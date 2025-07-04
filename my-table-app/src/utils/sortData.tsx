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

  // 大項目ごとに集計
  const result = {};
  data.forEach(item => {
    const main = item['大項目'] || '未分類';
    if (!result[main]) {
      result[main] = {
        items: [],
        total: 0
      };
    }
    result[main].items.push(item);
    result[main].total += Number(item['金額（円）']) || 0;
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
    // 振替除外オプションの処理
    if (filters.excludeTransfers) {
      // 振替列があり、値が0（または空）でない場合は除外
      const transferValue = item['振替'];
      if (transferValue !== undefined && transferValue !== null && transferValue !== '' && transferValue !== 0 && transferValue !== '0') {
        return false;
      }
    }

    // 日付範囲フィルターの処理
    if (filters.startDate || filters.endDate) {
      // 日付データがない場合は含めない
      if (!item['日付']) {
        return false;
      }
      
      // 文字列の日付をDateオブジェクトに変換（YYYY/MM/DD形式を想定）
      const itemDateStr = String(item['日付']);
      let itemDate;
      
      try {
        // 日付フォーマットに応じて処理（YYYY/MM/DD または YYYY-MM-DD）
        if (itemDateStr.includes('/')) {
          const [year, month, day] = itemDateStr.split('/').map(Number);
          itemDate = new Date(year, month - 1, day); // JavaScriptの月は0-11
        } else if (itemDateStr.includes('-')) {
          const [year, month, day] = itemDateStr.split('-').map(Number);
          itemDate = new Date(year, month - 1, day);
        } else if (!isNaN(Number(itemDateStr))) {
          // 数値形式の場合（Excelの日付など）
          const excelEpoch = new Date(1900, 0, 1);
          const millisPerDay = 24 * 60 * 60 * 1000;
          const offsetDays = parseInt(itemDateStr) - 1; // Excelの日付は1900/1/1が1
          itemDate = new Date(excelEpoch.getTime() + offsetDays * millisPerDay);
        } else {
          itemDate = new Date(itemDateStr);
        }
        
        // 日付が無効な場合は含めない
        if (isNaN(itemDate.getTime())) {
          return false;
        }
        
        // 開始日フィルターの適用
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          // 開始日より前のアイテムは除外
          if (itemDate < startDate) {
            return false;
          }
        }
        
        // 終了日フィルターの適用
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          // 終了日の23:59:59までを含めるため、翌日の0時と比較
          const nextDay = new Date(endDate);
          nextDay.setDate(nextDay.getDate() + 1);
          
          // 終了日より後のアイテムは除外
          if (itemDate >= nextDay) {
            return false;
          }
        }
      } catch (error) {
        console.warn('日付のフィルタリングエラー:', error);
        return false;
      }
    }

    // すべてのフィルタ条件に一致するかをチェック
    return Object.entries(filters).every(([key, value]) => {
      // 特殊なフィルターキーは個別に処理済みなのでスキップ
      if (key === 'excludeTransfers' || key === 'startDate' || key === 'endDate') return true;
      
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