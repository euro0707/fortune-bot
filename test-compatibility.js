const { getPersonality, getDetail } = require('@kurone-kito/dantalion-core');

// 相性テスト
const birthday1 = '1993-10-09';
const birthday2 = '1990-05-15';

console.log('=== 相性診断テスト ===');

try {
  const person1 = getPersonality(birthday1);
  const person2 = getPersonality(birthday2);
  
  console.log(`${birthday1} の性格:`, person1);
  console.log(`${birthday2} の性格:`, person2);
  
  // 各性格IDの詳細を取得
  const detail1Inner = getDetail(person1.inner);
  const detail2Inner = getDetail(person2.inner);
  
  console.log('\n=== 相性データ ===');
  console.log(`${birthday1}(${person1.inner}) のビジネス相性:`, detail1Inner.affinity.biz);
  console.log(`${birthday1}(${person1.inner}) の恋愛相性:`, detail1Inner.affinity.love);
  
  // 具体的な相性を確認
  console.log(`\n=== 相性スコア ===`);
  console.log(`ビジネス相性 ${person1.inner} → ${person2.inner}:`, detail1Inner.affinity.biz[person2.inner]);
  console.log(`恋愛相性 ${person1.inner} → ${person2.inner}:`, detail1Inner.affinity.love[person2.inner]);
  console.log(`ビジネス相性 ${person2.inner} → ${person1.inner}:`, detail2Inner.affinity.biz[person1.inner]);
  console.log(`恋愛相性 ${person2.inner} → ${person1.inner}:`, detail2Inner.affinity.love[person1.inner]);
  
} catch (error) {
  console.error('エラー:', error);
}