import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as trendPredictionApi from '../api/trendPredictionApi';

// Chart.jsをモックする - インポートの前に設定
jest.mock('chart.js', () => {
  const Chart = jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
    resize: jest.fn()
  }));
  
  // registerablesをイテラブルオブジェクトとして定義
  const registerables = ['scale', 'legend', 'title'];
  
  // register()メソッドを定義
  Chart.register = jest.fn((...args) => {
    console.log('Chart.register called with:', args);
  });
  
  return {
    Chart,
    registerables
  };
});

// APIモックを正しく設定する
jest.mock('../api/trendPredictionApi', () => {
  return {
    getPrediction: jest.fn(),
    getMockPrediction: jest.fn().mockResolvedValue({
      nextMonths: ['2023年4月', '2023年5月', '2023年6月'],
      predictions: {
        '食費': [33000, 34000, 35000]
      },
      method: 'seasonal_ma'
    })
  };
});

// MonthlyTrendChartをインポート（Chart.jsのモックの後）
import MonthlyTrendChart from './MonthlyTrendChart';

describe('MonthlyTrendChart', () => {
  // テスト用のサンプルデータ
  const sampleTrendData = {
    labels: ['2023年1月', '2023年2月', '2023年3月'],
    datasets: [
      {
        label: '食費',
        data: [30000, 35000, 32000],
        borderColor: '#ff0000'
      }
    ]
  };

  // 収入を含むサンプルデータ（貯蓄率テスト用）
  const sampleTrendDataWithIncome = {
    labels: ['2023年1月', '2023年2月', '2023年3月'],
    datasets: [
      {
        label: '収入',
        data: [300000, 310000, 320000],
        borderColor: '#00ff00'
      },
      {
        label: '食費',
        data: [30000, 35000, 32000],
        borderColor: '#ff0000'
      },
      {
        label: '住居費',
        data: [80000, 80000, 80000],
        borderColor: '#0000ff'
      }
    ]
  };

  const mockPredictionData = {
    nextMonths: ['2023年4月', '2023年5月', '2023年6月'],
    predictions: {
      '食費': [33000, 34000, 35000]
    },
    method: 'seasonal_ma'
  };

  const mockPredictionDataWithIncome = {
    nextMonths: ['2023年4月', '2023年5月', '2023年6月'],
    predictions: {
      '収入': [330000, 335000, 340000],
      '食費': [33000, 34000, 35000],
      '住居費': [80000, 80000, 80000]
    },
    method: 'seasonal_ma'
  };

  beforeEach(() => {
    // テスト前にモックをリセット
    jest.clearAllMocks();
    // デフォルトの応答を設定
    trendPredictionApi.getMockPrediction.mockResolvedValue(mockPredictionData);
  });

  it('基本的なレンダリングをテスト', () => {
    render(<MonthlyTrendChart trendData={sampleTrendData} />);
    expect(screen.getByTestId('monthly-trend-chart')).toBeInTheDocument();
  });

  it('予測表示が有効な場合にAPIを呼び出す', async () => {
    // モックをクリア
    jest.clearAllMocks();
    
    // レンダリングしてAPIが呼び出されるのを待つ
    await act(async () => {
      render(
        <MonthlyTrendChart 
          trendData={sampleTrendData}
          showPrediction={true}
        />
      );
    });
    
    // APIが呼び出されるのを待つ
    await waitFor(() => {
      // 回数の厳密なチェックではなく、少なくとも1回呼び出されたことをチェック
      expect(trendPredictionApi.getMockPrediction).toHaveBeenCalled();
    });
    
    // 正しいパラメータで呼び出されたことを確認（最後の呼び出しをチェック）
    expect(trendPredictionApi.getMockPrediction).toHaveBeenLastCalledWith(
      sampleTrendData,
      expect.objectContaining({
        forecastPeriods: 3,
        method: 'auto'
      })
    );
  });

  it('予測期間が指定された場合にAPIに渡す', async () => {
    const forecastPeriods = 2;
    
    // レンダリング
    await act(async () => {
      render(
        <MonthlyTrendChart
          trendData={sampleTrendData}
          showPrediction={true}
          forecastPeriods={forecastPeriods}
        />
      );
    });
    
    // APIが呼び出されるのを待つ
    await waitFor(() => {
      expect(trendPredictionApi.getMockPrediction).toHaveBeenCalled();
    });
    
    // 正しいパラメータでAPIが呼び出されることを確認（最後の呼び出しをチェック）
    expect(trendPredictionApi.getMockPrediction).toHaveBeenLastCalledWith(
      sampleTrendData,
      expect.objectContaining({ forecastPeriods })
    );
  });

  it('予測手法が指定された場合にAPIに渡す', async () => {
    const predictionMethod = 'seasonal_ma';
    
    // レンダリング
    await act(async () => {
      render(
        <MonthlyTrendChart
          trendData={sampleTrendData}
          showPrediction={true}
          predictionMethod={predictionMethod}
        />
      );
    });
    
    // APIが呼び出されるのを待つ
    await waitFor(() => {
      expect(trendPredictionApi.getMockPrediction).toHaveBeenCalled();
    });
    
    // 正しいパラメータでAPIが呼び出されることを確認
    expect(trendPredictionApi.getMockPrediction).toHaveBeenCalledWith(
      sampleTrendData,
      expect.objectContaining({ method: predictionMethod })
    );
  });

  it('季節性調整付き移動平均が予測手法として指定できる', async () => {
    // 特定の応答を返すようにモックを設定
    trendPredictionApi.getMockPrediction.mockResolvedValue({
      ...mockPredictionData,
      method: 'seasonal_ma'
    });
    
    // レンダリング
    await act(async () => {
      render(
        <MonthlyTrendChart
          trendData={sampleTrendData}
          showPrediction={true}
          predictionMethod="seasonal_ma"
          forecastPeriods={3}
        />
      );
    });
    
    // APIが呼び出されるのを待つ
    await waitFor(() => {
      expect(trendPredictionApi.getMockPrediction).toHaveBeenCalled();
    });
    
    // 正しいパラメータでAPIが呼び出されることを確認
    expect(trendPredictionApi.getMockPrediction).toHaveBeenCalledWith(
      sampleTrendData, 
      expect.objectContaining({
        method: 'seasonal_ma',
        forecastPeriods: 3
      })
    );
    
    // 十分な時間を待ち、予測情報が表示されることを確認
    await waitFor(() => {
      expect(screen.queryByText(/予測手法:/)).toBeInTheDocument();
    });
  });

  describe('貯蓄率機能のテスト', () => {
    beforeEach(() => {
      // 収入データを含む予測データを使用
      trendPredictionApi.getMockPrediction.mockResolvedValue(mockPredictionDataWithIncome);
    });

    it('showSavingsRateがtrueで収入データがある場合に貯蓄率が表示される', () => {
      render(
        <MonthlyTrendChart
          trendData={sampleTrendDataWithIncome}
          showSavingsRate={true}
        />
      );
      
      // 貯蓄率情報が表示されていることを確認
      const savingsRateInfo = screen.queryByTestId('savings-rate-info');
      expect(savingsRateInfo).toBeInTheDocument();
    });

    it('showSavingsRateがfalseの場合は貯蓄率が表示されない', () => {
      render(
        <MonthlyTrendChart
          trendData={sampleTrendDataWithIncome}
          showSavingsRate={false}
        />
      );
      
      // 貯蓄率情報が表示されていないことを確認
      expect(screen.queryByTestId('savings-rate-info')).not.toBeInTheDocument();
    });

    it('収入データがない場合は貯蓄率が表示されない', () => {
      render(
        <MonthlyTrendChart
          trendData={sampleTrendData} // 収入データが含まれていないデータ
          showSavingsRate={true}
        />
      );
      
      // 貯蓄率情報が表示されていないことを確認
      expect(screen.queryByTestId('savings-rate-info')).not.toBeInTheDocument();
    });

    // 予測データと貯蓄率表示のテストを復活
    it('予測データと貯蓄率表示を組み合わせることができる', async () => {
      // レンダリング
      await act(async () => {
        render(
          <MonthlyTrendChart 
            trendData={sampleTrendDataWithIncome}
            showPrediction={true}
            showSavingsRate={true}
          />
        );
      });
      
      // APIが呼び出されるのを待つ
      await waitFor(() => {
        expect(trendPredictionApi.getMockPrediction).toHaveBeenCalled();
      });
      
      // 正しいパラメータでAPIが呼び出されることを確認
      expect(trendPredictionApi.getMockPrediction).toHaveBeenCalledWith(
        sampleTrendDataWithIncome, 
        expect.objectContaining({
          forecastPeriods: 3,
          method: 'auto'
        })
      );
      
      // 貯蓄率情報が表示されていることを確認
      const savingsRateInfo = screen.queryByTestId('savings-rate-info');
      expect(savingsRateInfo).toBeInTheDocument();
    });
  });
});