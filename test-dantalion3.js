const { getPersonality, getDetail } = require('@kurone-kito/dantalion-core');

const birthday = '1993-10-09';
console.log(`テスト誕生日: ${birthday}`);

try {
  const personality = getPersonality(birthday);
  console.log('personality:', personality);
  
  const innerDetail = getDetail(personality.inner);
  const outerDetail = getDetail(personality.outer);
  const workStyleDetail = getDetail(personality.workStyle);
  
  console.log('\n内面の性格:', innerDetail);
  console.log('外面の性格:', outerDetail);
  console.log('仕事スタイル:', workStyleDetail);
  
} catch (error) {
  console.error('エラー:', error);
}