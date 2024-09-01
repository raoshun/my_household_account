import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
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

  const handleHover = (info) => {
    setHoverInfo(info);
  };

  const handleClick = (category) => {
    if (category) {
      const filtered = data.filter(item => item['大項目'] === category);
      setFilteredData(filtered);
      setView('table');
    } else {
      setFilteredData([]);
      setView('chart');
    }
  };

  const handleFiles = (files) => {
    importHandleFiles(files, setData, setPositiveChartData, setNegativeChartData, setPositiveTotal, setNegativeTotal);
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
        {view === 'table' && <DataTable data={filteredData.length > 0 ? filteredData : data} />}
      </div>
    </div>
  );
};

export default App;