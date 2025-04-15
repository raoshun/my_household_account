import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './MonthlyTrendTable.css';

/**
 * 月次推移テーブルコンポーネント
 * 
 * @param {Object} props - コンポーネントのプロパティ
 * @param {Object} props.trendData - 表示するデータ
 * @param {Array} props.trendData.labels - 月のラベル配列
 * @param {Array} props.trendData.datasets - カテゴリごとのデータセット配列
 * @returns {JSX.Element} - 月次推移テーブル
 */
const MonthlyTrendTable = ({ trendData = { labels: [], datasets: [] } }) => {
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [selectedRow, setSelectedRow] = useState(null);
  const [tableData, setTableData] = useState([]);

  // trendDataからテーブルデータを生成
  useEffect(() => {
    if (!trendData || !trendData.labels || !trendData.datasets || 
        trendData.labels.length === 0 || trendData.datasets.length === 0) {
      setTableData([]);
      return;
    }

    try {
      // カテゴリごとに行データを作成
      const rows = trendData.datasets.map(dataset => {
        const row = {
          category: dataset.label, // カテゴリ名
          total: dataset.data.reduce((sum, val) => sum + val, 0), // カテゴリの合計金額
        };

        // 各月のデータを追加
        trendData.labels.forEach((month, index) => {
          row[month] = dataset.data[index];
        });

        return row;
      });

      // 合計行を追加
      if (rows.length > 0) {
        const totalRow = {
          category: '合計',
          total: 0,
        };

        // 各カテゴリと月の合計を計算
        trendData.labels.forEach(month => {
          totalRow[month] = 0;
        });

        rows.forEach(row => {
          totalRow.total += row.total;
          trendData.labels.forEach(month => {
            totalRow[month] += row[month] || 0;
          });
        });

        rows.push(totalRow);
      }

      setTableData(rows);
    } catch (error) {
      console.error('MonthlyTrendTable: データ変換エラー', error);
      setTableData([]);
    }
  }, [trendData]);

  // テーブルのソート処理
  const sortBy = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // ソートされたテーブルデータを取得
  const getSortedData = () => {
    if (!sortConfig.key || tableData.length === 0) return tableData;
    
    return [...tableData].sort((a, b) => {
      // 合計行は常に最下部に表示
      if (a.category === '合計') return 1;
      if (b.category === '合計') return -1;

      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // 金額のフォーマット
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '-';
    return `¥${amount.toLocaleString()}`;
  };

  // 行のクリックハンドラ
  const handleRowClick = (index) => {
    if (index === tableData.length - 1) return; // 合計行は選択しない
    setSelectedRow(selectedRow === index ? null : index);
  };

  // 合計行かどうかを判定
  const isTotalRow = (index) => {
    return index === tableData.length - 1;
  };

  // データが無い場合の表示
  if (tableData.length === 0) {
    return (
      <div className="monthly-trend-table-no-data">
        <p>表示できるデータがありません。</p>
        <p className="hint">データを読み込むか、フィルタ条件を変更してください。</p>
      </div>
    );
  }

  // ソート方向に応じたアイコンを表示する関数
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <span className="sort-icon">⇅</span>;
    }
    return sortConfig.direction === 'asc' 
      ? <span className="sort-icon asc">↑</span> 
      : <span className="sort-icon desc">↓</span>;
  };

  return (
    <div className="monthly-trend-table-container">
      <table className="monthly-trend-table">
        <thead>
          <tr>
            <th onClick={() => sortBy('category')}>
              カテゴリ {getSortIcon('category')}
            </th>
            {trendData.labels.map((month) => (
              <th key={month} onClick={() => sortBy(month)}>
                {month} {getSortIcon(month)}
              </th>
            ))}
            <th onClick={() => sortBy('total')}>
              合計 {getSortIcon('total')}
            </th>
          </tr>
        </thead>
        <tbody>
          {getSortedData().map((row, index) => (
            <tr 
              key={row.category} 
              className={`
                ${selectedRow === index ? 'selected' : ''}
                ${isTotalRow(index) ? 'total-row' : ''}
              `}
              onClick={() => handleRowClick(index)}
            >
              <td className="category-cell">{row.category}</td>
              {trendData.labels.map((month) => (
                <td key={month} className="amount-cell">
                  {formatAmount(row[month])}
                </td>
              ))}
              <td className="total-cell">{formatAmount(row.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

MonthlyTrendTable.propTypes = {
  trendData: PropTypes.shape({
    labels: PropTypes.array,
    datasets: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      data: PropTypes.array,
      borderColor: PropTypes.string,
      backgroundColor: PropTypes.string
    }))
  })
};

export default MonthlyTrendTable;