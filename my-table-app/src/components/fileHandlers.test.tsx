/* eslint-env jest, browser */
import { handleFiles, processFile, exportDataToCSV, detectDateRange } from './fileHandlers';
import { parse } from 'papaparse';
import { describe, test, expect, beforeEach, jest, beforeAll, afterAll } from '@jest/globals';
// ErrorEventのモックをインポート
import '../test-utils/errorEventMock';

// テスト環境フラグを明示的に設定
import type { TestEnvWindow } from '../types';
(window as TestEnvWindow).__JEST_TEST_ENV__ = true;

// モジュールのモックを改善
jest.mock('../utils/sortData', () => {
  return {
    sortAndAggregateData: () => ({
      '食費': { '食料品': 1000, '外食': 2000 },
      '交通費': { '電車': -500 }
    })
  };
});

jest.mock('../utils/calculateCategoryTotals', () => {
  return () => Promise.resolve({
    '食費': 3000,
    '交通費': 500
  });
});

// 必要なモック関数のインポート
import * as actualUtils from '../utils';

// papaparseのモック
jest.mock('papaparse');

// iconvのモック
jest.mock('iconv-lite', () => ({
  decode: () => 'モックのCSV文字列'
}));

// URLのモック
globalThis.URL = {
  createObjectURL: jest.fn(() => 'mock-url'),
  revokeObjectURL: jest.fn()
} as unknown as typeof URL;

// FileReaderのグローバルモック
import MockFileReader from '../test-utils/fileReaderMock';
(window as unknown as { FileReader: typeof MockFileReader }).FileReader = MockFileReader;

import { setupTestEnvironment, cleanupTestEnvironment } from '../test-utils/testSetup';
import { createMockSetters, createMockFileList } from '../test-utils/mockHelpers';

// テスト前の設定
beforeAll(() => {
  setupTestEnvironment();
});

afterAll(() => {
  cleanupTestEnvironment();
});

beforeEach(() => {
  jest.clearAllMocks();
  // splitDataBySignのモック
  jest.spyOn(actualUtils, 'splitDataBySign').mockImplementation(() => ({
    positive: [],
    negative: [],
    positiveTotal: 4000,
    negativeTotal: -5000,
    positiveData: {
      labels: ['食費', '交通費'],
      datasets: [{ data: [3000, 1000], backgroundColor: '#ff6384', borderWidth: 1 }]
    },
    negativeData: {
      labels: ['収入'],
      datasets: [{ data: [-5000], backgroundColor: '#ff6384', borderWidth: 1 }]
    }
  }));
  parse.mockImplementation((text, options) => {
    options.complete({
      data: [
        { '大項目': '食費', '中項目': '食料品', '金額（円）': 1000 },
        { '大項目': '食費', '中項目': '外食', '金額（円）': 2000 },
        { '大項目': '交通費', '中項目': '電車', '金額（円）': -500 }
      ]
    });
  });
  
  // DOMのモック
  if (typeof document === 'undefined') {
    globalThis.document = {
      createElement: (() => ({
        setAttribute: jest.fn(),
        style: {},
        click: jest.fn()
      })) as unknown as typeof globalThis.document.createElement,
      body: {
        appendChild: jest.fn(),
        removeChild: jest.fn()
      } as unknown as HTMLElement
    } as unknown as Document;
  }
});

// DRY: 共通のセッター関数モック生成
function createAllSetters() {
  return {
    setData: jest.fn(),
    setPositiveChartData: jest.fn(),
    setNegativeChartData: jest.fn(),
    setPositiveTotal: jest.fn(),
    setNegativeTotal: jest.fn(),
    setIsLoading: jest.fn(),
    setError: jest.fn(),
  };
}

// 共通ヘルパー: セッター関数とファイル生成、非同期待機
function setupFileTest({ fileContents = ['dummy csv content'], fileNames = ['test.csv'], setters = null } = {}) {
  const files = fileContents.map((content, i) => new File([content], fileNames[i] || `file${i}.csv`, { type: 'text/csv' }));
  const s = setters || createMockSetters();
  return { files: createMockFileList(files), setters: s };
}

