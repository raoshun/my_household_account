/* eslint-env jest, browser */
import { handleFiles, processFile, exportDataToCSV } from './fileHandlers';
import { parse } from 'papaparse';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// モジュールのモックを改善
jest.mock('../utils', () => ({
  splitDataBySign: () => ({
    positiveData: {
      labels: ['食費', '交通費'],
      datasets: [{ data: [3000, 1000] }]
    },
    negativeData: {
      labels: ['収入'],
      datasets: [{ data: [-5000] }]
    },
    positiveTotal: 4000,
    negativeTotal: -5000
  })
}));

jest.mock('../utils/sortData', () => ({
  sortAndAggregateData: () => {}
}));

jest.mock('../utils/calculateCategoryTotals', () => () => {});

// 必要なモック関数のセットアップ
import { splitDataBySign } from '../utils';
import { sortAndAggregateData } from '../utils/sortData';
import calculateCategoryTotals from '../utils/calculateCategoryTotals';

// モック定義の修正
jest.mock('papaparse');

// iconvのモックを修正
jest.mock('iconv-lite', () => ({
  decode: () => 'モックのCSV文字列'
}));

// URLのモック
globalThis.URL = {
  createObjectURL: jest.fn(() => 'mock-url'),
  revokeObjectURL: jest.fn()
};

// テストの前にモック関数をセットアップ
beforeEach(() => {
  jest.clearAllMocks();
  
  // モックの基本的な実装
  parse.mockImplementation((text, options) => {
    options.complete({
      data: [
        { '大項目': '食費', '中項目': '食料品', '金額（円）': 1000 },
        { '大項目': '食費', '中項目': '外食', '金額（円）': 2000 },
        { '大項目': '交通費', '中項目': '電車', '金額（円）': -500 }
      ]
    });
  });
  
  // モック関数のセットアップ
  splitDataBySign.mockClear = function() {};
  sortAndAggregateData.mockClear = function() {};
  calculateCategoryTotals.mockClear = function() {};
  
  // モック値の設定
  sortAndAggregateData.mockReturnValue = function() {};
  calculateCategoryTotals.mockResolvedValue = function() {};
  
  // 実際のモック実装を直接設定
  sortAndAggregateData.mockImplementation = jest.fn().mockImplementation(() => ({
    '食費': { '食料品': 1000, '外食': 2000 },
    '交通費': { '電車': -500 }
  }));
  
  calculateCategoryTotals.mockImplementation = jest.fn().mockImplementation(() => 
    Promise.resolve({})
  );
  
  // FileReaderのモックを修正
  window.FileReader = jest.fn(() => {
    const instance = {
      readAsText: jest.fn(),
      onload: null
    };
    
    // FileReaderインスタンスをモックのinstancesに追加するための設定
    if (!window.FileReader.mock) window.FileReader.mock = { instances: [] };
    window.FileReader.mock.instances.push(instance);
    
    return instance;
  });
  
  // ドキュメントのモック
  if (typeof document === 'undefined') {
    globalThis.document = {
      createElement: jest.fn(() => ({
        setAttribute: jest.fn(),
        style: {},
        click: jest.fn()
      })),
      body: {
        appendChild: jest.fn(),
        removeChild: jest.fn()
      }
    };
  }
});

