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

// キャッチコピー辞書（11タイプ）
const typeCatchPhrases = {
  '111': '情熱の起爆剤🔥 自ら道を切り拓くタイプ',
  '222': '共感力の天才🌈 優しさで場を和ませるタイプ',
  '333': '自由な発想家🎨 自分らしく突き抜けるタイプ',
  '444': '職人肌の努力家⚙️ 着実に物事を積み上げるタイプ',
  '555': '面倒見のいいリーダー🧭 みんなの中心に立つタイプ',
  '666': '影の支配者🕶️ 裏で力を発揮するタイプ',
  '777': '鋭い直感の観察者👁️‍🗨️ 真実を見抜くタイプ',
  '888': '意志の強い突破者⚡ 逆境を力に変えるタイプ',
  '999': '理想を追う旅人🌌 常に成長し続けるタイプ',
  '000': '天才型の変わり者🧠 独自の世界観を持つタイプ',
  '999+': '神秘と現実をつなぐ橋🌉 超越したハイブリッドタイプ'
};

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
           `誕生日: ${birthday}\n\n` +
           `🎯 あなたのタイプ 🎯\n` +
           `${typeCatchPhrases[personality.inner] || personality.inner}\n\n` +
           `✨ 内面の性格 ✨\n` +
           `${translateTraits(innerDetail)}\n\n` +
           `✨ 外面の性格 ✨\n` +
           `${translateTraits(outerDetail)}\n\n` +
           `✨ 仕事スタイル ✨\n` +
           `${translateTraits(workStyleDetail)}`;
  } catch (error) {
    console.error('占い計算エラー:', error);
    return '申し訳ございません。占い結果の計算に失敗しました。';
  }
}

// 詳細診断結果を生成する関数
function generateDetailedFortuneMessage(birthday) {
  try {
    const personality = getPersonality(birthday);
    const innerDetail = getDetail(personality.inner);
    const outerDetail = getDetail(personality.outer);
    const workStyleDetail = getDetail(personality.workStyle);
    
    // 人生の基盤を日本語に翻訳
    const lifeBaseTranslations = {
      'application': '実用性重視',
      'humanely': '人間性重視',
      'economically': '経済性重視'
    };
    
    return `🔮 詳細性格診断結果 🔮\n\n` +
           `誕生日: ${birthday}\n` +
           `人生サイクル: ${personality.cycle}年周期\n` +
           `人生の基盤: ${lifeBaseTranslations[personality.lifeBase] || personality.lifeBase}\n` +
           `潜在能力: ${personality.potentials.join(', ')}\n\n` +
           `🎯 あなたのタイプ 🎯\n` +
           `${typeCatchPhrases[personality.inner] || personality.inner}\n\n` +
           `✨ 内面の性格（ID: ${personality.inner}）✨\n` +
           `${translateTraits(innerDetail)}\n\n` +
           `✨ 外面の性格（ID: ${personality.outer}）✨\n` +
           `${translateTraits(outerDetail)}\n\n` +
           `✨ 仕事スタイル（ID: ${personality.workStyle}）✨\n` +
           `${translateTraits(workStyleDetail)}\n\n` +
           `📊 相性データも利用可能です\n` +
           `「相性 あなたの誕生日 相手の誕生日」で確認できます`;
  } catch (error) {
    console.error('詳細占い計算エラー:', error);
    return '申し訳ございません。詳細占い結果の計算に失敗しました。';
  }
}

