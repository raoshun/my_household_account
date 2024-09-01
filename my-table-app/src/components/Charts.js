import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Chart, ArcElement, PieController } from 'chart.js';

// Chart.jsの要素とコントローラーを登録
Chart.register(ArcElement, PieController);

const Charts = ({ positiveChartData, negativeChartData, positiveTotal, negativeTotal, options, onHover, onClick }) => {
  const positiveChartRef = useRef(null);
  const negativeChartRef = useRef(null);

  useEffect(() => {
    const positiveCtx = positiveChartRef.current?.getContext('2d');
    const negativeCtx = negativeChartRef.current?.getContext('2d');

    let positiveChart;
    let negativeChart;

    if (positiveCtx) {
      positiveChart = new Chart(positiveCtx, {
        type: 'pie',
        data: positiveChartData,
        options: { ...options, onClick: handleClick, onHover: handleHover },
      });
    }

    if (negativeCtx) {
      negativeChart = new Chart(negativeCtx, {
        type: 'pie',
        data: negativeChartData,
        options: { ...options, onClick: handleClick, onHover: handleHover },
      });
    }

    return () => {
      if (positiveChart) {
        positiveChart.destroy();
      }
      if (negativeChart) {
        negativeChart.destroy();
      }
    };
  }, [positiveChartData, negativeChartData, options]);

  const handleHover = (event, elements) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      const label = positiveChartData.labels[index];
      const subtotal = positiveChartData.datasets[0].data[index];
      onHover({ label, subtotal });
    } else {
      onHover(null);
    }
  };

  const handleClick = (event, elements) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      const label = positiveChartData.labels[index];
      onClick(label);
    } else {
      onClick(null);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 45%', maxWidth: '45%', margin: '10px' }}>
        <h2>収入: ¥{positiveTotal.toLocaleString()}</h2>
        <canvas ref={positiveChartRef} />
      </div>
      <div style={{ flex: '1 1 45%', maxWidth: '45%', margin: '10px' }}>
        <h2>支出: ¥{negativeTotal.toLocaleString()}</h2>
        <canvas ref={negativeChartRef} />
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