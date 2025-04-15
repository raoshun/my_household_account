/**
 * チャートデータ処理のためのユーティリティ関数
 */
import { aggregateByCategory, convertToChartData, aggregateMonthlyData } from './categoryAggregation';

/**
 * データを収入と支出に分割する
 * @param {Array} data - 処理対象のデータ配列
 * @param {string} amountKey - 金額が格納されているプロパティ名（デフォルト: '金額（円）'）
 * @returns {Object} - 正の金額（収入）と負の金額（支出）に分割されたデータ
 */
export const splitDataBySign = (data, amountKey = '金額（円）') => {
  // 入力チェック
  if (!data || !Array.isArray(data)) {
    return { positive: [], negative: [] };
  }
  
  // 収入と支出に分割
  return data.reduce((result, item) => {
    // 数値変換（文字列などの場合は処理）
    const amount = typeof item[amountKey] === 'number'
      ? item[amountKey]
      : parseFloat(item[amountKey]?.toString().replace(/,/g, '')) || 0;
    
    if (amount > 0) {
      result.positive.push({ ...item, [amountKey]: amount });
    } else if (amount < 0) {
      // 支出データは絶対値を使用（負の符号を削除）
      result.negative.push({ ...item, [amountKey]: Math.abs(amount) });
    }
    
    return result;
  }, { positive: [], negative: [] });
};

/**
 * カテゴリごとの集計を行い、チャート表示用のデータ形式に変換する
 * @param {Array} data - 集計対象のデータ配列
 * @param {string} categoryKey - カテゴリキー（デフォルト: '大項目'）
 * @param {string} amountKey - 金額キー（デフォルト: '金額（円）'）
 * @returns {Object} - Chart.js用のデータオブジェクト
 */
export const prepareChartData = (data, categoryKey = '大項目', amountKey = '金額（円）') => {
  // 共通集計関数を利用
  const aggregatedData = aggregateByCategory(data, {
    categoryKey,
    amountKey,
    defaultCategory: '未分類',
  });
  
  return convertToChartData(aggregatedData, {
    filterPositive: true,
    colorGenerator: generateColorPalette
  });
};

/**
 * データの合計を計算する
 * @param {Array} data - 対象のデータ配列
 * @param {string} amountKey - 金額キー（デフォルト: '金額（円）'）
 * @returns {number} - 合計金額
 */
export const calculateTotal = (data, amountKey = '金額（円）') => {
  if (!data || !Array.isArray(data)) {
    return 0;
  }
  
  return data.reduce((total, item) => {
    const amount = typeof item[amountKey] === 'number'
      ? item[amountKey]
      : parseFloat(item[amountKey]?.toString().replace(/,/g, '')) || 0;
    
    return total + amount;
  }, 0);
};

/**
 * チャート用のカラーパレットを生成する
 * @param {number} count - 必要な色の数
 * @returns {Array} - 色コードの配列
 */
export const generateColorPalette = (count) => {
  // デフォルトカラーパレット
  const defaultColors = [
    '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
    '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC',
    '#2C7BE5', '#27AE60', '#9B59B6', '#F1C40F', '#E74C3C'
  ];
  
  // 色の数が足りない場合は繰り返し使用
  if (count <= defaultColors.length) {
    return defaultColors.slice(0, count);
  }
  
  // 必要な数の色をHSL色空間で生成
  const colors = [];
  for (let i = 0; i < count; i++) {
    // 色相を均等に分布
    const hue = (i * 360 / count) % 360;
    // 彩度と明度は固定
    const saturation = 65;
    const lightness = 65;
    
    colors.push(hslToHex(hue, saturation, lightness));
  }
  
  return colors;
};

/**
 * HSL色空間の値からHEX形式の色コードに変換
 * @param {number} h - 色相 (0-360)
 * @param {number} s - 彩度 (0-100)
 * @param {number} l - 明度 (0-100)
 * @returns {string} - HEX形式の色コード
 */
