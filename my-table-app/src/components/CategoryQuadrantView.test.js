import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoryQuadrantView from './CategoryQuadrantView';

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

// テストで分割テキストにも対応できるようにgetByTextの部分を柔軟にする
// 例: expect(screen.getByText(`${assignedCount}個の中項目カテゴリを分類済み`)).toBeInTheDocument();
// ↓
// expect(screen.getByText((content) => content.includes(`${assignedCount}個の中項目カテゴリを分類済み`))).toBeInTheDocument();

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

  test('分類済みのカテゴリがある場合、四分法グリッドとグループ化されたタグが表示される', () => {
    const savedAssignments = {
      '食費 - 食料品': 'necessary-variable',
      '住居費 - 家賃': 'necessary-fixed',
      '住居費 - 水道光熱費': 'necessary-fixed',
      '交通費 - 電車代': 'necessary-variable',
      '娯楽費 - ゲーム': 'leisure-variable',
      '娯楽費 - 書籍': 'leisure-fixed'
    };
    // 常に同じ値を返すように修正
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedAssignments));
    const { container } = render(<CategoryQuadrantView data={mockData} negativeTotal={negativeTotal} />);
    // 分類済みカウントの確認
    const assignedCount = Object.keys(savedAssignments).length;
    expect(
      screen.getByText((content) =>
        content.includes(`${assignedCount}個の中項目カテゴリを分類済み`)
      )
    ).toBeInTheDocument();
    // 四分法グリッドが表示されていることを確認
    const quadrantGrid = container.querySelector('.quadrant-grid');
    expect(quadrantGrid).not.toBeNull();
    if (!quadrantGrid) throw new Error('quadrantGrid is null');
    // 必需費（固定）象限の確認
    const necessaryFixedQuadrant = container.querySelector('.quadrant-1');
    expect(necessaryFixedQuadrant).not.toBeNull();
    if (!necessaryFixedQuadrant) throw new Error('necessaryFixedQuadrant is null');
    const housingGroupNF = necessaryFixedQuadrant.querySelectorAll('.assigned-category-group')[0];
    expect(housingGroupNF).not.toBeNull();
    if (!housingGroupNF) throw new Error('housingGroupNF is null');
    expect(housingGroupNF.querySelector('.assigned-main-category-header')).not.toBeNull();
    expect(housingGroupNF.querySelector('.assigned-main-category-header')?.textContent).toContain('住居費');
    const housingTags = housingGroupNF.querySelectorAll('.category-tag');
    expect(Array.from(housingTags).some(tag => tag?.textContent?.includes('家賃'))).toBeTruthy();
    expect(Array.from(housingTags).some(tag => tag?.textContent?.includes('水道光熱費'))).toBeTruthy();
    // 必需費（変動）象限の確認
    const necessaryVariableQuadrant = container.querySelector('.quadrant-3');
    expect(necessaryVariableQuadrant).not.toBeNull();
    if (!necessaryVariableQuadrant) throw new Error('necessaryVariableQuadrant is null');
    const categoryGroups = necessaryVariableQuadrant.querySelectorAll('.assigned-category-group');
    // 食費グループを探す
    const foodGroupNV = Array.from(categoryGroups).find(group => {
      const header = group.querySelector('.assigned-main-category-header');
      return header && header.textContent && header.textContent.includes('食費');
    });
    expect(foodGroupNV).not.toBeUndefined();
    if (!foodGroupNV) throw new Error('foodGroupNV is undefined');
    expect(foodGroupNV.querySelector('.assigned-main-category-header')).not.toBeNull();
    expect(foodGroupNV.querySelector('.assigned-main-category-header')?.textContent).toContain('食費');
    // 娯楽費（変動）象限の確認
    const leisureVariableQuadrant = container.querySelector('.quadrant-4');
    expect(leisureVariableQuadrant).not.toBeNull();
    if (!leisureVariableQuadrant) throw new Error('leisureVariableQuadrant is null');
    const leisureGroupLV = leisureVariableQuadrant.querySelectorAll('.assigned-category-group')[0];
    expect(leisureGroupLV).not.toBeNull();
    if (!leisureGroupLV) throw new Error('leisureGroupLV is null');
    expect(leisureGroupLV.querySelector('.assigned-main-category-header')).not.toBeNull();
    expect(leisureGroupLV.querySelector('.assigned-main-category-header')?.textContent).toContain('娯楽費');
    const leisureVariableTags = leisureGroupLV.querySelectorAll('.category-tag');
    expect(Array.from(leisureVariableTags).some(tag => tag?.textContent?.includes('ゲーム'))).toBeTruthy();
    // 娯楽費（固定）象限の確認 - 変数名を変更
    const leisureFixedSection = container.querySelector('.quadrant-2');
    expect(leisureFixedSection).not.toBeNull();
    if (!leisureFixedSection) throw new Error('leisureFixedSection is null');
    const leisureGroupFixed = leisureFixedSection.querySelector('.assigned-category-group');
    expect(leisureGroupFixed).not.toBeNull();
    if (!leisureGroupFixed) throw new Error('leisureGroupFixed is null');
    expect(leisureGroupFixed.querySelector('.assigned-main-category-header')).not.toBeNull();
    expect(leisureGroupFixed.querySelector('.assigned-main-category-header')?.textContent).toContain('娯楽費');
    expect(leisureGroupFixed?.textContent).toContain('書籍');
    // 未分類リストには「食費 - 外食」のみ残る
    expect(
      screen.getByText((content) => content.includes('未分類の中項目カテゴリ'))
    ).toBeInTheDocument();
    // 「食費」見出しが複数あるので、未分類リスト側(h4)をクラスで特定
    const headings = screen.getAllByRole('heading', { name: '食費' });
    const unassignedFoodGroup = Array.from(headings).find(
      h => h.classList.contains('unassigned-main-category-header')
    )?.closest('.unassigned-category-group');
    expect(unassignedFoodGroup).not.toBeNull();
    if (!unassignedFoodGroup) throw new Error('unassignedFoodGroup is null');
    expect(unassignedFoodGroup.textContent).toContain('外食');
    expect(unassignedFoodGroup.textContent).not.toContain('食料品');
    // 未分類リスト内の「住居費」見出しが存在しないことを確認
    const unassignedHeadings = container.querySelectorAll('.unassigned-main-category-header');
    expect(Array.from(unassignedHeadings).some(h => h.textContent === '住居費')).toBeFalsy();
  });

  test('未分類カテゴリをドラッグ＆ドロップで象限に割り当てられる', async () => {
    const { container } = render(<CategoryQuadrantView data={mockData} negativeTotal={negativeTotal} />);

    // 未分類の「食費 - 外食」アイテムを取得
    const unassignedFoodGroup = screen.getByRole('heading', { name: '食費' }).closest('.unassigned-category-group');
    const unassignedLunchItem = Array.from(unassignedFoodGroup.querySelectorAll('.unassigned-category-item'))
                                  .find(el => el.textContent === '外食');
    expect(unassignedLunchItem).toBeInTheDocument();

    // 娯楽費（変動）象限のドロップエリアを取得
    const leisureVariableQuadrantDropArea = container.querySelector('.quadrant-4 .droppable-area');
    expect(leisureVariableQuadrantDropArea).toBeInTheDocument();

    // ドラッグ＆ドロップを実行
    simulateDragDrop(unassignedLunchItem, leisureVariableQuadrantDropArea);

    // localStorage.setItemが正しい引数で呼び出されたか確認
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'categoryQuadrantAssignments',
        JSON.stringify({ '食費 - 外食': 'leisure-variable' })
      );
    });
  });

  test('分類済みカテゴリタグをドラッグ＆ドロップで別の象限に移動できる', async () => {
    const initialAssignments = {
      '食費 - 食料品': 'necessary-variable',
      '住居費 - 家賃': 'necessary-fixed'
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(initialAssignments));
    const { container } = render(<CategoryQuadrantView data={mockData} negativeTotal={negativeTotal} />);

    // 必需費（変動）にある「食費 - 食料品」タグを取得
    const necessaryVariableQuadrant = container.querySelector('.quadrant-3');
    const foodTag = Array.from(necessaryVariableQuadrant.querySelectorAll('.category-tag'))
                      .find(el => el.textContent.includes('食料品'));
    expect(foodTag).toBeInTheDocument();

    // 娯楽費（変動）象限のドロップエリアを取得
    const leisureVariableQuadrantDropArea = container.querySelector('.quadrant-4 .droppable-area');
    expect(leisureVariableQuadrantDropArea).toBeInTheDocument();

    // ドラッグ＆ドロップを実行
    simulateDragDrop(foodTag, leisureVariableQuadrantDropArea);

    // localStorage.setItemが更新された内容で呼び出されたか確認
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'categoryQuadrantAssignments',
        JSON.stringify({ 
          ...initialAssignments,
          '食費 - 食料品': 'leisure-variable' // 移動後の象限
        })
      );
    });
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

  // 軸ラベルとタイトルのテストは変更なしでOK
  test('4象限の軸ラベルとタイトルが正しく表示される', () => {
    const savedAssignments = { '食費 - 食料品': 'necessary-variable' }; // 何か一つ分類してグリッドを表示させる
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedAssignments));
    const { container } = render(<CategoryQuadrantView data={mockData} negativeTotal={negativeTotal} />);
    expect(container.querySelector('.x-axis-label-low').textContent).toBe('必需');
    expect(container.querySelector('.x-axis-label-high').textContent).toBe('娯楽');
    expect(container.querySelector('.y-axis-label-low').textContent).toBe('変動');
    expect(container.querySelector('.y-axis-label-high').textContent).toBe('固定');
    expect(container.querySelector('.x-axis-title').textContent).toBe('必要性');
    expect(container.querySelector('.y-axis-title').textContent).toBe('変動性');
  });

  // データがない場合のテスト
  test('データが空の場合でも正しく表示される', () => {
    render(<CategoryQuadrantView data={[]} negativeTotal={0} />);
    expect(screen.getByText('四分法とは？')).toBeInTheDocument();
    expect(screen.getByText('未分類の中項目カテゴリはありません')).toBeInTheDocument();
    expect(screen.queryByText('個の中項目カテゴリを分類済み')).not.toBeInTheDocument(); // 分類状況は表示されない
    expect(screen.queryByText('支出分析まとめ')).not.toBeInTheDocument(); // グリッドやサマリーも表示されない
  });

  // 旧フォーマットのテストは削除
});

