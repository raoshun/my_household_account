/**
 * データを指定されたキーでソートする関数
 * @param {Array} data - ソートするデータ配列
 * @param {string} key - ソートのキーとなるプロパティ名
 * @param {string} order - ソート順序 ('asc' または 'desc')
 * @returns {Array} - ソート済みの配列
 */
export function sortData(data, key, order = 'asc') {
  // 入力チェック
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  // コピーを作成してソート
  return [...data].sort((a, b) => {
    // キーが存在しない場合は最後に配置
    if (a[key] === undefined) return order === 'asc' ? -1 : 1;
    if (b[key] === undefined) return order === 'asc' ? 1 : -1;

    // 数値の場合
    if (typeof a[key] === 'number' && typeof b[key] === 'number') {
      return order === 'asc' ? a[key] - b[key] : b[key] - a[key];
    }

    // 文字列の場合
    if (typeof a[key] === 'string' && typeof b[key] === 'string') {
      return order === 'asc' 
        ? a[key].localeCompare(b[key]) 
        : b[key].localeCompare(a[key]);
    }

    // その他の型の場合
    return 0;
  });
}

/**
 * データをカテゴリ別に集計する関数
 * @param {Array} data - 集計するデータ配列
 * @returns {Object} - カテゴリ別に集計されたデータ
 */
export function sortAndAggregateData(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {};
  }

  const result = {};

  data.forEach(item => {
    const category = item['大項目'] || '未分類';
    if (!result[category]) {
      result[category] = {
        total: 0,
        items: []
      };
    }

    const amount = parseFloat(item['金額（円）'] || 0);
    result[category].total += amount;
    result[category].items.push(item);
  });

  return result;
}

/**
 * データを指定された条件でフィルタリングする
 * @param {Array} data - フィルタリング対象のデータ配列
 * @param {Object} filters - フィルタリング条件
 * @returns {Array} フィルタリングされたデータ配列
 */
export const filterData = (data, filters) => {
  // データがない場合は空配列を返す
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  // フィルタがない場合は全データを返す
  if (!filters || Object.keys(filters).length === 0) {
    return data;
  }
  
  // フィルタリング処理
  return data.filter(item => {
    // すべてのフィルタ条件に一致するかをチェック
    return Object.entries(filters).every(([key, value]) => {
      // フィルタ値が空の場合はチェックしない
      if (value === undefined || value === null || value === '') {
        return true;
      }
      
      // 項目の値がない場合は不一致
      if (item[key] === undefined || item[key] === null) {
        return false;
      }
      
      // 文字列として部分一致検索
      const itemValue = String(item[key]).toLowerCase();
      const filterValue = String(value).toLowerCase();
      return itemValue.includes(filterValue);
    });
  });
};