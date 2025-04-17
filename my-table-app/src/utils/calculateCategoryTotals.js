/**
 * データからカテゴリごとの合計を計算する
 * @param {Array} data - 計算対象のデータ配列
 * @returns {Promise<Object>} カテゴリごとの合計を含むオブジェクト
 */
import { aggregateByCategory } from './categoryAggregation';

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
    // テストの期待値に合わせて修正: 「金額」を参照する
    // また、テストでは 大項目 + 中項目 でカテゴリを構成しているため
    // 両方を使用するように修正
    return aggregateByCategory(data, {
      categoryKey: '大項目',
      subCategoryKey: '中項目',  // 中項目を使用するよう変更
      amountKey: '金額',  // 「金額（円）」から「金額」に修正
      defaultCategory: '未分類'
    });
  } catch (error) {
    console.error('Error in calculateCategoryTotals:', error);
    return {}; // エラー時は空オブジェクトを返す
  }
};

export default calculateCategoryTotals;