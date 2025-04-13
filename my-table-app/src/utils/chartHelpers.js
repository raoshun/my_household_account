/**
 * チャートのセグメントをハイライトする関数
 * @param {Object} chart - Chart.jsのインスタンス
 * @param {number} index - ハイライトするセグメントのインデックス
 */
export const highlightSegment = (chart, index) => {
  if (!chart || !chart.data || !chart.data.datasets || chart.data.datasets.length === 0) return;
  
  // 元の色を保存（まだ保存されていなければ）
  if (!chart._originalColors) {
    chart._originalColors = [...chart.data.datasets[0].backgroundColor];
  }
  
  // 既に同じインデックスがハイライトされている場合は更新しない
  if (chart._highlightedIndex === index) return;
  
  // コピーを作成して更新
  const newBackgroundColors = [...chart._originalColors];
  
  // ハイライトしたい要素の色を明るくする
  if (index >= 0 && index < newBackgroundColors.length) {
    const originalColor = chart._originalColors[index];
    const highlightColor = lightenColor(originalColor, 30); // 30%明るくする
    newBackgroundColors[index] = highlightColor;
  }
  
  // 新しい色の配列を一度に設定
  chart.data.datasets[0].backgroundColor = newBackgroundColors;
  
  // ハイライト状態を記録
  chart._highlightedIndex = index;
  
  // セグメント数が変わっていないことを確認
  if (chart.data.labels.length === chart.data.datasets[0].backgroundColor.length) {
    // アニメーションなしで部分更新（データ構造は変えない）
    if (typeof chart.update === 'function') {
      chart.update('none');
    }
  }
};

/**
 * ハイライトを解除する関数
 * @param {Object} chart - Chart.jsのインスタンス
 */
export const resetHighlight = (chart) => {
  if (!chart || !chart._originalColors) return;
  
  // ハイライトされていない場合は何もしない
  if (chart._highlightedIndex === undefined) return;
  
  // 元の色に戻す
  if (chart.data && chart.data.datasets && chart.data.datasets.length > 0) {
    // 元の色のコピーを設定
    chart.data.datasets[0].backgroundColor = [...chart._originalColors];
  }
  
  // ハイライト状態をリセット
  chart._highlightedIndex = undefined;
  
  // セグメント数が変わっていないことを確認
  if (chart.data && chart.data.labels && 
      chart.data.labels.length === chart.data.datasets[0].backgroundColor.length) {
    // アニメーションなしで更新（高速かつちらつき防止）
    if (typeof chart.update === 'function') {
      chart.update('none');
    }
  }
};

/**
 * 色を明るくする関数
 * @param {string} color - HEX形式の色コード (#RRGGBB)
 * @param {number} percent - 明るくする割合(%)
 * @returns {string} 明るくした色のHEX形式
 */
export const lightenColor = (color, percent) => {
  // HEXからRGBに変換
  const hex = color.replace('#', '');
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // 明るさを調整
  r = Math.min(255, Math.round(r + (255 - r) * (percent / 100)));
  g = Math.min(255, Math.round(g + (255 - g) * (percent / 100)));
  b = Math.min(255, Math.round(b + (255 - b) * (percent / 100)));
  
  // RGBからHEXに戻す
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};
