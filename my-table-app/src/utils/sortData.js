/**
 * データ配列を指定キーでソートする
 * @param {Array} data - ソート対象のデータ配列
 * @param {string} key - ソートに使用するキー
 * @param {string} order - ソート順序（'asc'または'desc'）
 * @returns {Array} ソートされたデータ配列
 */
export const sortData = (data, key, order = 'asc') => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  return [...data].sort((a, b) => {
    // 数値型かどうかをチェック - 配列内に一つでも数値型の値があれば数値としてソート
    const isNumericKey = data.some(item => typeof item[key] === 'number');
    
    if (isNumericKey) {
      // undefined/nullの場合の処理 - 数値型では欠損値は最後に配置
      const hasValueA = a[key] !== undefined;
      const hasValueB = b[key] !== undefined;
      
      // どちらかがundefined/nullの場合
      if (!hasValueA && !hasValueB) return 0;
      if (!hasValueA) return order === 'asc' ? 1 : -1; // undefined値は最後に
      if (!hasValueB) return order === 'asc' ? -1 : 1; // undefined値は最後に
      
      // 数値型の正常な比較
      const valueA = Number(a[key]) || 0;
      const valueB = Number(b[key]) || 0;
      
      return order === 'asc' ? valueA - valueB : valueB - valueA;
    } else {
      // 文字列型の場合
      // undefined/nullの場合の処理 - 文字列型では欠損値は最初に配置
      // hasOwnProperty の直接呼び出しを修正
      const hasValueA = Object.prototype.hasOwnProperty.call(a, key);
      const hasValueB = Object.prototype.hasOwnProperty.call(b, key);
      
      // どちらかがundefined/nullの場合
      if (!hasValueA && !hasValueB) return 0;
      if (!hasValueA) return order === 'asc' ? -1 : 1; // undefined値は最初に
      if (!hasValueB) return order === 'asc' ? 1 : -1; // undefined値は最初に
      
      // 文字列として比較
      const valueA = String(a[key] || '');
      const valueB = String(b[key] || '');
      
      if (order === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    }
  });
};

export const sortAndAggregateData = (data) => {
  const aggregatedData = {};

  data.forEach(item => {
    const majorCategory = item['大項目'];
    const minorCategory = item['中項目'];
    const amountValue = Number(item['金額（円）']) || 0;

    if (!majorCategory) {
      return; // 大項目がない場合はスキップ
    }

    if (!aggregatedData[majorCategory]) {
      aggregatedData[majorCategory] = {};
    }

    const safeMinorCategory = minorCategory || '未分類';
    if (!aggregatedData[majorCategory][safeMinorCategory]) {
      aggregatedData[majorCategory][safeMinorCategory] = 0;
    }

    aggregatedData[majorCategory][safeMinorCategory] += amountValue;
  });

  return aggregatedData;
};

/**
 * データを指定された条件でフィルタリングする
 * @param {Array} data - フィルタリング対象のデータ配列
 * @param {Object} filters - フィルタリング条件
 * @returns {Array} フィルタリングされたデータ配列
 */
export const filterData = (data, filters = {}) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  // フィルタが指定されていない場合
  if (!filters || Object.keys(filters).length === 0) {
    return [...data];
  }
  
  try {
    return data.filter(item => {
      return Object.keys(filters).every(key => {
        // フィルタ値が未指定の場合は全て通す
        if (filters[key] === undefined || filters[key] === null || filters[key] === '') {
          return true;
        }
        
        // 項目値が存在しない場合
        if (item[key] === undefined || item[key] === null) {
          return false;
        }
        
        // 文字列として部分一致で比較
        const itemValue = String(item[key]).toLowerCase();
        const filterValue = String(filters[key]).toLowerCase();
        return itemValue.includes(filterValue);
      });
    });
  } catch (error) {
    console.error('Error in filterData:', error);
    return [...data]; // エラー時は元のデータを返す
  }
};