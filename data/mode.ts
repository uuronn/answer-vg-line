import { FlexMessage } from "@line/bot-sdk";

export const modeMsg: FlexMessage = {
  type: "flex",
  altText: "モード設定",
  contents: {
    type: "bubble",
    direction: "ltr",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "モードを選択してください。",
          size: "md",
          align: "start",
          wrap: true
        }
      ]
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      margin: "none",
      contents: [
        {
          type: "button",
          action: {
            type: "postback",
            label: "英単語",
            text: "英単語",
            data: "英単語"
          },
          style: "primary"
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "英文",
            text: "英文",
            data: "英文"
          },
          style: "primary"
        }
      ]
    }
  }
};
