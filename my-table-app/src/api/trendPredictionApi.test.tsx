import { getMockPrediction } from './trendPredictionApi';
import { PredictionResult, TrendData } from '../types';

// fetch のモック
global.fetch = jest.fn();

describe('trendPredictionApi', () => {
  beforeEach(() => {
    // テストごとに fetch のモックをリセット
    (fetch as jest.Mock).mockClear();
  });

  describe('getMockPrediction', () => {
    it('空のデータに対して適切な応答を返す', async () => {
      const emptyTrendData: TrendData = { labels: [], datasets: [] };
      const result = await getMockPrediction(emptyTrendData) as PredictionResult;
      
      expect(result).toHaveProperty('nextMonths');
      expect(result).toHaveProperty('predictions');
      expect(Object.keys(result.predictions)).toHaveLength(0);
    });
    
    it('有効なデータで予測を生成する', async () => {
      // テスト用のチャートデータ
      const trendData = {
        labels: ['2023年1月', '2023年2月', '2023年3月'],
        datasets: [
          {
            label: '食費',
            data: [30000, 35000, 32000],
            borderColor: '#ff0000'
          },
          {
            label: '交通費',
            data: [5000, 5500, 5200],
            borderColor: '#00ff00'
          }
        ]
      };
      
      const result = await getMockPrediction(trendData) as PredictionResult;
      expect(result.nextMonths).toHaveLength(3); // デフォルトは3ヶ月
      expect(Object.keys(result.predictions)).toHaveLength(2); // 2つのカテゴリ
      expect(result.predictions).toHaveProperty('食費');
      expect(result.predictions).toHaveProperty('交通費');
      expect(Array.isArray(result.predictions['食費'])).toBe(true);
      expect(result.predictions['食費']).toHaveLength(3); // 3ヶ月分の予測
    });
    
    it('予測期間を指定できる', async () => {
      // テスト用のチャートデータ
      const trendData = {
        labels: ['2023年1月', '2023年2月', '2023年3月'],
        datasets: [
          {
            label: '食費',
            data: [30000, 35000, 32000]
          }
        ]
      };
      
      // 1ヶ月の予測
      const result1Month = await getMockPrediction(trendData, { forecastPeriods: 1 }) as PredictionResult;
      expect(result1Month.nextMonths).toHaveLength(1);
      expect(result1Month.predictions['食費']).toHaveLength(1);
      
      // 2ヶ月の予測
      const result2Month = await getMockPrediction(trendData, { forecastPeriods: 2 }) as PredictionResult;
      expect(result2Month.nextMonths).toHaveLength(2);
      expect(result2Month.predictions['食費']).toHaveLength(2);
    });
    
    it('予測アルゴリズムを指定できる', async () => {
      // テスト用のチャートデータ
      const trendData = {
        labels: ['2023年1月', '2023年2月', '2023年3月'],
        datasets: [
          {
            label: '食費',
            data: [30000, 35000, 32000]
          }
        ]
      };
      
      // 各アルゴリズムでの予測テスト
      const methodsToTest = ['auto', 'arima', 'exponential', 'seasonal_ma'];
      
      for (const method of methodsToTest) {
        const result = await getMockPrediction(trendData, { method }) as PredictionResult;
        expect(result).toHaveProperty('method');
        expect(result.method).toBe(method);
      }
    });
    
    it('季節性調整付き移動平均アルゴリズムで予測できる', async () => {
      // テスト用のチャートデータ
      const trendData = {
        labels: ['2023年1月', '2023年2月', '2023年3月'],
        datasets: [
          {
            label: '食費',
            data: [30000, 35000, 32000]
          }
        ]
      };
      
      // 季節性調整付き移動平均での予測
      const result = await getMockPrediction(trendData, { 
        method: 'seasonal_ma',
        forecastPeriods: 3 
      }) as PredictionResult;
      
      // 結果を検証
      expect(result).toHaveProperty('method');
      expect(result.method).toBe('seasonal_ma');
      expect(result.nextMonths).toHaveLength(3);
      expect(result.predictions['食費']).toHaveLength(3);
      
      // 季節性パターンが反映されているか確認（シンプルな実装では完全な検証は難しい）
      const predictions = result.predictions['食費'];
      // 予測値が数値であることを確認
      predictions.forEach(value => {
        expect(typeof value).toBe('number');
      });
    });
  });
});