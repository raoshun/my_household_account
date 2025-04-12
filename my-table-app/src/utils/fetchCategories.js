/**
 * カテゴリデータを取得する関数
 * @returns {Promise<Array>} カテゴリデータの配列
 */
async function fetchCategories() {
  // モックデータを返す
  return [
    { '大項目': '食費', 'type': '必需品', 'frequency': '定期' },
    { '大項目': '交通費', 'type': '必需品', 'frequency': '定期' },
    { '大項目': '娯楽', 'type': '娯楽', 'frequency': '臨時' },
  ];
}

export default fetchCategories;
