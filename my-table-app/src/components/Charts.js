import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Chart, ArcElement, PieController, Tooltip, Legend } from 'chart.js';

// ブラウザ環境かどうかの判定
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// テスト環境でなければChart.jsのコントローラを登録
if (isBrowser) {
  // ブラウザ環境でのみ実行
  try {
    Chart.register(ArcElement, PieController, Tooltip, Legend);
  } catch (e) {
    console.error('Failed to register Chart.js components:', e);
  }
}

const Charts = ({ positiveChartData, negativeChartData, positiveTotal, negativeTotal, options, onHover, onClick }) => {
  const positiveChartRef = useRef(null);
  const negativeChartRef = useRef(null);
  const positiveChartInstance = useRef(null);
  const negativeChartInstance = useRef(null);

  useEffect(() => {
    // テスト環境ではスキップ
    if (!isBrowser) return;

    const positiveCtx = positiveChartRef.current?.getContext('2d');
    const negativeCtx = negativeChartRef.current?.getContext('2d');

    try {
      if (positiveCtx) {
        positiveChartInstance.current = new Chart(positiveCtx, {
          type: 'pie',
          data: positiveChartData,
          options: { 
            ...options, 
            onClick: (event, elements) => handleClick(event, elements, positiveChartData), 
            onHover: (event, elements) => handleHover(event, elements, positiveChartData) 
          },
        });
      }

      if (negativeCtx) {
        negativeChartInstance.current = new Chart(negativeCtx, {
          type: 'pie',
          data: negativeChartData,
          options: { 
            ...options, 
            onClick: (event, elements) => handleClick(event, elements, negativeChartData), 
            onHover: (event, elements) => handleHover(event, elements, negativeChartData) 
          },
        });
      }
    } catch (error) {
      console.error('Error creating charts:', error);
    }

    return () => {
      // クリーンアップ時にチャートを安全に破棄
      try {
        if (positiveChartInstance.current && typeof positiveChartInstance.current.destroy === 'function') {
          positiveChartInstance.current.destroy();
        }
        if (negativeChartInstance.current && typeof negativeChartInstance.current.destroy === 'function') {
          negativeChartInstance.current.destroy();
        }
      } catch (error) {
        console.error('Error destroying charts:', error);
      }
    };
  }, [positiveChartData, negativeChartData, options]);

  const handleHover = (event, elements, chartData) => {
    if (elements && elements.length > 0) {
      const index = elements[0].index;
      const label = chartData.labels[index];
      const subtotal = chartData.datasets[0].data[index];
      onHover({ label, subtotal });
    } else {
      onHover(null);
    }
  };

  const handleClick = (event, elements, chartData) => {
    if (elements && elements.length > 0) {
      const index = elements[0].index;
      const label = chartData.labels[index];
      onClick(label);
    } else {
      onClick(null);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 45%', maxWidth: '45%', margin: '10px' }}>
        <h2>収入: ¥{positiveTotal.toLocaleString()}</h2>
        <canvas ref={positiveChartRef} data-testid="positive-chart" />
      </div>
      <div style={{ flex: '1 1 45%', maxWidth: '45%', margin: '10px' }}>
        <h2>支出: ¥{negativeTotal.toLocaleString()}</h2>
        <canvas ref={negativeChartRef} data-testid="negative-chart" />
      </div>
    </div>
  );
};

Charts.propTypes = {
  positiveChartData: PropTypes.object.isRequired,
  negativeChartData: PropTypes.object.isRequired,
  positiveTotal: PropTypes.number.isRequired,
  negativeTotal: PropTypes.number.isRequired,
  options: PropTypes.object.isRequired,
  onHover: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default Charts;