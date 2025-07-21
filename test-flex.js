const { getPersonality } = require('@kurone-kito/dantalion-core');

// テスト用データをここに含める（部分的に）
const typeCatchPhrases = {
  '555': '面倒見のいいリーダー🧭 みんなの中心に立つタイプ'
};

const personalityData = {
  '555': {
    name: '面倒見のいいリーダー',
    summary: 'バランス感覚に優れ、チームをまとめる力があります。面倒見が良く、頼られる存在。',
    weakness: '八方美人になりがちで、決断力に欠けることも。責任を背負いすぎる傾向。',
    solution: '優先順位を明確に。時には「NO」と言う勇気も必要です。自分の時間も大切に。'
  }
};

function shorten(text) {
  if (!text) return '';
  const firstSentence = text.split('。')[0];
  return firstSentence.length > 60
    ? firstSentence.slice(0, 60) + '…'
    : firstSentence + '。';
}

function createFlexMessage(typeCode, result) {
  const catchphrase = typeCatchPhrases[typeCode] || 'あなたの個性が光るタイプ';

  return {
    type: 'flex',
    altText: 'あなたの性格診断の結果が届きました！',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          {
            type: 'text',
            text: `🔮 ${result.name}`,
            weight: 'bold',
            size: 'xl',
            color: '#5D2E8C'
          },
          {
            type: 'text',
            text: `「${catchphrase}」`,
            wrap: true,
            size: 'md',
            color: '#555'
          },
          {
            type: 'separator',
            margin: 'md'
          },
          {
            type: 'text',
            text: `✨ 特徴: ${shorten(result.summary)}`,
            wrap: true,
            margin: 'md'
          },
          {
            type: 'text',
            text: `⚠️ 弱点: ${shorten(result.weakness)}`,
            wrap: true,
            margin: 'sm'
          },
          {
            type: 'text',
            text: `💡 対策: ${shorten(result.solution)}`,
            wrap: true,
            margin: 'sm'
          }
        ]
      },
      styles: {
        body: {
          backgroundColor: '#FFFDF6'
        }
      }
    }
  };
}

// テスト実行
const birthday = '1993-10-09';
const personality = getPersonality(birthday);
console.log('personality:', personality);

const typeCode = personality.inner;
const result = personalityData[typeCode];

if (result) {
  const flexMessage = createFlexMessage(typeCode, result);
  console.log('\n=== FlexMessage ===');
  console.log(JSON.stringify(flexMessage, null, 2));
} else {
  console.log(`No data found for typeCode: ${typeCode}`);
}