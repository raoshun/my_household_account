// Chart.jsのモック
const mockChart = function() {
  return {
    destroy: jest.fn(),
    update: jest.fn()
  };
};

// プロトタイプメソッド
mockChart.prototype.getContext = function() {
  return {};
};

// 静的メソッド
mockChart.register = jest.fn();

module.exports = {
  Chart: mockChart,
  ArcElement: jest.fn(),
  PieController: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  register: jest.fn()
};
