// src/App.js
import React, { useState, useEffect } from 'react';
import DataTable from './components/DataTable';
import Papa from 'papaparse';

const App = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const csvFilePath = '/home/shun-h/my_household_account_book/my-table-app/input.csv';
  
    Papa.parse(csvFilePath, {
      download: true,
      header: true,
      delimiter: ',', // 必要に応じてデリミタを指定
      complete: (result) => {
        if (result.errors.length > 0) {
          console.error('Errors:', result.errors);
        }
        const formattedData = result.data.map(item => ({
          ...item,
          '金額（円）': parseFloat(item['金額（円）']),
          '日付': new Date(item['日付']),
        }));
        console.log(formattedData); // 整形後のデータをコンソールに出力
        setData(formattedData);
      },
    });
  }, []);
  

  return (
    <div className="App">
      <h1>家計簿管理アプリ</h1>
      <DataTable data={data} />
    </div>
  );
};

export default App;
