import { fetchCategories } from './fetchCategories';

/**
 * 経費項目にカテゴリ情報をマッチングする関数
 * @param {Object} expense - 経費項目オブジェクト
 * @param {string} categoryKey - カテゴリキー（デフォルト: '大項目'）
 * @returns {Promise<Object>} カテゴリ情報が追加された経費項目オブジェクト
 */
async function matchCategories(expense, categoryKey = '大項目') {
  if (!expense || typeof expense !== 'object') {
    console.warn('matchCategories: Invalid expense data');
    return expense; // 空オブジェクトではなく元のデータを返す
  }
  
  try {
    const categories = await fetchCategories();
    
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.warn('matchCategories: No categories available');
      return expense;
    }
    
    const expenseCategoryValue = expense[categoryKey];
    if (!expenseCategoryValue) {
      console.warn(`matchCategories: Expense missing "${categoryKey}" field`);
      return expense;
    }

    const matchingCategory = categories.find(
      category => category[categoryKey] === expenseCategoryValue
    );

    if (matchingCategory) {
      return {
        ...expense,
        type: matchingCategory.type,
        frequency: matchingCategory.frequency
      };
    } else {
      console.info(`matchCategories: No matching category found for "${expenseCategoryValue}"`);
    }

    return expense;
  } catch (error) {
    console.error('Error in matchCategories:', error);
    return expense; // エラー時は元のデータを返す
  }
}

export default matchCategories;