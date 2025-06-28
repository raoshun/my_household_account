import React from 'react';
import './AggregatedTable.css';

// 型定義
interface AggregatedTableProps {
  aggregatedData: any;
}

const AggregatedTable: React.FC<AggregatedTableProps> = ({ aggregatedData = [] }) => {
  // 集計データが空の場合の処理
  if (!aggregatedData || Object.keys(aggregatedData).length === 0) {
    return (
      <div className="aggregated-table-container empty-state">
        <p>集計データがありません</p>
      </div>
    );
  }

  return (
    <div className="aggregated-table-container">
      <table className="modern-table">
        <thead>
          <tr>
            <th>カテゴリ</th>
            <th>項目</th>
            <th>合計金額（円）</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(aggregatedData).map((key) => {
            const categoryData = aggregatedData[key];
            const total = categoryData.total || 0;
            const itemsCount = categoryData.items && Array.isArray(categoryData.items) 
              ? categoryData.items.length 
              : 0;
            return (
              <tr key={key} className={key === '未分類' ? 'uncategorized-row' : ''}>
                <td>{key}</td>
                <td>{itemsCount}件</td>
                <td className={total >= 0 ? 'positive-amount' : 'negative-amount'}>
                  ¥{total.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AggregatedTable;