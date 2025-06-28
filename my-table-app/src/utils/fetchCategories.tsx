/**
 * カテゴリ情報を取得する関数
 * @returns {Promise<Array>} カテゴリ情報の配列
 */
export const fetchCategories = async () => {
  try {
    // ここでは単純化のため、固定のカテゴリリストを返す
    // 実際の実装ではAPIやファイルからデータを取得する可能性がある
    return [
      { '大項目': '食費', 'type': '必需品', 'frequency': '定期' },
      { '大項目': '交通費', 'type': '必需品', 'frequency': '定期' },
      { '大項目': '娯楽', 'type': '娯楽', 'frequency': '臨時' },
      { '大項目': '外食', 'type': '娯楽', 'frequency': '臨時' },
      { '大項目': '日用品', 'type': '必需品', 'frequency': '定期' }
    ];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

/**
 * カテゴリ情報を他の形式で取得する関数
 * テストで使用するために別名で実装
 */
export const loadCategories = async () => {
  const categories = await fetchCategories();
  // 形式を変換
  return categories.map(cat => ({
    name: cat['大項目'],
    type: cat.type,
    frequency: cat.frequency
  }));
};

export default { fetchCategories, loadCategories };
