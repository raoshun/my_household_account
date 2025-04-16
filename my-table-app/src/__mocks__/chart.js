// Chart.js のモック
const Chart = jest.fn().mockImplementation(() => {
  return {
    destroy: jest.fn(),
    update: jest.fn()
  };
});

// 必要なメソッドを追加
Chart.register = jest.fn();

// registerables配列を提供
const registerables = ['scale', 'legend', 'title'];

export { Chart, registerables };
export default Chart;
