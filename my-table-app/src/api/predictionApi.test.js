/**
 * 家計簿予測APIクライアントのテスト
 */

import { predictTrend, getPredictableCategories, convertPredictionToChartData } from './predictionApi';
import { getMockPrediction } from './trendPredictionApi';

// fetchのモック
global.fetch = jest.fn();

describe('家計簿予測APIクライアント', () => {
  beforeEach(() => {
    // 各テストの前にfetchのモックをリセット
    fetch.mockClear();
  });

  describe('predictTrend関数', () => {
    it('成功時に予測結果を返すこと', async () => {
      // モックレスポンスの設定
      const mockResponse = {
        success: true,
        method: 'arima',
        target_category: '合計',
        historical_data: [
          { date: '2023-01-01', year_month: '2023年1月', amount: 10000, is_prediction: false },
          { date: '2023-02-01', year_month: '2023年2月', amount: 12000, is_prediction: false },
          { date: '2023-03-01', year_month: '2023年3月', amount: 11000, is_prediction: false },
        ],
        forecast_data: [
          { date: '2023-04-01', year_month: '2023年4月', amount: 11500, is_prediction: true },
          { date: '2023-05-01', year_month: '2023年5月', amount: 12000, is_prediction: true },
        ]
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });
      
      // サンプルデータとオプション
      const sampleData = [{ '日付': '2023/01/15', '大項目': '食費', '金額（円）': 1000 }];
      const options = {
        forecastPeriods: 2,
        targetCategory: null,
        method: 'auto'
      };
      
      // APIを呼び出し
      const result = await predictTrend(sampleData, options);
      
      // 期待する結果
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/predict'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Object),
          body: JSON.stringify({
            data: sampleData,
            forecast_periods: 2,
            target_category: null,
            method: 'auto'
          })
        })
      );
      
      expect(result).toEqual(mockResponse);
    });
    
    it('APIエラー時にエラーレスポンスを返すこと', async () => {
      // エラーレスポンスを設定
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      // APIを呼び出し
      const result = await predictTrend([]);
      
      // 期待するエラーレスポンス
      expect(result).toEqual({
        success: false,
        error: expect.stringContaining('予測APIエラー'),
        historical_data: [],
        forecast_data: []
      });
    });
    
    it('ネットワークエラー時にエラーレスポンスを返すこと', async () => {
      // ネットワークエラーを設定
      fetch.mockRejectedValueOnce(new Error('Network Error'));
      
      // APIを呼び出し
      const result = await predictTrend([]);
      
      // 期待するエラーレスポンス
      expect(result).toEqual({
        success: false,
        error: expect.stringContaining('Network Error'),
        historical_data: [],
        forecast_data: []
      });
    });
  });
  
  describe('getPredictableCategories関数', () => {
    it('成功時にカテゴリリストを返すこと', async () => {
      // モックレスポンスの設定
      const mockResponse = {
        categories: ['食費', '住居費', '光熱費']
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });
      
      // サンプルデータ
      const sampleData = [{ '日付': '2023/01/15', '大項目': '食費', '金額（円）': 1000 }];
      
      // APIを呼び出し
      const result = await getPredictableCategories(sampleData);
      
      // 期待する結果
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/categories'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Object),
          body: JSON.stringify(sampleData)
        })
      );
      
      expect(result).toEqual(['食費', '住居費', '光熱費']);
    });
    
    it('APIエラー時に空配列を返すこと', async () => {
      // エラーレスポンスを設定
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      // APIを呼び出し
      const result = await getPredictableCategories([]);
      
      // 期待するエラーレスポンス
      expect(result).toEqual([]);
    });
  });
  
  describe('convertPredictionToChartData関数', () => {
    it('予測データをChart.js形式に変換すること', () => {
      // サンプル予測データ
      const predictionResult = {
        success: true,
        method: 'arima',
        target_category: '食費',
        historical_data: [
          { date: '2023-01-01', year_month: '2023年1月', amount: 3000, is_prediction: false },
          { date: '2023-02-01', year_month: '2023年2月', amount: 3500, is_prediction: false },
          { date: '2023-03-01', year_month: '2023年3月', amount: 3200, is_prediction: false },
        ],
        forecast_data: [
          { date: '2023-04-01', year_month: '2023年4月', amount: 3400, is_prediction: true, lower_bound: 3000, upper_bound: 3800 },
          { date: '2023-05-01', year_month: '2023年5月', amount: 3600, is_prediction: true, lower_bound: 3100, upper_bound: 4100 },
        ]
      };
      
      // カスタム色オプション
      const options = { targetColor: '#FF0000' };
      
      // 変換を実行
      const chartData = convertPredictionToChartData(predictionResult, options);
      
      // 期待する結果の構造
      expect(chartData).toHaveProperty('labels');
      expect(chartData).toHaveProperty('datasets');
      
      // ラベルの検証
      expect(chartData.labels).toEqual([
        '2023年1月', '2023年2月', '2023年3月',
        '2023年4月 (予測)', '2023年5月 (予測)'
      ]);
      
      // データセットの検証
      expect(chartData.datasets.length).toBe(4); // 実績、予測、上限、下限の4つ
      
      // 実績データセットの検証
      expect(chartData.datasets[0].label).toContain('実績');
      expect(chartData.datasets[0].data).toEqual([3000, 3500, 3200]);
      expect(chartData.datasets[0].borderColor).toBe('#FF0000');
      
      // 予測データセットの検証
      expect(chartData.datasets[1].label).toContain('予測');
      expect(chartData.datasets[1].data).toEqual([null, null, null, 3400, 3600]);
      expect(chartData.datasets[1].borderDash).toBeDefined(); // 点線スタイル
      
      // 信頼区間データセットの検証
      expect(chartData.datasets[2].label).toContain('上限');
      expect(chartData.datasets[2].data).toEqual([null, null, null, 3800, 4100]);
      
      expect(chartData.datasets[3].label).toContain('下限');
      expect(chartData.datasets[3].data).toEqual([null, null, null, 3000, 3100]);
    });
    
    it('信頼区間がない予測データを適切に処理すること', () => {
      // 信頼区間なしの予測データ
      const predictionResult = {
        success: true,
        method: 'exponential',
        target_category: '食費',
        historical_data: [{ date: '2023-01-01', year_month: '2023年1月', amount: 3000, is_prediction: false }],
        forecast_data: [{ date: '2023-02-01', year_month: '2023年2月', amount: 3200, is_prediction: true }]
      };
      
      // 変換を実行
      const chartData = convertPredictionToChartData(predictionResult);
      
      // データセットは実績と予測のみの2つであるべき
      expect(chartData.datasets.length).toBe(2);
    });
    
    it('不正な予測結果を適切に処理すること', () => {
      // 成功しなかった予測結果
      const failedResult = {
        success: false,
        error: 'エラーが発生しました',
      };
      
      // 変換を実行
      const chartData = convertPredictionToChartData(failedResult);
      
      // 空のチャートデータを返すべき
      expect(chartData).toEqual({ labels: [], datasets: [] });
      
      // nullの場合
      expect(convertPredictionToChartData(null)).toEqual({ labels: [], datasets: [] });
      
      // undefinedの場合
      expect(convertPredictionToChartData(undefined)).toEqual({ labels: [], datasets: [] });
    });
  });
});

