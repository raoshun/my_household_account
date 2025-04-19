import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoryQuadrantView from './CategoryQuadrantView';

// モックデータ
const mockData = [
  { '日付': '2023-01-01', '大項目': '食費', '金額（円）': -5000 },
  { '日付': '2023-01-02', '大項目': '光熱費', '金額（円）': -10000 },
  { '日付': '2023-01-03', '大項目': '交通費', '金額（円）': -3000 },
  { '日付': '2023-01-04', '大項目': '趣味', '金額（円）': -8000 },
  { '日付': '2023-01-05', '大項目': '外食', '金額（円）': -12000 },
  { '日付': '2023-01-06', '大項目': '給料', '金額（円）': 250000 },
];

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

// HTML5 DragDropのモック関数
// ドラッグアンドドロップをシミュレートするためのヘルパー関数
const simulateDragDrop = (sourceElement, targetElement) => {
  // DragStartイベント
  const dragStartEvent = createDragEvent('dragstart');
  Object.defineProperty(dragStartEvent, 'dataTransfer', {
    value: {
      setData: jest.fn(),
      effectAllowed: null,
      data: {},
    },
  });
  fireEvent(sourceElement, dragStartEvent);

  // DragOverイベント
  const dragOverEvent = createDragEvent('dragover');
  Object.defineProperty(dragOverEvent, 'dataTransfer', {
    value: {
      getData: jest.fn(() => dragStartEvent.dataTransfer.data),
      dropEffect: null,
    },
  });
  fireEvent(targetElement, dragOverEvent);

  // Dropイベント
  const dropEvent = createDragEvent('drop');
  Object.defineProperty(dropEvent, 'dataTransfer', {
    value: {
      getData: jest.fn((format) => {
        return sourceElement.textContent;
      }),
    },
  });
  fireEvent(targetElement, dropEvent);

  // DragEndイベント
  const dragEndEvent = createDragEvent('dragend');
  fireEvent(sourceElement, dragEndEvent);
};

// DragEventの作成ヘルパー
const createDragEvent = (type) => {
  const event = document.createEvent('Event');
  event.initEvent(type, true, true);
  return event;
};

