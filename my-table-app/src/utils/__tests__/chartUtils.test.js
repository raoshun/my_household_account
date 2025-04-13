import { lightenColor, hitTestPieSegment, safeChartUpdate } from '../chartUtils';

describe('chartUtils', () => {
  describe('lightenColor', () => {
    test('色を正しく明るくすること', () => {
      // 基本色のテスト
      expect(lightenColor('#000000', 50)).toBe('#7f7f7f');
      expect(lightenColor('#ff0000', 20)).toBe('#ff3333');
      expect(lightenColor('#00ff00', 10)).toBe('#1aff1a');
      expect(lightenColor('#0000ff', 30)).toBe('#4d4dff');
      
      // 無効な入力を処理
      expect(lightenColor('invalid', 30)).toBe('invalid');
    });
  });

  describe('hitTestPieSegment', () => {
    const chartData = {
      labels: ['A', 'B', 'C'],
      datasets: [{
        data: [10, 20, 30],
        backgroundColor: ['red', 'green', 'blue']
      }]
    };
    
    test('円グラフの中心点を指定した場合はnullを返す', () => {
      const result = hitTestPieSegment(100, 100, chartData, 200, 200);
      expect(result).toBeNull();
    });
    
    test('円グラフの外側を指定した場合はnullを返す', () => {
      const result = hitTestPieSegment(200, 200, chartData, 200, 200);
      expect(result).toBeNull();
    });
    
    test('無効なチャートデータの場合はnullを返す', () => {
      expect(hitTestPieSegment(100, 50, null, 200, 200)).toBeNull();
      expect(hitTestPieSegment(100, 50, {}, 200, 200)).toBeNull();
      expect(hitTestPieSegment(100, 50, { datasets: [] }, 200, 200)).toBeNull();
    });
    
    test('データの合計が0の場合はnullを返す', () => {
      const zeroData = {
        labels: ['A', 'B'],
        datasets: [{ data: [0, 0] }]
      };
      expect(hitTestPieSegment(100, 50, zeroData, 200, 200)).toBeNull();
    });
  });

  describe('safeChartUpdate', () => {
    test('有効なチャートのみ更新すること', () => {
      // モックの実装を調整
      const mockUpdate = jest.fn();
      
      const validChart = {
        current: {
          update: mockUpdate
        }
      };
      
      const invalidChart1 = { current: {} };
      const invalidChart2 = { current: null };
      const invalidChart3 = null;
      
      // 各ケースをテスト
      safeChartUpdate(validChart);
      expect(mockUpdate).toHaveBeenCalled();
      
      // エラーが発生しないことを確認
      expect(() => {
        safeChartUpdate(invalidChart1);
        safeChartUpdate(invalidChart2);
        safeChartUpdate(invalidChart3);
      }).not.toThrow();
    });
  });
});
