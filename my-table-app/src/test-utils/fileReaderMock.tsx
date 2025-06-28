// FileReaderのモック（全テスト共通で利用可能）
class MockFileReader {
  static EMPTY = 0;
  static LOADING = 1;
  static DONE = 2;
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  readAsArrayBuffer(_: { type: string }) {
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
