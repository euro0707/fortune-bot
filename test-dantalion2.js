const { getPersonality, getDetail } = require('@kurone-kito/dantalion-core');

console.log('Dantalion functions:', { getPersonality, getDetail });

const birthday = '1993-10-09';
console.log(`\nテスト誕生日: ${birthday}`);

try {
  const personality = getPersonality(birthday);
  console.log('personality result:', personality);
  console.log('personality type:', typeof personality);
  
  if (personality) {
    const detail = getDetail(personality);
    console.log('detail result:', detail);
    console.log('detail type:', typeof detail);
  }
} catch (error) {
  console.error('エラー:', error);
}