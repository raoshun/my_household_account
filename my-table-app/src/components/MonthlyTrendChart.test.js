import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import MonthlyTrendChart from './MonthlyTrendChart';
import * as trendPredictionApi from '../api/trendPredictionApi';

// trendPredictionApi のモック
jest.mock('../api/trendPredictionApi');

// Chart.jsのモック
jest.mock('chart.js', () => {
  return {
    Chart: jest.fn().mockImplementation(() => ({
      destroy: jest.fn()
    })),
    registerables: [{}],
    register: jest.fn()
  };
});

describe('MonthlyTrendChart コンポーネント', () => {
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
    
    // canvas context モック
    HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn()
    });
  });

  test('基本的なレンダリングが正常に行われる', () => {
    render(<MonthlyTrendChart trendData={mockTrendData} />);
    
    // キャンバス要素が存在することを確認
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  test('データが空の場合、適切なメッセージが表示される', () => {
    render(<MonthlyTrendChart trendData={{ labels: [], datasets: [] }} />);
    
    // データなしメッセージが表示されることを確認
    expect(screen.getByText(/表示できるデータがありません/)).toBeInTheDocument();
  });

  test('showPrediction=true の場合、予測APIが呼び出される', async () => {
    render(
      <MonthlyTrendChart 
        trendData={mockTrendData} 
        showPrediction={true} 
      />
    );

    // APIが呼び出されたことを確認
    await waitFor(() => {
      expect(trendPredictionApi.getMockPrediction).toHaveBeenCalledWith(mockTrendData);
    });
  });

  test('予測データがロードされると予測情報が表示される', async () => {
    render(
      <MonthlyTrendChart 
        trendData={mockTrendData} 
        showPrediction={true} 
      />
    );

    // 予測情報が表示されることを確認
    await waitFor(() => {
      // テキストを含むかどうかをチェック（完全一致ではなく含む）
      expect(screen.getByText(/2025年4月/)).toBeInTheDocument();
      expect(screen.getByText(/予測/)).toBeInTheDocument();
    });
  });

  test('showPrediction=false の場合、予測APIは呼び出されない', () => {
    render(
      <MonthlyTrendChart 
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
      <MonthlyTrendChart 
        trendData={mockTrendData} 
        showPrediction={true} 
      />
    );

    // ローディングインジケーターが表示されることを確認
    expect(screen.getByText(/予測データを計算中/)).toBeInTheDocument();

    // 予測データがロードされると予測情報が表示される
    await waitFor(() => {
      expect(screen.getByText(/2025年4月/)).toBeInTheDocument();
    });
  });
});