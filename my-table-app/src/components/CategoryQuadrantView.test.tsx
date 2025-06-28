import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoryQuadrantView from './CategoryQuadrantView';
import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// モックデータ（中項目を追加）
const mockData = [
  { '日付': '2023-01-01', '大項目': '食費', '中項目': '食料品', '金額（円）': -5000 },
  { '日付': '2023-01-01', '大項目': '食費', '中項目': '外食', '金額（円）': -12000 }, // 外食を食費に含める
  { '日付': '2023-01-02', '大項目': '住居費', '中項目': '家賃', '金額（円）': -80000 }, // 光熱費を住居費に変更
  { '日付': '2023-01-02', '大項目': '住居費', '中項目': '水道光熱費', '金額（円）': -10000 },
  { '日付': '2023-01-03', '大項目': '交通費', '中項目': '電車代', '金額（円）': -3000 },
  { '日付': '2023-01-04', '大項目': '娯楽費', '中項目': 'ゲーム', '金額（円）': -8000 }, // 趣味を娯楽費に変更
  { '日付': '2023-01-04', '大項目': '娯楽費', '中項目': '書籍', '金額（円）': -2000 },
  { '日付': '2023-01-06', '大項目': '収入', '中項目': '給料', '金額（円）': 250000 }, // 収入データ
];

// 支出合計額の計算（収入を除く）
const negativeTotal = mockData
  .filter(item => item['金額（円）'] < 0)
  .reduce((sum, item) => sum + item['金額（円）'], 0);

// LocalStorageのモック
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
  };
})();

const simulateDragDrop = (sourceElement, targetElement) => {
  const dragStartEvent = createDragEvent('dragstart');
  let draggedData = '';
  Object.defineProperty(dragStartEvent, 'dataTransfer', {
    value: {
      setData: jest.fn((format, data) => { draggedData = data; }),
      effectAllowed: null,
    },
  });
  fireEvent(sourceElement, dragStartEvent);

  // dragoverイベントにもdataTransferを付与
  const dragOverEvent = createDragEvent('dragover');
  Object.defineProperty(dragOverEvent, 'dataTransfer', {
    value: {
      getData: jest.fn((format) => draggedData),
      setData: jest.fn(),
      dropEffect: null,
    },
  });
  fireEvent(targetElement, dragOverEvent);

  const dropEvent = createDragEvent('drop');
  Object.defineProperty(dropEvent, 'dataTransfer', {
    value: {
      getData: jest.fn((format) => draggedData),
    },
  });
  fireEvent(targetElement, dropEvent);

  const dragEndEvent = createDragEvent('dragend');
  fireEvent(sourceElement, dragEndEvent);
};

const createDragEvent = (type) => {
  const event = document.createEvent('Event');
  event.initEvent(type, true, true);
  return event;
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// URLユーティリティのモック
const mockRevokeObjectURL = jest.fn();
if (!window.URL.revokeObjectURL) {
  window.URL.revokeObjectURL = mockRevokeObjectURL;
}

// --- テスト本体の該当箇所修正 ---
describe('CategoryQuadrantView Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('初期状態で四分法の説明が表示される', () => {
    render(<CategoryQuadrantView data={mockData} negativeTotal={negativeTotal} />);
    expect(screen.getByText('四分法とは？')).toBeInTheDocument();
    const explanationSection = screen.getByText('四分法とは？').closest('.quadrant-explanation');
    expect(explanationSection).not.toBeNull();
    if (!explanationSection) throw new Error('explanationSection is null');
    expect(explanationSection.textContent).toContain('必需費（固定）');
    expect(explanationSection.textContent).toContain('必需費（変動）');
    expect(explanationSection.textContent).toContain('娯楽費（固定）');
    expect(explanationSection.textContent).toContain('娯楽費（変動）');
  });

  test('未分類カテゴリが大項目ごとにグループ化されて表示される', () => {
    render(<CategoryQuadrantView data={mockData} negativeTotal={negativeTotal} />);
    expect(screen.getByText('未分類の中項目カテゴリ（ドラッグして象限に割り当ててください）')).toBeInTheDocument();

    // 大項目ヘッダーが表示されるか
    expect(screen.getByRole('heading', { name: '食費' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '住居費' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '交通費' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '娯楽費' })).toBeInTheDocument();

    // 各大項目の下に中項目が表示されるか（中項目名のみ）
    const foodGroup = screen.getByRole('heading', { name: '食費' }).closest('.unassigned-category-group');
    expect(foodGroup).toHaveTextContent('食料品');
    expect(foodGroup).toHaveTextContent('外食');

    const housingGroup = screen.getByRole('heading', { name: '住居費' }).closest('.unassigned-category-group');
    expect(housingGroup).toHaveTextContent('家賃');
    expect(housingGroup).toHaveTextContent('水道光熱費');

    const transportGroup = screen.getByRole('heading', { name: '交通費' }).closest('.unassigned-category-group');
    expect(transportGroup).toHaveTextContent('電車代');

    const leisureGroup = screen.getByRole('heading', { name: '娯楽費' }).closest('.unassigned-category-group');
    expect(leisureGroup).toHaveTextContent('ゲーム');
    expect(leisureGroup).toHaveTextContent('書籍');

    // 収入カテゴリは表示されない
    expect(screen.queryByRole('heading', { name: '収入' })).not.toBeInTheDocument();
  });

  test('分類済みカテゴリタグを削除ボタンで未分類に戻せる', async () => {
    const initialAssignments = {
      '食費 - 食料品': 'necessary-variable',
      '住居費 - 家賃': 'necessary-fixed'
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(initialAssignments));

    const { container } = render(<CategoryQuadrantView data={mockData} negativeTotal={negativeTotal} />);

    // 必需費（変動）にある「食費 - 食料品」タグの削除ボタンを取得
    const necessaryVariableQuadrant = container.querySelector('.quadrant-3');
    const foodTag = Array.from(necessaryVariableQuadrant.querySelectorAll('.category-tag'))
                      .find(el => el.textContent.includes('食料品'));
    const deleteButton = foodTag.querySelector('.remove-category-tag');
    expect(deleteButton).toBeInTheDocument();

    // 削除ボタンをクリック
    fireEvent.click(deleteButton);

    // localStorage.setItemが削除後の内容で呼び出されたか確認
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'categoryQuadrantAssignments',
        JSON.stringify({ 
          '住居費 - 家賃': 'necessary-fixed' // 食費が削除されている
        })
      );
    });

    // 未分類リストに「食費 - 食料品」が戻っていることを確認（表示更新を待つ）
    await waitFor(() => {
        const unassignedFoodGroup = screen.getByRole('heading', { name: '食費' }).closest('.unassigned-category-group');
        expect(unassignedFoodGroup).toHaveTextContent('食料品');
    });
  });
});

