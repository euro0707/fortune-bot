const { getPersonality, getDetail } = require('@kurone-kito/dantalion-core');

// テスト用の誕生日
const testBirthdays = ['1993-10-09', '1990-05-15', '2000-01-01'];

testBirthdays.forEach(birthday => {
  console.log(`\n=== ${birthday} ===`);
  try {
    const personality = getPersonality(birthday);
    const detail = getDetail(personality);
    console.log(`性格ID: ${personality}`);
    console.log(`詳細診断:\n${detail}`);
  } catch (error) {
    console.error('エラー:', error);
  }
});