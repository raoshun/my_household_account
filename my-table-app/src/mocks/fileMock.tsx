// 画像や静的ファイルのモック
module.exports = 'test-file-stub';

// FileReaderのモック
export class MockFileReader extends FileReader {
  static EMPTY = 0 as const;
  static LOADING = 1 as const;
  static DONE = 2 as const;
  error: DOMException | null = null;
  onabort: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
  onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
  onloadstart: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
  onprogress: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
  readyState: 0 | 1 | 2 = MockFileReader.EMPTY;
  result: string | ArrayBuffer | null = null;
  abort(): void { /* モック */ }
  readAsBinaryString(): void { this.readAsText(); }
  readAsDataURL(): void { this.readAsText(); }
  constructor() {
    super();
    this.onload = null;
    this.onerror = null;
  }
  readAsText() {
    this.readyState = MockFileReader.LOADING;
    if (this.onload) {
      setTimeout(() => {
        this.result = 'mocked,csv,content';
        this.readyState = MockFileReader.DONE;
        (this.onload as ((event: ProgressEvent<FileReader>) => void))({ target: { result: this.result } } as ProgressEvent<FileReader>);
        if (this.onloadend) this.onloadend.call(this, { target: { result: this.result } } as ProgressEvent<FileReader>);
      }, 0);
    }
    return null;
  }
  readAsArrayBuffer() {
    this.readAsText();
    return null;
  }
}

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'test') {
  window.FileReader = MockFileReader as typeof FileReader;
}