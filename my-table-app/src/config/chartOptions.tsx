export const chartOptions = {
  plugins: {
    tooltip: {
      enabled: false, // 標準のツールチップを無効化
      callbacks: {
        label: function(context) {
          const label = context.label || '';
          const value = context.raw || 0;
          return `${label}: ¥${value.toLocaleString()}`;
        }
      },
      // インタラクション時のツールチップ表示制御
      external: function() {
        // カスタムツールチップのレンダリングロジック
        // 実際の実装はチャートコンポーネント側で行う
      }
    },
    legend: {
      position: 'right',
      labels: {
        boxWidth: 12,
        padding: 15,
        font: {
          size: 12
        },
        // レジェンドアイテムのホバー状態をカスタマイズ
        usePointStyle: true,
        generateLabels: function(chart) {
          const data = chart.data;
          if (data.labels.length && data.datasets.length) {
            return data.labels.map((label, i) => {
              const dataset = data.datasets[0];
              const style = dataset.backgroundColor[i];
              
              return {
                text: label,
                fillStyle: style,
                strokeStyle: '#fff',
                lineWidth: 2,
                hidden: false,
                index: i
              };
            });
          }
          return [];
        }
      }
    }
  },
  hover: {
    mode: null, // ホバーモードを無効化して独自のハイライト処理を使用
    animationDuration: 0, // ホバー時のアニメーション時間を0に
  },
  animation: {
    duration: 500, // 初期表示時のアニメーション
    animateRotate: true,
    animateScale: false,
  },
  // 要素のホバー効果を制御
  elements: {
    arc: {
      hoverOffset: 0, // ホバー時の拡大を無効化
      borderWidth: 1,
      borderColor: '#fff',
      hoverBorderColor: '#fff',
      // アニメーションを調整
      hoverBorderWidth: 1, // ホバー時の境界線を標準と同じにする
    }
  },
  // イベントの種類を設定
  events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
  // チャート設定
  maintainAspectRatio: false,
  responsive: true,
  // 高速な更新のための設定
  transitions: {
    active: {
      animation: {
        duration: 0 // ハイライト時のアニメーションを無効化
      }
    },
    resize: {
      animation: {
        duration: 0 // サイズ変更時のアニメーションを無効化
      }
    },
    show: {
      animation: {
        duration: 500 // 初期表示時のアニメーションは保持
      }
    },
    hide: {
      animation: {
        duration: 0 // 非表示時のアニメーションを無効化
      }
    }
  },
  // データセットの更新方法
  datasets: {
    pie: {
      animation: {
        duration: function(context) {
          // 初期表示時のみアニメーション、更新時は無効化
          return context.initial ? 500 : 0;
        }
      }
    }
  },
  // レスポンシブな挙動を制御
  resizeDelay: 0,
  // インタラクション設定の強化
  interaction: {
    mode: 'nearest',
    intersect: true,
    includeInvisible: false,
    axis: 'xy',
    // インタラクション解決の方法
    resolver: 'resolve',
    eventHandlers: {
      // この階層にイベントハンドラーの詳細設定を追加
      click: null,
      mousemove: null,
      mouseout: null
    }
  },
  // カスタムオプション（Chart.jsの拡張）
  customOption: {
    highlightMode: true,
    disableHoverEffects: true,
    enableClickHandling: true,
    interactionType: 'click-and-hover',
    tooltipHandling: 'custom',
    // マウスイベントハンドラー設定
    mouseEventHandlers: {
      mousemove: true,
      mouseout: true,
      click: true
    },
    // ハイライト効果の設定
    highlightEffect: {
      method: 'color-change',
      intensity: 20,
      duration: 0
    },
    // ホバー効果のカスタマイズ
    hoverEffect: {
      enabled: true,
      mode: 'custom',
      callback: null // コンポーネントで設定
    },
    // クリック効果のカスタマイズ
    clickEffect: {
      enabled: true,
      mode: 'custom',
      callback: null // コンポーネントで設定
    }
  },
  // アクセシビリティ設定
  layout: {
    padding: {
      top: 5,
      right: 10,
      bottom: 5,
      left: 10
    },
    // キャンバスの詳細レイアウト設定
    autoPadding: true
  },
  // インタラクション中の状態管理
  onHover: null, // コンポーネント側で定義するため、ここではnull
  onClick: null,  // コンポーネント側で定義するため、ここではnull
  // アクセス可能性のための設定
  accessibility: {
    enabled: true,
    announceTooltips: true
  }
};

// エクスポートする追加の設定
export const chartInteractionConfig = {
  enablePointerEvents: true,
  useCustomEventHandlers: true,
  handlersInitialized: false
};