describe('詳細な機能テスト（カバレッジ向上）', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    // コンソール警告とエラーを明示的にモック
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // モックを元に戻す
    console.warn.mockRestore();
    console.error.mockRestore();
    console.log.mockRestore();
  });

  test('保存された分類設定が不正な場合、エラー処理が行われる', () => {
    // 不正なJSONを返すようにモック
    localStorageMock.getItem.mockImplementation(() => '{"invalid json":');
    
    render(<CategoryQuadrantView data={mockData} negativeTotal={negativeTotal} />);
    
    // コンソールエラーが呼び出されたことを確認（元のテストでは失敗していた）
    expect(console.error).toHaveBeenCalled();
    expect(console.error.mock.calls[0][0]).toBe('保存された分類情報の読み込みに失敗しました:');
    
    // localStorage.removeItemが呼び出されたことを確認
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('categoryQuadrantAssignments');
  });
  
  test('保存された分類設定の形式が不正な場合、警告とクリアが行われる', () => {
    // 不正な形式（オブジェクトではない値）を返すようにモック
    localStorageMock.getItem.mockImplementation(() => '"not an object"');
    
    render(<CategoryQuadrantView data={mockData} negativeTotal={negativeTotal} />);
    
    // コンソール警告が呼び出されたことを確認（元のテストでは失敗していた）
    expect(console.warn).toHaveBeenCalled();
    expect(console.warn.mock.calls[0][0]).toBe('ローカルストレージの分類データ形式が不正です。');
    
    // localStorage.removeItemが呼び出されたことを確認
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('categoryQuadrantAssignments');
  });

  // 修正：金額のフォーマットに失敗した場合のテストを書き換え
  test('金額のフォーマットに失敗した場合のエラーハンドリングが機能する', () => {
    // 金額のフォーマットに失敗するデータ
    const invalidMockData = [
      { '日付': '2023-01-01', '大項目': '食費', '中項目': '食料品', '金額（円）': 'invalid amount' },
    ];
    
    const savedAssignments = {
      '食費 - 食料品': 'necessary-variable'
    };
    
    console.error.mockClear();
    // エラーをスローするモック関数を作成
    // コンポーネント内でエラーが適切にキャッチされ、
    // コンポーネントがクラッシュしないことを確認するテスト
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedAssignments));
    
    // レンダリングが成功することを確認（エラーハンドリングが機能している）
    expect(() => {
      render(<CategoryQuadrantView data={invalidMockData} negativeTotal={-100} />);
    }).not.toThrow();
    
    // エラーハンドリングが適切に行われ、コンポーネントが正常に表示されることを確認
    expect(screen.getByText('四分法とは？')).toBeInTheDocument();
  });

  test('インポート機能で不正なファイル内容を処理できる', async () => {
    // alertをモック
    window.alert = jest.fn();
    
    render(<CategoryQuadrantView data={mockData} negativeTotal={negativeTotal} />);
    const importBtn = screen.getByText('設定をインポート');
    const fileInput = importBtn.closest('label').querySelector('input[type="file"]');
    
    // 不正なJSON形式のファイル
    const invalidFile = new File(['not a json'], 'invalid.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('ファイルの読み込みに失敗しました');
    });
    
    // 有効なJSONだが中身が不正なファイル
    window.alert.mockClear();
    const invalidContentFile = new File(['123'], 'invalid-content.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [invalidContentFile] } });
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('不正なファイル形式です');
    });
  });
});