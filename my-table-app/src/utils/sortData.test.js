/* eslint-env jest */
import { sortData, sortAndAggregateData, filterData } from './sortData';
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

// filterData関数のテスト
test('filterData should filter data by specified filters', () => {
  const testData = [
    { '大項目': '食費', '金額（円）': 3000 },
    { '大項目': '娯楽', '金額（円）': 2000 },
    { '大項目': '交通費', '金額（円）': 1000 },
  ];
  
  // 大項目が食費のデータだけをフィルタリング
  const filtered = filterData(testData, { '大項目': '食費' });
  expect(filtered).toHaveLength(1);
  expect(filtered[0]['大項目']).toBe('食費');
});

test('filterData should handle empty or invalid input', () => {
  expect(filterData(null, { key: 'value' })).toEqual([]);
  expect(filterData([], { key: 'value' })).toEqual([]);
  expect(filterData({}, { key: 'value' })).toEqual([]);
});

test('filterData should filter out transfers when excludeTransfers is true', () => {
  const testData = [
    { '大項目': '食費', '金額（円）': 3000, '振替': '' },
    { '大項目': '娯楽', '金額（円）': 2000, '振替': '0' },
    { '大項目': '交通費', '金額（円）': 1000, '振替': '1' },
    { '大項目': '住居費', '金額（円）': 5000, '振替': '振替対象' },
  ];
  
  // 振替を除外するフィルタを適用
  const filtered = filterData(testData, { excludeTransfers: true });
  expect(filtered).toHaveLength(2);
  
  // 振替が空または0のデータのみが含まれていることを確認
  const includesNonTransfer = filtered.every(item => 
    item['振替'] === '' || item['振替'] === '0' || item['振替'] === 0
  );
  expect(includesNonTransfer).toBe(true);
  
  // 振替があるデータが除外されていることを確認
  const hasTransferItems = filtered.some(item => 
    item['振替'] === '1' || item['振替'] === '振替対象'
  );
  expect(hasTransferItems).toBe(false);
});

test('filterData should not filter transfers when excludeTransfers is false or undefined', () => {
  const testData = [
    { '大項目': '食費', '金額（円）': 3000, '振替': '' },
    { '大項目': '娯楽', '金額（円）': 2000, '振替': '0' },
    { '大項目': '交通費', '金額（円）': 1000, '振替': '1' },
    { '大項目': '住居費', '金額（円）': 5000, '振替': '振替対象' },
  ];
  
  // excludeTransfersをfalseに設定
  const filteredWithFlag = filterData(testData, { excludeTransfers: false });
  expect(filteredWithFlag).toHaveLength(4); // すべてのデータが含まれる
  
  // excludeTransfersを指定しない
  const filteredWithoutFlag = filterData(testData, {});
  expect(filteredWithoutFlag).toHaveLength(4); // すべてのデータが含まれる
});

// 日付範囲フィルターのテスト
test('filterData should filter data by date range using startDate filter', () => {
  const testData = [
    { '大項目': '食費', '日付': '2023/01/15', '金額（円）': 1000 },
    { '大項目': '食費', '日付': '2023/02/10', '金額（円）': 2000 },
    { '大項目': '食費', '日付': '2023/03/20', '金額（円）': 3000 },
  ];
  
  // 開始日のみのフィルター
  const filtered = filterData(testData, { startDate: '2023-02-01' });
  expect(filtered).toHaveLength(2);
  
  // 日付が2023/02/01以降のデータのみが含まれることを確認
  const dates = filtered.map(item => item['日付']);
  expect(dates).toContain('2023/02/10');
  expect(dates).toContain('2023/03/20');
  expect(dates).not.toContain('2023/01/15');
});

test('filterData should filter data by date range using endDate filter', () => {
  const testData = [
    { '大項目': '食費', '日付': '2023/01/15', '金額（円）': 1000 },
    { '大項目': '食費', '日付': '2023/02/10', '金額（円）': 2000 },
    { '大項目': '食費', '日付': '2023/03/20', '金額（円）': 3000 },
  ];
  
  // 終了日のみのフィルター
  const filtered = filterData(testData, { endDate: '2023-02-15' });
  expect(filtered).toHaveLength(2);
  
  // 日付が2023/02/15以前のデータのみが含まれることを確認
  const dates = filtered.map(item => item['日付']);
  expect(dates).toContain('2023/01/15');
  expect(dates).toContain('2023/02/10');
  expect(dates).not.toContain('2023/03/20');
});

test('filterData should filter data by date range using both startDate and endDate filters', () => {
  const testData = [
    { '大項目': '食費', '日付': '2023/01/15', '金額（円）': 1000 },
    { '大項目': '食費', '日付': '2023/02/10', '金額（円）': 2000 },
    { '大項目': '食費', '日付': '2023/03/20', '金額（円）': 3000 },
  ];
  
  // 開始日と終了日の両方を指定
  const filtered = filterData(testData, {
    startDate: '2023-01-20',
    endDate: '2023-03-01'
  });
  
  expect(filtered).toHaveLength(1);
  expect(filtered[0]['日付']).toBe('2023/02/10');
});

test('filterData should handle different date formats correctly', () => {
  const testData = [
    { '大項目': '食費', '日付': '2023/01/15', '金額（円）': 1000 }, // YYYY/MM/DD形式
    { '大項目': '食費', '日付': '2023-02-10', '金額（円）': 2000 }, // YYYY-MM-DD形式
    { '大項目': '食費', '日付': '44640', '金額（円）': 3000 },      // Excel日付（2022/3/15に対応する数値）
    { '大項目': '食費', '日付': '無効な日付', '金額（円）': 4000 }, // 無効な日付
  ];
  
  // 日付範囲でフィルタリング
  const filtered = filterData(testData, {
    startDate: '2023-01-01',
    endDate: '2023-02-28'
  });
  
  expect(filtered).toHaveLength(2);
  expect(filtered.some(item => item['日付'] === '2023/01/15')).toBe(true);
  expect(filtered.some(item => item['日付'] === '2023-02-10')).toBe(true);
  
  // 無効な日付と範囲外の日付が除外されていることを確認
  expect(filtered.some(item => item['日付'] === '44640')).toBe(false);
  expect(filtered.some(item => item['日付'] === '無効な日付')).toBe(false);
});

test('filterData should skip date filtering if neither startDate nor endDate is provided', () => {
  const testData = [
    { '大項目': '食費', '日付': '2023/01/15', '金額（円）': 1000 },
    { '大項目': '食費', '日付': '2023/02/10', '金額（円）': 2000 },
    { '大項目': '食費', '日付': '無効な日付', '金額（円）': 3000 },
  ];
  
  // 日付フィルターなしでフィルタリング
  const filtered = filterData(testData, { '大項目': '食費' });
  
  // すべての食費データが含まれることを確認（日付無効なものも含む）
  expect(filtered).toHaveLength(3);
});