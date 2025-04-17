// Chart.js のモック
const Chart = jest.fn().mockImplementation(() => {
  return {
    destroy: jest.fn(),
    update: jest.fn()
  };
});

// registerablesをイテラブルオブジェクトとして定義
const registerables = ['scale', 'legend', 'title'];

// register()メソッドを定義 - スプレッド演算子で渡されるregisterablesを正しく処理
Chart.register = jest.fn((...components) => {
  // 引数を処理するモック実装（各コンポーネントを登録する処理をシミュレート）
  return;
});

// モックにregisterablesプロパティを設定
Chart.registerables = registerables;

export { Chart, registerables };
export default Chart;