// Chart.js のモック
const mockChart = function() {
  return {
    destroy: function() {},
    update: function() {},
    data: {},
    options: {}
  };
};

// 静的メソッドを追加
mockChart.register = function() {};

module.exports = {
  Chart: mockChart,
  ArcElement: function() {},
  PieController: function() {},
  Tooltip: function() {},
  Legend: function() {},
  registerables: []
};
