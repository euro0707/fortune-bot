const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');
require('dotenv').config();

// LINE Bot設定
const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
};

const client = new Client(config);
const app = express();

// シンプルなイベントハンドラー
function handleEvent(event) {
  console.log('=== EVENT DEBUG ===');
  console.log('Event type:', event.type);
  console.log('Message type:', event.message?.type);
  console.log('Message text:', event.message?.text);
  
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userMessage = event.message.text.trim();
  
  // 簡単なテキスト応答
  const responseText = `受信: ${userMessage}`;
  
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: responseText
  });
}

// ヘルスチェック
app.get('/', (req, res) => {
  res.json({ status: 'Debug server running!' });
});

// Webhook
app.post('/webhook', middleware(config), (req, res) => {
  console.log('=== WEBHOOK DEBUG ===');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => {
      console.log('Result:', result);
      res.json(result);
    })
    .catch((err) => {
      console.error('Webhook error:', err);
      res.status(500).end();
    });
});

// サーバー開始
const port = process.env.PORT || 3000;
app.listen(port, '127.0.0.1', () => {
  console.log(`Debug server running on http://127.0.0.1:${port}`);
});