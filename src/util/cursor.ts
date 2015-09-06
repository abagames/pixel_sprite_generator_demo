module u {
	export module Cursor {
		export var pos: SAT.Vector;
		export var isPressing = false;
		export var isPressed = false;
		export var isMoving = false;
		export var chasingPos: SAT.Vector;
		export var chasingTargetPos: SAT.Vector;

		export function init() {
			pos = new SAT.Vector().set(0.5);
			currentPos = new SAT.Vector().set(0.5);
			window.addEventListener('mousedown', onMouseDown);
			window.addEventListener('mousemove', onMouseMove);
			window.addEventListener('mouseup', onMouseUp);
			window.addEventListener('touchstart', onTouchStart);
			window.addEventListener('touchmove', onTouchMove);
			window.addEventListener('touchend', onTouchEnd);
		}

		export function setChasing(pos: SAT.Vector = null, speed: number = 0) {
			chasingPos = pos;
			chasingSpeed = speed;
			prevPos = new SAT.Vector().set(0.5);
			chasingTargetPos = new SAT.Vector().set(0.5);
		}

		var currentPos: SAT.Vector;
		var wasPressing = false;
		var wasMoving = false;
		var prevPos: SAT.Vector;
		var chasingSpeed = 0;

		function setPosByMoving(pageX: number, pageY: number) {
			wasMoving = true;
			var rect = Display.canvas.canvas.getBoundingClientRect();
			currentPos.set
				((pageX - rect.left) / rect.width, (pageY - rect.top) / rect.height).
				clamp();
		}

		function onMouseDown(event: MouseEvent) {
			isPressing = true;
			onMouseMove(event);
			resume();
		}

		function onMouseMove(event: MouseEvent) {
			event.preventDefault();
			setPosByMoving(event.pageX, event.pageY);
		}

		function onMouseUp(event: MouseEvent) {
			isPressing = false;
		}

		function onTouchStart(event: TouchEvent) {
			isPressing = true;
			onTouchMove(event);
			resume();
		}

		function onTouchMove(event: TouchEvent) {
			event.preventDefault();
			var touch = event.touches[0];
			setPosByMoving(touch.pageX, touch.pageY);
		}

		function onTouchEnd(event: TouchEvent) {
			isPressing = false;
		}

		export function update() {
			isPressed = false;
			if (disabledCount > 0) {
				if (!isPressing) {
					disabledCount--;
				}
				isPressing = wasPressing = isMoving = wasMoving = false;
				return;
			}
			pos.copy(currentPos);
			if (chasingPos) {
				if (isPressing) {
					if (!wasPressing) {
						isPressed = true;
						chasingTargetPos.copy(chasingPos);
						prevPos.copy(currentPos);
					}
					prevPos.sub(currentPos);
					chasingTargetPos.sub(prevPos);
				}
				prevPos.copy(currentPos);
			} else {
				if (isPressing) {
					if (!wasPressing) {
						isPressed = true;
					}
				}
			}
			wasPressing = isPressing;
			if (wasMoving) {
				isMoving = true;
				wasMoving = false;
				if (chasingPos && !isPressing) {
					chasingTargetPos.copy(currentPos);
				}
			} else {
				isMoving = false;
			}
			if (chasingPos) {
				chasingTargetPos.clamp();
				var angle = chasingPos.angleTo(chasingTargetPos);
				var distance = chasingPos.distanceTo(chasingTargetPos);
				chasingPos.addAngleLength(angle, distance.clamp(0, chasingSpeed));
			}
		}

		var disabledCount = 0;

		function setDisabledCount(count: number) {
			disabledCount = count;
		}
	}
}
