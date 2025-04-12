/**
 * 正の金額の合計を計算する
 * @param {Array} data - 計算対象のデータ配列
 * @param {string} amountKey - 金額が格納されているプロパティ名（デフォルト: '金額（円）'）
 * @returns {number} 正の金額の合計
 */
export const calculatePositiveSum = (data, amountKey = '金額（円）') => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return 0;
  }
  
  return data.reduce((sum, item) => {
    const amount = Number(item[amountKey]) || 0;
    return amount > 0 ? sum + amount : sum;
  }, 0);
};

/**
 * 負の金額の合計を計算する
 * @param {Array} data - 計算対象のデータ配列
 * @param {string} amountKey - 金額が格納されているプロパティ名（デフォルト: '金額（円）'）
 * @returns {number} 負の金額の合計
 */
export const calculateNegativeSum = (data, amountKey = '金額（円）') => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return 0;
  }
  
  return data.reduce((sum, item) => {
    const amount = Number(item[amountKey]) || 0;
    return amount < 0 ? sum + amount : sum;
  }, 0);
};

/**
 * 特定のカテゴリの合計金額を計算する
 * @param {Array} data - 計算対象のデータ配列
 * @param {string} categoryKey - カテゴリが格納されているプロパティ名（デフォルト: '大項目'）
 * @param {string} categoryValue - 計算対象のカテゴリ値
 * @param {string} amountKey - 金額が格納されているプロパティ名（デフォルト: '金額（円）'）
 * @returns {number} 指定カテゴリの合計金額
 */
export const calculateCategorySum = (data, categoryKey = '大項目', categoryValue, amountKey = '金額（円）') => {
  if (!data || !Array.isArray(data) || data.length === 0 || !categoryValue) {
    return 0;
  }
  
  return data
    .filter(item => item[categoryKey] === categoryValue)
    .reduce((sum, item) => {
      const amount = Number(item[amountKey]) || 0;
      return sum + amount;
    }, 0);
};