async function waitForAsync(ms = 100) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 基本的なテスト
describe('fileHandlers 基本機能テスト', () => {
  test('processFile should return a formatted string', () => {
    expect(processFile('test.csv')).toBe('File processed: test.csv');
  });

  test('handleFiles should return error message when no files provided', () => {
    const { setData, setPositiveChartData } = createMockSetters();
    const result = handleFiles(null, { setData, setPositiveChartData });
    expect(result.success).toBe(false);
    expect(result.message).toBe('No files provided');
  });

  test('handleFiles should handle empty files array', () => {
    const { setData, setPositiveChartData } = createMockSetters();
    const result = handleFiles(createMockFileList([]), { setData, setPositiveChartData });
    expect(result.success).toBe(false);
    expect(result.message).toBe('No files provided');
  });

  test('handleFiles should detect test environment when callbacks not provided', () => {
    const mockFile = new File(['test data'], 'test.csv', { type: 'text/csv' });
    const result = handleFiles(createMockFileList([mockFile]));
    expect(result.success).toBe(true);
    expect(result.message).toBe('Test environment detected');
  });

  test('exportDataToCSV should return error when no data provided', () => {
    const result = exportDataToCSV(null);
    expect(result.success).toBe(false);
    expect(result.message).toBe('No data to export');
  });

  test('exportDataToCSV should handle empty array', () => {
    const result = exportDataToCSV([]);
    expect(result.success).toBe(false);
    expect(result.message).toBe('No data to export');
  });

  test('exportDataToCSV should handle valid data', () => {
    const data = [{ id: 1, name: 'Test' }];
    const result = exportDataToCSV(data);
    expect(result.success).toBe(true);
    expect(result.message).toBe('CSV exported successfully');
  });
});

// ファイル処理のテスト例: 共通セッター関数を利用
describe('fileHandlers ファイル処理テスト', () => {
  test('handleFiles correctly processes CSV data', async () => {
    const { files, setters } = setupFileTest();
    handleFiles(files, setters);
    await waitForAsync();
    expect(setters.setIsLoading).toHaveBeenCalledWith(true);
    expect(setters.setData).toHaveBeenCalled();
    expect(setters.setPositiveChartData).toHaveBeenCalled();
    expect(setters.setNegativeChartData).toHaveBeenCalled();
    expect(setters.setIsLoading).toHaveBeenCalledWith(false);
    const passedData = setters.setData.mock.calls[0][0];
    expect(Array.isArray(passedData)).toBe(true);
    expect(passedData.length).toBe(3);
  });

  test('handleFiles correctly handles multiple files', async () => {
    const { files, setters } = setupFileTest({
      fileContents: ['content1', 'content2'],
      fileNames: ['file1.csv', 'file2.csv']
    });
    handleFiles(files, setters);
    await waitForAsync(150);
    expect(setters.setIsLoading).toHaveBeenCalledWith(true);
    expect(setters.setIsLoading).toHaveBeenCalledWith(false);
  });

  test('handleFiles correctly handles errors', async () => {
    parse.mockImplementationOnce((text, options) => {
      if (options.error) {
        options.error(new Error('CSV parsing failed'));
      }
      options.complete({ data: [] });
    });
    const { files } = setupFileTest({ fileContents: ['invalid csv'], fileNames: ['error.csv'] });
    const setters = createAllSetters();
    handleFiles(files, setters);
    await waitForAsync();
    expect(setters.setError).toHaveBeenCalled();
    expect(setters.setIsLoading).toHaveBeenCalledWith(false);
  });
});

// エッジケースのテスト
describe('fileHandlers エッジケーステスト', () => {
  test('handleFiles correctly processes empty CSV data', async () => {
    // 空のCSVデータをシミュレートするためのモック
    parse.mockImplementationOnce((text, options) => {
      options.complete({ data: [] });
    });
    
    // ファイルモック
    const mockFile = new File([''], 'empty.csv', { type: 'text/csv' });
    const mockFiles = createMockFileList([mockFile]);
    
    // セッター関数をモック
    const setData = jest.fn();
    const setPositiveChartData = jest.fn();
    const setNegativeChartData = jest.fn();
    const setPositiveTotal = jest.fn();
    const setNegativeTotal = jest.fn();
    const setIsLoading = jest.fn();
    
    // handleFiles関数を実行
    handleFiles(mockFiles, {
      setData,
      setPositiveChartData,
      setNegativeChartData,
      setPositiveTotal,
      setNegativeTotal,
      setIsLoading
    });
    
    // 非同期処理の完了を待つ
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 検証
    expect(setData).toHaveBeenCalledWith([]);
    expect(setIsLoading).toHaveBeenCalledWith(false);
  });
});

