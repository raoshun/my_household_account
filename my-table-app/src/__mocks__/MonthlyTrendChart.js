import React from 'react';
import PropTypes from 'prop-types';

/**
 * MonthlyTrendChartのモック版（テスト用）
 * Chart.registerablesに関する問題を回避するためのシンプルな実装
 */
const MockMonthlyTrendChart = ({ 
  trendData = { labels: [], datasets: [] },
  showPrediction = false,
  predictionMethod = 'auto'
}) => {
  return (
    <div className="monthly-trend-chart-container" data-testid="monthly-trend-chart">
      <canvas className="monthly-trend-chart"></canvas>
      
      {showPrediction && (
        <div className="prediction-info">
          <div className="prediction-badge">予測</div>
          <p>
            <strong>予測データ</strong>
            <span className="prediction-method">予測手法: {predictionMethod}</span>
          </p>
        </div>
      )}
    </div>
  );
};

MockMonthlyTrendChart.propTypes = {
  trendData: PropTypes.shape({
    labels: PropTypes.array,
    datasets: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      data: PropTypes.array,
      borderColor: PropTypes.string,
      backgroundColor: PropTypes.string
    }))
  }),
  options: PropTypes.object,
  showPrediction: PropTypes.bool,
  forecastPeriods: PropTypes.number,
  predictionMethod: PropTypes.string
};

export default MockMonthlyTrendChart;