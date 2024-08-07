// src/components/DataTable.js
import React from 'react';
import { useTable } from 'react-table';

const DataTable = ({ data }) => {
  const columns = React.useMemo(
    () => [
      { Header: '計算対象', accessor: '計算対象' },
      { Header: '日付', accessor: '日付', Cell: ({ value }) => new Date(value).toLocaleDateString() },
      { Header: '内容', accessor: '内容' },
      { Header: '金額（円）', accessor: '金額（円）' },
      { Header: '保有金融機関', accessor: '保有金融機関' },
      { Header: '大項目', accessor: '大項目' },
      { Header: '中項目', accessor: '中項目' },
      { Header: 'メモ', accessor: 'メモ' },
      { Header: '振替', accessor: '振替' },
      { Header: 'ID', accessor: 'ID' },
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
        {headerGroups.map((headerGroup, index) => {
          const headerGroupProps = headerGroup.getHeaderGroupProps();
          return (
            <tr key={index} {...headerGroupProps}>
              {headerGroup.headers.map((column, colIndex) => {
                const columnProps = column.getHeaderProps();
                return <th key={colIndex} {...columnProps}>{column.render('Header')}</th>;
              })}
            </tr>
          );
        })}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map(row => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => (
                <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default DataTable;
