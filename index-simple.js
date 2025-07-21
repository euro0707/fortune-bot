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

// キャッチコピー辞書（FlexMessage用 - タイトル重複を避けた説明文のみ）
const typeCatchPhrases = {
  '111': '自ら道を切り拓くタイプ',
  '222': '優しさで場を和ませるタイプ',
  '333': '自分らしく突き抜けるタイプ',
  '444': '着実に物事を積み上げるタイプ',
  '555': 'みんなの中心に立つタイプ',
  '666': '裏で力を発揮するタイプ',
  '777': '真実を見抜くタイプ',
  '888': '逆境を力に変えるタイプ',
  '999': '常に成長し続けるタイプ',
  '000': '独自の世界観を持つタイプ',
  '999+': '超越したハイブリッドタイプ',
  '001': '新しい可能性を見出すタイプ',
  '012': '調和を重視するタイプ',
  '024': '責任感の強いタイプ',
  '025': 'バランスの取れたタイプ',
  '100': '挑戦者タイプ',
  '108': '深い思考を持つタイプ',
  '125': 'チームワークを大切にするタイプ',
  '789': '適応力のあるタイプ',
  '919': '自分の道を歩むタイプ'
};

// 詳細な性格データ辞書（FlexMessage用）
const personalityData = {
  '111': {
    name: '情熱の起爆剤',
    summary: '行動力抜群で新しいことにチャレンジするのが得意。リーダーシップを発揮し、周りを引っ張っていく力があります。',
    weakness: '短気になりがちで、計画性に欠けることがある。一人で突っ走ってしまう傾向も。',
    solution: '深呼吸して一歩引く習慣を。チームワークを意識し、他人の意見も取り入れましょう。'
  },
  '222': {
    name: '共感力の天才',
    summary: '人の気持ちを理解するのが得意で、場の空気を読む能力に長けています。調和を大切にするタイプ。',
    weakness: '自分の意見を言うのが苦手で、他人に合わせすぎてストレスを溜めがち。',
    solution: '自分の気持ちも大切に。「No」と言う練習をして、自分軸を持ちましょう。'
  },
  '333': {
    name: '自由な発想家',
    summary: 'クリエイティブで独創的なアイデアを生み出すのが得意。自分らしさを大切にする個性派。',
    weakness: 'ルールや制約を嫌い、継続することが苦手。飽きっぽい面も。',
    solution: '小さな目標設定で継続力アップ。自由度のある環境を選んで能力を発揮しましょう。'
  },
  '444': {
    name: '職人肌の努力家',
    summary: 'コツコツと努力を積み重ねることができる堅実派。責任感が強く、信頼される存在。',
    weakness: '完璧主義すぎて融通が利かない。変化を嫌い、新しいことに挑戦するのが苦手。',
    solution: '「80点で合格」の心構えで。時には冒険心を持って新しいことにもチャレンジを。'
  },
  '555': {
    name: '面倒見のいいリーダー',
    summary: 'バランス感覚に優れ、チームをまとめる力があります。面倒見が良く、頼られる存在。',
    weakness: '八方美人になりがちで、決断力に欠けることも。責任を背負いすぎる傾向。',
    solution: '優先順位を明確に。時には「NO」と言う勇気も必要です。自分の時間も大切に。'
  },
  '666': {
    name: '影の支配者',
    summary: '洞察力が鋭く、戦略的な思考が得意。裏方として力を発揮し、重要な場面で頼りになる。',
    weakness: '表に出るのが苦手で、自分の功績をアピールするのが下手。疑い深い面も。',
    solution: '自分の成果を適切にアピールする練習を。信頼できる人には心を開きましょう。'
  },
  '777': {
    name: '鋭い直感の観察者',
    summary: '物事の本質を見抜く力があり、直感的な判断が得意。研究熱心で深く考える知性派。',
    weakness: '考えすぎて行動が遅れがち。人との距離感を保ちすぎることも。',
    solution: '「まず行動」を心がけて。人とのコミュニケーションも積極的に取りましょう。'
  },
  '888': {
    name: '意志の強い突破者',
    summary: '困難に立ち向かう強さがあり、逆境をバネにして成長できる。目標達成への執念が強い。',
    weakness: '頑固で他人の意見を聞かない傾向。自分に厳しすぎて燃え尽きることも。',
    solution: '柔軟性を意識して他人の意見も取り入れを。適度な休息で心身のバランスを保ちましょう。'
  },
  '999': {
    name: '理想を追う旅人',
    summary: '高い理想を持ち、常に成長を求める向上心の塊。新しい体験や学びを大切にする。',
    weakness: '理想が高すぎて現実とのギャップに悩むことも。飽きやすく一つのことに集中するのが苦手。',
    solution: '小さな達成感を積み重ねることで自信をつけて。現在の自分も認めてあげましょう。'
  },
  '000': {
    name: '天才型の変わり者',
    summary: '独特の世界観を持ち、他人とは違う視点で物事を捉える。天才的なひらめきがある。',
    weakness: '周りに理解されにくく、孤立しがち。常識にとらわれない分、社会性に欠けることも。',
    solution: '自分らしさを大切にしつつ、他人との共通点も見つけて。コミュニケーションを心がけて。'
  },
  '999+': {
    name: '神秘と現実をつなぐ橋',
    summary: '精神的な世界と現実世界の両方を理解できる稀有な存在。バランス感覚と包容力がある。',
    weakness: '責任感が強すぎて一人で抱え込みがち。理想と現実の板挟みになることも。',
    solution: '完璧を求めすぎず、時には誰かに頼ることも大切。自分の限界を認めて適度な距離感を。'
  },
  '001': {
    name: '純粋な理想家',
    summary: '高い志を持ち、物事の本質を追い求める心を持つタイプ。新しい可能性を見出す力があります。',
    weakness: '理想と現実のギャップに悩みやすく、完璧を求めすぎる傾向があります。',
    solution: '小さな進歩も認めて自分を褒めましょう。現実的な目標設定が成功の鍵です。'
  },
  '012': {
    name: 'バランス調整者',
    summary: '物事のバランスを取ることが得意で、調和を重視するタイプ。',
    weakness: '決断力に欠け、優柔不断になりがち。他人に合わせすぎることも。',
    solution: '自分の意見も大切に。時には積極的な決断を心がけましょう。'
  },
  '024': {
    name: '着実な実行者',
    summary: '計画的で着実に物事を進める力があります。責任感が強く信頼される存在。',
    weakness: '融通が利かず、変化への適応が苦手。完璧主義すぎる面も。',
    solution: '柔軟性を意識して。時には「まあいいか」の心構えも大切です。'
  },
  '025': {
    name: '創造的な実践者',
    summary: 'クリエイティブでありながら実用性も重視する、バランスの取れたタイプ。',
    weakness: 'アイデアが多すぎて一つに集中するのが苦手。飽きやすい面も。',
    solution: '優先順位を決めて一つずつ実行を。継続することで大きな成果が得られます。'
  },
  '100': {
    name: '情熱のパイオニア',
    summary: '新しいことに挑戦する勇気があり、人を引っ張っていく力があります。',
    weakness: '短気で計画性に欠ける傾向。一人で突っ走ってしまうことも。',
    solution: 'チームワークを意識して。計画を立ててから行動する習慣を身につけましょう。'
  },
  '108': {
    name: '洞察力の達人',
    summary: '物事の本質を見抜く力があり、深い洞察力を持つタイプ。',
    weakness: '考えすぎて行動が遅れがち。人との距離を置きすぎることも。',
    solution: '直感を信じて行動を。人とのコミュニケーションも積極的に取りましょう。'
  },
  '125': {
    name: '協調性のリーダー',
    summary: 'チームワークを大切にしながらリーダーシップを発揮するタイプ。',
    weakness: '責任を背負いすぎて疲れやすい。決断力に欠けることも。',
    solution: '適度に休息を取り、時には他人に頼ることも大切です。'
  },
  '789': {
    name: '多彩な才能家',
    summary: '様々な分野で才能を発揮できる多才なタイプ。適応力があります。',
    weakness: '器用貧乏になりがち。一つのことを極めるのが苦手。',
    solution: '得意分野を見つけて集中を。深く掘り下げることで真の力が発揮されます。'
  },
  '919': {
    name: '独立した探求者',
    summary: '強い独立心があり、新しい発見を求める探求心を持つタイプ。',
    weakness: '孤立しがちで、協調性に欠けることがある。頑固な面も。',
    solution: '他人との協力も大切に。時には妥協することで新しい発見があります。'
  }
};

