// 画像や静的ファイルのモック
module.exports = 'test-file-stub';

// FileReaderのモック
export class MockFileReader {
  constructor() {
    this.onload = null;
    this.onerror = null;
  }
  
  readAsText(file) {
    // モックの実装
    if (this.onload) {
      setTimeout(() => {
        this.onload({
          target: { result: 'mocked,csv,content' }
        });
      }, 0);
    }
    return null;
  }
  
  readAsArrayBuffer(file) {
    // readAsTextと同様の実装でモックする
    this.readAsText(file);
    return null;
  }
}

// グローバルのFileReaderをモック化するための設定
if (typeof window !== 'undefined') {
  window.FileReader = MockFileReader;
}