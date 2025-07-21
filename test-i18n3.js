const { getPersonality } = require('@kurone-kito/dantalion-core');
const { createAccessors } = require('@kurone-kito/dantalion-i18n');

// テスト用の誕生日
const birthday = '1993-10-09';

console.log('=== Dantalion i18n テスト (メソッド確認) ===');

try {
  const typeCode = getPersonality(birthday);
  console.log('typeCode:', typeCode);
  
  // 日本語アクセサーを作成
  const accessors = createAccessors('ja');
  
  console.log('\n=== genius オブジェクト ===');
  console.log('genius:', accessors.genius);
  console.log('genius methods:', Object.keys(accessors.genius));
  
  // 利用可能なメソッドを確認
  if (accessors.genius.get) {
    const result = accessors.genius.get(typeCode.inner);
    console.log('genius.get result:', result);
  }
  
  if (accessors.genius.getName) {
    const name = accessors.genius.getName(typeCode.inner);
    console.log('genius.getName result:', name);
  }
  
  // getDescriptionメソッドを試す
  console.log('\n=== getDescription テスト ===');
  const description = accessors.getDescription(typeCode.inner);
  console.log('description:', description);
  
} catch (error) {
  console.error('エラー:', error);
}