SAT.Vector.prototype.angle = function(): number {
	return Math.atan2((<any>this).x, -(<any>this).y) * 180 / Math.PI;
}

SAT.Vector.prototype.set = function(x: number = 0, y: number = null) {
	(<any>this).x = x;
	if (!y) {
		(<any>this).y = x;
	} else {
		(<any>this).y = y;
	}
	return this;
};

SAT.Vector.prototype.addAngleLength = function(angle: number, length: number) {
	var ag = angle * Math.PI / 180;
	(<any>this).x += Math.sin(ag) * length;
	(<any>this).y -= Math.cos(ag) * length;
	return this;
};

SAT.Vector.prototype.mul = function(v: number) {
	(<any>this).x *= v;
	(<any>this).y *= v;
	return this;
};

SAT.Vector.prototype.div = function(v: number) {
	(<any>this).x /= v;
	(<any>this).y /= v;
	return this;
};

SAT.Vector.prototype.rotate = function(angle: number) {
	var x = (<any>this).x;
	var y = (<any>this).y;
	var ag = -angle * Math.PI / 180;
	(<any>this).x = x * Math.cos(ag) - y * Math.sin(ag);
    (<any>this).y = x * Math.sin(ag) + y * Math.cos(ag);	
	return this;
}

SAT.Vector.prototype.clamp = function
(minX: number = 0, maxX: number = 1, minY: number = null, maxY: number = null) {
	if (!minY) {
		minY = minX;
	}
	if (!maxY) {
		maxY = maxX;
	}
	(<any>this).x = (<any>this).x.clamp(minX, maxX);
	(<any>this).y = (<any>this).y.clamp(minY, maxY);
	return this;
}

SAT.Vector.prototype.isIn = function
(spacing: number = 0, minX: number = 0, maxX: number = 1, minY:number = 0, maxY:number = 1): boolean {
	var x: number = (<any>this).x;
	var y: number = (<any>this).y;
	return minX - spacing <= x && x <= maxX + spacing &&
		minY - spacing <= y && y <= maxY + spacing;
}

SAT.Vector.prototype.angleTo = function(other: SAT.Vector): number {
	return Math.atan2(other.x - (<any>this).x, (<any>this).y - other.y) * 180 / Math.PI;
}

SAT.Vector.prototype.distanceTo = function(other: SAT.Vector): number {
	var ox: number = other.x - (<any>this).x;
	var oy: number = other.y - (<any>this).y;
	return Math.sqrt(ox * ox + oy * oy);
}
