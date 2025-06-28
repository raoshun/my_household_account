import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import MonthlyTrendTable from './MonthlyTrendTable';
import * as trendPredictionApi from '../api/trendPredictionApi';

// trendPredictionApi のモック
jest.mock('../api/trendPredictionApi');

// localStorage のモック
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

// テスト前にlocalStorageをモックに置き換え
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('MonthlyTrendTable コンポーネント', () => {
  const mockTrendData = {
    labels: ['2025年1月', '2025年2月', '2025年3月'],
    datasets: [
      {
        label: '食費',
        data: [30000, 32000, 31000],
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.1)'
      },
      {
        label: '交通費',
        data: [5000, 4800, 5200],
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.1)'
      }
    ]
  };

  // 収入と支出を含むデータ（貯蓄率テスト用）
  const mockTrendDataWithIncome = {
    labels: ['2025年1月', '2025年2月', '2025年3月'],
    datasets: [
      {
        label: '収入',
        data: [300000, 300000, 320000],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)'
      },
      {
        label: '食費',
        data: [30000, 32000, 31000],
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.1)'
      },
      {
        label: '交通費',
        data: [5000, 4800, 5200],
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.1)'
      },
      {
        label: '住居費',
        data: [80000, 80000, 80000],
        borderColor: '#FFCE56',
        backgroundColor: 'rgba(255, 206, 86, 0.1)'
      }
    ]
  };

  const mockPredictionData = {
    nextMonth: '2025年4月',
    predictions: {
      '収入': 310000,
      '食費': 31500,
      '交通費': 5100,
      '住居費': 80000
    }
  };

  beforeEach(() => {
    // getMockPrediction のモック実装をリセット
    trendPredictionApi.getMockPrediction.mockReset();
    trendPredictionApi.getMockPrediction.mockResolvedValue(mockPredictionData);
  });

  test('基本的なレンダリングが正常に行われる', () => {
    render(<MonthlyTrendTable trendData={mockTrendData} />);
    
    // テーブルが存在することを確認
    const table = document.querySelector('.monthly-trend-table');
    expect(table).toBeInTheDocument();
    
    // カテゴリと月のヘッダーが表示されることを確認
    expect(screen.getByText('カテゴリ')).toBeInTheDocument();
    expect(screen.getAllByText('2025年1月')[0]).toBeInTheDocument();
    expect(screen.getAllByText('2025年2月')[0]).toBeInTheDocument();
    expect(screen.getAllByText('2025年3月')[0]).toBeInTheDocument();
    
    // カテゴリ行が表示されることを確認
    expect(screen.getByText('食費')).toBeInTheDocument();
    expect(screen.getByText('交通費')).toBeInTheDocument();
  });

  test('データが空の場合、適切なメッセージが表示される', () => {
    render(<MonthlyTrendTable trendData={{ labels: [], datasets: [] }} />);
    
    // データなしメッセージが表示されることを確認
    expect(screen.getByText(/表示できるデータがありません/)).toBeInTheDocument();
  });

  test('showPrediction=true の場合、予測APIが呼び出される', async () => {
    render(
      <MonthlyTrendTable 
        trendData={mockTrendData} 
        showPrediction={true} 
      />
    );

    // APIが呼び出されたことを確認
    await waitFor(() => {
      expect(trendPredictionApi.getMockPrediction).toHaveBeenCalledWith(mockTrendData);
    });
  });

  test('予測データがロードされると予測列が表示される', async () => {
    render(
      <MonthlyTrendTable 
        trendData={mockTrendData} 
        showPrediction={true} 
      />
    );

    // 予測月のヘッダーが表示されることを確認
    await waitFor(() => {
      // getAllByTextを使用して複数要素から最初の要素を取得
      expect(screen.getAllByText(/2025年4月/)[0]).toBeInTheDocument();
      
      // 予測バッジが表示される
      const predictionBadge = screen.getAllByText('予測')[0];
      expect(predictionBadge).toBeInTheDocument();
    });
    
    // 予測データの説明が表示されることを確認
    await waitFor(() => {
      expect(screen.getByText(/の予測データを表示しています/)).toBeInTheDocument();
    });
  });

  test('showPrediction=false の場合、予測APIは呼び出されない', () => {
    render(
      <MonthlyTrendTable 
        trendData={mockTrendData} 
        showPrediction={false} 
      />
    );

    // APIが呼び出されないことを確認
    expect(trendPredictionApi.getMockPrediction).not.toHaveBeenCalled();
  });

  test('予測データ取得中はローディングインジケーターが表示される', async () => {
    // 予測データ取得を遅延させる
    trendPredictionApi.getMockPrediction.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockPredictionData), 100))
    );

    render(
      <MonthlyTrendTable 
        trendData={mockTrendData} 
        showPrediction={true} 
      />
    );

    // ローディングインジケーターが表示されることを確認
    expect(screen.getByText(/予測データを計算中/)).toBeInTheDocument();
    
    // データが読み込まれると表示が更新される
    await waitFor(() => {
      // getAllByTextを使用して複数要素から最初の要素を取得
      expect(screen.getAllByText(/2025年4月/)[0]).toBeInTheDocument();
    });
  });
  
  test('合計行も予測データが正しく計算される', async () => {
    const { container } = render(
      <MonthlyTrendTable 
        trendData={mockTrendData} 
        showPrediction={true} 
      />
    );

    // 合計行が表示されることを確認
    await waitFor(() => {
      // DOMクエリを使用して合計行を直接取得
      const totalRows = container.querySelectorAll('.total-row');
      expect(totalRows.length).toBeGreaterThan(0);
      
      // 合計行のテキストを確認
      const totalRow = totalRows[0];
      const categoryCell = totalRow.querySelector('.category-cell');
      expect(categoryCell.textContent).toBe('合計');
    });
    
    // 食費・交通費の合計が表示されることを確認
    await waitFor(() => {
      // 合計行の合計セルを取得
      const totalCells = container.querySelectorAll('.total-cell');
      // 最後のtotal-cell（合計行の合計）を取得
      const grandTotalCell = totalCells[totalCells.length - 1];
      
      // 金額表示には単位記号やカンマが含まれるため、含有テストで検証
      expect(grandTotalCell.textContent).toContain('144,600');
    });
  });

  describe('貯蓄率機能のテスト', () => {
    test('収入データがある場合、貯蓄率行が表示される', async () => {
      const { container } = render(
        <MonthlyTrendTable
          trendData={mockTrendDataWithIncome}
          showSavingsRate={true}
        />
      );

      // 貯蓄率行が存在することを確認
      expect(screen.getByText('貯蓄率')).toBeInTheDocument();

      // 貯蓄率の数値が計算されていることを確認
      const savingsRateRow = container.querySelector('.savings-rate-row');
      expect(savingsRateRow).toBeInTheDocument();

      // 2025年1月の貯蓄率を計算して検証 (300000 - 115000) / 300000 * 100 = 61.7%
      const jan2025Rate = Array.from(savingsRateRow.querySelectorAll('td')).find(
        td => td.className.includes('savings-rate-cell') && !td.className.includes('total')
      );
      expect(jan2025Rate.textContent).toContain('61.7%');
    });

    test('showSavingsRate=false の場合、貯蓄率行は表示されない', () => {
      render(
        <MonthlyTrendTable
          trendData={mockTrendDataWithIncome}
          showSavingsRate={false}
        />
      );

      // 貯蓄率行が表示されないことを確認
      expect(screen.queryByText('貯蓄率')).not.toBeInTheDocument();
    });

    test('収入データがない場合、貯蓄率行は表示されない', () => {
      render(
        <MonthlyTrendTable
          trendData={mockTrendData} // 収入データが含まれていないデータ
          showSavingsRate={true}
        />
      );

      // 貯蓄率行が表示されないことを確認
      expect(screen.queryByText('貯蓄率')).not.toBeInTheDocument();
    });

    test('予測データがある場合、貯蓄率の予測も表示される', async () => {
      const { container } = render(
        <MonthlyTrendTable
          trendData={mockTrendDataWithIncome}
          showSavingsRate={true}
          showPrediction={true}
        />
      );

      // 予測月のデータがロードされるのを待つ
      await waitFor(() => {
        expect(screen.getAllByText(/2025年4月/)[0]).toBeInTheDocument();
      });

      // 貯蓄率行を取得
      const savingsRateRow = container.querySelector('.savings-rate-row');
      expect(savingsRateRow).toBeInTheDocument();

      // 予測月の貯蓄率セルを取得
      const predictionCells = savingsRateRow.querySelectorAll('.prediction-cell');
      expect(predictionCells.length).toBe(1);

      // 予測月の貯蓄率値を検証 (310000 - 116600) / 310000 * 100 = 62.4%
      expect(predictionCells[0].textContent).toContain('62.4%');
    });

    test('合計の貯蓄率も正しく計算される', async () => {
      const { container } = render(
        <MonthlyTrendTable
          trendData={mockTrendDataWithIncome}
          showSavingsRate={true}
        />
      );

      // 貯蓄率行の合計セルを取得
      const savingsRateRow = container.querySelector('.savings-rate-row');
      const totalCell = savingsRateRow.querySelector('.savings-rate-total-cell');

      // 全期間の貯蓄率を検証（実際の計算結果に合わせる）
      expect(totalCell.textContent).toContain('62.2%');
    });
  });

  describe('四分法（クワドラント）集計機能のテスト', () => {
    // テスト用のモックカテゴリ分類データ
    const mockCategoryAssignments = {
      '食費': 'necessary-variable',
      '住居費': 'necessary-fixed',
      '交通費': 'necessary-variable',
      '娯楽費': 'leisure-variable',
      'サブスク': 'leisure-fixed'
    };

    // より明確なモックデータ（四分法テスト用）
    const mockQuadrantTrendData = {
      labels: ['2025年1月', '2025年2月', '2025年3月'],
      datasets: [
        {
          label: '食費',
          data: [30000, 32000, 31000],
          borderColor: '#FF6384',
          backgroundColor: 'rgba(255, 99, 132, 0.1)'
        },
        {
          label: '住居費',
          data: [80000, 80000, 80000],
          borderColor: '#FFCE56',
          backgroundColor: 'rgba(255, 206, 86, 0.1)'
        },
        {
          label: '交通費',
          data: [5000, 4800, 5200],
          borderColor: '#36A2EB',
          backgroundColor: 'rgba(54, 162, 235, 0.1)'
        },
        {
          label: '娯楽費',
          data: [20000, 18000, 22000],
          borderColor: '#4BC0C0',
          backgroundColor: 'rgba(75, 192, 192, 0.1)'
        },
        {
          label: 'サブスク',
          data: [10000, 10000, 10000],
          borderColor: '#9966FF',
          backgroundColor: 'rgba(153, 102, 255, 0.1)'
        }
      ]
    };

    beforeEach(() => {
      // テスト前にLocalStorageをクリアしてモックデータをセット
      localStorageMock.clear();
      localStorageMock.getItem.mockClear();
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockCategoryAssignments));
    });

    test('showQuadrantSummary=true の場合、四分法の集計行が表示される', () => {
      const { container } = render(
        <MonthlyTrendTable
          trendData={mockQuadrantTrendData}
          showQuadrantSummary={true}
        />
      );

      // 四分法の集計行が表示されることを確認
      const quadrantRows = container.querySelectorAll('.quadrant-summary-row');
      expect(quadrantRows.length).toBeGreaterThan(0);

      // 必需費（固定）の行が表示されることを確認
      expect(screen.getByText('必需費（固定）')).toBeInTheDocument();
    });

    test('showQuadrantSummary=false の場合、四分法の集計行は表示されない', () => {
      render(
        <MonthlyTrendTable
          trendData={mockQuadrantTrendData}
          showQuadrantSummary={false}
        />
      );

      // 四分法の集計行が表示されないことを確認
      expect(screen.queryByText('必需費（固定）')).not.toBeInTheDocument();
      expect(screen.queryByText('必需費（変動）')).not.toBeInTheDocument();
      expect(screen.queryByText('娯楽費（固定）')).not.toBeInTheDocument();
      expect(screen.queryByText('娯楽費（変動）')).not.toBeInTheDocument();
    });

    test('showQuadrantSummary="only" の場合、カテゴリ行が非表示で集計行のみ表示される', () => {
      const { container } = render(
        <MonthlyTrendTable
          trendData={mockQuadrantTrendData}
          showQuadrantSummary="only"
        />
      );

      // 各カテゴリの行が表示されないことを確認（合計行は除く）
      expect(screen.queryByText('食費')).not.toBeInTheDocument();
      expect(screen.queryByText('交通費')).not.toBeInTheDocument();

      // 四分法の集計行が表示されることを確認
      const quadrantRows = container.querySelectorAll('.quadrant-summary-row');
      expect(quadrantRows.length).toBeGreaterThan(0);

      // 必需費（固定）の行が表示されることを確認（最初に見つかる要素でテスト）
      expect(screen.getAllByText('必需費（固定）')[0]).toBeInTheDocument();
    });

    test('四分法集計の合計が正しく計算される', () => {
      const { container } = render(
        <MonthlyTrendTable
          trendData={mockQuadrantTrendData}
          showQuadrantSummary={true}
        />
      );

      // 必需費（変動）行を取得
      const rows = container.querySelectorAll('.quadrant-summary-row');
      const variableRow = Array.from(rows).find(
        row => row.textContent.includes('必需費（変動）')
      );
      
      expect(variableRow).toBeTruthy();

      // 必需費（変動）行に食費と交通費の合計が表示されていることを確認
      // （合計列は右から1番目）
      const cells = variableRow.querySelectorAll('td');
      const totalCell = cells[cells.length - 1];
      
      // 食費(93000) + 交通費(15000) = 108000
      expect(totalCell.textContent).toContain('108,000');
    });
  });
});