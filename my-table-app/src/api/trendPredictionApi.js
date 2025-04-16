/**
 * トレンド予測APIクライアント
 * 月次データから翌月の予測値を取得するAPIを呼び出す
 */

// API基本URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * 月次データから翌月の予測値を取得する
 * 
 * @param {Array} monthlyData - 月ごとの金額データ配列 ([月, 金額]のペア)
 * @returns {Promise<Object>} - 予測結果を含むオブジェクト {nextMonth: '2023年5月', predictedValue: 12345}
 */
export const getPredictedNextMonthValue = async (monthlyData) => {
  try {
    // リクエストの検証
    if (!Array.isArray(monthlyData) || monthlyData.length < 3) {
      throw new Error('予測には少なくとも3ヶ月分のデータが必要です');
    }

    const response = await fetch(`${API_BASE_URL}/api/predict/trend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ monthlyData }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`予測API呼び出しエラー: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('トレンド予測エラー:', error);
    throw error;
  }
};

/**
 * カテゴリごとの月次データから翌月の予測値を取得する
 * 
 * @param {Object} trendData - Chart.js形式の月次推移データ
 * @returns {Promise<Object>} - カテゴリごとの予測結果 {nextMonth: '2023年5月', predictions: {'食費': 12345, '交通費': 5000, ...}}
 */
export const getPredictedCategoryValues = async (trendData) => {
  try {
    // データ検証
    if (!trendData || !trendData.labels || !trendData.datasets ||
        trendData.labels.length < 3 || trendData.datasets.length === 0) {
      throw new Error('予測には少なくとも3ヶ月分のデータが必要です');
    }

    // 各カテゴリごとに予測リクエストを作成
    const categories = trendData.datasets.map(dataset => dataset.label);
    const monthLabels = trendData.labels;
    
    // カテゴリごとの月別データを抽出
    const categoryData = trendData.datasets.map(dataset => {
      return {
        category: dataset.label,
        // [月, 金額]のペアの配列を作成
        monthlyData: dataset.data.map((value, index) => [monthLabels[index], value])
      };
    });

    // APIリクエスト
    const response = await fetch(`${API_BASE_URL}/api/predict/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categoryData }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`予測API呼び出しエラー: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('カテゴリ別予測エラー:', error);
    throw error;
  }
};

/**
 * モックデータで予測値を取得する（APIが利用できない場合のテスト用）
 * 
 * @param {Object} trendData - Chart.js形式の月次推移データ
 * @returns {Promise<Object>} - カテゴリごとの予測結果
 */
export const getMockPrediction = async (trendData) => {
  return new Promise((resolve) => {
    // 1秒待機して応答をシミュレート
    setTimeout(() => {
      if (!trendData || !trendData.labels || !trendData.datasets ||
          trendData.labels.length === 0 || trendData.datasets.length === 0) {
        resolve({
          nextMonth: '予測不可',
          predictions: {}
        });
        return;
      }

      // 最後の月から次の月を推定
      const lastMonth = trendData.labels[trendData.labels.length - 1];
      let nextMonthStr = '予測月';
      
      if (lastMonth.match(/(\d+)年(\d+)月/)) {
        const year = parseInt(RegExp.$1, 10);
        let month = parseInt(RegExp.$2, 10) + 1;
        let yearNext = year;
        
        if (month > 12) {
          month = 1;
          yearNext += 1;
        }
        
        nextMonthStr = `${yearNext}年${month}月`;
      }
      
      // 各カテゴリの予測値を生成（最後の3ヶ月の平均から少しランダム変動）
      const predictions = {};
      trendData.datasets.forEach(dataset => {
        const category = dataset.label;
        const recentData = dataset.data.slice(-3); // 最後の3ヶ月分
        
        if (recentData.length === 0) {
          predictions[category] = 0;
          return;
        }
        
        // 平均値を計算し、±15%のランダム変動を加える
        const avg = recentData.reduce((sum, val) => sum + val, 0) / recentData.length;
        const randomFactor = 0.85 + (Math.random() * 0.3); // 0.85～1.15の範囲
        predictions[category] = Math.round(avg * randomFactor);
      });
      
      resolve({
        nextMonth: nextMonthStr,
        predictions
      });
    }, 1000);
  });
};

export default {
  getPredictedNextMonthValue,
  getPredictedCategoryValues,
  getMockPrediction
};