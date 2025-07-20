const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');
const { getPersonality, getDetail } = require('@kurone-kito/dantalion-core');
require('dotenv').config();

// LINE Bot設定
const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
};

const client = new Client(config);
const app = express();

// 誕生日の形式を検証する関数
function isValidDateFormat(dateStr) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  
  const date = new Date(dateStr);
  const [year, month, day] = dateStr.split('-').map(Number);
  
  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day;
}

// 占い結果を生成する関数
function generateFortuneMessage(birthday) {
  try {
    const personality = getPersonality(birthday);
    const detail = getDetail(personality);
    
    return `🔮 あなたの性格診断結果 🔮\n\n` +
           `誕生日: ${birthday}\n` +
           `性格ID: ${personality}\n\n` +
           `✨ 詳細診断 ✨\n` +
           `${detail}`;
  } catch (error) {
    console.error('占い計算エラー:', error);
    return '申し訳ございません。占い結果の計算に失敗しました。';
  }
}

// LINEイベントハンドラー
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userMessage = event.message.text.trim();
  
  // 誕生日の形式をチェック
  if (isValidDateFormat(userMessage)) {
    const fortuneMessage = generateFortuneMessage(userMessage);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: fortuneMessage
    });
  } else {
    // 使用方法を案内
    const helpMessage = `占いBotへようこそ！🔮\n\n` +
                       `誕生日を「YYYY-MM-DD」の形式で送信してください。\n` +
                       `例: 1993-10-09\n\n` +
                       `四柱推命に基づいた性格診断を行います。`;
    
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: helpMessage
    });
  }
}

// ヘルスチェックエンドポイント
app.get('/', (req, res) => {
  res.json({ status: 'Fortune Bot is running!' });
});

// LINE Webhookエンドポイント
app.post('/webhook', middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error('Webhook処理エラー:', err);
      res.status(500).end();
    });
});

// サーバー開始
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Fortune Bot server is running on port ${port}`);
});