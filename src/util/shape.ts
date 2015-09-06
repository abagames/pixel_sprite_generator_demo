/// <reference path="../../typings/pixel-sprite-generator/pixel-sprite-generator.d.ts" />

module u {
	export class Shape {
		mask: psg.Mask;
		sprite: psg.Sprite;
		width: number;
		height: number;

		constructor(patterns: string[],
			seed: number = null,
			scale: number = 1,
			hue: number = null, saturation: number = null,
			isMirrorX: boolean = true, isMirrorY: boolean = false) {
			var random = new Random();
			if (seed) {
				random.setSeed(seed);
			}
			random.rangeFrom0To1 = random.rangeFrom0To1.bind(random);
			psg.setRandomFunction(random.rangeFrom0To1);
			this.mask = this.createMask(patterns, scale, isMirrorX, isMirrorY);
			var options: any = {};
			if (hue) {
				options.hue = hue;
			}
			if (saturation) {
				options.saturation = saturation;
			}
			this.sprite = new psg.Sprite(this.mask, options);
			this.sprite.init();
			this.removeEmptyLines();
			this.width = this.sprite.width / Display.pixelSize;
			this.height = this.sprite.height / Display.pixelSize;
			if (hue && saturation) {
				this.sprite.hslToRgb(hue, saturation, 1, this.edgeRgb);
			} else {
				var hsl = this.sprite.getLastHsl();
				this.sprite.hslToRgb(hsl.h, hsl.s, 1, this.edgeRgb);
			}
			this.edgeRgb.r *= 255;
			this.edgeRgb.g *= 255;
			this.edgeRgb.b *= 255;
		}

		render(x: number, y: number, angle: number = 0) {
			if (angle === 0) {
				this.renderBasic(x, y);
			} else {
				this.renderRotate(x, y, angle);
			}
		}

		renderBasic(x: number, y: number) {
			var cp = this.calcPixelBeginEndPos(x, y);
			var overlayRatio = this.calcOverrayRatio();
			for (var py = cp.by, sy = cp.sby; py <= cp.ey; py++ , sy++) {
				var pi = (cp.bx + py * Display.pixelSize) * 4;
				var sdi = cp.sbx + sy * this.sprite.width;
				var spi = sdi * 4;
				for (var px = cp.bx; px <= cp.ex; px++ , pi += 4, sdi++ , spi += 4) {
					this.setPixel(pi, spi, sdi, overlayRatio);
				}
			}
		}

		renderRotate(x: number, y: number, angle: number) {
			var wh1 = new SAT.Vector(this.sprite.width / 2, this.sprite.height / 2);
			var wh2 = new SAT.Vector(this.sprite.width / 2, -this.sprite.height / 2);
			wh1.rotate(-angle);
			wh2.rotate(-angle);
			var w = Math.ceil(Math.max(Math.abs(wh1.x), Math.abs(wh2.x)) * 2);
			var h = Math.ceil(Math.max(Math.abs(wh1.y), Math.abs(wh2.y)) * 2);
			var cp = this.calcPixelBeginEndPos(x, y, w, h);
			var overlayRatio = this.calcOverrayRatio();
			var cpx = x * Display.pixelSize;
			var cpy = y * Display.pixelSize;
			var sp = new SAT.Vector();
			for (var py = cp.by; py <= cp.ey; py++) {
				var pi = (cp.bx + py * Display.pixelSize) * 4;
				for (var px = cp.bx; px <= cp.ex; px++ , pi += 4) {
					sp.x = (px - cpx);
					sp.y = (py - cpy);
					sp.rotate(angle);
					sp.x = Math.floor(sp.x + this.sprite.width / 2);
					sp.y = Math.floor(sp.y + this.sprite.height / 2);
					if (sp.x >= 0 && sp.x < this.sprite.width &&
						sp.y >= 0 && sp.y < this.sprite.height) {
						var sdi = sp.x + sp.y * this.sprite.width;
						var spi = sdi * 4;
						this.setPixel(pi, spi, sdi, overlayRatio);
					}
				}
			}
		}

