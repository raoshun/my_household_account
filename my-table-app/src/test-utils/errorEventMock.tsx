/**
 * ErrorEvent のモッククラス
 * テスト環境では ErrorEvent が未定義の場合に使用
 */
export class ErrorEvent extends Event {
  message: string;
  filename: string;
  lineno: number;
  colno: number;
  error: unknown;
  constructor(type: string, options: {
    message?: string;
    filename?: string;
    lineno?: number;
    colno?: number;
    error?: unknown;
  } = {}) {
    super(type);
    this.message = options.message || '';
    this.filename = options.filename || '';
    this.lineno = options.lineno || 0;
    this.colno = options.colno || 0;
    this.error = options.error || null;
  }
}

// グローバルに ErrorEvent が存在しない場合、モックを設定
if (typeof window !== 'undefined' && typeof window.ErrorEvent === 'undefined') {
  (window as unknown as typeof window).ErrorEvent = ErrorEvent;
}

// Node環境の場合、globalにEventクラスが存在しない可能性がある
if (typeof Event === 'undefined') {
  const MockEvent = class Event {
    type: string;
    bubbles: boolean;
    cancelable: boolean;
    constructor(type: string, options: { bubbles?: boolean; cancelable?: boolean } = {}) {
      this.type = type;
      this.bubbles = options.bubbles || false;
      this.cancelable = options.cancelable || false;
    }
    static NONE = 0;
    static CAPTURING_PHASE = 1;
    static AT_TARGET = 2;
    static BUBBLING_PHASE = 3;
  };
  (globalThis as unknown as typeof globalThis).Event = MockEvent as unknown as typeof Event;
}