// テキスト短縮関数（FlexMessage用 - 句読点を安全な文字に変換）
function shorten(text) {
  if (!text) return '';
  const firstSentence = text.split('。')[0];
  const result = firstSentence.length > 60
    ? firstSentence.slice(0, 60) + '...'
    : firstSentence;
  // 句読点を安全な文字に変換
  return result.replace(/。/g, '.').replace(/、/g, ',');
}

// シンプルなFlexMessage作成関数（テスト用）
function createFlexMessage(typeCode, result) {
  const catchphrase = typeCatchPhrases[typeCode] || 'あなたの個性が光るタイプ';

  return {
    type: 'flex',
    altText: 'あなたの性格診断の結果が届きました',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          {
            type: 'text',
            text: result.name,
            weight: 'bold',
            size: 'xl',
            color: '#5D2E8C'
          },
          {
            type: 'text',
            text: catchphrase,
            wrap: true,
            size: 'md',
            color: '#555555'
          },
          {
            type: 'separator',
            margin: 'md'
          },
          {
            type: 'text',
            text: `特徴: ${shorten(result.summary)}`,
            wrap: true,
            margin: 'md'
          },
          {
            type: 'text',
            text: `弱点: ${shorten(result.weakness)}`,
            wrap: true,
            margin: 'sm'
          },
          {
            type: 'text',
            text: `対策: ${shorten(result.solution)}`,
            wrap: true,
            margin: 'sm'
          }
        ]
      }
    }
  };
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

