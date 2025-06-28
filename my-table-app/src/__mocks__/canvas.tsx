/**
 * Canvas要素のモック
 */
class MockCanvasRenderingContext2D {
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
  if (!window.HTMLCanvasElement.prototype._getContext) {
    window.HTMLCanvasElement.prototype._getContext = window.HTMLCanvasElement.prototype.getContext;
    window.HTMLCanvasElement.prototype.getContext = function(contextType) {
      if (contextType === '2d') {
        return new MockCanvasRenderingContext2D();
      }
      return this._getContext(contextType);
    };
  }
}

module.exports = { MockCanvasRenderingContext2D };
