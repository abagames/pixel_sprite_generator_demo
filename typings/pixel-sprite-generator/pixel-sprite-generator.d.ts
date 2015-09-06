declare module psg {
	class Mask {
		constructor(data: number[], width: number, height: number,
			mirrorX?:boolean, mirrorY?:boolean);
	}
	class Sprite {
		width: number;
		height: number;
		mask: Mask;
		data: Array<number>;
		pixels: { data: Array<number> };
		constructor(mask: Mask, options?: any);
		init();
		getLastHsl(): {h: number, s: number, l: number};
		hslToRgb(h: number, s: number, l: number, result: {r: number, g: number, b: number});		
	}
	
	function setRandomFunction(func: Function);
}
