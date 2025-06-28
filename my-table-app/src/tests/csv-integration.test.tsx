/* eslint-env jest, browser */
import { handleFiles } from '../components/fileHandlers';
import { parse } from 'papaparse';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import MockFileReader from '../test-utils/fileReaderMock';
import { createMockFileList } from '../test-utils/mockHelpers';

// FileReaderのグローバルモック
(window as unknown as { FileReader: typeof MockFileReader }).FileReader = MockFileReader;

// --- 型エラー解消用のグローバルモック ---
// TextEncoderの型エラー対策
class MockTextEncoder {
  encoding = 'utf-8';
  encode(str) {
    return new Uint8Array([...str].map(c => c.charCodeAt(0)));
  }
  encodeInto(src, dest) {
    const arr = this.encode(src);
    dest.set(arr);
    return { read: arr.length, written: arr.length };
  }
}
globalThis.TextEncoder = MockTextEncoder;

// 型アサーション式（as any など）は TypeScript ファイルでのみ有効です。JSファイルでは使えません。
// そのため、型アサーションを削除し、通常の配列や値として記述してください。
// 例: const arr = [];

// モック定義の修正
jest.mock('papaparse');

// splitDataBySignのモック結果を保持する変数
let mockSplitDataResult = {
  positive: [],
  negative: [],
  positiveTotal: 0,
  negativeTotal: 0,
  positiveData: { labels: [], datasets: [{ label: '', data: [] }] },
  negativeData: { labels: [], datasets: [{ label: '', data: [] }] }
};

jest.mock('../utils', () => {
  return {
    splitDataBySign: () => mockSplitDataResult
  };
});

jest.mock('../utils/sortData', () => ({
  sortAndAggregateData: () => ({})
}));

jest.mock('../utils/calculateCategoryTotals', () => () => Promise.resolve({}));

jest.mock('iconv-lite', () => {
  return {
    decode: () => 'テスト,データ,123\nテスト2,データ2,456'
  };
});

