// FileReaderのモック（全テスト共通で利用可能）
class MockFileReader {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.result = null;
  }

  readAsText(file) {
    setTimeout(() => {
      this.result = file.type === 'text/csv' ? 'mock,csv,data' : 'mock-text-data';
      if (this.onload) {
        this.onload({ target: { result: this.result } });
      }
    }, 0);
  }

  readAsArrayBuffer(file) {
    setTimeout(() => {
      const mockData = new Uint8Array([97, 98, 99]); // "abc"
      this.result = mockData.buffer;
      if (this.onload) {
        this.onload({ target: { result: this.result } });
      }
    }, 0);
  }
}

export default MockFileReader;
