import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import PropTypes from 'prop-types';
import { getDefaultTrendChartOptions } from '../utils/monthlyTrendUtils';
import { getMockPrediction } from '../api/trendPredictionApi';
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
 * @param {boolean} props.showPrediction - 予測データを表示するかどうか
 * @returns {JSX.Element} - 月次推移チャート
 */
const MonthlyTrendChart = ({ 
  trendData = { labels: [], datasets: [] }, 
  options = {},
  showPrediction = false
}) => {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [noDataMessage, setNoDataMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [predictionData, setPredictionData] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // 予測データの取得
  useEffect(() => {
    let isMounted = true;

    const fetchPrediction = async () => {
      if (!showPrediction || !trendData || !trendData.labels || trendData.labels.length < 3) {
        return;
      }

      try {
        setIsPredicting(true);
        // 本番環境では実際のAPIを呼び出す予定
        // テスト段階ではモックを使用
        const result = await getMockPrediction(trendData);
        
        if (isMounted) {
          setPredictionData(result);
          setIsPredicting(false);
        }
      } catch (error) {
        console.error('予測データの取得に失敗しました:', error);
        if (isMounted) {
          setIsPredicting(false);
        }
      }
    };

    fetchPrediction();

    return () => {
      isMounted = false;
    };
  }, [trendData, showPrediction]);

  // チャートデータに予測を追加
  const getTrendDataWithPredictions = () => {
    if (!showPrediction || !predictionData || !predictionData.predictions || 
        Object.keys(predictionData.predictions).length === 0) {
      return {
        ...trendData,
        datasets: trendData.datasets.map(dataset => ({
          ...dataset,
          borderDash: undefined, // 実データは実線を保証
          pointStyle: 'circle'   // 統一したポイントスタイル
        }))
      };
    }

    // データのディープコピーを作成
    const newData = JSON.parse(JSON.stringify(trendData));
    
    // 予測月を追加
    newData.labels = [...newData.labels, predictionData.nextMonth];
    
    // 各データセットに予測値を追加
    newData.datasets = newData.datasets.map(dataset => {
      const predictedValue = predictionData.predictions[dataset.label] || null;
      const originalData = [...dataset.data];
      const extendedData = [...originalData, predictedValue];
      
      // 予測データを含むデータセットを生成
      return {
        ...dataset,
        data: extendedData,
        // 実データポイントと予測データポイントで異なるスタイルを設定
        pointStyle: [...originalData.map(() => 'circle'), 'rectRot'],
        // 実線と破線のセグメントを生成するためのデータセット分割
        // 本来のデータは実線で表示
        borderDash: undefined,
        // データポイントのサイズを調整
        pointRadius: [...originalData.map(() => 3), 5],
        // データポイントのホバー時サイズ
        pointHoverRadius: [...originalData.map(() => 5), 7],
        // 予測点を強調
        pointBackgroundColor: [...originalData.map(() => dataset.borderColor), dataset.borderColor],
        // 予測線用のスタイル設定は別セグメントとして追加
        segment: {
          borderDash: ctx => ctx.p0DataIndex >= originalData.length - 1 ? [5, 5] : undefined
        }
      };
    });
    
    return newData;
  };

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

        // 予測を含むデータを取得
        const displayData = showPrediction ? getTrendDataWithPredictions() : trendData;

        // チャートの生成
        const newChartInstance = new Chart(ctx, {
          type: 'line',
          data: displayData,
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
  }, [trendData, options, predictionData, showPrediction]);

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

      {!isLoading && isPredicting && showPrediction && (
        <div className="prediction-loading-indicator">
          <div className="spinner small"></div>
          <span>予測データを計算中...</span>
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
      
      {showPrediction && predictionData && (
        <div className="prediction-info">
          <div className="prediction-badge">予測</div>
          <p>
            <strong>{predictionData.nextMonth}</strong>の予測データを表示しています。
            <span className="prediction-note">（直近のトレンドに基づく予測値）</span>
          </p>
        </div>
      )}
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
  options: PropTypes.object,
  showPrediction: PropTypes.bool
};

export default MonthlyTrendChart;