describe('エクスポート・インポート機能', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('エクスポート時にネスト構造のJSONが生成される', () => {
    const savedAssignments = {
      '食費 - 食料品': 'necessary-variable',
      '住居費 - 家賃': 'necessary-fixed',
      '住居費 - 水道光熱費': 'necessary-fixed',
      '娯楽費 - ゲーム': 'leisure-variable'
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedAssignments));
    render(<CategoryQuadrantView data={mockData} negativeTotal={negativeTotal} />);
    const exportBtn = screen.getByRole('button', { name: '設定をエクスポート' });

    // Blob, URL.createObjectURL, a.click, appendChild, removeChild をモック
    const mockClick = jest.fn();
    const mockRemoveChild = jest.fn();
    const mockAppendChild = jest.fn();
    const mockCreateObjectURL = jest.fn(() => 'blob:url');
    const mockRevokeObjectURL = jest.fn();

    // document.createElement のモックを修正
    const mockLink = {
      href: '',
      download: '',
      click: mockClick,
      style: {},
    };
    const originalCreateElement = document.createElement; // 元の関数を保存
    document.createElement = jest.fn((tagName) => {
        if (tagName === 'a') {
            return mockLink;
        }
        // 他の要素が必要な場合は元の関数を呼ぶ
        return originalCreateElement.call(document, tagName);
    });
    // document.body の appendChild と removeChild をモック
    const originalAppendChild = document.body.appendChild;
    const originalRemoveChild = document.body.removeChild;
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;

    const originalCreateObjectURL = window.URL.createObjectURL;
    const originalRevokeObjectURL = window.URL.revokeObjectURL;
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;

    fireEvent.click(exportBtn);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalledWith(mockLink); // appendChildが呼ばれたか
    expect(mockClick).toHaveBeenCalled(); // clickが呼ばれたか
    expect(mockRemoveChild).toHaveBeenCalledWith(mockLink); // removeChildが呼ばれたか

    // Blob内容の検証 - FileReaderを使用して読み取る
    const blobArg = mockCreateObjectURL.mock.calls[0][0];
    
    // FileReaderを使ってBlobを読み取る
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        const json = JSON.parse(text);
        expect(json).toEqual({
          '食費': { '食料品': 'necessary-variable' },
          '住居費': { '家賃': 'necessary-fixed', '水道光熱費': 'necessary-fixed' },
          '娯楽費': { 'ゲーム': 'leisure-variable' }
        });
        resolve();
      };
      reader.readAsText(blobArg);
      
      // モックを元に戻す
      document.createElement = originalCreateElement;
      document.body.appendChild = originalAppendChild;
      document.body.removeChild = originalRemoveChild;
      window.URL.createObjectURL = originalCreateObjectURL;
      window.URL.revokeObjectURL = originalRevokeObjectURL;
    });
  });

  test('インポート時にネスト構造JSONを正しく読み込む', async () => {
    render(<CategoryQuadrantView data={mockData} negativeTotal={negativeTotal} />);
    const importBtn = screen.getByText('設定をインポート');
    // input[type=file]を取得
    const fileInput = importBtn.closest('label').querySelector('input[type="file"]');
    // ネスト構造のJSON
    const nestedJson = {
      '食費': { '食料品': 'necessary-variable' },
      '住居費': { '家賃': 'necessary-fixed', '水道光熱費': 'necessary-fixed' },
      '娯楽費': { 'ゲーム': 'leisure-variable' }
    };
    const file = new File([JSON.stringify(nestedJson)], 'categoryQuadrantAssignments.json', { type: 'application/json' });
    // window.alertをモック
    window.alert = jest.fn();
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'categoryQuadrantAssignments',
        JSON.stringify({
          '食費 - 食料品': 'necessary-variable',
          '住居費 - 家賃': 'necessary-fixed',
          '住居費 - 水道光熱費': 'necessary-fixed',
          '娯楽費 - ゲーム': 'leisure-variable'
        })
      );
      expect(window.alert).toHaveBeenCalledWith('設定をインポートしました');
    });
  });

  test('エクスポート・インポートボタンが表示されている', () => {
    render(<CategoryQuadrantView data={mockData} negativeTotal={negativeTotal} />);
    expect(screen.getByRole('button', { name: '設定をエクスポート' })).toBeInTheDocument();
    expect(screen.getByText('設定をインポート')).toBeInTheDocument();
  });
});