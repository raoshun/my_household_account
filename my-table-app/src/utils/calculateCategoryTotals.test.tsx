/* eslint-env jest */
import calculateCategoryTotals from './calculateCategoryTotals';
import { describe, expect } from '@jest/globals';

describe('calculateCategoryTotals', () => {
  test('calculateCategoryTotals returns correct totals', async () => {
    // 関数が期待する正確なデータ形式を使用
    const input = [
      {
        大項目: '必需品',
        中項目: '定期',
        金額: 150
      },
      {
        大項目: '必需品',
        中項目: '定期',
        金額: 100
      },
      {
        大項目: '娯楽',
        中項目: '臨時',
        金額: 200
      }
    ];
    
    // 直接テストデータを使用
    const result = await calculateCategoryTotals(input);
    
    // 結果の検証
    expect(result).toEqual({
      '必需品 - 定期': 250,
      '娯楽 - 臨時': 200
    });
  });

  test('calculateCategoryTotals handles empty data gracefully', async () => {
    const result = await calculateCategoryTotals([]);
    expect(result).toEqual({});
  });

  test('calculateCategoryTotals handles missing category fields', async () => {
    const input = [
      { 金額: 100 },
      { 大項目: '食費', 金額: 200 }
    ];
    
    const result = await calculateCategoryTotals(input);
    expect(result).toHaveProperty('未分類 - 未分類');
    expect(result).toHaveProperty('食費 - 未分類');
  });
});