export const hslToHex = (h, s, l) => {
  h /= 360;
  s /= 100;
  l /= 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // 無彩色の場合
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  // RGB値を0-255の範囲に変換し、16進数に
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * 金額のフォーマット
 * @param {number|string} amount - フォーマットする金額
 * @param {boolean} showSign - プラスマイナス記号を表示するか
 * @returns {string} - フォーマットされた金額
 */
export const formatAmount = (amount, showSign = false) => {
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  let formattedAmount = Math.abs(numAmount).toLocaleString();
  
  if (showSign) {
    formattedAmount = numAmount > 0 ? `+${formattedAmount}` : `-${formattedAmount}`;
  }
  
  return formattedAmount;
};

/**
 * 文字列や他の形式の日付を「YYYY年MM月」形式に変換する
 * @param {string|Date} dateValue - 変換する日付
 * @returns {string} - 変換された日付文字列、または'日付不明'
 */
export const normalizeYearMonth = (dateValue) => {
  try {
    // 日付がないか無効な場合
    if (!dateValue) return '日付不明';
    
    // 文字列の場合
    if (typeof dateValue === 'string') {
      // YYYY/MM/DD または YYYY-MM-DD 形式
      const standardFormat = dateValue.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
      if (standardFormat) {
        const year = parseInt(standardFormat[1], 10);
        const month = parseInt(standardFormat[2], 10);
        return `${year}年${month}月`;
      }
      
      // YYYY年MM月DD日 形式
      const jpFormat = dateValue.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
      if (jpFormat) {
        const year = parseInt(jpFormat[1], 10);
        const month = parseInt(jpFormat[2], 10);
        return `${year}年${month}月`;
      }
      
      // MM/DD/YYYY 形式 (米国式)
      const usFormat = dateValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
      if (usFormat) {
        const month = parseInt(usFormat[1], 10);
        const year = parseInt(usFormat[3], 10);
        return `${year}年${month}月`;
      }
      
      // その他はDate型に変換を試みる
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return `${date.getFullYear()}年${date.getMonth() + 1}月`;
      }
    }
    // Date型の場合
    else if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      return `${dateValue.getFullYear()}年${dateValue.getMonth() + 1}月`;
    }
    
    return '日付不明';
  } catch (error) {
    console.error('日付変換エラー:', error);
    return '日付不明';
  }
};

/**
 * 月を時系列順にソートする比較関数
 * @param {string} a - 比較する最初の月（例: '2023年1月'）
 * @param {string} b - 比較する2番目の月（例: '2023年2月'）
 * @returns {number} - ソート順（負: a < b, 0: a = b, 正: a > b）
 */
export const compareMonths = (a, b) => {
  // 「日付不明」は最後に
  if (a === '日付不明') return 1;
  if (b === '日付不明') return -1;
  
  // 年月をパース
  const yearMonthA = a.match(/(\d+)年(\d+)月/);
  const yearMonthB = b.match(/(\d+)年(\d+)月/);
  
  if (!yearMonthA || !yearMonthB) return 0;
  
  // 年で比較
  const yearA = parseInt(yearMonthA[1], 10);
  const yearB = parseInt(yearMonthB[1], 10);
  
  if (yearA !== yearB) return yearA - yearB;
  
  // 月で比較
  const monthA = parseInt(yearMonthA[2], 10);
  const monthB = parseInt(yearMonthB[2], 10);
  return monthA - monthB;
};

/**
 * 数値に変換する（文字列、通貨記号、カンマなどを処理）
 * @param {any} value - 変換する値
 * @returns {number} - 変換された数値、変換できない場合は0
 */
