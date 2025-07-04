// matchCategories.test.js
import { jest, test, expect, describe } from '@jest/globals';

// モックデータ（モジュールの外部で定義）
const mockCategoryData = [
  { "大項目": "食費", "type": "expense", "frequency": "daily" },
  { "大項目": "日用品", "type": "expense", "frequency": "weekly" },
  { "大項目": "交通費", "type": "expense", "frequency": "daily" }
];

// ファクトリー関数を使用せず、直接オブジェクトを返すようにモック
jest.mock('./fetchCategories', () => ({
  fetchCategories: () => Promise.resolve(mockCategoryData)
}));

// デフォルトインポートに修正
import matchCategories from './matchCategories';

describe('matchCategories', () => {
  test('正確に一致するカテゴリを見つける', async () => {
    const expense = { '大項目': '食費', '中項目': '食料品', '金額（円）': 1000 };
    
    const result = await matchCategories(expense);
    expect(result).toEqual({
      '大項目': '食費',
      '中項目': '食料品',
      '金額（円）': 1000,
      'type': 'expense',
      'frequency': 'daily'
    });
  });
  
  test('存在しないカテゴリは元のデータを返す', async () => {
    const expense = { '大項目': '未分類', '中項目': 'その他', '金額（円）': 500 };
    
    const result = await matchCategories(expense);
    expect(result).toEqual(expense);
  });
});