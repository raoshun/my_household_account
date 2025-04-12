/* eslint-env jest */
import { sortData, sortAndAggregateData } from './sortData';
import { test, expect } from '@jest/globals';

test('sortAndAggregateData should aggregate data by categories', () => {
  const testData = [
    { '大項目': '食費', '中項目': '食料品', '金額（円）': 1000 },
    { '大項目': '食費', '中項目': '外食', '金額（円）': 2000 },
    { '大項目': '交通費', '中項目': '電車', '金額（円）': 500 }
  ];
  
  const expectedResult = {
    '食費': {
      '食料品': 1000,
      '外食': 2000
    },
    '交通費': {
      '電車': 500
    }
  };
  
  expect(sortAndAggregateData(testData)).toEqual(expectedResult);
});

// sortData関数のテスト追加
test('sortData should sort data by specified key in ascending order', () => {
  const testData = [
    { '大項目': '交通費', '金額（円）': 500 },
    { '大項目': '食費', '金額（円）': 2000 },
    { '大項目': '娯楽', '金額（円）': 1500 }
  ];
  
  const sortedByCategory = sortData(testData, '大項目', 'asc');
  expect(sortedByCategory[0]['大項目']).toBe('交通費');
  expect(sortedByCategory[1]['大項目']).toBe('娯楽');
  expect(sortedByCategory[2]['大項目']).toBe('食費');
  
  const sortedByAmount = sortData(testData, '金額（円）', 'asc');
  expect(sortedByAmount[0]['金額（円）']).toBe(500);
  expect(sortedByAmount[1]['金額（円）']).toBe(1500);
  expect(sortedByAmount[2]['金額（円）']).toBe(2000);
});

test('sortData should sort data by specified key in descending order', () => {
  const testData = [
    { '大項目': '交通費', '金額（円）': 500 },
    { '大項目': '食費', '金額（円）': 2000 },
    { '大項目': '娯楽', '金額（円）': 1500 }
  ];
  
  const sortedByCategory = sortData(testData, '大項目', 'desc');
  expect(sortedByCategory[0]['大項目']).toBe('食費');
  expect(sortedByCategory[1]['大項目']).toBe('娯楽');
  expect(sortedByCategory[2]['大項目']).toBe('交通費');
  
  const sortedByAmount = sortData(testData, '金額（円）', 'desc');
  expect(sortedByAmount[0]['金額（円）']).toBe(2000);
  expect(sortedByAmount[1]['金額（円）']).toBe(1500);
  expect(sortedByAmount[2]['金額（円）']).toBe(500);
});

test('sortData should handle empty or invalid input', () => {
  expect(sortData([], '大項目')).toEqual([]);
  expect(sortData(null, '大項目')).toEqual([]);
  expect(sortData(undefined, '大項目')).toEqual([]);
});

test('sortData should handle missing keys in data objects', () => {
  const testData = [
    { '金額（円）': 500 },
    { '大項目': '食費', '金額（円）': 2000 },
    { '大項目': '娯楽' }
  ];
  
  const sortedByCategory = sortData(testData, '大項目', 'asc');
  // undefined値は空文字として扱われ、アルファベット順で先頭になる
  expect(sortedByCategory[0]['大項目']).toBe(undefined);
  expect(sortedByCategory[1]['大項目']).toBe('娯楽');
  expect(sortedByCategory[2]['大項目']).toBe('食費');
  
  const sortedByAmount = sortData(testData, '金額（円）', 'asc');
  // undefined値は数値の場合、比較でNaNになるため最後に配置される
  expect(sortedByAmount[0]['金額（円）']).toBe(500);
  expect(sortedByAmount[1]['金額（円）']).toBe(2000);
  expect(sortedByAmount[2]['金額（円）']).toBe(undefined);
});