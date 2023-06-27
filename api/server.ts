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
import { englishSentence } from "../data/englishSentence";
import { englishWord } from "../data/englishWord";
import { modeMsg } from "../data/mode";
import { db } from "../firebase";
require("dotenv").config();

// LINEクライアントとExpressの設定を行う
const clientConfig: ClientConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || "",
  channelSecret: process.env.CHANNEL_SECRET
};

const middlewareConfig: MiddlewareConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET || ""
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

  const docRef = doc(db, "users", "95H7vERViDXZK8Cg2jVN");
  const dataDocRef = doc(db, "quizData", "quizData");
  const docSnap = await getDoc(docRef);
  const dataDocSnap = await getDoc(dataDocRef);

  if (!docSnap.exists()) return;
  if (!dataDocSnap.exists()) return;

  const prevSentenceQuiz =
    dataDocSnap.data().sentenceQuizList[
      Math.floor(Math.random() * dataDocSnap.data().sentenceQuizList.length)
    ];

  type Quiz = { question: "リンゴ"; answer: "apple" };

  const quiz: Quiz =
    docSnap.data().quiz[Math.floor(Math.random() * docSnap.data().quiz.length)];

  const { replyToken } = event;

  // モード切り替え
  switch (event.message.text) {
    case "スタート":
      client.replyMessage(replyToken, modeMsg);
      return;

    case "英単語":
      await updateDoc(docRef, {
        mode: "英単語"
      });
      await updateDoc(docRef, {
        prevQuiz: quiz
      });
      client.replyMessage(replyToken, englishWord(quiz.question));
      return;

    case "英文":
      await updateDoc(docRef, {
        mode: "英文"
      });

      await updateDoc(docRef, {
        prevSentenceQuizAnswer: prevSentenceQuiz.answer
      });

      client.replyMessage(replyToken, {
        type: "flex",
        altText: "英文",
        contents: {
          type: "bubble",
          direction: "ltr",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "問題",
                weight: "bold",
                align: "center",
                margin: "none"
              },
              {
                type: "text",
                text: "以下の英文を英語に翻訳するとどれが正しいですか？fff",
                size: "md",
                align: "start",
                margin: "xxl",
                wrap: true
              },
              {
                type: "text",
                text: prevSentenceQuiz.questionJa,
                size: "md",
                margin: "lg",
                wrap: true
              }
            ]
          },
          footer: {
            type: "box",
            layout: "vertical",
            spacing: "md",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                spacing: "lg",
                contents: [
                  {
                    type: "button",
                    action: {
                      type: "postback",
                      label: "1",
                      text: "1",
                      data: "1"
                    },
                    flex: 2,
                    margin: "none",
                    height: "sm",
                    style: "primary",
                    gravity: "top"
                  },
                  {
                    type: "text",
                    text: prevSentenceQuiz.question[0],
                    flex: 8,
                    align: "start",
                    gravity: "center",
                    wrap: true
                  }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                spacing: "lg",
                contents: [
                  {
                    type: "button",
                    action: {
                      type: "postback",
                      label: "2",
                      text: "2",
                      data: "2"
                    },
                    flex: 2,
                    margin: "none",
                    height: "sm",
                    style: "primary",
                    gravity: "top"
                  },
                  {
                    type: "text",
                    text: prevSentenceQuiz.question[1],
                    flex: 8,
                    align: "start",
                    gravity: "center",
                    wrap: true
                  }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                spacing: "lg",
                contents: [
                  {
                    type: "button",
                    action: {
                      type: "postback",
                      label: "3",
                      text: "3",
                      data: "3"
                    },
                    flex: 2,
                    margin: "none",
                    height: "sm",
                    style: "primary",
                    gravity: "top"
                  },
                  {
                    type: "text",
                    text: prevSentenceQuiz.question[2],
                    flex: 8,
                    align: "start",
                    gravity: "center",
                    wrap: true
                  }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                spacing: "lg",
                contents: [
                  {
                    type: "button",
                    action: {
                      type: "postback",
                      label: "4",
                      text: "4",
                      data: "4"
                    },
                    flex: 2,
                    margin: "none",
                    height: "sm",
                    style: "primary",
                    gravity: "top"
                  },
                  {
                    type: "text",
                    text: prevSentenceQuiz.question[3],
                    flex: 8,
                    align: "start",
                    gravity: "center",
                    wrap: true
                  }
                ]
              }
            ]
          }
        }
      });
      return;
  }

  // モードによってテキストの見方を変える
  switch (docSnap.data().mode) {
    case "英単語":
      if (docSnap.data().prevQuiz.answer === event.message.text) {
        const prevQuiz: Quiz =
          docSnap.data().quiz[
            Math.floor(Math.random() * docSnap.data().quiz.length)
          ];

        await updateDoc(docRef, {
          prevQuiz
        });

        return client.replyMessage(replyToken, [
          {
            type: "text",
            text: "正解です!"
          },
          {
            type: "flex",
            altText: "単語",
            contents: {
              type: "bubble",
              direction: "ltr",
              body: {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: `「${prevQuiz.question}」を英語で入力してください。\n（全て小文字）`,
                    size: "md",
                    align: "start",
                    wrap: true
                  }
                ]
              }
            }
          }
        ]);
      } else {
        return client.replyMessage(replyToken, {
          type: "text",
          text: "不正解です。"
        });
      }

    case "英文":
      if (docSnap.data().prevSentenceQuizAnswer === event.message.text) {
        const newPrevSentenceQuiz =
          dataDocSnap.data().sentenceQuizList[
            Math.floor(
              Math.random() * dataDocSnap.data().sentenceQuizList.length
            )
          ];

        await updateDoc(docRef, {
          prevSentenceQuizAnswer: newPrevSentenceQuiz.answer
        });

        return client.replyMessage(replyToken, [
          {
            type: "text",
            text: "正解です。"
          },
          {
            type: "flex",
            altText: "英文",
            contents: {
              type: "bubble",
              direction: "ltr",
              body: {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "問題",
                    weight: "bold",
                    align: "center",
                    margin: "none"
                  },
                  {
                    type: "text",
                    text: "以下の英文を英語に翻訳するとどれが正しいですか？",
                    size: "md",
                    align: "start",
                    margin: "xxl",
                    wrap: true
                  },
                  {
                    type: "text",
                    text: newPrevSentenceQuiz.questionJa,
                    size: "md",
                    margin: "lg",
                    wrap: true
                  }
                ]
              },
              footer: {
                type: "box",
                layout: "vertical",
                spacing: "md",
                contents: [
                  {
                    type: "box",
                    layout: "horizontal",
                    spacing: "lg",
                    contents: [
                      {
                        type: "button",
                        action: {
                          type: "postback",
                          label: "1",
                          text: "1",
                          data: "1"
                        },
                        flex: 2,
                        margin: "none",
                        height: "sm",
                        style: "primary",
                        gravity: "top"
                      },
                      {
                        type: "text",
                        text: newPrevSentenceQuiz.question[0],
                        flex: 8,
                        align: "start",
                        gravity: "center",
                        wrap: true
                      }
                    ]
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    spacing: "lg",
                    contents: [
                      {
                        type: "button",
                        action: {
                          type: "postback",
                          label: "2",
                          text: "2",
                          data: "2"
                        },
                        flex: 2,
                        margin: "none",
                        height: "sm",
                        style: "primary",
                        gravity: "top"
                      },
                      {
                        type: "text",
                        text: newPrevSentenceQuiz.question[1],
                        flex: 8,
                        align: "start",
                        gravity: "center",
                        wrap: true
                      }
                    ]
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    spacing: "lg",
                    contents: [
                      {
                        type: "button",
                        action: {
                          type: "postback",
                          label: "3",
                          text: "3",
                          data: "3"
                        },
                        flex: 2,
                        margin: "none",
                        height: "sm",
                        style: "primary",
                        gravity: "top"
                      },
                      {
                        type: "text",
                        text: newPrevSentenceQuiz.question[2],
                        flex: 8,
                        align: "start",
                        gravity: "center",
                        wrap: true
                      }
                    ]
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    spacing: "lg",
                    contents: [
                      {
                        type: "button",
                        action: {
                          type: "postback",
                          label: "4",
                          text: "4",
                          data: "4"
                        },
                        flex: 2,
                        margin: "none",
                        height: "sm",
                        style: "primary",
                        gravity: "top"
                      },
                      {
                        type: "text",
                        text: newPrevSentenceQuiz.question[3],
                        flex: 8,
                        align: "start",
                        gravity: "center",
                        wrap: true
                      }
                    ]
                  }
                ]
              }
            }
          }
        ]);
      } else {
        return client.replyMessage(replyToken, {
          type: "text",
          text: "不正解です。"
        });
      }
  }
};

// LINEミドルウェアを登録
// ルートハンドラの中でミドルウェアを渡すことも可能↓
// app.use(middleware(middlewareConfig));

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
