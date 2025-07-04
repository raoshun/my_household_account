import type { PredictionResult } from '../types';

/**
 * 家計簿予測APIクライアント
 * 
 * Pythonバックエンドで実装された予測APIと通信し、月次トレンドの予測データを取得します。
 */

// APIのベースURL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * 月次トレンドの予測を実行する
 * 
 * @param {Array} data - 家計簿データの配列
 * @param {Object} options - 予測オプション
 * @param {number} options.forecastPeriods - 予測する期間（月数）
 * @param {string} options.targetCategory - 予測対象のカテゴリ（指定しない場合は全カテゴリ合計）
 * @param {string} options.method - 予測手法 ('auto', 'arima', 'exponential')
 * @returns {Promise<Object>} - 予測結果
 */
interface PredictOptions {
  forecastPeriods?: number;
  targetCategory?: string | null;
  method?: string;
  [key: string]: unknown;
}

export const predictTrend = async (data: Record<string, unknown>[], options: PredictOptions = {}) => {
  try {
    const {
      forecastPeriods = 3,
      targetCategory = null,
      method = 'auto'
    } = options;

    // APIリクエスト用のデータ構造を作成
    const requestData = {
      data,
      forecast_periods: forecastPeriods,
      target_category: targetCategory,
      method
    };

    // APIリクエスト
    const response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`予測APIエラー: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('予測APIリクエスト中にエラーが発生しました:', error);
    return {
      success: false,
      error: error.message || '予測処理中にエラーが発生しました',
      historical_data: [],
      forecast_data: []
    };
  }
};

/**
 * 予測可能なカテゴリのリストを取得する
 * 
 * @param {Array} data - 家計簿データの配列
 * @returns {Promise<Array>} - カテゴリのリスト
 */
export const getPredictableCategories = async (data) => {
  try {
    // APIリクエスト
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`カテゴリ取得エラー: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.categories || [];

  } catch (error) {
    console.error('カテゴリ取得中にエラーが発生しました:', error);
    return [];
  }
};

/**
 * 予測データを月次トレンドチャート用のデータ形式に変換する
 * 
 * @param {Object} predictionResult - 予測API結果
 * @param {Object} options - 変換オプション
 * @param {string} options.targetColor - 予測線の色
 * @returns {Object} Chart.js用のデータ形式
 */
export const convertPredictionToChartData = (predictionResult: PredictionResult, options: { targetColor?: string } = {}) => {
  const { targetColor = '#FF6384' } = options;

  if (!predictionResult || !predictionResult.success) {
    return { labels: [], datasets: [] };
  }

  // 履歴データと予測データを取得
  const historicalData = predictionResult.historical_data || [];
  const forecastData = predictionResult.forecast_data || [];

  // カテゴリ名を取得
  const categoryName = predictionResult.target_category || '合計';

  // ラベル（月）を抽出
  const labels = [
    ...historicalData.map(item => item.year_month),
    ...forecastData.map(item => `${item.year_month} (予測)`)
  ];

  // 実績値データセット
  const historicalDataset = {
    label: `${categoryName}（実績）`,
    data: historicalData.map(item => item.amount),
    borderColor: targetColor,
    backgroundColor: `${targetColor}20`, // 透明度20%
    borderWidth: 2,
    fill: false
  };

  // 予測データの中点に対応する実データの長さ
  const dataOffset = historicalData.length;

  // 予測値データセット
  const forecastDataset = {
    label: `${categoryName}（予測）`,
    data: Array(dataOffset).fill(null).concat(forecastData.map(item => item.amount)),
    borderColor: targetColor,
    backgroundColor: `${targetColor}20`,
    borderWidth: 2,
    borderDash: [5, 5], // 点線スタイル
    fill: false,
    pointStyle: 'circle',
    pointRadius: 4,
    pointBackgroundColor: targetColor
  };

  // 上限値と下限値のデータセット（信頼区間がある場合のみ）
  let confidenceDatasets = [];
  const hasConfidenceInterval = forecastData.length > 0 && 
                               'lower_bound' in forecastData[0] && 
                               'upper_bound' in forecastData[0];

  if (hasConfidenceInterval) {
    // 信頼区間上限データセット
    const upperDataset = {
      label: '予測上限',
      data: Array(dataOffset).fill(null).concat(forecastData.map(item => item.upper_bound)),
      borderColor: `${targetColor}60`, // 透明度60%
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderDash: [3, 3],
      fill: false,
      pointRadius: 0,
    };

    // 信頼区間下限データセット
    const lowerDataset = {
      label: '予測下限',
      data: Array(dataOffset).fill(null).concat(forecastData.map(item => item.lower_bound)),
      borderColor: `${targetColor}60`, // 透明度60%
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderDash: [3, 3],
      fill: '+1', // 上限線との間を塗りつぶす
      pointRadius: 0,
    };

    confidenceDatasets = [upperDataset, lowerDataset];
  }

  // 最終的なチャートデータ
  return {
    labels,
    datasets: [
      historicalDataset,
      forecastDataset,
      ...confidenceDatasets
    ]
  };
};

export default {
  predictTrend,
  getPredictableCategories,
  convertPredictionToChartData
};