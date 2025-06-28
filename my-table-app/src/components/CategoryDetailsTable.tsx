import React from 'react';
import './CategoryDetailsTable.css';

// 型定義
interface CategoryDetailsTableProps {
  category: string;
  data: any[];
  onBack?: () => void;
  title?: string;
}

const CategoryDetailsTable: React.FC<CategoryDetailsTableProps> = ({ category, data, onBack, title }) => {
  // データがない場合
  if (!data || data.length === 0) {
    return (
      <div className="category-details empty-state">
        <p>選択したカテゴリに対応するデータがありません</p>
      </div>
    );
  }

  // 日付をフォーマットする関数
  const formatDate = (dateStr) => {
    try {
      if (!dateStr) return '';
      // 様々な日付形式に対応
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; // 無効な日付はそのまま返す
      return date.toLocaleDateString('ja-JP');
    } catch (e) {
      return dateStr;
    }
  };

  // 金額をフォーマットする関数
  const formatAmount = (amount) => {
    try {
      const num = Number(amount);
      return isNaN(num) ? amount : `¥${num.toLocaleString()}`;
    } catch (e) {
      return amount;
    }
  };

  return (
    <div className="category-details-container">
      <div className="category-header">
        <h3 className="category-details-title">
          {title || `「${category}」の明細`}
        </h3>
        
        <div className="data-summary-badge">
          <span>該当データ: {data.length}件</span>
        </div>
      </div>
      
      <div className="data-table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>日付</th>
              <th>内容</th>
              <th>中項目</th>
              <th>金額（円）</th>
              <th>メモ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr 
                key={`detail-row-${index}`}
                className={index % 2 === 0 ? 'even-row' : 'odd-row'}
              >
                <td>{formatDate(item['日付'])}</td>
                <td>{item['内容'] || '-'}</td>
                <td>{item['中項目'] || '-'}</td>
                <td className={Number(item['金額（円）']) >= 0 ? 'positive-amount' : 'negative-amount'}>
                  {formatAmount(item['金額（円）'])}
                </td>
                <td>{item['メモ'] || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryDetailsTable;