// 基本診断のFlexMessage版を生成する関数
function generateFortuneFlexMessage(birthday) {
  try {
    const personality = getPersonality(birthday);
    const typeCode = personality.inner;
    const result = personalityData[typeCode];
    
    if (!result) {
      // データがない場合はテキスト版にフォールバック
      return generateFortuneTextMessage(birthday);
    }
    
    return createFlexMessage(typeCode, result);
  } catch (error) {
    console.error('占い計算エラー:', error);
    return {
      type: 'text',
      text: '申し訳ございません。占い結果の計算に失敗しました。'
    };
  }
}

// テキスト版の簡潔診断（フォールバック用）
function generateFortuneTextMessage(birthday) {
  try {
    const personality = getPersonality(birthday);
    
    // personalityオブジェクトから詳細情報を取得
    const innerDetail = getDetail(personality.inner);
    const outerDetail = getDetail(personality.outer);
    const workStyleDetail = getDetail(personality.workStyle);
    
    // 各特性の要約を取得
    const innerSummary = `${translateTraits(innerDetail).split('\n')[0]}`;
    const outerSummary = `${translateTraits(outerDetail).split('\n')[0]}`;
    const workSummary = `${translateTraits(workStyleDetail).split('\n')[0]}`;
    
    return `🔮 性格診断結果 🔮\n\n` +
           `🎯 ${typeCatchPhrases[personality.inner] || personality.inner}\n\n` +
           `✨ 内面: ${innerSummary}\n` +
           `✨ 外面: ${outerSummary}\n` +
           `✨ 仕事: ${workSummary}\n\n` +
           `📖 詳しく知りたい場合：\n` +
           `「詳しく ${birthday}」と送信してください`;
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
  try {
    console.log('Event received:', event);
    
    if (event.type !== 'message' || event.message.type !== 'text') {
      return Promise.resolve(null);
    }

    const userMessage = event.message.text.trim();
    console.log('User message:', userMessage);
  
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
    try {
      const fortuneMessage = generateFortuneFlexMessage(userMessage);
      console.log('Generated message type:', fortuneMessage.type);
      console.log('Generated message:', JSON.stringify(fortuneMessage, null, 2));
      return client.replyMessage(event.replyToken, fortuneMessage);
    } catch (error) {
      console.error('FlexMessage generation error:', error);
      // フォールバックでテキスト版を返す
      const textMessage = generateFortuneTextMessage(userMessage);
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: textMessage
      });
    }
  } else {
    // 使用方法を案内
    const helpMessage = `占いBotへようこそ！🔮\n\n` +
                       `誕生日を「YYYY-MM-DD」の形式で送信してください。\n` +
                       `例: 1993-10-09\n\n` +
                       `💡 最初は簡潔版が表示され、詳しく知りたい場合は「詳しく」コマンドが案内されます。\n\n` +
                       `「ヘルプ」と送信すると詳しい使い方が確認できます。`;
    
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: helpMessage
    });
  }
  } catch (error) {
    console.error('Handler error:', error);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'エラーが発生しました。しばらく後でお試しください。'
    }).catch(err => console.error('Reply error:', err));
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