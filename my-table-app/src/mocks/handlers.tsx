import { http, HttpResponse } from 'msw';

interface TrendPredictionRequest {
  data: Array<{ date: string; value: number }>;
  forecastMonths: number;
}

interface PredictionRequest {
  category: string;
  months: number;
}

// 予測APIのモックハンドラー
export const handlers = [
  // 予測APIのモック
  http.post('/api/predict', async ({ request }) => {
    const body = (await request.json()) as PredictionRequest;
    const { category, months } = body;
    
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
    
    return HttpResponse.json({
      predictions: mockPredictionData,
      accuracy: 0.85
    }, { status: 200 });
  }),
  
  // 予測可能なカテゴリ取得APIのモック
  http.get('/api/predictable-categories', () => {
    return HttpResponse.json({
      categories: ['食費', '住居費', '交通費', '娯楽費', '光熱費']
    }, { status: 200 });
  }),
  
  // トレンド予測APIのモック
  http.post('/api/trend-prediction', async ({ request }) => {
    const body = (await request.json()) as TrendPredictionRequest;
    const { data, forecastMonths } = body;
    
    // モックデータ生成
    const lastDate = data && data.length > 0 
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
    
    return HttpResponse.json({
      forecast: mockForecast,
      confidence: 0.87
    }, { status: 200 });
  }),
  
  // エラー処理テスト用
  http.post('/api/predict-error', () => {
    return HttpResponse.json({
      error: 'Internal Server Error'
    }, { status: 500 });
  }),
  
  http.get('/api/network-error', () => {
    return HttpResponse.error();
  })
];