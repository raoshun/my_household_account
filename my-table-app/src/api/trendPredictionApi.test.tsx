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
      // 型エラー回避: predictions, nextMonthsをanyとして扱う
      const predictions: any = result.predictions;
      expect(result.nextMonths).toHaveLength(3); // デフォルトは3ヶ月
      expect(Object.keys(predictions)).toHaveLength(2); // 2つのカテゴリ
      expect(predictions).toHaveProperty('食費');
      expect(predictions).toHaveProperty('交通費');
      expect(Array.isArray(predictions['食費'])).toBe(true);
      expect(predictions['食費']).toHaveLength(3); // 3ヶ月分の予測
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
      // 型エラー回避: predictionsをanyとして扱う
      const predictions1: any = result1Month.predictions;
      expect(result1Month.nextMonths).toHaveLength(1);
      expect(predictions1['食費']).toHaveLength(1);
      // 2ヶ月の予測
      const result2Month = await getMockPrediction(trendData, { forecastPeriods: 2 }) as PredictionResult;
      // 型エラー回避: predictionsをanyとして扱う
      const predictions2: any = result2Month.predictions;
      expect(result2Month.nextMonths).toHaveLength(2);
      expect(predictions2['食費']).toHaveLength(2);
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
      // 型エラー回避: predictionsをanyとして扱う
      const predictions: any = result.predictions;
      expect(result).toHaveProperty('method');
      expect(result.method).toBe('seasonal_ma');
      expect(result.nextMonths).toHaveLength(3);
      expect(predictions['食費']).toHaveLength(3);
      // 季節性パターンが反映されているか確認（シンプルな実装では完全な検証は難しい）
      predictions['食費'].forEach((value: any) => {
        expect(typeof value).toBe('number');
      });
    });
    
    it('週次推移データ・unit: weekly指定で予測API呼び出しができる', async () => {
      const trendData = {
        labels: ['2025年第1週', '2025年第2週', '2025年第3週'],
        datasets: [
          { label: '食費', data: [1000, 1200, 1100] },
          { label: '交通費', data: [500, 600, 550] }
        ]
      };
      // fetchのモック
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          nextWeeks: ['2025年第4週', '2025年第5週'],
          predictions: { '食費': [1150, 1170], '交通費': [560, 570] },
          method: 'auto'
        })
      });
      const { getPredictedCategoryValues } = await import('./trendPredictionApi');
      const result = await getPredictedCategoryValues(trendData, { unit: 'weekly', forecastPeriods: 2 });
      expect(fetch).toHaveBeenCalled();
      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
      expect(body.unit).toBe('weekly');
      expect(result.nextWeeks).toHaveLength(2);
      expect(result.predictions['食費']).toEqual([1150, 1170]);
    });

    it('getMockPredictionで週次データも予測できる', async () => {
      const trendData = {
        labels: ['2025年第1週', '2025年第2週', '2025年第3週'],
        datasets: [
          { label: '食費', data: [1000, 1200, 1100] }
        ]
      };
      const result = await getMockPrediction(trendData, { forecastPeriods: 2 });
      expect(result.nextMonths && result.nextMonths.length).toBeGreaterThan(0);
      expect(Array.isArray(result.predictions['食費'])).toBe(true);
      expect(result.predictions['食費'].length).toBe(2);
    });
  });
});