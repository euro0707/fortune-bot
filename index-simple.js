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

// 性格特性を日本語に変換
function translateTraits(detail) {
  const translations = {
    brain: { left: '論理的思考', right: '直感的思考' },
    communication: { fix: '一貫したコミュニケーション', flex: '柔軟なコミュニケーション' },
    management: { care: '配慮型マネジメント', power: '力強いマネジメント' },
    motivation: { ownMind: '内発的動機', safety: '安全志向', competition: '競争志向' },
    position: { direct: '直接的立場', adjust: '調整型立場' },
    response: { mind: '思考重視', action: '行動重視' },
    vector: { economically: '経済的志向', humanely: '人間的志向' }
  };

  return `思考タイプ: ${translations.brain[detail.brain] || detail.brain}
コミュニケーション: ${translations.communication[detail.communication] || detail.communication}
マネジメント: ${translations.management[detail.management] || detail.management}
動機: ${translations.motivation[detail.motivation] || detail.motivation}
立場: ${translations.position[detail.position] || detail.position}
反応スタイル: ${translations.response[detail.response] || detail.response}
価値観: ${translations.vector[detail.vector] || detail.vector}`;
}

// 占い結果を生成する関数
function generateFortuneMessage(birthday) {
  try {
    const personality = getPersonality(birthday);
    
    // personalityオブジェクトから詳細情報を取得
    const innerDetail = getDetail(personality.inner);
    const outerDetail = getDetail(personality.outer);
    const workStyleDetail = getDetail(personality.workStyle);
    
    return `🔮 あなたの性格診断結果 🔮\n\n` +
           `誕生日: ${birthday}\n` +
           `サイクル: ${personality.cycle}\n` +
           `人生の基盤: ${personality.lifeBase}\n\n` +
           `✨ 内面の性格（${personality.inner}）✨\n` +
           `${translateTraits(innerDetail)}\n\n` +
           `✨ 外面の性格（${personality.outer}）✨\n` +
           `${translateTraits(outerDetail)}\n\n` +
           `✨ 仕事スタイル（${personality.workStyle}）✨\n` +
           `${translateTraits(workStyleDetail)}`;
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
  res.json({ status: 'Simple Fortune Bot is running!' });
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
app.listen(port, '127.0.0.1', () => {
  console.log(`Simple Fortune Bot server is running on http://127.0.0.1:${port}`);
});