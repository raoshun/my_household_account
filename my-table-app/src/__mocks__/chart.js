// Chart.js のモック
const Chart = jest.fn().mockImplementation(() => {
  return {
    destroy: jest.fn(),
    update: jest.fn()
  };
});

export { Chart };
export default Chart;
