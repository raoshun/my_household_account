/**
 * ErrorEvent のモッククラス
 * テスト環境では ErrorEvent が未定義の場合に使用
 */
export class ErrorEvent extends Event {
  constructor(type, options = {}) {
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
  window.ErrorEvent = ErrorEvent;
}

// Node環境の場合、globalにEventクラスが存在しない可能性がある
if (typeof Event === 'undefined') {
  global.Event = class Event {
    constructor(type, options = {}) {
      this.type = type;
      this.bubbles = options.bubbles || false;
      this.cancelable = options.cancelable || false;
    }
  };
}
