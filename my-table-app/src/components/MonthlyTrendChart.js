import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import PropTypes from 'prop-types';
import { getDefaultTrendChartOptions } from '../utils/monthlyTrendUtils';
import './MonthlyTrendChart.css';

// Chart.jsの機能を登録
Chart.register(...registerables);

/**
 * 月次推移チャートコンポーネント
 * 
 * @param {Object} props - コンポーネントのプロパティ
 * @param {Object} props.trendData - 表示するデータ
 * @param {Array} props.trendData.labels - 月のラベル配列
 * @param {Array} props.trendData.datasets - カテゴリごとのデータセット配列
 * @param {Object} props.options - Chart.jsのオプション（オプショナル）
 * @returns {JSX.Element} - 月次推移チャート
 */
const MonthlyTrendChart = ({ trendData = { labels: [], datasets: [] }, options = {} }) => {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [noDataMessage, setNoDataMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // チャートの初期化と更新
  useEffect(() => {
    let timer;
    setIsLoading(true);

    // データをバリデーション
    const isValidData = 
      trendData && 
      trendData.labels && 
      trendData.datasets && 
      trendData.labels.length > 0 && 
      trendData.datasets.length > 0;

    console.log('MonthlyTrendChart: データの有効性チェック', isValidData);

    // データが無効な場合
    if (!isValidData) {
      setNoDataMessage('表示できるデータがありません。データをアップロードしてください。');
      setIsLoading(false);
      return;
    }

    // 既存のチャートを破棄
    if (chartInstance) {
      chartInstance.destroy();
    }

    // チャート初期化処理
    timer = setTimeout(() => {
      const ctx = chartRef.current?.getContext('2d');
      if (!ctx) {
        console.error('MonthlyTrendChart: チャートのコンテキストが取得できません');
        setNoDataMessage('チャートを表示できません');
        setIsLoading(false);
        return;
      }

      try {
        // オプションの設定
        const chartOptions = {
          ...getDefaultTrendChartOptions(),
          ...options
        };

        // チャートの生成
        const newChartInstance = new Chart(ctx, {
          type: 'line',
          data: trendData,
          options: chartOptions
        });

        setChartInstance(newChartInstance);
        setNoDataMessage('');
        setIsLoading(false);

      } catch (error) {
        console.error('MonthlyTrendChart: チャート作成エラー', error);
        setNoDataMessage('チャートの作成中にエラーが発生しました');
        setIsLoading(false);
      }
    }, 100);

    // クリーンアップ
    return () => {
      clearTimeout(timer);
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [trendData, options]);

  // ウィンドウサイズが変わった時にチャートをリサイズ
  useEffect(() => {
    const handleResize = () => {
      if (chartInstance) {
        chartInstance.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [chartInstance]);

  return (
    <div className="monthly-trend-chart-container">
      {isLoading && (
        <div className="monthly-trend-chart-loading">
          <div className="spinner"></div>
          <p>チャートを読み込み中...</p>
        </div>
      )}

      {!isLoading && noDataMessage && (
        <div className="monthly-trend-chart-no-data">
          <p>{noDataMessage}</p>
        </div>
      )}

      <canvas 
        ref={chartRef} 
        className="monthly-trend-chart"
        style={{ display: isLoading || noDataMessage ? 'none' : 'block' }}
      />
    </div>
  );
};

MonthlyTrendChart.propTypes = {
  trendData: PropTypes.shape({
    labels: PropTypes.array,
    datasets: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      data: PropTypes.array,
      borderColor: PropTypes.string,
      backgroundColor: PropTypes.string
    }))
  }),
  options: PropTypes.object
};

export default MonthlyTrendChart;