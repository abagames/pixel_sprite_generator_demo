/// <reference path="./util/actor.ts" />

var movingTipsText: u.Text;
var buttonTipsText: u.Text;

window.onload = () => {
	u.init(update);
	new Ship(true);
	movingTipsText = new u.Text('[udlr]: MOVE').setXy(0.1, 0.1).alignLeft().
		setDuration(180).setShowingFrom(120);
	buttonTipsText = new u.Text('[Z]: CHANGE SHAPE').setXy(0.1, 0.2).alignLeft().
		setDuration(180).setShowingFrom(180);
}

function update(time) {
	if (u.ticks % 60 == 0) {
		new Ship();
	}
	if (u.ticks % 10 == 0) {
		new Star();
	}
}

class Ship extends u.Actor {
	shape: u.Shape;
	isPlayer: boolean;
	scale: number;
	particleFreq: number;

	init(ip = false) {
		if (ip) {
			this.pos.set(.5, .7);
			this.scale = 1;
			this.particleFreq = 2;
		} else {
			this.scale = 0.5 + (1).randomTo() * (1).randomTo() * 3;
			this.pos.set(0.1.randomRange(0.9), -0.1 + (1).randomIntTo() * 1.2);
			this.vel.set(0.003.randomToPlusMinus(),
				0.003.randomRange(0.015)).div(this.scale);
			this.particleFreq = 0.05 / this.vel.y;
			if (this.pos.y > 0) {
				this.particleFreq /= 3;
				this.vel.y *= -1;
			}
			this.particleFreq = Math.floor(this.particleFreq).clamp(2, 20);
		}
		this.setShape();
		this.isPlayer = ip;
	}

	setShape() {
		this.shape = new u.Shape([
			'...--',
			'...-o',
			'..--o',
			'..--o',
			'.---o',
			'---xx',
			'---xx',
			'---xx',
			'----o',
			'..---',
		], null, this.scale);
	}

	update() {
		if (this.isPlayer) {
			this.updatePlayer();
		} else {
			if (!this.pos.isIn(0.12)) {
				this.remove();
			}
		}
		this.shape.render(this.pos.x, this.pos.y);
		if (u.ticks % this.particleFreq === 0) {
			new u.Particle().
				setXy(this.pos.x + (0).randomRange(.015 * this.scale),
					this.pos.y + .05 * this.scale).
				setColor(u.Color.cyan).
				setSize(0.02 * this.scale).setSpeed(0.01).
				setAngle(180).setAngleWidth(40);
		}
	}

	updatePlayer() {
		var mv = u.Pad.getStickCombiledWithKeys().mul(0.018);
		if (mv.len2() > 0) {
			movingTipsText.remove();
		}
		this.pos.add(mv);
		this.pos.clamp();
		u.Display.fitPosToPixel(this.pos);
		if (u.Key.button.isPressed || u.Pad.isPressed) {
			this.setShape();
			buttonTipsText.remove();
		}
	}
}

class Star extends u.Actor {
	scale: number;
	color: u.Color;

	init() {
		this.setDisplayPriotiry(0.1);
		this.scale = (0.01).randomRange(0.02);
		this.pos.set((1).randomTo(), -0.01);
		this.vel.set(0, (0.1).randomRange(0.2) * this.scale);
		this.color = new u.Color().copy(u.Color.white.getBlinkColor());
	}

	update() {
		if (this.pos.y > 1.01) {
			this.remove();
		}
		u.Display.fillRect(this.pos.x, this.pos.y,
			this.scale, this.scale, this.color, 0.2);
	}
}
