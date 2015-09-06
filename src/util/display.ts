module u {
	export module Display {
		export var pixelSize = 128;

		export function setPixel
			(x: number, y: number, color: Color, bloom: number = 0) {
			setPixelByPixel(x * pixelSize, y * pixelSize, color, bloom);
		}

		export function setPixelByPixel
			(px: number, py: number, color: Color, bloom: number = 0) {
			if (px < 0 || px >= pixelSize) {
				return;
			}
			if (py < 0 || py >= pixelSize) {
				return;
			}
			var r = color.red * 255;
			var g = color.green * 255;
			var b = color.blue * 255;
			canvas.setPixel(Math.floor(px), Math.floor(py), r, g, b);
			if (bloom > 0) {
				PostEffect.addPixel(px, py, r * bloom, g * bloom, b * bloom);
			}
		}

		export function fillRect
			(x: number, y: number, width: number, height: number,
			color: Color, bloom: number = 0) {
			var px = x * pixelSize;
			var py = y * pixelSize;
			var pw = width * pixelSize;
			var ph = height * pixelSize;
			fillRectByPixel(px, py, ph, pw, color, bloom);
		}

		export function fillRectByPixel
			(px: number, py: number, pw: number, ph: number,
			color: Color, bloom: number = 0) {
			var r = color.red * 255;
			var g = color.green * 255;
			var b = color.blue * 255;
			var bx = px - pw / 2;
			var by = py - ph / 2;
			canvas.fillRect
				(Math.floor(bx), Math.floor(by), Math.floor(pw), Math.floor(ph), r, g, b);
			if (bloom > 0) {
				PostEffect.addRect(bx, by, pw, ph, r * bloom, g * bloom, b * bloom);
			}
		}

		export function fitPosToPixel(pos: SAT.Vector): SAT.Vector {
			pos.x = (Math.round(pos.x * u.Display.pixelSize) + 0.001) / u.Display.pixelSize;
			pos.y = (Math.round(pos.y * u.Display.pixelSize) + 0.001) / u.Display.pixelSize;
			return pos;
		}

		export var canvas: PixelCanvas;
		export var overlayCanvas: PixelCanvas;
		var effectPixelSize = 32 + 2;
		var mainElement: HTMLDivElement;
		var pixelScale: number;
		var resizeTimeout: number;

		export function init() {
			mainElement = <HTMLDivElement> document.getElementById('main');
			canvas = new PixelCanvas(pixelSize, 'display');
			overlayCanvas = new PixelCanvas(pixelSize, 'overlay', true);
			PostEffect.init();
			resize();
			window.onresize = () => {
				if (resizeTimeout) {
					clearTimeout(resizeTimeout);
				}
				resizeTimeout = setTimeout(() => {
					resize();
					resizeTimeout = null;
				}, 500);
			};
		}

		function resize() {
			var cw = mainElement.clientWidth;
			var ch = mainElement.clientHeight;
			var cm = Math.min(cw, ch);
			pixelScale = Math.max(cm / pixelSize, 1);
			var cs = pixelSize * pixelScale;
			canvas.resize(cs, cs, (cw - cs) / 2, (ch - cs) / 2);
			overlayCanvas.resize(cs, cs, (cw - cs) / 2, (ch - cs) / 2);
			PostEffect.resize(cw, ch);
		}

		export function clear() {
			canvas.clearPixels();
			canvas.applyPixels();
			PostEffect.clear();
			overlayCanvas.clearPixels();
			overlayCanvas.applyPixels();
		}

		export function preRender() {
			canvas.clearPixels();
			PostEffect.preRender();
			overlayCanvas.clearPixels();
		}

		export function postRender() {
			canvas.applyPixels();
			PostEffect.postRender();
			overlayCanvas.applyPixels();
		}

		export function capture(context: CanvasRenderingContext2D) {
			canvas.capture(context);
			PostEffect.capture(context);
			overlayCanvas.capture(context);
		}

		module PostEffect {
			var multiplier = 4;
			var margin = 2;
			var pixelSizeWithoutMargin = Display.pixelSize / multiplier;
			var pixelSize = pixelSizeWithoutMargin + margin * 2;
			var canvas: PixelCanvas;
			var isAvailable = false;
			var pixelTotals: { r: number, g: number, b: number }[];

			export function init() {
				canvas = new PixelCanvas(pixelSize, 'effect');
				pixelTotals = _.times(pixelSize * pixelSize, () => {
					return { r: 0, g: 0, b: 0 };
				});
				isAvailable = true;
			}

			export function resize(cw: number, ch: number) {
				var w = pixelSize * pixelScale * multiplier;
				var h = pixelSize * pixelScale * multiplier;
				canvas.resize(w, h, (cw - w) / 2, (ch - h) / 2);
			}

			export function clear() {
				if (!isAvailable) {
					return;
				}
				canvas.clear();
			}

			export function addPixel(x: number, y: number, r: number, g: number, b: number) {
				addRect(x, y, multiplier, multiplier, r, g, b);
			}

			export function addRect(x: number, y: number, width: number, height: number,
				r: number, g: number, b: number) {
				var w = Math.ceil(width / multiplier);
				var h = Math.ceil(height / multiplier);
				if (w < 1 || h < 1) {
					return;
				}
				var pxr = x / multiplier;
				var px = Math.floor(pxr);
				pxr -= px + 0.5;
				var pyr = y / multiplier;
				var py = Math.floor(pyr);
				pyr -= py + 0.5;
				if (px < 0) {
					var sx = -px;
					px += sx;
					w -= sx;
				}
				if (px + w > pixelSizeWithoutMargin) {
					var sx = px + w - pixelSizeWithoutMargin;
					w -= sx;
				}
				if (py < 0) {
					var sy = -py;
					px += sy;
					h -= sy;
				}
				if (py + h > pixelSizeWithoutMargin) {
					var sy = py + h - pixelSizeWithoutMargin;
					h -= sy;
				}
				if (w < 1 || h < 1) {
					return;
				}
				for (var ox = -1; ox <= w; ox++) {
					var pox = px + ox + margin;
					if (pox < 0 || pox >= pixelSize) {
						continue;
					}
					var rx = 0;
					if (ox === -1) {
						if (pxr < 0) {
							rx = -pxr;
						}
					} else if (ox < w) {
						rx = 0.5;
					} else {
						if (pxr > 0) {
							rx = pxr;
						}
					}
					for (var oy = -1; oy <= h; oy++) {
						var poy = py + oy + margin;
						if (poy < 0 || poy >= pixelSize) {
							continue;
						}
						var ry = 0;
						if (oy === -1) {
							if (pyr < 0) {
								ry = -pyr;
							}
						} else if (oy < h) {
							ry = 0.5;
						} else {
							if (pyr > 0) {
								ry = pyr;
							}
						}
						var i = pox + poy * pixelSize;
						var rxy = rx + ry;
						if (rxy > 0.1) {
							var pt = pixelTotals[i];
							pt.r += r * rxy;
							pt.g += g * rxy;
							pt.b += b * rxy;
						}
					}
				}
			}

			export function preRender() {
				if (!isAvailable) {
					return;
				}
				_.forEach(pixelTotals, (pt) => {
					pt.r /= 2;
					pt.g /= 2;
					pt.b /= 2;
				});
			}

			export function postRender() {
				if (!isAvailable) {
					return;
				}
				var i = 0;
				var pi = 0;
				_.forEach(pixelTotals, (pt) => {
					canvas.pixels[pi] = pt.r;
					canvas.pixels[pi + 1] = pt.g;
					canvas.pixels[pi + 2] = pt.b;
					canvas.pixels[pi + 3] = (pt.r + pt.g + pt.b) / 3 / 3;
					i++;
					pi += 4;
				});
				canvas.applyPixels();
			}

			export function capture(context: CanvasRenderingContext2D) {
				if (!isAvailable) {
					return;
				}
				canvas.capture(context);
			}
		}

		class PixelCanvas {
			context: CanvasRenderingContext2D;
			canvas: HTMLCanvasElement;
			imageData: ImageData;
			pixels: number[];

			constructor(public pixelSize: number, elementId: string, public isTransparent: boolean = false) {
				this.canvas = <HTMLCanvasElement> document.getElementById(elementId);
				this.canvas.width = this.canvas.height = pixelSize;
				this.context = <CanvasRenderingContext2D> this.canvas.getContext('2d');
				if (isTransparent) {
					this.context.fillStyle = 'rgba(0, 0, 0, 0)';
				} else {
					this.context.fillStyle = 'rgb(0, 0, 0)';
				}
				this.context.fillRect(0, 0, pixelSize, pixelSize);
				this.imageData = this.context.getImageData(0, 0, pixelSize, pixelSize);
				this.pixels = this.imageData.data;
			}

			resize(width: number, height: number, marginLeft: number, marginTop: number) {
				this.canvas.style.width = width + 'px';
				this.canvas.style.height = height + 'px';
				this.canvas.style.marginLeft = marginLeft + 'px';
				this.canvas.style.marginTop = marginTop + 'px';
			}

			clearPixels() {
				var pl = this.pixelSize * this.pixelSize * 4;
				if (this.isTransparent) {
					for (var i = 0; i < pl; i += 4) {
						this.pixels[i] = 0;
						this.pixels[i + 1] = 0;
						this.pixels[i + 2] = 0;
						this.pixels[i + 3] = 0;
					}
				} else {
					for (var i = 0; i < pl; i += 4) {
						this.pixels[i] = 0;
						this.pixels[i + 1] = 0;
						this.pixels[i + 2] = 0;
					}
				}
			}

			setPixel(x: number, y: number,
				r: number, g: number, b: number, a: number = null) {
				var i = (x + y * this.pixelSize) * 4;
				this.pixels[i] = r;
				this.pixels[i + 1] = g;
				this.pixels[i + 2] = b;
				if (a) {
					this.pixels[i + 3] = a;
				}
			}

			fillRect(x: number, y: number, width: number, height: number,
				r: number, g: number, b: number, a: number = null) {
				if ((x < 0 && x + width - 1 < 0) ||
					(x >= pixelSize && x + width - 1 >= pixelSize) ||
					(y < 0 && y + height - 1 < 0) ||
					(y >= pixelSize && y + height - 1 >= pixelSize)) {
					return;
				}
				var bx = x.clamp(0, pixelSize - 1);
				var by = y.clamp(0, pixelSize - 1);
				var ex = (x + width - 1).clamp(0, pixelSize - 1);
				var ey = (y + height - 1).clamp(0, pixelSize - 1);
				if (a) {
					for (var y = by; y <= ey; y++) {
						var i = (bx + y * pixelSize) * 4;
						for (var x = bx; x <= ex; x++ , i += 4) {
							this.pixels[i] = r;
							this.pixels[i + 1] = g;
							this.pixels[i + 2] = b;
							this.pixels[i + 3] = a;
						}
					}
				} else {
					for (var y = by; y <= ey; y++) {
						var i = (bx + y * pixelSize) * 4;
						for (var x = bx; x <= ex; x++ , i += 4) {
							this.pixels[i] = r;
							this.pixels[i + 1] = g;
							this.pixels[i + 2] = b;
						}
					}
				}
			}

			clear() {
				this.clearPixels();
				this.applyPixels();
			}

			applyPixels() {
				this.context.putImageData(this.imageData, 0, 0);
			}

			capture(context: CanvasRenderingContext2D) {
				context.drawImage(this.canvas, 0, 0);
			}
		}
	}
}
