module u {
	export class Random {
		to(to: number = 1): number {
			return this.rangeFrom0To1() * to;
		}

		intTo(to: number = 1): number {
			return Math.floor(this.to(to + 1));
		}
		
		range(from: number = 0, to: number = 1): number {
			return this.rangeFrom0To1() * (to - from) + from;
		}

		intRange(from: number = 0, to: number = 1): number {
			return Math.floor(this.range(from, to + 1));
		}

		plusMinus(): number {
			return this.intRange() * 2 - 1;
		}
		
		toPlusMinus(to: number = 1): number {
			return this.range(-to, to);
		}

		intToPlusMinus(to: number = 1): number {
			return this.intRange(-to, to);
		}

		x: number;
		y: number;
		z: number;
		w: number;

		setSeed(v: number = -0x7fffffff) {
			if (v === -0x7fffffff) {
				v = Math.floor(Math.random() * 0x7fffffff);
			}
			this.x = v = 1812433253 * (v ^ (v >> 30))
			this.y = v = 1812433253 * (v ^ (v >> 30)) + 1
			this.z = v = 1812433253 * (v ^ (v >> 30)) + 2
			this.w = v = 1812433253 * (v ^ (v >> 30)) + 3;
			return this;
		}

		constructor() {
			this.setSeed();
		}

		rangeFrom0To1() {
			var t = this.x ^ (this.x << 11);
			this.x = this.y;
			this.y = this.z;
			this.z = this.w;
			this.w = (this.w ^ (this.w >> 19)) ^ (t ^ (t >> 8));
			return this.w / 0x7fffffff;
		}
	}
}
