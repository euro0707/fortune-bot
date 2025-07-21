const { getPersonality } = require('@kurone-kito/dantalion-core');
const { createAccessors } = require('@kurone-kito/dantalion-i18n');

// テスト用の誕生日
const birthday = '1993-10-09';

console.log('=== Dantalion i18n テスト (正しい方法) ===');

try {
  const typeCode = getPersonality(birthday);
  console.log('typeCode:', typeCode);
  
  // 日本語アクセサーを作成
  const accessors = createAccessors('ja');
  console.log('accessors:', Object.keys(accessors));
  
  // inner性格の詳細を取得
  if (accessors.genius && typeCode.inner) {
    const result = accessors.genius.getValue(typeCode.inner);
    console.log('genius result:', result);
    
    if (result) {
      console.log('\n=== 詳細データ ===');
      console.log('name:', result.name);
      console.log('summary:', result.summary);
      console.log('weakness:', result.weakness);
      console.log('solution:', result.solution);
    }
  }
  
} catch (error) {
  console.error('エラー:', error);
}