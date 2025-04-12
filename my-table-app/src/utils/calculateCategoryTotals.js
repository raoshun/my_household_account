/**
 * データからカテゴリごとの合計を計算する
 * @param {Array} data - 計算対象のデータ配列
 * @returns {Promise<Object>} カテゴリごとの合計を含むオブジェクト
 */
const calculateCategoryTotals = async (data) => {
  // データが無効な場合は空オブジェクトを返す
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {};
  }

  try {
    // カテゴリごとの合計を計算
    const totals = {};
    
    data.forEach(item => {
      // 大項目と中項目のプロパティが存在するか確認
      const majorCategory = item.大項目 || '未分類';
      const minorCategory = item.中項目 || '未分類';
      
      // ここで合成キーを作成（変数名を categoryKeyWithValue に変更）
      const categoryWithKey = `${majorCategory} - ${minorCategory}`;
      
      // 金額を数値として扱う
      const amount = typeof item.金額 === 'number' ? 
        item.金額 : parseFloat(item.金額) || 0;
      
      // カテゴリごとに金額を集計
      totals[categoryWithKey] = (totals[categoryWithKey] || 0) + amount;
    });
    
    return totals;
  } catch (error) {
    console.error('Error in calculateCategoryTotals:', error);
    return {}; // エラー時は空オブジェクトを返す
  }
};

export default calculateCategoryTotals;