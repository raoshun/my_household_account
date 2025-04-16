import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import MonthlyTrendTable from './MonthlyTrendTable';
import * as trendPredictionApi from '../api/trendPredictionApi';

// trendPredictionApi のモック
jest.mock('../api/trendPredictionApi');

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

  const mockPredictionData = {
    nextMonth: '2025年4月',
    predictions: {
      '食費': 31500,
      '交通費': 5100
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
});