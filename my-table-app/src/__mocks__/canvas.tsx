/**
 * Canvas要素のモック
 */
class MockCanvasRenderingContext2D {
  canvas: HTMLCanvasElement | null;
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  font: string;
  textAlign: string;
  textBaseline: string;
  lineCap: string;
  lineJoin: string;
  miterLimit: number;
  globalAlpha: number;
  globalCompositeOperation: string;
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  lineDashOffset: number;
  _currentPath: unknown[];
  _transformStack: unknown[];
  _clipStack: unknown[];

  constructor() {
    this.canvas = null;
    this.fillStyle = '#000000';
    this.strokeStyle = '#000000';
    this.lineWidth = 1;
    this.font = '10px sans-serif';
    this.textAlign = 'start';
    this.textBaseline = 'alphabetic';
    this.lineCap = 'butt';
    this.lineJoin = 'miter';
    this.miterLimit = 10;
    this.globalAlpha = 1.0;
    this.globalCompositeOperation = 'source-over';
    this.shadowBlur = 0;
    this.shadowColor = 'rgba(0,0,0,0)';
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
    this.lineDashOffset = 0;
    this._currentPath = [];
    this._transformStack = [];
    this._clipStack = [];
  }

  // Canvas Drawing APIs
  clearRect() {}
  fillRect() {}
  strokeRect() {}
  beginPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  bezierCurveTo() {}
  quadraticCurveTo() {}
  arc() {}
  arcTo() {}
  ellipse() {}
  rect() {}
  fill() {}
  stroke() {}
  clip() {}
  isPointInPath() { return false; }
  isPointInStroke() { return false; }

  // Text APIs
  fillText() {}
  strokeText() {}
  measureText() { return { width: 0 }; }

  // Image APIs
  drawImage() {}
  createImageData() { 
    return { 
      data: new Uint8ClampedArray(4), 
      width: 1, 
      height: 1 
    }; 
  }
  getImageData() { 
    return this.createImageData(); 
  }
  putImageData() {}
  
  // Other APIs
  getLineDash() { return []; }
  setLineDash() {}
  getTransform() { 
    return { 
      a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
      multiplySelf: () => {},
      invertSelf: () => {},
      transformPoint: () => ({ x: 0, y: 0 })
    };
  }
  setTransform() {}
  resetTransform() {}
  createLinearGradient() { 
    return { 
      addColorStop: () => {} 
    }; 
  }
  createRadialGradient() { 
    return { 
      addColorStop: () => {} 
    }; 
  }
  createPattern() { return {}; }
  save() {}
  restore() {}
  translate() {}
  rotate() {}
  scale() {}
  transform() {}
}

// HTMLCanvasElement拡張
if (typeof window !== 'undefined') {
  // 実際のDOM環境
  const proto = window.HTMLCanvasElement.prototype as unknown as { _getContext?: (contextType: string) => unknown };
  if (!proto._getContext) {
    proto._getContext = window.HTMLCanvasElement.prototype.getContext;
    // オーバーロード宣言で型安全にgetContextを再定義
    function getContext(this: HTMLCanvasElement, contextId: "2d", options?: unknown): CanvasRenderingContext2D | null;
    function getContext(this: HTMLCanvasElement, contextId: "webgl" | "webgl2", options?: unknown): WebGLRenderingContext | WebGL2RenderingContext | null;
    function getContext(this: HTMLCanvasElement, contextId: "bitmaprenderer", options?: unknown): ImageBitmapRenderingContext | null;
    function getContext(this: HTMLCanvasElement, contextId: string, options?: unknown): unknown {
      if (contextId === '2d') {
        return new MockCanvasRenderingContext2D() as unknown as CanvasRenderingContext2D;
      }
      return (this as unknown as { _getContext: (contextType: string, options?: unknown) => unknown })._getContext(contextId, options);
    }
    window.HTMLCanvasElement.prototype.getContext = getContext as typeof window.HTMLCanvasElement.prototype.getContext;
  }
}

module.exports = { MockCanvasRenderingContext2D };
