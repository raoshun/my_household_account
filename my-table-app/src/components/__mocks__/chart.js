// Chart.jsのモック
export const Chart = jest.fn().mockImplementation(() => {
  return {
    destroy: jest.fn(),
    update: jest.fn()
  };
});

export default {
  Chart
};
