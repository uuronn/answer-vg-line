import { FlexMessage } from "@line/bot-sdk";

export const englishWord = (question: string): FlexMessage => {
  return {
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
            text: `「${question}」を英語で入力してください。\n（全て小文字）`,
            size: "md",
            align: "start",
            wrap: true
          }
        ]
      }
    }
  };
};
