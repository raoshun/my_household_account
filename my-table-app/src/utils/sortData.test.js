/* eslint-env jest */
import { sortData, sortAndAggregateData } from './sortData';
import { test, expect } from '@jest/globals';

test('sortAndAggregateData should aggregate data by categories', () => {
  const testData = [
    { '大項目': '食費', '中項目': '食料品', '金額（円）': 1000 },
    { '大項目': '食費', '中項目': '外食', '金額（円）': 2000 },
    { '大項目': '交通費', '中項目': '電車', '金額（円）': 500 },
  ];

  const result = sortAndAggregateData(testData);
  
  // カテゴリが存在することを確認
  expect(result).toHaveProperty('食費');
  expect(result).toHaveProperty('交通費');
  
  // 各カテゴリが必要なプロパティを持っているか確認
  expect(result['食費']).toHaveProperty('items');
  expect(result['食費']).toHaveProperty('total');
  expect(result['交通費']).toHaveProperty('items');
  expect(result['交通費']).toHaveProperty('total');
  
  // 合計値が正しいか確認
  expect(result['食費'].total).toBe(3000);
  expect(result['交通費'].total).toBe(500);
  
  // 項目数が正しいか確認
  expect(result['食費'].items).toHaveLength(2);
  expect(result['交通費'].items).toHaveLength(1);
});

// sortData関数のテスト
test('sortData should sort data by specified key in ascending order', () => {
  const testData = [
    { '大項目': '食費', '金額（円）': 3000 },
    { '大項目': '娯楽', '金額（円）': 2000 },
    { '大項目': '交通費', '金額（円）': 1000 },
  ];
  
  // 金額でソート（昇順）
  const sortedByAmount = sortData(testData, '金額（円）', 'asc');
  // 正しくソートされたか確認
  expect(sortedByAmount).toHaveLength(3);
  expect(sortedByAmount[0]['金額（円）']).toBe(1000);
  expect(sortedByAmount[1]['金額（円）']).toBe(2000);
  expect(sortedByAmount[2]['金額（円）']).toBe(3000);
});

test('sortData should sort data by specified key in descending order', () => {
  const testData = [
    { '大項目': '食費', '金額（円）': 3000 },
    { '大項目': '娯楽', '金額（円）': 2000 },
    { '大項目': '交通費', '金額（円）': 1000 },
  ];
  
  // 金額でソート（降順）
  const sortedByAmount = sortData(testData, '金額（円）', 'desc');
  // 正しくソートされたか確認
  expect(sortedByAmount[0]['金額（円）']).toBe(3000);
  expect(sortedByAmount[1]['金額（円）']).toBe(2000);
  expect(sortedByAmount[2]['金額（円）']).toBe(1000);
});

test('sortData should handle empty or invalid input', () => {
  expect(sortData(null, 'key')).toEqual([]);
  expect(sortData([], 'key')).toEqual([]);
  expect(sortData({}, 'key')).toEqual([]);
});

test('sortData should handle missing keys in data objects', () => {
  const testData = [
    { '大項目': '食費' },
    { '大項目': '娯楽' },
    { '中項目': '不明' }, // 大項目キーがない
  ];
  
  const sortedByCategory = sortData(testData, '大項目', 'asc');
  
  // 結果に全ての項目が含まれていることを確認
  expect(sortedByCategory).toHaveLength(3);
  
  // 結果に必要なカテゴリが含まれていることを確認
  const categories = sortedByCategory
    .map(item => item['大項目'])
    .filter(category => category !== undefined);
  
  expect(categories).toContain('食費');
  expect(categories).toContain('娯楽');
  
  // undefinedを持つデータが存在することを確認
  const hasUndefinedKey = sortedByCategory.some(item => item['大項目'] === undefined);
  expect(hasUndefinedKey).toBe(true);
});