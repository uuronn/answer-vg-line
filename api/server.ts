import {
  ClientConfig,
  Client,
  middleware,
  MiddlewareConfig,
  WebhookEvent,
  MessageAPIResponseBase
} from "@line/bot-sdk";
import express, { Application, Request, Response } from "express";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
require("dotenv").config();

// LINEクライアントとExpressの設定を行う
const clientConfig: ClientConfig = {
  channelAccessToken:
    "9S+ZwgaXwH1ZIMbuUHLT8FLBMYaiXlDFkS9DY11dGGvFA7Ad7SjAclnMqn3A9f133y1Xw7Vxwkoo7NKXp1mAtYuYTsM8Hl16xttiBaCKx+Aj548CTQn91PA0gFbUOvDtguJG8HaGAel2MRmDf1lKswdB04t89/1O/w1cDnyilFU=",
  channelSecret: "1b808908e2617b4ac98d3f64fdbcf3a4"
};

const middlewareConfig: MiddlewareConfig = {
  channelAccessToken:
    "9S+ZwgaXwH1ZIMbuUHLT8FLBMYaiXlDFkS9DY11dGGvFA7Ad7SjAclnMqn3A9f133y1Xw7Vxwkoo7NKXp1mAtYuYTsM8Hl16xttiBaCKx+Aj548CTQn91PA0gFbUOvDtguJG8HaGAel2MRmDf1lKswdB04t89/1O/w1cDnyilFU=",
  channelSecret: "1b808908e2617b4ac98d3f64fdbcf3a4"
};

const PORT = process.env.PORT || 3000;

// LINE SDKクライアントを新規に作成
const client = new Client(clientConfig);

// Expressアプリケーションを新規に作成
const app: Application = express();

// テキストを受け取る関数
const textEventHandler = async (
  event: WebhookEvent
): Promise<MessageAPIResponseBase | undefined> => {
  // すべての変数を処理
  if (event.type !== "message" || event.message.type !== "text") {
    return;
  }

  const usesDocRef = doc(db, "uses", "test");
  const docRef = doc(db, "vg", "vg-list");
  const usesDocSnap = await getDoc(usesDocRef);
  const docSnap = await getDoc(docRef);

  if (!usesDocSnap.exists()) return;
  if (!docSnap.exists()) return;

  const prevQuestion =
    docSnap.data().vgList[
      Math.floor(Math.random() * docSnap.data().vgList.length)
    ];

  const { replyToken } = event;

  if (event.message.text !== "スタート") {
    if (!usesDocSnap.data().isPlay) {
      if (event.message.text) {
        return client.replyMessage(replyToken, [
          {
            type: "text",
            text: "「スタート」でゲームを開始できるよ！"
          }
        ]);
      }
    }
  }

  if (event.message.text === "スタート") {
    await updateDoc(usesDocRef, {
      isPlay: true,
      prevQuestion,
      questionCount: usesDocSnap.data().questionCount + 1
    });

    return client.replyMessage(replyToken, [
      { type: "text", text: "ゲーム開始！" },
      {
        type: "image",
        originalContentUrl: prevQuestion.imageUrl,
        previewImageUrl: prevQuestion.imageUrl
      }
    ]);
  }

  if (usesDocSnap.data().prevQuestion.name === event.message.text) {
    const newPrevQuestion =
      docSnap.data().vgList[
        Math.floor(Math.random() * docSnap.data().vgList.length)
      ];

    await updateDoc(usesDocRef, {
      prevQuestion: newPrevQuestion,
      questionCount: usesDocSnap.data().questionCount + 1
    });

    if (usesDocSnap.data().questionCount + 1 === 5) {
      await updateDoc(usesDocRef, {
        isPlay: false,
        questionCount: 0,
        missCount: 0
      });

      return client.replyMessage(replyToken, [
        {
          type: "text",
          text: "終了！"
        },
        {
          type: "text",
          text:
            usesDocSnap.data().missCount === 0
              ? "評価 A（ばりぐっど）"
              : usesDocSnap.data().missCount === 1
              ? "評価 B"
              : "評価 C（ばりばっど）"
        },
        {
          type: "text",
          text:
            usesDocSnap.data().missCount === 0
              ? "あなたはばりぐっどばりぐっど大学にふさわしい人材です！！\nこれからも活動頑張ってください！！"
              : usesDocSnap.data().missCount === 1
              ? "あなたはばりぐっどばりぐっど大学にふさわしい人材です！"
              : "あなたがばりぐっど大学を退学させられる日も近いかもしれません。。"
        }
      ]);
    }
    return client.replyMessage(replyToken, [
      {
        type: "text",
        text: "正解です!"
      },
      {
        type: "image",
        originalContentUrl: newPrevQuestion.imageUrl,
        previewImageUrl: newPrevQuestion.imageUrl
      }
    ]);
  } else {
    await updateDoc(usesDocRef, {
      missCount: usesDocSnap.data().miss + 1
    });
    return client.replyMessage(replyToken, [
      {
        type: "text",
        text: "不正解です。"
      }
    ]);
  }
};

// Webhookイベントを受信する
// 接続テストを受信
app.get("/", async (_: Request, res: Response): Promise<Response> => {
  return res.status(200).json({
    status: "成功",
    message: "正常に接続されました!"
  });
});

// Webhookに使用されるルート
app.post(
  "/webhook",
  middleware(middlewareConfig),
  async (req: Request, res: Response): Promise<Response> => {
    const events: WebhookEvent[] = req.body.events;

    // 受信したすべてのイベントを非同期で処理
    const results = await Promise.all(
      events.map(async (event: WebhookEvent) => {
        try {
          await textEventHandler(event);
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error(err);
          }

          // エラーメッセージを返す
          return res.status(500).json({
            status: "エラー"
          });
        }
      })
    );

    // 成功した場合のメッセージを返す
    return res.status(200).json({
      status: "成功",
      results
    });
  }
);

// サーバーを作成し3000listenする
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
