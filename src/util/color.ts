module u {
	export class Color {
		constructor
			(public red: number = 0,
			public green: number = 0,
			public blue: number = 0) { }

		copy(color: Color): Color {
			this.red = color.red;
			this.green = color.green;
			this.blue = color.blue;
			return this;
		}

		normalize(): Color {
			this.red = this.red.clamp();
			this.green = this.green.clamp();
			this.blue = this.blue.clamp();
			return this;
		}

		getBlinkColor(): Color {
			Color.blinkColor.copy(this);
			Color.blinkColor.changeValue
				(0.25.randomToPlusMinus(),
				0.25.randomToPlusMinus(),
				0.25.randomToPlusMinus());
			return Color.blinkColor;
		}

		changeValue(red: number, green: number, blue: number) {
			this.red += red;
			this.green += green;
			this.blue += blue;
			this.normalize();
		}
	}

	export module Color {
		var baseValue = 1;
		var whitnessValue = 0;
		export var black: Color = instance(0, 0, 0);
		export var red: Color = instance(1, 0, 0);
		export var green: Color = instance(0, 1, 0);
		export var blue: Color = instance(0, 0, 1);
		export var yellow: Color = instance(1, 1, 0);
		export var magenta: Color = instance(1, 0, 1);
		export var cyan: Color = instance(0, 1, 1);
		export var white: Color = instance(1, 1, 1);
		export var blinkColor = new Color();

		function instance(red: number, green: number, blue: number) {
			return new Color(
				red * (baseValue - whitnessValue) + whitnessValue,
				green * (baseValue - whitnessValue) + whitnessValue,
				blue * (baseValue - whitnessValue) + whitnessValue);
		}
	}
}