// 空行フィルタリングのテスト
describe('CSV空行フィルタリングテスト', () => {
  test('空行が正しくフィルタリングされること', async () => {
    // 空行を含むCSVデータをシミュレートするためのモック
    parse.mockImplementationOnce((text, options) => {
      options.complete({
        data: [
          { '大項目': '食費', '中項目': '食料品', '金額（円）': 1000 },
          { '大項目': '', '中項目': '', '金額（円）': '' }, // 完全な空行
          { '大項目': '食費', '中項目': '外食', '金額（円）': 2000 },
          {}, // キーがない空オブジェクト
          { '大項目': null, '中項目': null, '金額（円）': null }, // null値の行
          { '大項目': '交通費', '中項目': '電車', '金額（円）': -500 }
        ]
      });
    });
    
    // モックのCSVファイル
    const mockFile = new File(['dummy csv with empty lines'], 'test_with_empty_lines.csv', { type: 'text/csv' });
    const mockFiles = createMockFileList([mockFile]);
    
    // セッター関数をモック
    const setData = jest.fn();
    const setPositiveChartData = jest.fn();
    const setNegativeChartData = jest.fn();
    const setIsLoading = jest.fn();
    
    // handleFiles関数を実行
    handleFiles(mockFiles, {
      setData,
      setPositiveChartData,
      setNegativeChartData,
      setIsLoading
    });
    
    // 非同期処理の完了を待つ
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 検証：空行がフィルタリングされているか
    const passedData = setData.mock.calls[0][0] as Record<string, unknown>[];
    expect(Array.isArray(passedData)).toBe(true);
    // 空行がフィルタリングされ、有効なデータのみが残っていることを確認
    expect(passedData.length).toBe(3); // 元の6行から空行3行が除去され3行に
    
    // 残ったデータが正しいか確認
    const validItems = passedData.filter(item => 
      item['大項目'] === '食費' || item['大項目'] === '交通費'
    );
    expect(validItems.length).toBe(3);

    // フィルタリングされたデータに空行が含まれていないことを確認
    const emptyRows = passedData.filter(item => 
      !item || 
      Object.keys(item).length === 0 || 
      Object.values(item).every(val => val === null || val === undefined || val === '')
    );
    expect(emptyRows.length).toBe(0);
    
    expect(setIsLoading).toHaveBeenCalledWith(false);
  });

  test('様々な形式の空行が正しくフィルタリングされること', async () => {
    // 様々な形式の空行を含むCSVデータをシミュレート
    parse.mockImplementationOnce((text, options) => {
      options.complete({
        data: [
          { '大項目': '食費', '中項目': '食料品', '金額（円）': 1000 },
          { '大項目': '', '中項目': '', '金額（円）': '' }, // 空文字列の行
          { '大項目': '食費', '中項目': '外食', '金額（円）': 2000 },
          { '大項目': undefined, '中項目': undefined, '金額（円）': undefined }, // undefined値の行
          { '大項目': '交通費', '中項目': '電車', '金額（円）': -500 },
          { '大項目': null, '中項目': null, '金額（円）': null }, // null値の行
          { '大項目': ' ', '中項目': '  ', '金額（円）': '   ' } // 空白文字だけの行
        ]
      });
    });
    
    // モックのCSVファイル
    const mockFile = new File(['dummy csv with various empty lines'], 'test_with_various_empty.csv', { type: 'text/csv' });
    const mockFiles = createMockFileList([mockFile]);
    
    // セッター関数をモック
    const setData = jest.fn();
    const setPositiveChartData = jest.fn();
    const setNegativeChartData = jest.fn();
    const setIsLoading = jest.fn();
    
    // handleFiles関数を実行
    handleFiles(mockFiles, {
      setData,
      setPositiveChartData,
      setNegativeChartData,
      setIsLoading
    });
    
    // 非同期処理の完了を待つ
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 検証：空行がフィルタリングされているか
    const passedData = setData.mock.calls[0][0] as Record<string, unknown>[];
    expect(Array.isArray(passedData)).toBe(true);
    // 空行がフィルタリングされ、有効なデータのみが残っていることを確認
    expect(passedData.length).toBe(3); // 元の6行から空行3行が除去され3行に
    
    // 残ったデータが正しいか確認
    const validItems = passedData.filter(item => 
      item['大項目'] === '食費' || item['大項目'] === '交通費'
    );
    expect(validItems.length).toBe(3);

    // フィルタリングされたデータに空行が含まれていないことを確認
    const emptyRows = passedData.filter(item => 
      !item || 
      Object.keys(item).length === 0 || 
      Object.values(item).every(val => val === null || val === undefined || val === '')
    );
    expect(emptyRows.length).toBe(0);
    
    expect(setIsLoading).toHaveBeenCalledWith(false);
  });
});