export const parseNumber = (value) => {
  if (value === null || value === undefined) return 0;
  
  // 既に数値の場合はそのまま返す
  if (typeof value === 'number') return value;
  
  try {
    // 文字列の場合、通貨記号やカンマを削除して変換
    if (typeof value === 'string') {
      // 通貨記号（¥, $など）とカンマを削除
      const cleanedValue = value.replace(/[^\d.-]/g, '');
      const result = parseFloat(cleanedValue);
      return isNaN(result) ? 0 : result;
    }
    
    // その他の型は0を返す
    return 0;
  } catch (error) {
    console.warn('数値変換エラー:', error);
    return 0;
  }
};

/**
 * データを月別・カテゴリ別に集計し、折れ線グラフ用のデータ形式に変換する
 * 改良版: より効率的でエラーに強い実装
 * 
 * @param {Array} data - 集計対象のデータ配列
 * @param {Object|string} options - オプション設定またはdateKey
 * @param {string} [categoryKey] - カテゴリキー（位置パラメータ方式の場合）
 * @param {string} [amountKey] - 金額キー（位置パラメータ方式の場合）
 * @param {number} [maxCategories] - 表示するカテゴリの最大数（位置パラメータ方式の場合）
 * @returns {Object} - Chart.js折れ線グラフ用のデータ形式
 */
export const prepareMonthlyTrendData = (data, options = {}, categoryKey, amountKey, maxCategories) => {
  // パラメータの形式をチェックして適切に変換
  let normalizedOptions = options;
  
  // 第2引数が文字列の場合は位置パラメータ方式と判断
  if (typeof options === 'string') {
    normalizedOptions = {
      dateKey: options, // 第2引数をdateKeyとして使用
      categoryKey: categoryKey || '大項目',
      amountKey: amountKey || '金額（円）',
      maxCategories: maxCategories || 5
    };
    
    console.log('位置パラメータ方式でprepareMonthlyTrendDataが呼び出されました');
  } else {
    // デフォルト値の設定
    normalizedOptions = {
      dateKey: options.dateKey || '日付',
      categoryKey: options.categoryKey || '大項目',
      amountKey: options.amountKey || '金額（円）',
      maxCategories: options.maxCategories || 5,
      ...options
    };
  }
  
  try {
    // データ入力チェック
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('月次推移データの生成: 有効なデータがありません');
      return { labels: [], datasets: [] };
    }
    
    // データのサンプルをログ出力（開発時のデバッグ用）
    if (normalizedOptions.debugMode) {
      console.log('月次推移データ生成: データサンプル', 
        data.slice(0, 2).map(item => ({
          [normalizedOptions.dateKey]: item[normalizedOptions.dateKey],
          [normalizedOptions.categoryKey]: item[normalizedOptions.categoryKey],
          [normalizedOptions.amountKey]: item[normalizedOptions.amountKey]
        }))
      );
    }
    
    // 共通の集計関数を利用
    return aggregateMonthlyData(data, {
      dateKey: normalizedOptions.dateKey,
      categoryKey: normalizedOptions.categoryKey,
      amountKey: normalizedOptions.amountKey,
      maxCategories: normalizedOptions.maxCategories,
      normalizeDate: normalizeYearMonth,
      colorGenerator: generateColorPalette,
      compareMonths: compareMonths
    });
  } catch (error) {
    console.error('月次推移データの生成中にエラーが発生しました:', error);
    return { labels: [], datasets: [] };
  }
};

// 後方互換性のためのラッパー関数
export const legacyPrepareMonthlyTrendData = (
  data, 
  dateKey = '日付', 
  categoryKey = '大項目', 
  amountKey = '金額（円）',
  maxCategories = 5
) => {
  return prepareMonthlyTrendData(data, {
    dateKey,
    categoryKey,
    amountKey,
    maxCategories
  });
};

// デフォルトエクスポート
export default {
  splitDataBySign,
  prepareChartData,
  calculateTotal,
  generateColorPalette,
  hslToHex,
  formatAmount,
  prepareMonthlyTrendData,
  normalizeYearMonth,
  parseNumber,
  compareMonths
};
