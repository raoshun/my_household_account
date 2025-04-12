import React from 'react';
import PropTypes from 'prop-types';
import { useTable, useSortBy, usePagination } from 'react-table';
import './DataTable.css';

// セル用PropTypes
const CellPropType = {
  value: PropTypes.any
};

// 日付セル
function DateCell({ value }) { 
  return value ? new Date(value).toLocaleDateString('ja-JP') : '';
}

DateCell.propTypes = CellPropType;

// 金額セル
function AmountCell({ value }) {
  const isNegative = Number(value) < 0;
  return (
    <span className={isNegative ? 'negative-amount' : 'positive-amount'}>
      ¥{Number(value).toLocaleString()}
    </span>
  );
}

AmountCell.propTypes = CellPropType;

const DataTable = ({ data }) => {
  const columns = React.useMemo(
    () => [
      { Header: '計算対象', accessor: '計算対象' },
      { 
        Header: '日付', 
        accessor: '日付', 
        Cell: DateCell
      },
      { Header: '内容', accessor: '内容' },
      { 
        Header: '金額（円）', 
        accessor: '金額（円）',
        Cell: AmountCell
      },
      { Header: '保有金融機関', accessor: '保有金融機関' },
      { Header: '大項目', accessor: '大項目' },
      { Header: '中項目', accessor: '中項目' },
      { Header: 'メモ', accessor: 'メモ' },
      { Header: '振替', accessor: '振替' },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page, // ページネーションを使うため、rowsではなくpageを使用
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    { 
      columns, 
      data,
      initialState: { pageIndex: 0, pageSize: 10 } // デフォルトページサイズを設定
    }, 
    useSortBy,
    usePagination
  );

  return (
    <div className="data-table-container">
      <table {...getTableProps()} className="modern-table">
        <thead>
          {headerGroups.map((headerGroup, i) => {
            const { key: headerGroupKey, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
            return (
              <tr key={headerGroupKey || `header-group-${i}`} {...restHeaderGroupProps}>
                {headerGroup.headers.map((column, j) => {
                  const { key: headerKey, ...restColumnProps } = column.getHeaderProps(column.getSortByToggleProps());
                  return (
                    <th key={headerKey || `header-${i}-${j}`} {...restColumnProps}>
                      {column.render('Header')}
                      <span className="sort-indicator">
                        {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                      </span>
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            const { key: rowKey, ...restRowProps } = row.getRowProps();
            return (
              <tr 
                key={rowKey || `row-${i}`} 
                {...restRowProps}
                className={i % 2 === 0 ? 'even-row' : 'odd-row'}
              >
                {row.cells.map((cell, j) => {
                  const { key: cellKey, ...restCellProps } = cell.getCellProps();
                  return (
                    <td key={cellKey || `cell-${i}-${j}`} {...restCellProps}>
                      {cell.render('Cell')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ページネーション UI */}
      <div className="pagination">
        <div className="pagination-controls">
          <button 
            onClick={() => gotoPage(0)} 
            disabled={!canPreviousPage}
            className="pagination-button"
          >
            {'<<'}
          </button>
          <button 
            onClick={() => previousPage()} 
            disabled={!canPreviousPage}
            className="pagination-button"
          >
            {'<'}
          </button>
          <span className="pagination-info">
            ページ{' '}
            <strong>
              {pageIndex + 1} / {pageOptions.length}
            </strong>
          </span>
          <button 
            onClick={() => nextPage()} 
            disabled={!canNextPage}
            className="pagination-button"
          >
            {'>'}
          </button>
          <button 
            onClick={() => gotoPage(pageCount - 1)} 
            disabled={!canNextPage}
            className="pagination-button"
          >
            {'>>'}
          </button>
        </div>
        <div className="pagination-size">
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value))
            }}
            className="pagination-select"
          >
            {[10, 20, 30, 40, 50].map(size => (
              <option key={size} value={size}>
                {size}件表示
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

DataTable.propTypes = {
  data: PropTypes.array.isRequired,
};

export default DataTable;