describe('trendPredictionApi', () => {
  describe('getMockPrediction', () => {
    it('有効なデータで予測データが正しく生成される', async () => {
      // テスト用のデータを準備
      const testData = {
        labels: ['2025年1月', '2025年2月', '2025年3月'],
        datasets: [
          {
            label: '食費',
            data: [30000, 32000, 31000],
            borderColor: '#FF6384'
          },
          {
            label: '交通費',
            data: [5000, 4800, 5200],
            borderColor: '#36A2EB'
          }
        ]
      };

      // 予測データを取得
      const prediction = await getMockPrediction(testData);

      // 結果の検証
      expect(prediction).toBeDefined();
      expect(prediction.nextMonth).toBe('2025年4月');
      expect(prediction.predictions).toBeDefined();
      expect(prediction.predictions['食費']).toBeDefined();
      expect(prediction.predictions['交通費']).toBeDefined();
      
      // 予測値が配列なので、最初の要素を比較するよう修正
      const foodAvg = (30000 + 32000 + 31000) / 3;
      expect(prediction.predictions['食費'][0]).toBeGreaterThanOrEqual(foodAvg * 0.85);
      expect(prediction.predictions['食費'][0]).toBeLessThanOrEqual(foodAvg * 1.15);
      
      const transportAvg = (5000 + 4800 + 5200) / 3;
      expect(prediction.predictions['交通費'][0]).toBeGreaterThanOrEqual(transportAvg * 0.85);
      expect(prediction.predictions['交通費'][0]).toBeLessThanOrEqual(transportAvg * 1.15);
    });

    it('データが足りない場合は適切なデフォルト値を返す', async () => {
      // データが不足しているケース
      const insufficientData = {
        labels: ['2025年3月'], // 1ヶ月分しかない
        datasets: [
          {
            label: '食費',
            data: [30000],
            borderColor: '#FF6384'
          }
        ]
      };

      const prediction = await getMockPrediction(insufficientData);
      
      // 結果の検証
      expect(prediction).toBeDefined();
      expect(prediction.nextMonth).toBe('2025年4月');
      expect(prediction.predictions['食費']).toBeDefined();
    });

    it('空のデータの場合は適切なレスポンスを返す', async () => {
      // 空のデータ
      const emptyData = { labels: [], datasets: [] };
      const prediction = await getMockPrediction(emptyData);
      
      // 結果の検証
      expect(prediction).toBeDefined();
      expect(prediction.nextMonth).toBe('予測不可');
      expect(Object.keys(prediction.predictions).length).toBe(0);
    });

    it('データが未定義の場合も適切なレスポンスを返す', async () => {
      // undefinedの場合
      const prediction = await getMockPrediction(undefined);
      
      // 結果の検証
      expect(prediction).toBeDefined();
      expect(prediction.nextMonth).toBe('予測不可');
      expect(Object.keys(prediction.predictions).length).toBe(0);
    });
  });
});