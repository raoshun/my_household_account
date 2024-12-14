import React, { useState } from 'react';
import { sortAndAggregateData } from './utils/sortData';
import AggregatedTable from './components/AggregatedTable';
import Sidebar from './components/Sidebar';
import calculateCategoryTotals from './utils/calculateCategoryTotals';
import CategoryPieChart from './components/CategoryPieChart';
import Charts from './components/Charts';
import DataTable from './components/DataTable';
import { handleFiles as importHandleFiles } from './components/fileHandlers';
import { chartOptions } from './config/chartOptions';

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
  const [filteredData, setFilteredData] = useState([]);
  const [hoverInfo, setHoverInfo] = useState(null); // ホバー情報を保持する状態
  const [aggregatedData, setAggregatedData] = useState({});
  const [categoryTotals, setCategoryTotals] = useState({});

  const handleHover = (info) => {
    setHoverInfo(info);
  };

  const handleClick = (category) => {
    if (category) {
      const filtered = data.filter(item => item['大項目'] === category);
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
      setView('chart');
    }
  };

  const handleFiles = (files) => {
    importHandleFiles(files, setData, setPositiveChartData, setNegativeChartData, setPositiveTotal, setNegativeTotal);
    // CSVファイルを読み込んでデータをセットする処理
    // ここでは仮のデータを使用
    const parsedData = [
      { '大項目': '食費', '金額（円）': 1000 },
      { '大項目': '外食', '金額（円）': 2000 },
      // 他のデータ
    ];
    setData(parsedData);
  
    const aggregated = sortAndAggregateData(parsedData);
    setAggregatedData(aggregated);
  
    const totals = calculateCategoryTotals(parsedData);
    setCategoryTotals(totals);
  };

  return (
    <div className="App" style={{ display: 'flex' }}>
      <Sidebar setView={setView} handleFiles={handleFiles} />
      <div className="content" style={{ flex: 1, padding: '10px' }}>
        {view === 'chart' && (
          <>
            <Charts positiveChartData={positiveChartData} negativeChartData={negativeChartData} positiveTotal={positiveTotal} negativeTotal={negativeTotal} options={chartOptions} onHover={handleHover} onClick={handleClick} />
            {hoverInfo && hoverInfo.subtotal !== undefined && (
              <div>
                <p>項目名: {hoverInfo.label}</p>
                <p>小計: ¥{hoverInfo.subtotal.toLocaleString()}</p>
              </div>
            )}
          </>
        )}
        {/* {view === 'table' && <DataTable data={filteredData.length > 0 ? filteredData : data} />} */}
        {view === 'table' && <AggregatedTable aggregatedData={aggregatedData} />}  
      </div>
    </div>
  );
};

export default App;