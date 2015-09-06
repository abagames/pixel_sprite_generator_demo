/// <reference path="../../typings/lodash/lodash.d.ts" />
/// <reference path="../../typings/sat/sat.d.ts" />

module u {
	export var fps = 60;
	export var ticks = 0;
	export var score = 0;
	export var random: Random;

	export function init(updateFn: Function) {
		random = new Random();
		updateFunc = updateFn;
		Display.init();
		Cursor.init();
		Key.init();
		Text.init();		
		window.onblur = (e) => pause();
		window.onfocus = (e) => resume();
		requestAnimFrame(updateFrame);
	}
	
	var frameDelta = 0;
	var currentTime = 0;
	var prevTime = 0;
	var isBeginning = false;
	var isPaused = false;
	var frameInterval = 1000 / fps;
	var win: any = window;
	var requestAnimFrame =
		win.requestAnimationFrame ||
		win.webkitRequestAnimationFrame ||
		win.mozRequestAnimationFrame ||
		win.oRequestAnimationFrame ||
		win.msRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, frameInterval);
		};
	var updateFunc: Function;
	var pausedText: Text;
	
	function pause() {
		if (isPaused) {
			return;
		}
		isPaused = true;
		Display.clear();
		Key.reset();
		pausedText = new u.Text('PAUSED');
		pausedText.draw();
		Display.overlayCanvas.applyPixels();
	}

	export function resume() {
		if (!isPaused) {
			return;
		}
		isPaused = false;
		pausedText.remove();
	}
	
	function preUpdate(time): boolean {
		if (time) {
			currentTime = time;
		} else {
			currentTime = new Date().getTime();
		}
		frameDelta += (currentTime - prevTime) / frameInterval;
		prevTime = currentTime;
		/*if (frameDelta < 0.75) {
			requestAnimFrame(updateFrame);
			return false;
		}*/
		Key.update();
		if (Key.pause.isPressed) {
			if (!isPaused) {
				pause();
			} else {
				resume();
			}
		}
		if (isPaused) {
			postUpdate();
			return false;
		}
		return true;
	}
	
	function updateFrame(time) {
		if (!preUpdate(time)) {
			return;
		}
		Display.preRender();
		Cursor.update();
		Pad.update();
		updateFunc();
		Actor.update();
		Display.postRender();
		postUpdate();
		ticks++;
	}
	
	function postUpdate() {
		frameDelta = 0;
		requestAnimFrame(updateFrame);
	}
}

interface Number {
	clamp(min?: number, max?: number): number;
	wrap(min?: number, max?: number): number;
	normalizeAngle(): number;
	randomTo(): number;
	randomIntTo(): number;
	randomRange(to?:number): number;
	randomIntRange(to?:number): number;
	randomToPlusMinus(): number;
	randomIntToPlusMinus(): number;
}

Number.prototype.clamp = function(min: number = 0, max: number = 1): number {
	if (this < min) {
		return min;
	} else if (this > max) {
		return max;
	} else {
		return this;
	}
};

Number.prototype.wrap = function(min: number = 0, max: number = 1): number {
	var w = max - min;
	var v = this - min;
	if (v >= 0) {
		return v % w + min;
	} else {
		return w + v % w + min;
	}
};

Number.prototype.normalizeAngle = function() {
	return this.wrap(-180, 180);
};

Number.prototype.randomTo = function() {
	return u.random.to(this);
};

Number.prototype.randomIntTo = function() {
	return u.random.intTo(this);
};

Number.prototype.randomRange = function(to: number = 1) {
	return u.random.range(this, to);
};

Number.prototype.randomIntRange = function(to: number = 1) {
	return u.random.intRange(this, to);
};

Number.prototype.randomToPlusMinus = function() {
	return u.random.toPlusMinus(this);
};

Number.prototype.randomIntToPlusMinus = function() {
	return u.random.intToPlusMinus(this);
};