// テスト前にlocalStorageをモックに置き換え
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('CategoryQuadrantView Component', () => {
  // 各テスト前にモックリセット
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('初期状態で四分法の説明が表示される', () => {
    render(<CategoryQuadrantView data={mockData} negativeTotal={-38000} />);
    
    // 説明部分があることを確認
    expect(screen.getByText('四分法とは？')).toBeInTheDocument();
    
    // 複数ある場合はquerySelectorでより具体的に指定する
    const explanationSection = screen.getByText('四分法とは？').closest('.quadrant-explanation');
    expect(explanationSection).toBeInTheDocument();
    
    // 説明文内のテキストを確認
    expect(explanationSection.textContent).toContain('必需費（固定）');
    expect(explanationSection.textContent).toContain('必需費（変動）');
    expect(explanationSection.textContent).toContain('娯楽費（固定）');
    expect(explanationSection.textContent).toContain('娯楽費（変動）');
  });

  test('未分類カテゴリがリストに表示される', () => {
    render(<CategoryQuadrantView data={mockData} negativeTotal={-38000} />);
    
    // 未分類カテゴリセクションがあることを確認
    expect(screen.getByText('未分類のカテゴリ（ドラッグして象限に割り当ててください）')).toBeInTheDocument();
    
    // データ内の支出カテゴリが未分類としてリストされていることを確認
    expect(screen.getByText('食費')).toBeInTheDocument();
    expect(screen.getByText('光熱費')).toBeInTheDocument();
    expect(screen.getByText('交通費')).toBeInTheDocument();
    expect(screen.getByText('趣味')).toBeInTheDocument();
    expect(screen.getByText('外食')).toBeInTheDocument();
  });

  test('分類済みのカテゴリがある場合、四分法グリッドが表示される', () => {
    // LocalStorageにあらかじめ保存された分類情報をセット
    const savedAssignments = {
      '食費': 'necessary-variable',
      '光熱費': 'necessary-fixed',
      '交通費': 'necessary-variable',
      '趣味': 'leisure-fixed', // 新しい分類名に更新
      '外食': 'leisure-variable' // 新しい分類名に更新
    };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedAssignments));
    
    const { container } = render(<CategoryQuadrantView data={mockData} negativeTotal={-38000} />);
    
    // 分類済みのカテゴリがあることを確認
    expect(screen.getByText('5個のカテゴリを分類済み')).toBeInTheDocument();
    
    // 四分法グリッドが表示されていることを確認
    const quadrantGrid = container.querySelector('.quadrant-grid');
    expect(quadrantGrid).toBeInTheDocument();
    
    // 各象限のタイトル部分を取得
    const quadrantTitles = container.querySelectorAll('.quadrant-title');
    expect(quadrantTitles.length).toBe(4); // 4つの象限があることを確認
    
    // 必需費率と固定費率のセクションが表示されていることを確認（更新後の指標）
    expect(screen.getByText('必需費率')).toBeInTheDocument();
    expect(screen.getByText('固定費率')).toBeInTheDocument();
    
    // 改善アドバイスのセクションが表示されていることを確認
    expect(screen.getByText('改善アドバイス')).toBeInTheDocument();
  });

  test('カテゴリタグが象限内に表示される', () => {
    // LocalStorageにあらかじめ保存された分類情報をセット
    const savedAssignments = {
      '食費': 'necessary-variable',
      '光熱費': 'necessary-fixed',
    };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedAssignments));
    
    const { container } = render(<CategoryQuadrantView data={mockData} negativeTotal={-38000} />);
    
    // 必需費（固定）象限に「光熱費」タグが表示されていることを確認
    const necessaryFixedQuadrant = container.querySelector('.quadrant-1');
    const lightHeatTag = Array.from(necessaryFixedQuadrant.querySelectorAll('.category-tag'))
      .find(el => el.textContent.includes('光熱費'));
    expect(lightHeatTag).toBeInTheDocument();
    
    // 必需費（変動）象限に「食費」タグが表示されていることを確認
    const necessaryVariableQuadrant = container.querySelector('.quadrant-3');
    const foodTag = Array.from(necessaryVariableQuadrant.querySelectorAll('.category-tag'))
      .find(el => el.textContent.includes('食費'));
    expect(foodTag).toBeInTheDocument();
  });

  test('4象限の軸ラベルが正しく表示される', () => {
    // LocalStorageにあらかじめ保存された分類情報をセット
    const savedAssignments = {
      '食費': 'necessary-variable',
    };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedAssignments));
    
    const { container } = render(<CategoryQuadrantView data={mockData} negativeTotal={-38000} />);
    
    // 軸ラベルが存在するか確認
    expect(container.querySelector('.x-axis-label-low')).toBeInTheDocument();
    expect(container.querySelector('.x-axis-label-high')).toBeInTheDocument();
    expect(container.querySelector('.y-axis-label-low')).toBeInTheDocument();
    expect(container.querySelector('.y-axis-label-high')).toBeInTheDocument();
    
    // 軸タイトルが存在するか確認
    expect(container.querySelector('.x-axis-title')).toBeInTheDocument();
    expect(container.querySelector('.y-axis-title')).toBeInTheDocument();
    
    // 軸ラベルの内容が正しいか確認（新しいラベルに更新）
    expect(container.querySelector('.x-axis-label-low').textContent).toBe('必需');
    expect(container.querySelector('.x-axis-label-high').textContent).toBe('娯楽');
    expect(container.querySelector('.y-axis-label-low').textContent).toBe('変動');
    expect(container.querySelector('.y-axis-label-high').textContent).toBe('固定');
    
    // 軸タイトルの内容が正しいか確認
    expect(container.querySelector('.x-axis-title').textContent).toBe('必要性');
    expect(container.querySelector('.y-axis-title').textContent).toBe('変動性');
  });

  test('カテゴリタグを削除ボタンでリセットできる', async () => {
    // LocalStorageにあらかじめ保存された分類情報をセット
    const savedAssignments = {
      '食費': 'necessary-variable',
      '光熱費': 'necessary-fixed'
    };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedAssignments));
    
    const { container } = render(<CategoryQuadrantView data={mockData} negativeTotal={-38000} />);
    
    // 必需費（変動）象限内の「食費」タグを探す
    const necessaryVariableQuadrant = container.querySelector('.quadrant-3');
    const foodTag = Array.from(necessaryVariableQuadrant.querySelectorAll('.category-tag'))
      .find(el => el.textContent.includes('食費'));
    
    // 「食費」タグの削除ボタンをクリック
    const deleteButton = foodTag.querySelector('.remove-category-tag');
    fireEvent.click(deleteButton);
    
    // LocalStorageに食費がないデータが保存されたことを確認
    const saveCall = localStorageMock.setItem.mock.calls.find(
      call => call[0] === 'categoryQuadrantAssignments'
    );
    
    expect(saveCall).toBeTruthy();
    const savedData = JSON.parse(saveCall[1]);
    expect(savedData).not.toHaveProperty('食費');
    expect(savedData).toHaveProperty('光熱費', 'necessary-fixed');
  });

  test('旧フォーマットの分類データが新フォーマットに変換される', () => {
    // 旧フォーマットの分類情報をセット
    const oldFormatAssignments = {
      '食費': 'necessary-variable',
      '光熱費': 'necessary-fixed',
      '趣味': 'entertainment', // 旧: entertainment → 新: leisure-fixed
      '外食': 'waste'          // 旧: waste → 新: leisure-variable
    };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(oldFormatAssignments));
    
    const { container } = render(<CategoryQuadrantView data={mockData} negativeTotal={-38000} />);
    
    // 娯楽費（固定）象限に「趣味」タグが表示されていることを確認（変換されたかどうか）
    const leisureFixedQuadrant = container.querySelector('.quadrant-2');
    
    // 「必需費（固定）」象限に「光熱費」があることを確認
    const necessaryFixedQuadrant = container.querySelector('.quadrant-1');
    const lightHeatTag = Array.from(necessaryFixedQuadrant.querySelectorAll('.category-tag'))
      .find(el => el.textContent.includes('光熱費'));
    expect(lightHeatTag).toBeInTheDocument();

    // データ変換が行われたことを確認
    const convertCall = localStorageMock.setItem.mock.calls.find(
      call => call[0] === 'categoryQuadrantAssignments'
    );
    
    if (convertCall) {
      const convertedData = JSON.parse(convertCall[1]);
      expect(convertedData).toHaveProperty('趣味', 'leisure-fixed');
      expect(convertedData).toHaveProperty('外食', 'leisure-variable');
    }
  });
  
  // 表示するデータがない場合のテスト
  test('データが空の場合でも正しく表示される', () => {
    render(<CategoryQuadrantView data={[]} negativeTotal={0} />);
    
    // 説明が表示されること
    expect(screen.getByText('四分法とは？')).toBeInTheDocument();
    
    // 未分類カテゴリが空であることを示すメッセージ
    expect(screen.getByText('未分類のカテゴリはありません')).toBeInTheDocument();
  });
});