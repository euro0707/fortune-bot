const { getPersonality } = require('@kurone-kito/dantalion-core');

const birthday = '1982-09-02';
console.log(`誕生日: ${birthday}`);

try {
  const personality = getPersonality(birthday);
  console.log('personality:', personality);
  console.log('inner type:', personality.inner);
  
  // personalityDataにこのタイプがあるかチェック
  const personalityData = {
    '111': { name: '情熱の起爆剤' },
    '222': { name: '共感力の天才' },
    '333': { name: '自由な発想家' },
    '444': { name: '職人肌の努力家' },
    '555': { name: '面倒見のいいリーダー' },
    '666': { name: '影の支配者' },
    '777': { name: '鋭い直感の観察者' },
    '888': { name: '意志の強い突破者' },
    '999': { name: '理想を追う旅人' },
    '000': { name: '天才型の変わり者' },
    '999+': { name: '神秘と現実をつなぐ橋' }
  };
  
  const result = personalityData[personality.inner];
  console.log('Data exists:', !!result);
  if (result) {
    console.log('Name:', result.name);
  } else {
    console.log('⚠️ No data found for type:', personality.inner);
  }
  
} catch (error) {
  console.error('Error:', error);
}