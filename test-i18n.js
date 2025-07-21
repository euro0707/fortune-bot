const { getPersonality } = require('@kurone-kito/dantalion-core');

// i18nライブラリの正しいインポート方法を確認
console.log('利用可能なi18nモジュール:');
try {
  const i18n = require('@kurone-kito/dantalion-i18n');
  console.log('i18n:', Object.keys(i18n));
} catch (e) {
  console.log('i18nエラー:', e.message);
}

try {
  const ja = require('@kurone-kito/dantalion-i18n/lib/ja');
  console.log('ja:', Object.keys(ja));
} catch (e) {
  console.log('ja エラー:', e.message);
}

// テスト用の誕生日
const birthday = '1993-10-09';

console.log('=== Dantalion i18n テスト ===');

try {
  const typeCode = getPersonality(birthday);
  console.log('typeCode:', typeCode);
  
  const result = genius.getValue(typeCode);
  console.log('genius result:', result);
  
  console.log('\n=== 詳細データ ===');
  if (result) {
    console.log('name:', result.name);
    console.log('summary:', result.summary);
    console.log('weakness:', result.weakness);
    console.log('solution:', result.solution);
  }
  
} catch (error) {
  console.error('エラー:', error);
}