// 相性診断結果を生成する関数
function generateCompatibilityMessage(birthday1, birthday2) {
  try {
    const person1 = getPersonality(birthday1);
    const person2 = getPersonality(birthday2);
    
    const detail1 = getDetail(person1.inner);
    const detail2 = getDetail(person2.inner);
    
    // 相性スコアを取得（0-3の範囲）
    const bizScore1to2 = detail1.affinity.biz[person2.inner] || 0;
    const loveScore1to2 = detail1.affinity.love[person2.inner] || 0;
    const bizScore2to1 = detail2.affinity.biz[person1.inner] || 0;
    const loveScore2to1 = detail2.affinity.love[person1.inner] || 0;
    
    // 平均相性を計算
    const avgBizScore = Math.round((bizScore1to2 + bizScore2to1) / 2 * 10) / 10;
    const avgLoveScore = Math.round((loveScore1to2 + loveScore2to1) / 2 * 10) / 10;
    
    // スコアを星に変換
    function scoreToStars(score) {
      const starCount = Math.round(score);
      return '★'.repeat(starCount) + '☆'.repeat(3 - starCount);
    }
    
    // スコアを文字評価に変換
    function scoreToText(score) {
      if (score >= 2.5) return '非常に良い';
      if (score >= 2.0) return '良い';
      if (score >= 1.5) return 'まあまあ';
      if (score >= 1.0) return '普通';
      if (score >= 0.5) return 'やや難しい';
      return '難しい';
    }
    
    return `💕 相性診断結果 💕\n\n` +
           `👤 ${birthday1}\n` +
           `${typeCatchPhrases[person1.inner] || person1.inner}\n\n` +
           `👤 ${birthday2}\n` +
           `${typeCatchPhrases[person2.inner] || person2.inner}\n\n` +
           `📊 ビジネス相性：${scoreToStars(avgBizScore)} (${avgBizScore}/3)\n` +
           `評価：${scoreToText(avgBizScore)}\n\n` +
           `💖 恋愛相性：${scoreToStars(avgLoveScore)} (${avgLoveScore}/3)\n` +
           `評価：${scoreToText(avgLoveScore)}\n\n` +
           `📈 詳細スコア：\n` +
           `• ${birthday1} → ${birthday2}\n` +
           `  ビジネス: ${bizScore1to2}/3, 恋愛: ${loveScore1to2}/3\n` +
           `• ${birthday2} → ${birthday1}\n` +
           `  ビジネス: ${bizScore2to1}/3, 恋愛: ${loveScore2to1}/3\n\n` +
           `🔮 四柱推命に基づいた診断です`;
  } catch (error) {
    console.error('相性診断エラー:', error);
    return '申し訳ございません。相性診断の計算に失敗しました。';
  }
}

// ヘルプメッセージを生成する関数
function generateHelpMessage() {
  return `🔮 占いBot使い方ガイド 🔮\n\n` +
         `📝 基本的な使い方：\n` +
         `• 誕生日を「YYYY-MM-DD」形式で送信\n` +
         `• 例: 1993-10-09\n\n` +
         `🎯 便利なコマンド：\n` +
         `• 「詳しく YYYY-MM-DD」- 詳細診断\n` +
         `• 「相性 YYYY-MM-DD YYYY-MM-DD」- 相性診断\n` +
         `• 「ヘルプ」- この画面を表示\n\n` +
         `✨ 機能説明：\n` +
         `• 四柱推命に基づいた本格的な性格診断\n` +
         `• 内面・外面・仕事スタイルを分析\n` +
         `• 2人の相性も診断可能`;
}

// LINEイベントハンドラー
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userMessage = event.message.text.trim();
  
  // ヘルプコマンドのチェック
  if (userMessage.match(/^(ヘルプ|help|使い方|？|\?)$/i)) {
    const helpMessage = generateHelpMessage();
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: helpMessage
    });
  }
  
  // 詳細診断コマンドのチェック
  const detailMatch = userMessage.match(/^(詳しく|詳細|detail)\s+(\d{4}-\d{2}-\d{2})$/i);
  if (detailMatch && isValidDateFormat(detailMatch[2])) {
    const detailedMessage = generateDetailedFortuneMessage(detailMatch[2]);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: detailedMessage
    });
  }
  
  // 相性診断コマンドのチェック
  const compatibilityMatch = userMessage.match(/^(相性|compatibility)\s+(\d{4}-\d{2}-\d{2})\s+(\d{4}-\d{2}-\d{2})$/i);
  if (compatibilityMatch && isValidDateFormat(compatibilityMatch[2]) && isValidDateFormat(compatibilityMatch[3])) {
    const compatibilityMessage = generateCompatibilityMessage(compatibilityMatch[2], compatibilityMatch[3]);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: compatibilityMessage
    });
  }
  
  // 誕生日の形式をチェック（基本診断）
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
                       `「ヘルプ」と送信すると詳しい使い方が確認できます。`;
    
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