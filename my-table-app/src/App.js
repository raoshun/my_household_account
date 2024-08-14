import React, { useState } from 'react';
import Charts from './components/Charts';
import DataTable from './components/DataTable';
import Sidebar from './components/Sidebar'; // Sidebarコンポーネントをインポート
import Papa from 'papaparse';
import iconv from 'iconv-lite';
import { Buffer } from 'buffer';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { splitDataBySign } from './utils'; // 関数をインポート

Chart.register(ArcElement, Tooltip, Legend);

const App = () => {
  const [data, setData] = useState([]);
  const [positiveChartData, setPositiveChartData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverBackgroundColor: []
    }]
  });
  const [negativeChartData, setNegativeChartData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverBackgroundColor: []
    }]
  });
  const [positiveTotal, setPositiveTotal] = useState(0);
  const [negativeTotal, setNegativeTotal] = useState(0);
  const [view, setView] = useState('chart'); // 表示を切り替えるための状態

  const handleFiles = files => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const csvBuffer = e.target.result;
      const csvText = iconv.decode(Buffer.from(csvBuffer), 'Shift_JIS');
      console.log(csvText);
      Papa.parse(csvText, {
        header: true,
        delimiter: ',', // 必要に応じてデリミタを指定
        skipEmptyLines: true, // 空行をスキップ
        dynamicTyping: true, // 自動的に型を推測
        complete: (result) => {
          if (result.errors.length > 0) {
            console.error('Errors:', result.errors);
            console.log('Data:', result.data);
          }
          const formattedData = result.data.map(item => ({
            '計算対象': item['計算対象'],
            '日付': item['日付'] ? new Date(item['日付'].replace(/-/g, '/')) : null, // 日付をDateオブジェクトに変換
            '内容': item['内容'],
            '金額（円）': parseInt(item['金額（円）'], 10), // 基数を指定
            '保有金融機関': item['保有金融機関'],
            '大項目': item['大項目'],
            '中項目': item['中項目'],
            'メモ': item['メモ'],
            '振替': item['振替'],
            'ID': item['ID'],
          }));
          console.log(formattedData); // 整形後のデータをコンソールに出力
          setData(formattedData);

          // データをプラスとマイナスに分割
          const { positiveData, negativeData, positiveTotal, negativeTotal } = splitDataBySign(formattedData);
          setPositiveChartData(positiveData);
          setNegativeChartData(negativeData);
          setPositiveTotal(positiveTotal);
          setNegativeTotal(negativeTotal);
        },
      });
    };
    reader.readAsArrayBuffer(files[0]);
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ¥${value.toLocaleString()}`;
          }
        }
      }
    }
  };

  return (
    <div className="App" style={{ display: 'flex' }}>
      <Sidebar setView={setView} handleFiles={handleFiles} /> {/* Sidebarコンポーネントをレンダリング */}
      <div className="content" style={{ flex: 1, padding: '10px' }}>
        {view === 'chart' && (
          <Charts
            positiveChartData={positiveChartData}
            negativeChartData={negativeChartData}
            options={options}
          />
        )}
        {view === 'table' && <DataTable data={data} />}
      </div>
    </div>
  );
};

export default App;
