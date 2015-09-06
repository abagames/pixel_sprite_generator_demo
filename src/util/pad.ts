module u {
	export module Pad {
		export var stick = new SAT.Vector();
		export var isPressing = false;
		export var isPressed = false;
		
		export function getStickCombiledWithKeys() {
			stickCombiledWithKeys.copy(stick).add(Key.stick);
			var sl = stickCombiledWithKeys.len();
			if (sl > 1) {
				stickCombiledWithKeys.div(sl);
			}
			return stickCombiledWithKeys;
		}
		
		var stickCombiledWithKeys = new SAT.Vector();
		var stickThreshold = 0.5;

		export function update() {
			if (!navigator.getGamepads) {
				return;
			}
			var gamepads = navigator.getGamepads();
			if (gamepads.length <= 0) {
				return;
			}
			var gamepad = gamepads[0];
			if (!gamepad) {
				return;
			}
			stick.set();
			_.forEach(gamepad.axes, (axes, i) => {
				if (i % 2 === 0) {
					var x = axes;
					if (Math.abs(x) < stickThreshold) {
						x = 0;
					}
					stick.x += x;
				} else {
					var y = axes;
					if (Math.abs(y) < stickThreshold) {
						y = 0;
					}
					stick.y += y;
				}
			});
			var sl = stick.len();
			if (sl > 1) {
				stick.div(sl);
			}
			var ip = false;
			_.forEach(gamepad.buttons, (b) => {
				if (b.pressed) {
					ip = true;
					return false;
				}
			});
			isPressed = ip && !isPressing;
			isPressing = ip;
		}
	}
}
