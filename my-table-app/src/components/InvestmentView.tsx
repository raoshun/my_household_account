import React, { useState, useMemo } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import './InvestmentView.css';
import type { InvestmentViewProps, InvestmentRecord } from '../types';

// 投資データをフィルタリングする
const InvestmentView: React.FC<InvestmentViewProps> = ({ data = [] }) => {
  // アクティブなタブを管理する状態
  const [activeTab, setActiveTab] = useState('overview');
  
  // 投資データをフィルタリングする
  const filteredData = useMemo(() => {
    return (data as InvestmentRecord[]).filter(item => 
      (item['大項目'] === '株式' || item['大項目'] === '投資信託' || item['大項目'] === '不動産') &&
      Number(item['金額（円）']) > 0
    );
  }, [data]);
  
  // 投資データを種類別に分類する
  const { 
    stocks, 
    reits, 
    totalStocks, 
    totalReits, 
    totalInvestment, 
    monthlyData 
  } = useMemo(() => {
    // 株式と投資信託のデータ
    const stocks = filteredData.filter(item => 
      item['大項目'] === '株式' || item['大項目'] === '投資信託'
    );
    
    // 不動産投資のデータ
    const reits = filteredData.filter(item => 
      item['大項目'] === '不動産'
    );
    
    // 株式と投資信託の合計金額
    const totalStocks = stocks.reduce((sum, item) => sum + Number(item['金額（円）']), 0);
    
    // 不動産投資の合計金額
    const totalReits = reits.reduce((sum, item) => sum + Number(item['金額（円）']), 0);
    
    // 投資の総合計
    const totalInvestment = totalStocks + totalReits;
    
    // 月別データの集計
    const monthsMap = new Map();
    
    // データを日付でソート
    const sortedData = [...filteredData].sort((a, b) =>
      new Date(String(a['日付'])).getTime() - new Date(String(b['日付'])).getTime()
    );
    
    // 月別・カテゴリ別に集計
    sortedData.forEach(item => {
      const date = String(item['日付']);
      if (!date) return;
      
      // YYYY/MM形式に変換
      const monthKey = date.substring(0, 7);
      
      if (!monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, {
          '株式': 0,
          '投資信託': 0,
          '不動産': 0,
          '合計': 0
        });
      }
      
      const monthData = monthsMap.get(monthKey);
      const category = String(item['大項目']);
      const amount = Number(item['金額（円）']);
      if (!monthData[category]) monthData[category] = 0;
      monthData[category] += amount;
      monthData['合計'] += amount;
    });
    
    // 月別データをChart.js形式に変換
    const months = Array.from(monthsMap.keys()).sort();
    const monthlyData = {
      labels: months,
      datasets: [
        {
          label: '株式',
          data: months.map(month => monthsMap.get(month)['株式']),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderWidth: 2,
          tension: 0.3
        },
        {
          label: '投資信託',
          data: months.map(month => monthsMap.get(month)['投資信託']),
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.5)',
          borderWidth: 2,
          tension: 0.3
        },
        {
          label: '不動産',
          data: months.map(month => monthsMap.get(month)['不動産']),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderWidth: 2,
          tension: 0.3
        },
        {
          label: '合計',
          data: months.map(month => monthsMap.get(month)['合計']),
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderWidth: 3,
          borderDash: [5, 5],
          tension: 0.3
        }
      ]
    };
    
    return {
      stocks,
      reits,
      totalStocks,
      totalReits,
      totalInvestment,
      monthlyData
    };
  }, [filteredData]);
  
  // 円グラフのデータ
  const pieChartData = useMemo(() => {
    // 株式と投資信託を分けて計算
    const stocksOnly = filteredData.filter(item => item['大項目'] === '株式')
      .reduce((sum, item) => sum + item['金額（円）'], 0);
    
    const investmentTrust = filteredData.filter(item => item['大項目'] === '投資信託')
      .reduce((sum, item) => sum + item['金額（円）'], 0);
    
    return {
      labels: ['株式', '投資信託', '不動産'],
      datasets: [
        {
          data: [stocksOnly, investmentTrust, totalReits],
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(75, 192, 192, 0.7)'
          ],
          borderColor: [
            'rgb(54, 162, 235)',
            'rgb(255, 159, 64)',
            'rgb(75, 192, 192)'
          ],
          borderWidth: 1,
          hoverOffset: 15
        }
      ]
    };
  }, [filteredData, totalReits]);
  
  // 折れ線グラフのオプション
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const, // eslint-disable-line no-undef
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('ja-JP', { 
                style: 'currency', 
                currency: 'JPY' 
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('ja-JP', { 
              style: 'currency', 
              currency: 'JPY',
              maximumSignificantDigits: 3
            }).format(value);
          }
        }
      }
    }
  };
  
  // 円グラフのオプション
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const, // eslint-disable-line no-undef
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = Math.round(value / (totalInvestment || 1) * 100);
            return `${label}: ${new Intl.NumberFormat('ja-JP', { 
              style: 'currency', 
              currency: 'JPY' 
            }).format(value)} (${percentage}%)`;
          }
        }
      }
    }
  };

  // 金額を日本円形式でフォーマット
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', { 
      style: 'currency', 
      currency: 'JPY' 
    }).format(amount);
  };
  
  // 日付をYYYY/MM/DD形式でフォーマット
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // 無効な日付の場合はそのまま返す
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}/${month}/${day}`;
  };

  return (
    <div className="investment-view">
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          概要
        </button>
        <button 
          className={`tab-button ${activeTab === 'stocks' ? 'active' : ''}`}
          onClick={() => setActiveTab('stocks')}
        >
          株式・投資信託
        </button>
        <button 
          className={`tab-button ${activeTab === 'reits' ? 'active' : ''}`}
          onClick={() => setActiveTab('reits')}
        >
          不動産
        </button>
        <button 
          className={`tab-button ${activeTab === 'trend' ? 'active' : ''}`}
          onClick={() => setActiveTab('trend')}
        >
          推移
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <h2>投資ポートフォリオ概要</h2>
            
            <div className="investment-summary">
              <div className="summary-card total">
                <h3>総投資額</h3>
                <p className="amount">{formatCurrency(totalInvestment)}</p>
              </div>
              
              <div className="summary-card">
                <h3>株式</h3>
                <p className="amount">{formatCurrency(
                  filteredData.filter(item => item['大項目'] === '株式')
                    .reduce((sum, item) => sum + item['金額（円）'], 0)
                )}</p>
              </div>
              
              <div className="summary-card">
                <h3>投資信託</h3>
                <p className="amount">{formatCurrency(
                  filteredData.filter(item => item['大項目'] === '投資信託')
                    .reduce((sum, item) => sum + item['金額（円）'], 0)
                )}</p>
              </div>
              
              <div className="summary-card">
                <h3>不動産</h3>
                <p className="amount">{formatCurrency(totalReits)}</p>
              </div>
            </div>
            
            <div className="portfolio-distribution">
              <h3>ポートフォリオ分布</h3>
              <div className="chart-container">
                <Pie data={pieChartData} options={pieOptions} />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'stocks' && (
          <div className="stocks-tab">
            <h2>株式・投資信託詳細</h2>
            
            {stocks.length === 0 ? (
              <p className="no-data">株式・投資信託のデータがありません。</p>
            ) : (
              <table className="investment-table">
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>種類</th>
                    <th>詳細</th>
                    <th>金額</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((item, index) => (
                    <tr key={index}>
                      <td>{formatDate(item['日付'])}</td>
                      <td>{item['大項目']}</td>
                      <td>{item['中項目']}</td>
                      <td className="amount">{formatCurrency(item['金額（円）'])}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3">合計</td>
                    <td className="amount">{formatCurrency(totalStocks)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}
        
        {activeTab === 'reits' && (
          <div className="reits-tab">
            <h2>不動産投資詳細</h2>
            
            {reits.length === 0 ? (
              <p className="no-data">不動産投資のデータがありません。</p>
            ) : (
              <table className="investment-table">
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>種類</th>
                    <th>詳細</th>
                    <th>金額</th>
                  </tr>
                </thead>
                <tbody>
                  {reits.map((item, index) => (
                    <tr key={index}>
                      <td>{formatDate(item['日付'])}</td>
                      <td>{item['大項目']}</td>
                      <td>{item['中項目']}</td>
                      <td className="amount">{formatCurrency(item['金額（円）'])}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3">合計</td>
                    <td className="amount">{formatCurrency(totalReits)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}
        
        {activeTab === 'trend' && (
          <div className="trend-tab">
            <h2>投資額の月次推移</h2>
            
            {monthlyData.labels.length === 0 ? (
              <p className="no-data">推移データがありません。</p>
            ) : (
              <div className="chart-container line-chart">
                <Line data={monthlyData} options={lineOptions} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentView;
