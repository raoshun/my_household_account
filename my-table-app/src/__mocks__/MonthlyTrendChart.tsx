import React from 'react';

interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
}

interface TrendData {
  labels: string[];
  datasets: Dataset[];
}

interface MockMonthlyTrendChartProps {
  trendData?: TrendData;
  options?: object;
  showPrediction?: boolean;
  forecastPeriods?: number;
  predictionMethod?: string;
}

/**
 * MonthlyTrendChartのモック版（テスト用）
 * Chart.registerablesに関する問題を回避するためのシンプルな実装
 */
const MockMonthlyTrendChart: React.FC<MockMonthlyTrendChartProps> = ({ 
  trendData = { labels: [], datasets: [] },
  showPrediction = false,
  predictionMethod = 'auto'
}) => {
  return (
    <div className="monthly-trend-chart-container" data-testid="monthly-trend-chart">
      <canvas className="monthly-trend-chart"></canvas>
      <div className="chart-info">
        <span>データ数: {trendData.labels?.length || 0}</span>
      </div>
      
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

export default MockMonthlyTrendChart;