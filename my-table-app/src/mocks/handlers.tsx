import { rest } from 'msw';

// 予測APIのモックハンドラー
export const handlers = [
  // 予測APIのモック
  rest.post('/api/predict', (req, res, ctx) => {
    const { category, months } = req.body;
    
    // 予測データのモック作成
    const mockPredictionData = [];
    const startDate = new Date();
    
    for (let i = 0; i < months; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      
      mockPredictionData.push({
        date: date.toISOString().substring(0, 10),
        amount: Math.round(Math.random() * 10000 + 5000),
        category: category
      });
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        predictions: mockPredictionData,
        accuracy: 0.85
      })
    );
  }),
  
  // 予測可能なカテゴリ取得APIのモック
  rest.get('/api/predictable-categories', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        categories: ['食費', '住居費', '交通費', '娯楽費', '光熱費']
      })
    );
  }),
  
  // トレンド予測APIのモック
  rest.post('/api/trend-prediction', (req, res, ctx) => {
    const { data, forecastMonths } = req.body;
    
    // モックデータ生成
    const lastDate = data.length > 0 
      ? new Date(data[data.length - 1].date) 
      : new Date();
    
    const mockForecast = [];
    
    for (let i = 1; i <= forecastMonths; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setMonth(lastDate.getMonth() + i);
      
      mockForecast.push({
        date: forecastDate.toISOString().substring(0, 10),
        amount: Math.round(Math.random() * 10000 + 5000)
      });
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        forecast: mockForecast,
        confidence: 0.87
      })
    );
  }),
  
  // エラー処理テスト用
  rest.post('/api/predict-error', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        error: 'Internal Server Error'
      })
    );
  }),
  
  rest.get('/api/network-error', (req, res) => {
    return res.networkError('Network Error');
  })
];