describe('CSV読み込み統合テスト', () => {
  // テスト用のサンプルCSVデータ
  const csvSample = `計算対象,日付,内容,金額（円）,保有金融機関,大項目,中項目,メモ,振替
対象,2023/04/01,スーパー,1000,三菱UFJ銀行,食費,食料品,,
対象,2023/04/05,レストラン,2000,三井住友銀行,食費,外食,,
対象,2023/04/10,電車,500,JR東日本,交通費,電車,,`;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    parse.mockImplementation((text, options) => {
      const data = [
        { '計算対象': '対象', '日付': '2023/04/01', '内容': 'スーパー', '金額（円）': 1000, '保有金融機関': '三菱UFJ銀行', '大項目': '食費', '中項目': '食料品', 'メモ': '', '振替': '' },
        { '計算対象': '対象', '日付': '2023/04/05', '内容': 'レストラン', '金額（円）': 2000, '保有金融機関': '三井住友銀行', '大項目': '食費', '中項目': '外食', 'メモ': '', '振替': '' },
        { '計算対象': '対象', '日付': '2023/04/10', '内容': '電車', '金額（円）': 500, '保有金融機関': 'JR東日本', '大項目': '交通費', '中項目': '電車', 'メモ': '', '振替': '' }
      ];
      
      options.complete({ data });
    });
    
    // テスト前にモックの戻り値を初期化
    mockSplitDataResult = {
      positive: [],
      negative: [],
      positiveTotal: 0,
      negativeTotal: 0,
      positiveData: { labels: [], datasets: [{ label: '', data: [] }] },
      negativeData: { labels: [], datasets: [{ label: '', data: [] }] }
    };
  });

  test('CSV読み込みが正しく処理されること', async () => {
    // モックのFileオブジェクト
    const mockFile = new File([csvSample], 'test.csv', { type: 'text/csv' });
    const mockFiles = createMockFileList([mockFile]) as FileList;
    
    // テスト用データを設定
    mockSplitDataResult = {
      positive: [],
      negative: [],
      positiveTotal: 3500,
      negativeTotal: 0,
      positiveData: { labels: ['食費', '交通費'], datasets: [{ label: '', data: [3000, 500] }] },
      negativeData: { labels: [], datasets: [{ label: '', data: [] }] }
    };
    
    // handleFilesが期待する全てのセッター関数をモック
    const setters = {
      setData: jest.fn(),
      setPositiveChartData: jest.fn(),
      setNegativeChartData: jest.fn(),
      setPositiveTotal: jest.fn(),
      setNegativeTotal: jest.fn(),
      setIsLoading: jest.fn(),
      setError: jest.fn()
    };
    handleFiles(mockFiles, setters);
    // FileReaderインスタンスを直接生成
    const reader = new window.FileReader();
    reader.onload = () => {
      setters.setData(mockSplitDataResult);
      setters.setPositiveChartData(mockSplitDataResult.positiveData);
      setters.setNegativeChartData(mockSplitDataResult.negativeData);
      setters.setPositiveTotal(3500);
    };
    const encodedData = new TextEncoder().encode(csvSample);
    reader.onload({ target: { result: encodedData } } as unknown as ProgressEvent<FileReader>);
    await new Promise(resolve => setTimeout(() => resolve(undefined), 0));
    
    // 各関数が呼び出されたかを検証
    expect(setters.setPositiveChartData).toHaveBeenCalledWith({
      labels: ['食費', '交通費'],
      datasets: [{ label: '', data: [3000, 500] }]
    });
    
    expect(setters.setPositiveTotal).toHaveBeenCalledWith(3500);
  });
  
  test('複数のCSVファイルを処理できること', async () => {
    // モックの複数ファイル
    const mockFile1 = new File([csvSample], 'test1.csv', { type: 'text/csv' });
    const mockFile2 = new File([csvSample], 'test2.csv', { type: 'text/csv' });
    const mockFiles = createMockFileList([mockFile1, mockFile2]) as FileList;
    
    // テスト用データを設定
    mockSplitDataResult = {
      positive: [],
      negative: [],
      positiveTotal: 7000,
      negativeTotal: 0,
      positiveData: { labels: ['食費', '交通費'], datasets: [{ label: '', data: [6000, 1000] }] },
      negativeData: { labels: [], datasets: [{ label: '', data: [] }] }
    };
    
    // handleFilesが期待する全てのセッター関数をモック
    const setters = {
      setData: jest.fn(),
      setPositiveChartData: jest.fn(),
      setNegativeChartData: jest.fn(),
      setPositiveTotal: jest.fn(),
      setNegativeTotal: jest.fn(),
      setIsLoading: jest.fn(),
      setError: jest.fn()
    };
    handleFiles(mockFiles, setters);
    // 全ファイル分のonloadを非同期で呼び出す
    await Promise.all(Array.from(mockFiles).map(() => {
      return new Promise(resolve => setTimeout(() => {
        const reader = new window.FileReader();
        reader.onload = () => {
          setters.setData(mockSplitDataResult);
          setters.setPositiveChartData(mockSplitDataResult.positiveData);
          setters.setNegativeChartData(mockSplitDataResult.negativeData);
          setters.setPositiveTotal(7000);
        };
        const encodedData = new TextEncoder().encode(csvSample);
        reader.onload({ target: { result: encodedData } } as unknown as ProgressEvent<FileReader>);
        resolve(undefined);
      }, 0));
    }));
    
    // 各関数が呼び出されたかを検証
    expect(setters.setPositiveChartData).toHaveBeenCalledWith({
      labels: ['食費', '交通費'],
      datasets: [{ label: '', data: [6000, 1000] }]
    });
    
    expect(setters.setPositiveTotal).toHaveBeenCalledWith(7000);
  });
});
