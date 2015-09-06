module u {
	export class Text extends Actor {
		init(text: string) {
			this.text = text;
			this.pos.set(0.5);
			this.setDisplayPriotiry(2);
		}

		setPos(pos: SAT.Vector): Text {
			super.setPos(pos);
			return this;
		}

		setXy(x: number, y: number = null): Text {
			super.setXy(x, y);
			return this;
		}

		setVelocity(vel: SAT.Vector): Text {
			super.setVelocity(vel);
			return this;
		}

		setVelocityXy(x: number, y: number = null): Text {
			super.setVelocityXy(x, y);
			return this;
		}

		setDuration(duration: number): Text {
			this.duration = duration;
			return this;
		}

		setDurationToInfinite(): Text {
			return this.setDuration(Number.MAX_VALUE);
		}

		setShowingFrom(from: number = 0): Text {
			this.showingFrom = from;
			return this;
		}

		alignLeft(): Text {
			this.xAlign = -1;
			return this;
		}

		alignRight(): Text {
			this.xAlign = 1;
			return this;
		}

		alignTop(): Text {
			this.yAlign = -1;
			return this;
		}

		alignBottom(): Text {
			this.yAlign = 1;
			return this;
		}

		setColor(color: Color): Text {
			this.color = color;
			return this;
		}

		setScale(scale: number): Text {
			this.scale = scale;
			return this;
		}

		text: string;
		duration = 1;
		showingFrom = 0;
		showingTo = 0;
		xAlign = 0;
		yAlign = 0;
		color = new Color().copy(Color.white);
		scale = 1;

		update() {
			if (this.ticks === 0) {
				this.vel.div(this.duration);
				this.showingTo = this.showingFrom + this.duration;
			}
			if (this.ticks < this.showingFrom) {
				return;
			}
			this.draw();
			if (this.ticks >= this.showingTo) {
				this.remove();
			}
		}

		draw() {
			var lw = this.scale * 5;
			var tx = Math.floor(this.pos.x * Display.pixelSize -
				(this.xAlign + 1) * this.text.length * lw / 2);
			var ty = Math.floor(this.pos.y * Display.pixelSize -
				(this.yAlign + 1) * 5 / 2);
			_.forEach(this.text, (c: string) => {
				var li = Text.charToIndex[c.charCodeAt(0)];
				if (li >= 0) {
					Text.draw(li, tx, ty, this.color, this.scale);
				} else if (li === -2) {
					throw 'Invalid char ' + c;
				}
				tx += lw;
			});
		}
	}

	export module Text {
		var count = 66;
		var dotPatterns: SAT.Vector[][];
		export var charToIndex: number[];
		export function init() {
			var patterns = [
				0x4644AAA4, 0x6F2496E4, 0xF5646949, 0x167871F4, 0x2489F697,
				0xE9669696, 0x79F99668, 0x91967979, 0x1F799976, 0x1171FF17,
				0xF99ED196, 0xEE444E99, 0x53592544, 0xF9F11119, 0x9DDB9999,
				0x79769996, 0x7ED99611, 0x861E9979, 0x994444E7, 0x46699699,
				0x6996FD99, 0xF4469999, 0x2224F248, 0x26244424, 0x64446622,
				0x84284248, 0x40F0F024, 0x0F0044E4, 0x480A4E40, 0x9A459124,
				0x000A5A16, 0x640444F0, 0x80004049, 0x40400004, 0x44444040,
				0x0AA00044, 0x6476E400, 0xFAFA61D9, 0xE44E4EAA, 0x24F42445,
				0xF244E544, 0x00000042
			];
			var p = 0;
			var d = 32;
			var pindex = 0;
			dotPatterns = _.times(count, () => {
				var dots: SAT.Vector[] = [];
				_.times(5, (y) => {
					_.times(4, (x) => {
						if (++d >= 32) {
							p = patterns[pindex++];
							d = 0;
						}
						if ((p & 1) > 0) {
							dots.push(new SAT.Vector(x, y));
						}
						p >>= 1;
					});
				});
				return dots;
			});
			var charStr = "()[]<>=+-*/%&_!?,.:|'\"$@#\\urdl";
			charToIndex = _.times(127, (c) => {
				if (c === 32) {
					return -1;
				} else if (48 <= c && c < 58) {
					return c - 48;
				} else if (65 <= c && c < 91) {
					return c - 65 + 10;
				} else {
					var ci = charStr.indexOf(String.fromCharCode(c));
					if (ci >= 0) {
						return ci + 36;
					} else {
						return -2;
					}
				}
			});
		}

		export function draw(i: number, x: number, y: number, color: Color, scale: number) {
			var r = color.red * 255;
			var g = color.green * 255;
			var b = color.blue * 255;
			if (scale === 1) {
				_.forEach(dotPatterns[i], (p) => {
					Display.overlayCanvas.setPixel(x + p.x, y + p.y, r, g, b, 255);
				});
			} else {
				_.forEach(dotPatterns[i], (p) => {
					Display.overlayCanvas.fillRect
						(x + p.x * scale, y + p.y * scale, scale, scale, r, g, b, 255);
				});
			}
		}
	}
}
