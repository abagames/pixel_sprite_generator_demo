module u {
	export class Particle extends Actor {
		number = 1;
		angleWidth = 360;
		targetSize = 0.02;
		duration = 30;
		color = new Color().copy(Color.white);
		size = 0.01;
		isExpanding = true;

		setPos(v: SAT.Vector): Particle {
			super.setPos(v);
			return this;
		}

		setXy(x: number, y: number = null): Particle {
			super.setXy(x, y);
			return this;
		}

		setNumber(number: number): Particle {
			this.number = number;
			return this;
		}

		setAngle(angle: number): Particle {
			super.setAngle(angle);
			return this;
		}

		setAngleWidth(angleWidth: number): Particle {
			this.angleWidth = angleWidth;
			return this;
		}

		setSpeed(speed: number): Particle {
			super.setSpeed(speed);
			return this;
		}

		setSize(size: number): Particle {
			this.targetSize = size;
			return this;
		}

		setDuration(duration: number): Particle {
			this.duration = duration;
			return this;
		}

		setColor(color: Color): Particle {
			this.color.copy(color);
			return this;
		}

		init() {
			this.speed = 0.01;
			this.setDisplayPriotiry(0);
		}

		update() {
			if (this.number > 0) {
				this.remove();
				var aw = this.angleWidth / 2;
				_.times(this.number, () => {
					var a = new Particle();
					a.setPos(this.pos);
					a.angle = this.angle + (-aw).randomRange(aw);
					a.speed = this.speed * 0.5.randomRange(1.5);
					a.color = this.color;
					a.targetSize = this.targetSize;
					a.duration = this.duration * 0.5.randomRange(1.5);
					a.number = 0;
				});
				return;
			}
			this.speed *= 0.98;
			if (this.isExpanding) {
				this.size *= 1.5;
				if (this.size > this.targetSize) {
					this.isExpanding = false;
				}
			} else {
				this.size *= 0.95;
			}
			Display.fillRect(this.pos.x, this.pos.y, this.size, this.size,
				this.color.getBlinkColor(), 0.5);
			if (this.ticks >= this.duration - 1) {
				this.remove();
			}
		}
	}
}
