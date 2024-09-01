export const chartOptions = {
  plugins: {
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.label || '';
          const value = context.raw || 0;
          return `${label}: ¥${value.toLocaleString()}`;
        }
      }
    }
  }
};