import React from 'react';
import PropTypes from 'prop-types';
import { useTable } from 'react-table';

const DataTable = ({ data }) => {
  const columns = React.useMemo(
    () => [
      { Header: '計算対象', accessor: '計算対象' },
      { Header: '日付', accessor: '日付', Cell: ({ value }) => new Date(value).toLocaleDateString('ja-JP') },
      { Header: '内容', accessor: '内容' },
      { Header: '金額（円）', accessor: '金額（円）' },
      { Header: '保有金融機関', accessor: '保有金融機関' },
      { Header: '大項目', accessor: '大項目' },
      { Header: '中項目', accessor: '中項目' },
      { Header: 'メモ', accessor: 'メモ' },
      { Header: '振替', accessor: '振替' },
      // { Header: 'ID', accessor: 'ID' },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup, index) => (
          <tr key={index} {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column, colIndex) => (
              <th key={colIndex} {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, rowIndex) => {
          prepareRow(row);
          return (
            <tr key={rowIndex} {...row.getRowProps()}>
              {row.cells.map((cell, cellIndex) => (
                <td key={cellIndex} {...cell.getCellProps()}>{cell.render('Cell')}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

DataTable.propTypes = {
  data: PropTypes.array.isRequired,
};

export default DataTable;
