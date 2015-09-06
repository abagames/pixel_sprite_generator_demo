module u {
	export class Actor {
		pos = new SAT.Vector();
		vel = new SAT.Vector();
		angle = 0;
		speed = 0;
		ticks = 0;

		setPos(pos: SAT.Vector): Actor {
			this.pos.copy(pos);
			return this;
		}

		setXy(x: number, y: number): Actor {
			this.pos.set(x, y);
			return this;
		}
		
		setVelocity(vel: SAT.Vector): Actor {
			this.vel.copy(vel);
			return this;
		}
		
		setVelocityXy(x: number, y: number): Actor {
			this.vel.set(x, y);
			return this;
		}

		setAngle(angle: number): Actor {
			this.angle = angle;
			return this;
		}

		setSpeed(speed: number): Actor {
			this.speed = speed;
			return this;
		}

		// the init and update function	shoule be overriden
		init(...args: any[]) { }
		update() { }

		remove() {
			this.isRemoving = true;
		}

		setDisplayPriotiry(priotiry: number): Actor {
			if (this.group.displayPriority === priotiry) {
				return this;
			}
			this.group.displayPriority = priotiry;
			Actor.sortGroups();
			return this;
		}

		isRemoving = false;
		group: Actor.Group;

		constructor(...args: any[]) {
			var className = ('' + this.constructor)
				.replace(/^\s*function\s*([^\(]*)[\S\s]+$/im, '$1');
			_.forEach(Actor.groups, (group) => {
				if (group.name === className) {
					this.group = group;
					return false;
				}
			})
			if (!this.group) {
				this.group = new Actor.Group(className);
				Actor.groups.push(this.group);
				Actor.sortGroups();
			}
			this.group.actors.push(this);
			var argArray = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
			this.init.apply(this, argArray);
		}

		postUpdate() {
			this.pos.add(this.vel).addAngleLength(this.angle, this.speed);
			this.ticks++;
		}
	}

	export module Actor {
		export function get(clazz: any) {
			var className = ('' + clazz)
				.replace(/^\s*function\s*([^\(]*)[\S\s]+$/im, '$1');
			_.forEach(groups, (group) => {
				if (group.name === className) {
					return group.actors;
				}
			});
			return [];
		}

		export var groups: Actor.Group[] = [];

		export function clear() {
			groups = [];
		}

		export function update() {
			_.forEach(groups, (group) => {
				group.update();
			});
		}

		export function sortGroups() {
			groups.sort((v1, v2) => {
				return v1.displayPriority - v2.displayPriority;
			});
		}

		export class Group {
			displayPriority = 1;
			actors: Actor[];

			constructor(public name: string) {
				this.clear();
			}

			clear() {
				this.actors = [];
			}

			update() {
				var i = 0;
				while (i < this.actors.length) {
					var actor = this.actors[i];
					if (!actor.isRemoving) {
						actor.update();
					}
					if (actor.isRemoving) {
						this.actors.splice(i, 1);
					} else {
						actor.postUpdate();
						i++;
					}
				}
			}
		}
	}
}