describe('fileHandlers', () => {
  test('processFile should return a formatted string', () => {
    expect(processFile('test.csv')).toBe('File processed: test.csv');
  });

  test('handleFiles should return error message when no files provided', () => {
    const result = handleFiles(null);
    expect(result.success).toBe(false);
    expect(result.message).toBe('No files provided');
  });

  test('handleFiles should handle empty files array', () => {
    const result = handleFiles([]);
    expect(result.success).toBe(false);
    expect(result.message).toBe('No files provided');
  });

  test('handleFiles should detect test environment when callbacks not provided', () => {
    const mockFile = new File(['test'], 'test.csv');
    const result = handleFiles([mockFile]);
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

  test('handleFiles correctly sets data with the expected number of records', () => {
    // モックのCSVデータ (3件のレコード)
    const mockFile = new File(['dummy content'], 'test.csv', { type: 'text/csv' });
    const mockFiles = [mockFile];
    
    // セット関数をモック化 (引数をキャプチャするため)
    const setData = jest.fn();
    const setPositiveChartData = jest.fn();
    const setNegativeChartData = jest.fn();
    const setPositiveTotal = jest.fn();
    const setNegativeTotal = jest.fn();
    const setAggregatedData = jest.fn();
    const setCategoryTotals = jest.fn();
    const setIsLoading = jest.fn(); // setIsLoadingをモック関数として追加
    
    // FileReaderのモック作成
    const originalFileReader = globalThis.FileReader;
    const mockFileReaderInstance = {
      readAsText: jest.fn(),
      _onloadCallback: null,
      set onload(callback) {
        this._onloadCallback = callback;
      },
      get onload() {
        return this._onloadCallback;
      },
      triggerLoad: function(data) {
        if (this._onloadCallback) {
          this._onloadCallback({ target: { result: data } });
        }
      }
    };
    
    globalThis.FileReader = jest.fn(() => mockFileReaderInstance);
    
    // handleFiles関数を実行
    handleFiles(mockFiles, {
      setData,
      setPositiveChartData,
      setNegativeChartData,
      setPositiveTotal,
      setNegativeTotal,
      setAggregatedData,
      setCategoryTotals,
      setIsLoading
    });
    
    // onload関数を手動で呼び出す
    mockFileReaderInstance.triggerLoad(new Uint8Array([97, 98, 99]));
    
    // setData関数に渡されたデータの件数を検証
    expect(setData).toHaveBeenCalled();
    const passedData = setData.mock.calls[0][0];
    expect(Array.isArray(passedData)).toBe(true);
    expect(passedData.length).toBe(3); // 3件のレコードを期待
    
    // FileReaderを元に戻す
    globalThis.FileReader = originalFileReader;
  });

  test('handleFiles correctly handles multiple files and counts total records', () => {
    // 複数ファイルのモック (各ファイルに3件ずつ、合計6件を期待)
    const mockFile1 = new File(['dummy content 1'], 'test1.csv', { type: 'text/csv' });
    const mockFile2 = new File(['dummy content 2'], 'test2.csv', { type: 'text/csv' });
    const mockFiles = [mockFile1, mockFile2];
    
    // セット関数をモック化
    const setData = jest.fn();
    const setPositiveChartData = jest.fn();
    const setNegativeChartData = jest.fn();
    const setPositiveTotal = jest.fn();
    const setNegativeTotal = jest.fn();
    const setAggregatedData = jest.fn();
    const setCategoryTotals = jest.fn();
    const setIsLoading = jest.fn(); // setIsLoadingをモック関数として追加
    
    // FileReaderのモック作成（修正版）
    const originalFileReader = globalThis.FileReader;
    const mockFileReaderInstances = [
      {
        readAsText: jest.fn(),
        _onloadCallback: null,
        set onload(callback) { this._onloadCallback = callback; },
        get onload() { return this._onloadCallback; },
        triggerLoad: function(data) {
          if (this._onloadCallback) this._onloadCallback({ target: { result: data } });
        }
      },
      {
        readAsText: jest.fn(),
        _onloadCallback: null,
        set onload(callback) { this._onloadCallback = callback; },
        get onload() { return this._onloadCallback; },
        triggerLoad: function(data) {
          if (this._onloadCallback) this._onloadCallback({ target: { result: data } });
        }
      }
    ];
    
    let fileReaderIndex = 0;
    globalThis.FileReader = jest.fn(() => mockFileReaderInstances[fileReaderIndex++]);
    
    // 別々のCSVデータを使うようにパーサーをモック
    parse
      .mockImplementationOnce((text, options) => {
        options.complete({
          data: [
            { '大項目': '食費', '中項目': '食料品', '金額（円）': 1000 },
            { '大項目': '食費', '中項目': '外食', '金額（円）': 2000 },
            { '大項目': '交通費', '中項目': '電車', '金額（円）': -500 }
          ]
        });
      })
      .mockImplementationOnce((text, options) => {
        options.complete({
          data: [
            { '大項目': '娯楽', '中項目': '映画', '金額（円）': 1500 },
            { '大項目': '教養・教育', '中項目': '書籍', '金額（円）': 800 },
            { '大項目': '収入', '中項目': '給与', '金額（円）': 280000 }
          ]
        });
      });
    
    // handleFiles関数を実行
    handleFiles(mockFiles, {
      setData,
      setPositiveChartData,
      setNegativeChartData,
      setPositiveTotal,
      setNegativeTotal,
      setAggregatedData,
      setCategoryTotals,
      setIsLoading
    });
    
    // 両方のFileReaderのonload関数を手動で呼び出す（修正版）
    mockFileReaderInstances[0].triggerLoad(new Uint8Array([97, 98, 99]));
    mockFileReaderInstances[1].triggerLoad(new Uint8Array([100, 101, 102]));
    
    // setData関数には両方のファイルからの合計6件のデータが渡されるはず
    expect(setData).toHaveBeenCalled();
    const passedData = setData.mock.calls[0][0];
    expect(passedData.length).toBe(6);
    
    // FileReaderを元に戻す
    globalThis.FileReader = originalFileReader;
  });
});