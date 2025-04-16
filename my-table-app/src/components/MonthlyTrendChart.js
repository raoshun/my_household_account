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
 * @param {number} props.forecastPeriods - 予測する期間（月数）
 * @param {string} props.predictionMethod - 予測手法
 * @returns {JSX.Element} - 月次推移チャート
 */
const MonthlyTrendChart = ({ 
  trendData = { labels: [], datasets: [] }, 
  options = {},
  showPrediction = false,
  forecastPeriods = 3,
  predictionMethod = 'auto'
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
        const result = await getMockPrediction(trendData, {
          forecastPeriods,
          method: predictionMethod
        });
        
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
  }, [trendData, showPrediction, forecastPeriods, predictionMethod]);

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
    const nextMonths = predictionData.nextMonths || [predictionData.nextMonth];
    newData.labels = [...newData.labels, ...nextMonths];
    
    // 各データセットに予測値を追加
    newData.datasets = newData.datasets.map(dataset => {
      const category = dataset.label;
      const originalData = [...dataset.data];
      
      // カテゴリに対応する予測値を取得（配列または単一値）
      let predictedValues = [];
      if (predictionData.predictions[category]) {
        // 新しい形式（複数月の予測）
        if (Array.isArray(predictionData.predictions[category])) {
          predictedValues = predictionData.predictions[category];
        } 
        // 旧形式（1ヶ月のみの予測）
        else {
          predictedValues = [predictionData.predictions[category]];
        }
      }
      
      // 予測値が足りない場合は最後の値を繰り返して埋める
      while (predictedValues.length < forecastPeriods) {
        const lastValue = predictedValues.length > 0 
          ? predictedValues[predictedValues.length - 1] 
          : (originalData.length > 0 ? originalData[originalData.length - 1] : 0);
        predictedValues.push(lastValue);
      }
      
      // 予測値を必要数に切り詰める
      predictedValues = predictedValues.slice(0, forecastPeriods);
      
      const extendedData = [...originalData, ...predictedValues];
      
      // 予測ポイントの視覚的スタイルを設定
      const pointStyles = [...originalData.map(() => 'circle')];
      const pointRadii = [...originalData.map(() => 3)];
      const pointHoverRadii = [...originalData.map(() => 5)];
      const pointBackgroundColors = [...originalData.map(() => dataset.borderColor)];
      
      // 予測ポイントごとに異なるスタイルを適用
      for (let i = 0; i < forecastPeriods; i++) {
        // 予測期間が長い場合、異なる形状を使う
        const pointStyle = i === 0 ? 'rectRot' : (i === 1 ? 'triangle' : 'cross');
        pointStyles.push(pointStyle);
        
        // 予測期間に応じてサイズを少しずつ小さくする（不確実性の表現）
        const sizeAdjustment = Math.max(0, 1 - i * 0.15);
        pointRadii.push(5 * sizeAdjustment);
        pointHoverRadii.push(7 * sizeAdjustment);
        pointBackgroundColors.push(dataset.borderColor);
      }
      
      // 予測データを含むデータセットを生成
      return {
        ...dataset,
        data: extendedData,
        // ポイントのスタイル設定
        pointStyle: pointStyles,
        pointRadius: pointRadii,
        pointHoverRadius: pointHoverRadii,
        pointBackgroundColor: pointBackgroundColors,
        // データポイントのホバー時サイズ
        // 予測点を強調
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

  // 使用した予測手法の表示用テキスト
  const getPredictionMethodText = () => {
    if (!predictionData || !predictionData.method) return '自動選択';
    
    const methodMap = {
      'auto': '自動選択',
      'arima': 'ARIMA',
      'exponential': '指数平滑法',
      'seasonal_ma': '季節性調整付き移動平均'
    };
    
    return methodMap[predictionData.method] || predictionData.method;
  };

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
            <strong>{predictionData.nextMonths ? predictionData.nextMonths.join(', ') : predictionData.nextMonth}</strong>の予測データを表示しています。
            <span className="prediction-method">予測手法: {getPredictionMethodText()}</span>
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
  showPrediction: PropTypes.bool,
  forecastPeriods: PropTypes.number,
  predictionMethod: PropTypes.string
};

export default MonthlyTrendChart;