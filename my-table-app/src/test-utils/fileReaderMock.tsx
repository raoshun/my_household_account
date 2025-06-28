// FileReaderのモック（全テスト共通で利用可能）
class MockFileReader {
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
  result: string | ArrayBuffer | null = null;

  constructor() {}

  readAsText(file: { type: string }) {
    setTimeout(() => {
      this.result = file.type === 'text/csv' ? 'mock,csv,data' : 'mock-text-data';
      if (this.onload) {
        this.onload.call(this, { target: { result: this.result } } as ProgressEvent<FileReader>);
      }
    }, 0);
  }

  readAsArrayBuffer(_file: { type: string }) {
    setTimeout(() => {
      const mockData = new Uint8Array([97, 98, 99]); // "abc"
      this.result = mockData.buffer;
      if (this.onload) {
        this.onload.call(this, { target: { result: this.result } } as ProgressEvent<FileReader>);
      }
    }, 0);
  }
}

export default MockFileReader;