		calcPixelBeginEndPos(x: number, y: number,
			width: number = this.sprite.width, height: number = this.sprite.height) {
			var pbx = Math.floor(x * Display.pixelSize - width / 2);
			var cpbx = pbx.clamp(0, Display.pixelSize - 1);
			var sbx = cpbx - pbx;
			var pby = Math.floor(y * Display.pixelSize - height / 2);
			var cpby = pby.clamp(0, Display.pixelSize - 1);
			var sby = cpby - pby;
			var cpex = (pbx + width - 1).clamp(0, Display.pixelSize - 1);
			var cpey = (pby + height - 1).clamp(0, Display.pixelSize - 1);
			return { bx: cpbx, ex: cpex, by: cpby, ey: cpey, sbx: sbx, sby: sby };
		}

		calcOverrayRatio() {
			var s = Math.sin(ticks * 3);
			return s * s * s * 0.8;
		}

		setPixel(pi: number, spi: number, sdi: number, overlayRatio: number) {
			if (this.sprite.pixels.data[spi + 3] > 0) {
				Display.canvas.pixels[pi] = this.sprite.pixels.data[spi];
				Display.canvas.pixels[pi + 1] = this.sprite.pixels.data[spi + 1];
				Display.canvas.pixels[pi + 2] = this.sprite.pixels.data[spi + 2];
			}
			if (this.sprite.data[sdi] === -1) {
				Display.overlayCanvas.pixels[pi] = this.edgeRgb.r * overlayRatio;
				Display.overlayCanvas.pixels[pi + 1] = this.edgeRgb.g * overlayRatio;
				Display.overlayCanvas.pixels[pi + 2] = this.edgeRgb.b * overlayRatio;
				Display.overlayCanvas.pixels[pi + 3] = 250 * overlayRatio;
			}
		}

		edgeRgb: { r: number, g: number, b: number } = { r: 255, g: 255, b: 255 };

		createMask(patterns: string[], scale: number,
			isMirrorX: boolean, isMirrorY: boolean): psg.Mask {
			var pw = patterns[0].length;
			var ph = patterns.length;
			var w = Math.round(pw * scale);
			var h = Math.round(ph * scale);
			if (isMirrorX) {
				w += 1;
			} else {
				w += 2;
			}
			if (isMirrorY) {
				h += 1;
			} else {
				h += 2;
			}
			var patternArray: number[] = [];
			_.times(h, (y) => {
				var py = Math.floor((y - 1) / scale);
				patternArray = patternArray.concat(_.times(w, (x) => {
					var px = Math.floor((x - 1) / scale);
					if (px < 0 || px >= pw || py < 0 || py >= ph) {
						return 0;
					} else {
						var c = patterns[py].charAt(px);
						switch (c) {
							case '.':
								return 0;
							case '-':
								return 1;
							case 'x':
								return 2;
							case 'o':
								return -1;
							default:
								throw new Error('invalid pattern char: ' + c);
						}
					}
				}));
			});
			return new psg.Mask(patternArray, w, h, isMirrorX, isMirrorY);
		}

		removeEmptyLines() {
			var xl = _.times(this.sprite.height, () => false);
			var yl = _.times(this.sprite.width, () => false);
			for (var y = 0; y < this.sprite.height; y++) {
				var si = y * this.sprite.width;
				for (var x = 0; x < this.sprite.width; x++ , si++) {
					if (this.sprite.data[si] != 0) {
						xl[y] = yl[x] = true;
					}
				}
			}
			var bx = 0;
			_.forEach(yl, (l, i) => {
				if (l) {
					bx = i;
					return false;
				}
			});
			var ex = 0;
			_.forEachRight(yl, (l, i) => {
				if (l) {
					ex = i;
					return false;
				}
			});
			var by = 0;
			_.forEach(xl, (l, i) => {
				if (l) {
					by = i;
					return false;
				}
			});
			var ey = 0;
			_.forEachRight(xl, (l, i) => {
				if (l) {
					ey = i;
					return false;
				}
			});
			var w = ex - bx + 1;
			var h = ey - by + 1;
			var data: number[] = [];
			var pixels: number[] = [];
			for (var y = by; y <= ey; y++) {
				var di = y * this.sprite.width + bx;
				var pi = di * 4;
				for (var x = bx; x <= ex; x++) {
					data.push(this.sprite.data[di++]);
					_.times(4, () => {
						pixels.push(this.sprite.pixels.data[pi++]);
					});
				}
			}
			this.sprite.data = data;
			this.sprite.pixels.data = pixels;
			this.sprite.width = w;
			this.sprite.height = h;
		}
	}
}