// detectDateRangeのテスト
describe('detectDateRange 関数のテスト', () => {
  test('YYYY/MM/DD形式の日付からの日付範囲検出', () => {
    const testData = [
      { '日付': '2023/01/15', '大項目': '食費', '金額（円）': 1000 },
      { '日付': '2023/02/20', '大項目': '交通費', '金額（円）': 500 },
      { '日付': '2023/01/05', '大項目': '食費', '金額（円）': 2000 }
    ];

    const result = detectDateRange(testData);
    expect(result).toEqual({
      startDate: '2023-01-05',
      endDate: '2023-02-20'
    });
  });

  test('YYYY-MM-DD形式の日付からの日付範囲検出', () => {
    const testData = [
      { '日付': '2023-01-15', '大項目': '食費', '金額（円）': 1000 },
      { '日付': '2023-02-20', '大項目': '交通費', '金額（円）': 500 },
      { '日付': '2023-01-05', '大項目': '食費', '金額（円）': 2000 }
    ];

    const result = detectDateRange(testData);
    expect(result).toEqual({
      startDate: '2023-01-05',
      endDate: '2023-02-20'
    });
  });

  test('YYYY年MM月DD日形式の日付からの日付範囲検出', () => {
    const testData = [
      { '日付': '2023年1月15日', '大項目': '食費', '金額（円）': 1000 },
      { '日付': '2023年2月20日', '大項目': '交通費', '金額（円）': 500 },
      { '日付': '2023年1月5日', '大項目': '食費', '金額（円）': 2000 }
    ];

    const result = detectDateRange(testData);
    expect(result).toEqual({
      startDate: '2023-01-05',
      endDate: '2023-02-20'
    });
  });

  test('混在する日付形式からの日付範囲検出', () => {
    const testData = [
      { '日付': '2023/01/15', '大項目': '食費', '金額（円）': 1000 },
      { '日付': '2023-02-20', '大項目': '交通費', '金額（円）': 500 },
      { '日付': '2023年1月5日', '大項目': '食費', '金額（円）': 2000 }
    ];

    const result = detectDateRange(testData);
    expect(result).toEqual({
      startDate: '2023-01-05',
      endDate: '2023-02-20'
    });
  });

  test('日付データがない場合は空文字を返す', () => {
    const testData = [
      { '大項目': '食費', '金額（円）': 1000 },
      { '大項目': '交通費', '金額（円）': 500 }
    ];

    const result = detectDateRange(testData);
    expect(result).toEqual({
      startDate: '',
      endDate: ''
    });
  });

  test('無効な日付データがある場合は有効なデータのみ処理する', () => {
    const testData = [
      { '日付': '無効な日付', '大項目': '食費', '金額（円）': 1000 },
      { '日付': '2023/02/20', '大項目': '交通費', '金額（円）': 500 },
      { '日付': '2023/01/05', '大項目': '食費', '金額（円）': 2000 }
    ];

    const result = detectDateRange(testData);
    expect(result).toEqual({
      startDate: '2023-01-05',
      endDate: '2023-02-20'
    });
  });
});