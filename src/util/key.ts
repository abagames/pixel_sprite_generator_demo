module u {
	export class Key {
		isPressed = false;
		isPressing = false;
		
		keyCodes: number[];

		constructor(keyCode: any) {
			if (keyCode instanceof Array) {
				this.keyCodes = keyCode;
			} else {
				this.keyCodes = [keyCode];
			}
		}
		
		update() {
			this.isPressed = false;
			var id = this.isDown();
			this.isPressed = (id && !this.isPressing);
			this.isPressing = id;
		}
		
		isDown(): boolean {
			return _.some(this.keyCodes, (kc) => Key.isDown[kc]);
		}
	}

	export module Key {
		export var isDown: boolean[] = [];
		export var up = new Key([38, 87, 73]);
		export var right = new Key([39, 68, 76]);
		export var down = new Key([40, 83, 75]);
		export var left = new Key([37, 65, 74]);
		export var button = new Key([90, 88, 190, 191, 32, 13, 16, 18]);
		export var button1 = new Key([90, 190, 32, 13]);
		export var button2 = new Key([88, 191, 16, 18]);
		export var pause = new Key([80, 27]);
		export var stick = new SAT.Vector();
		
		var keys: Key[] = [up, right, down, left, button, button1, button2, pause];
		
		export function init() {
			isDown = _.times(256, () => false);
			window.onkeydown = (e: KeyboardEvent) => {
				var kc = e.keyCode;
				isDown[kc] = true;
				if (kc >= 37 && kc <= 40) {
					e.preventDefault();
				}
			};
			window.onkeyup = (e: KeyboardEvent) => {
				isDown[e.keyCode] = false;	
			};
		}

		export function update() {
			_.forEach(keys, (key: Key) => {
				key.update();
			});
			stick.x = stick.y = 0;
			if (up.isDown()) {
				stick.y = -1;
			}
			if (right.isDown()) {
				stick.x = 1;
			}
			if (down.isDown()) {
				stick.y = 1;
			}
			if (left.isDown()) {
				stick.x = -1;
			}
			var sl = stick.len(); 
			if (sl > 1) {
				stick.div(sl);
			}
		}
		
		export function reset() {
			isDown = _.times(256, () => false);
			update();
		}
	}
}
