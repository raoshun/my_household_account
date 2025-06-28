import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js';
import type { InteractionModeMap } from 'chart.js/dist/types';
import { getDefaultTrendChartOptions } from '../utils/monthlyTrendUtils';
import { getMockPrediction } from '../api/trendPredictionApi';
import './MonthlyTrendChart.css';
import type { MonthlyTrendChartProps } from '../types';

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
 * @param {boolean} props.showSavingsRate - 貯蓄率を表示するかどうか
 * @returns {JSX.Element} - 月次推移チャート
 */
const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ 
  trendData = { labels: [], datasets: [] }, 
  options = {},
  showPrediction = false,
  forecastPeriods = 3,
  predictionMethod = 'auto',
  showSavingsRate = true
}) => {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [noDataMessage, setNoDataMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [predictionData, setPredictionData] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [savingsRateData, setSavingsRateData] = useState(null);

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

  // 貯蓄率の計算
  useEffect(() => {
    if (!showSavingsRate || !trendData || !trendData.labels || !trendData.datasets || 
        trendData.labels.length === 0 || trendData.datasets.length === 0) {
      setSavingsRateData(null);
      return;
    }

    try {
      // 収入と支出のカテゴリを判別
      const incomeDatasets = trendData.datasets.filter(dataset => 
        dataset.label.includes('収入') || 
        dataset.label === '給与' || 
        dataset.label === '賞与' || 
        dataset.label === 'その他収入'
      );
      
      const expenseDatasets = trendData.datasets.filter(dataset => 
        !dataset.label.includes('収入') && 
        dataset.label !== '給与' && 
        dataset.label !== '賞与' && 
        dataset.label !== 'その他収入'
      );
      
      // 収入データがある場合のみ貯蓄率を計算
      if (incomeDatasets.length > 0) {
        const monthlyIncomes = Array(trendData.labels.length).fill(0);
        const monthlyExpenses = Array(trendData.labels.length).fill(0);
        
        // 月ごとの収入合計を計算
        incomeDatasets.forEach(dataset => {
          dataset.data.forEach((value, index) => {
            monthlyIncomes[index] += value;
          });
        });
        
        // 月ごとの支出合計を計算
        expenseDatasets.forEach(dataset => {
          dataset.data.forEach((value, index) => {
            monthlyExpenses[index] += value;
          });
        });
        
        // 月ごとの貯蓄率を計算
        const savingsRates = monthlyIncomes.map((income, index) => {
          if (income > 0) {
            const savings = income - monthlyExpenses[index];
            return (savings / income) * 100;
          }
          return null;
        });
        
        // 貯蓄率のデータセットを作成
        const savingsRateDataset = {
          label: '貯蓄率',
          data: savingsRates,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2,
          fill: false,
          type: 'line',
          yAxisID: 'y1',
          tension: 0.4
        };
        
        setSavingsRateData(savingsRateDataset);
      } else {
        setSavingsRateData(null);
      }
    } catch (error) {
      console.error('貯蓄率の計算エラー:', error);
      setSavingsRateData(null);
    }
  }, [trendData, showSavingsRate]);

  // チャートデータに予測と貯蓄率を追加
  const getEnhancedTrendData = () => {
    const enhancedData = { ...trendData };
    let nextMonths = [];
    
    // 基本データセットのスタイルを調整
    enhancedData.datasets = enhancedData.datasets.map(dataset => ({
      ...dataset,
      borderDash: undefined, // 実データは実線を保証
      pointStyle: 'circle'   // 統一したポイントスタイル
    }));
    
    // 予測データを追加
    if (showPrediction && predictionData && predictionData.predictions) {
      nextMonths = predictionData.nextMonths || [predictionData.nextMonth];
      enhancedData.labels = [...enhancedData.labels, ...nextMonths];
      
      // 各データセットに予測値を追加
      enhancedData.datasets = enhancedData.datasets.map(dataset => {
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
          // 予測線用のスタイル設定
          segment: {
            borderDash: ctx => ctx.p0DataIndex >= originalData.length - 1 ? [5, 5] : undefined
          }
        };
      });
    }
    
    // 貯蓄率データを追加
    if (showSavingsRate && savingsRateData) {
      const savingsRateDatasetWithPrediction = { ...savingsRateData };
      
      // 予測データがある場合は貯蓄率の予測も追加
      if (showPrediction && predictionData && predictionData.predictions) {
        // 収入と支出カテゴリを特定
        const incomeCategories = enhancedData.datasets
          .filter(d => d.label.includes('収入') || d.label === '給与' || d.label === '賞与' || d.label === 'その他収入')
          .map(d => d.label);
          
        const expenseCategories = enhancedData.datasets
          .filter(d => !d.label.includes('収入') && d.label !== '給与' && d.label !== '賞与' && d.label !== 'その他収入')
          .map(d => d.label);
        
        // 予測月ごとの収入と支出を計算
        const predictedSavingsRates = nextMonths.map((_, monthIndex) => {
          let monthlyIncome = 0;
          let monthlyExpense = 0;
          
          // その月の各カテゴリの収入・支出を合計
          enhancedData.datasets.forEach(dataset => {
            const dataLength = dataset.data.length;
            const predictedValue = dataset.data[dataLength - forecastPeriods + monthIndex];
            
            if (incomeCategories.includes(dataset.label)) {
              monthlyIncome += predictedValue || 0;
            } else if (expenseCategories.includes(dataset.label)) {
              monthlyExpense += predictedValue || 0;
            }
          });
          
          // 貯蓄率の計算
          if (monthlyIncome > 0) {
            return ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100;
          }
          
          return null;
        });
        
        // 予測貯蓄率を追加
        savingsRateDatasetWithPrediction.data = [...savingsRateData.data, ...predictedSavingsRates];
        
        // 予測部分のスタイル設定
        const originalDataLength = savingsRateData.data.length;
        savingsRateDatasetWithPrediction.pointStyle = [
          ...Array(originalDataLength).fill('circle'),
          ...Array(predictedSavingsRates.length).fill('rectRot')
        ];
        
        savingsRateDatasetWithPrediction.segment = {
          borderDash: ctx => ctx.p0DataIndex >= originalDataLength - 1 ? [5, 5] : undefined
        };
      }
      
      enhancedData.datasets.push(savingsRateDatasetWithPrediction);
    }
    
    return enhancedData;
  };

  // チャートの初期化と更新
  useEffect(() => {
    // テスト環境では処理をスキップ
    if (globalThis.isTestEnvironment && globalThis.isTestEnvironment()) {
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      if (!chartRef.current) {
        console.error('チャート要素への参照が見つかりません');
        setNoDataMessage('チャート要素が見つかりません');
        setIsLoading(false);
        return;
      }

      try {
        const ctx = chartRef.current.getContext('2d');
        if (!ctx) {
          console.error('チャートコンテキストの取得に失敗しました');
          setNoDataMessage('チャートを表示できません');
          setIsLoading(false);
          return;
        }

        // 貯蓄率表示用のオプション拡張
        const chartOptions = {
          ...getDefaultTrendChartOptions(),
          ...options,
        };
        // interaction.modeの型安全な値を保証
        if (chartOptions.interaction && typeof chartOptions.interaction === 'object') {
          chartOptions.interaction = {
            ...chartOptions.interaction,
            mode: 'index' as keyof InteractionModeMap, // 型安全な値に修正
            intersect: false,
          };
        }
        
        // 貯蓄率表示時は右側にY軸を追加
        if (showSavingsRate && savingsRateData) {
          (chartOptions.scales as unknown as { [field: string]: unknown })['y1'] = { // eslint-disable-line no-undef
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: '貯蓄率 (%)'
            },
            grid: {
              drawOnChartArea: false
            },
            min: 0,
            max: 100,
            ticks: {
              callback: function(value: number) {
                return value + '%';
              }
            }
          };
        }

        // 予測と貯蓄率を含むデータを取得
        const displayData = getEnhancedTrendData();

        // チャートの生成
        const newChartInstance = new Chart(ctx, {
          type: 'line',
          data: displayData,
          options: chartOptions as import('chart.js').ChartOptions<'line'>, // eslint-disable-line no-undef
        });

        setChartInstance(newChartInstance);
        setNoDataMessage('');
        setIsLoading(false);

      } catch (error) {
        console.error('MonthlyTrendChart: チャート作成エラー', error);
        setNoDataMessage('チャートの作成中にエラーが発生しました: ' + error.message);
        setIsLoading(false);
      }
    }, 200); // タイミングを少し増やして DOM の準備を確実に

    // クリーンアップ
    return () => {
      clearTimeout(timer);
      if (chartInstance) {
        try {
          chartInstance.destroy();
        } catch (error) {
          console.error('クリーンアップ中のチャート破棄でエラーが発生しました:', error);
        }
        setChartInstance(null); // ここでも明示的にnull
      }
    };
  }, [trendData, options, predictionData, showPrediction, savingsRateData, showSavingsRate]);

  // ウィンドウサイズが変わった時にチャートをリサイズ
  useEffect(() => {
    const handleResize = () => {
      if (chartInstance && chartRef.current) {
        chartInstance.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      setChartInstance(null); // アンマウント時にインスタンスをnullに
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
    <div className="monthly-trend-chart-container" data-testid="monthly-trend-chart">
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
      
      {showSavingsRate && savingsRateData && (
        <div className="savings-rate-info" data-testid="savings-rate-info">
          <div className="savings-rate-badge">貯蓄率</div>
          <p>
            貯蓄率 = (収入 - 支出) / 収入 × 100%
          </p>
        </div>
      )}
    </div>
  );
};

export default MonthlyTrendChart;