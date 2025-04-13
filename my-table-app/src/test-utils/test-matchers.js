/**
 * データ配列に指定した条件のオブジェクトが含まれているか確認する
 * @param {Array} array - 検索対象の配列
 * @param {Object} criteria - 一致条件
 * @returns {boolean} - 条件に一致する要素が見つかった場合はtrue
 */
export function containsObjectMatching(array, criteria) {
  if (!Array.isArray(array)) return false;
  
  return array.some(item => {
    if (!item || typeof item !== 'object') return false;
    
    return Object.entries(criteria).every(([key, value]) => {
      return item[key] === value;
    });
  });
}

/**
 * 配列内の各オブジェクトから特定のプロパティの値を抽出する
 * @param {Array} array - 対象の配列
 * @param {string} property - 抽出するプロパティ名
 * @returns {Array} - 抽出した値の配列
 */
export function pluck(array, property) {
  if (!Array.isArray(array)) return [];
  
  return array
    .filter(item => item && typeof item === 'object')
    .map(item => item[property]);
}

/**
 * 指定したプロパティでソートされているか確認する
 * @param {Array} array - 確認対象の配列
 * @param {string} property - ソート対象のプロパティ名
 * @param {string} order - ソート順序 ('asc'または'desc')
 * @returns {boolean} - 正しくソートされていればtrue
 */
export function isSortedByProperty(array, property, order = 'asc') {
  if (!Array.isArray(array) || array.length <= 1) return true;
  
  const values = pluck(array, property);
  
  for (let i = 1; i < values.length; i++) {
    const prev = values[i-1];
    const current = values[i];
    
    if (order === 'asc') {
      if (prev > current) return false;
    } else {
      if (prev < current) return false;
    }
  }
  
  return true;
}
