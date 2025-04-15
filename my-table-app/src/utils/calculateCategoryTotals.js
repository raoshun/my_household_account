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
    // 共通の集計関数を使用
    return aggregateByCategory(data, {
      categoryKey: '大項目',
      subCategoryKey: '中項目',
      amountKey: '金額',
      defaultCategory: '未分類',
      defaultSubCategory: '未分類'
    });
  } catch (error) {
    console.error('Error in calculateCategoryTotals:', error);
    return {}; // エラー時は空オブジェクトを返す
  }
};

export default calculateCategoryTotals;