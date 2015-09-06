var u;
(function (u) {
    var Actor = (function () {
        function Actor() {
            var _this = this;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            this.pos = new SAT.Vector();
            this.vel = new SAT.Vector();
            this.angle = 0;
            this.speed = 0;
            this.ticks = 0;
            this.isRemoving = false;
            var className = ('' + this.constructor)
                .replace(/^\s*function\s*([^\(]*)[\S\s]+$/im, '$1');
            _.forEach(Actor.groups, function (group) {
                if (group.name === className) {
                    _this.group = group;
                    return false;
                }
            });
            if (!this.group) {
                this.group = new Actor.Group(className);
                Actor.groups.push(this.group);
                Actor.sortGroups();
            }
            this.group.actors.push(this);
            var argArray = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
            this.init.apply(this, argArray);
        }
        Actor.prototype.setPos = function (pos) {
            this.pos.copy(pos);
            return this;
        };
        Actor.prototype.setXy = function (x, y) {
            this.pos.set(x, y);
            return this;
        };
        Actor.prototype.setVelocity = function (vel) {
            this.vel.copy(vel);
            return this;
        };
        Actor.prototype.setVelocityXy = function (x, y) {
            this.vel.set(x, y);
            return this;
        };
        Actor.prototype.setAngle = function (angle) {
            this.angle = angle;
            return this;
        };
        Actor.prototype.setSpeed = function (speed) {
            this.speed = speed;
            return this;
        };
        // the init and update function	shoule be overriden
        Actor.prototype.init = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
        };
        Actor.prototype.update = function () { };
        Actor.prototype.remove = function () {
            this.isRemoving = true;
        };
        Actor.prototype.setDisplayPriotiry = function (priotiry) {
            if (this.group.displayPriority === priotiry) {
                return this;
            }
            this.group.displayPriority = priotiry;
            Actor.sortGroups();
            return this;
        };
        Actor.prototype.postUpdate = function () {
            this.pos.add(this.vel).addAngleLength(this.angle, this.speed);
            this.ticks++;
        };
        return Actor;
    })();
    u.Actor = Actor;
    var Actor;
    (function (Actor) {
        function get(clazz) {
            var className = ('' + clazz)
                .replace(/^\s*function\s*([^\(]*)[\S\s]+$/im, '$1');
            _.forEach(Actor.groups, function (group) {
                if (group.name === className) {
                    return group.actors;
                }
            });
            return [];
        }
        Actor.get = get;
        Actor.groups = [];
        function clear() {
            Actor.groups = [];
        }
        Actor.clear = clear;
        function update() {
            _.forEach(Actor.groups, function (group) {
                group.update();
            });
        }
        Actor.update = update;
        function sortGroups() {
            Actor.groups.sort(function (v1, v2) {
                return v1.displayPriority - v2.displayPriority;
            });
        }
        Actor.sortGroups = sortGroups;
        var Group = (function () {
            function Group(name) {
                this.name = name;
                this.displayPriority = 1;
                this.clear();
            }
            Group.prototype.clear = function () {
                this.actors = [];
            };
            Group.prototype.update = function () {
                var i = 0;
                while (i < this.actors.length) {
                    var actor = this.actors[i];
                    if (!actor.isRemoving) {
                        actor.update();
                    }
                    if (actor.isRemoving) {
                        this.actors.splice(i, 1);
                    }
                    else {
                        actor.postUpdate();
                        i++;
                    }
                }
            };
            return Group;
        })();
        Actor.Group = Group;
    })(Actor = u.Actor || (u.Actor = {}));
})(u || (u = {}));
/// <reference path="./util/actor.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var movingTipsText;
var buttonTipsText;
window.onload = function () {
    u.init(update);
    new Ship(true);
    movingTipsText = new u.Text('[udlr]: MOVE').setXy(0.1, 0.1).alignLeft().
        setDuration(180).setShowingFrom(120);
    buttonTipsText = new u.Text('[Z]: CHANGE SHAPE').setXy(0.1, 0.2).alignLeft().
        setDuration(180).setShowingFrom(180);
};
function update(time) {
    if (u.ticks % 60 == 0) {
        new Ship();
    }
    if (u.ticks % 10 == 0) {
        new Star();
    }
}
var Ship = (function (_super) {
    __extends(Ship, _super);
    function Ship() {
        _super.apply(this, arguments);
    }
    Ship.prototype.init = function (ip) {
        if (ip === void 0) { ip = false; }
        if (ip) {
            this.pos.set(.5, .7);
            this.scale = 1;
            this.particleFreq = 2;
        }
        else {
            this.scale = 0.5 + (1).randomTo() * (1).randomTo() * 3;
            this.pos.set(0.1.randomRange(0.9), -0.1 + (1).randomIntTo() * 1.2);
            this.vel.set(0.003.randomToPlusMinus(), 0.003.randomRange(0.015)).div(this.scale);
            this.particleFreq = 0.05 / this.vel.y;
            if (this.pos.y > 0) {
                this.particleFreq /= 3;
                this.vel.y *= -1;
            }
            this.particleFreq = Math.floor(this.particleFreq).clamp(2, 20);
        }
        this.setShape();
        this.isPlayer = ip;
    };
    Ship.prototype.setShape = function () {
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
    };
    Ship.prototype.update = function () {
        if (this.isPlayer) {
            this.updatePlayer();
        }
        else {
            if (!this.pos.isIn(0.12)) {
                this.remove();
            }
        }
        this.shape.render(this.pos.x, this.pos.y);
        if (u.ticks % this.particleFreq === 0) {
            new u.Particle().
                setXy(this.pos.x + (0).randomRange(.015 * this.scale), this.pos.y + .05 * this.scale).
                setColor(u.Color.cyan).
                setSize(0.02 * this.scale).setSpeed(0.01).
                setAngle(180).setAngleWidth(40);
        }
    };
    Ship.prototype.updatePlayer = function () {
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
    };
    return Ship;
})(u.Actor);
var Star = (function (_super) {
    __extends(Star, _super);
    function Star() {
        _super.apply(this, arguments);
    }
    Star.prototype.init = function () {
        this.setDisplayPriotiry(0.1);
        this.scale = (0.01).randomRange(0.02);
        this.pos.set((1).randomTo(), -0.01);
        this.vel.set(0, (0.1).randomRange(0.2) * this.scale);
        this.color = new u.Color().copy(u.Color.white.getBlinkColor());
    };
    Star.prototype.update = function () {
        if (this.pos.y > 1.01) {
            this.remove();
        }
        u.Display.fillRect(this.pos.x, this.pos.y, this.scale, this.scale, this.color, 0.2);
    };
    return Star;
})(u.Actor);
/// <reference path="../../typings/lodash/lodash.d.ts" />
/// <reference path="../../typings/sat/sat.d.ts" />
var u;
(function (u) {
    u.fps = 60;
    u.ticks = 0;
    u.score = 0;
    u.random;
    function init(updateFn) {
        u.random = new u.Random();
        updateFunc = updateFn;
        u.Display.init();
        u.Cursor.init();
        u.Key.init();
        u.Text.init();
        window.onblur = function (e) { return pause(); };
        window.onfocus = function (e) { return resume(); };
        requestAnimFrame(updateFrame);
    }
    u.init = init;
    var frameDelta = 0;
    var currentTime = 0;
    var prevTime = 0;
    var isBeginning = false;
    var isPaused = false;
    var frameInterval = 1000 / u.fps;
    var win = window;
    var requestAnimFrame = win.requestAnimationFrame ||
        win.webkitRequestAnimationFrame ||
        win.mozRequestAnimationFrame ||
        win.oRequestAnimationFrame ||
        win.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, frameInterval);
        };
    var updateFunc;
    var pausedText;
    function pause() {
        if (isPaused) {
            return;
        }
        isPaused = true;
        u.Display.clear();
        u.Key.reset();
        pausedText = new u.Text('PAUSED');
        pausedText.draw();
        u.Display.overlayCanvas.applyPixels();
    }
    function resume() {
        if (!isPaused) {
            return;
        }
        isPaused = false;
        pausedText.remove();
    }
    u.resume = resume;
    function preUpdate(time) {
        if (time) {
            currentTime = time;
        }
        else {
            currentTime = new Date().getTime();
        }
        frameDelta += (currentTime - prevTime) / frameInterval;
        prevTime = currentTime;
        /*if (frameDelta < 0.75) {
            requestAnimFrame(updateFrame);
            return false;
        }*/
        u.Key.update();
        if (u.Key.pause.isPressed) {
            if (!isPaused) {
                pause();
            }
            else {
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
        u.Display.preRender();
        u.Cursor.update();
        u.Pad.update();
        updateFunc();
        u.Actor.update();
        u.Display.postRender();
        postUpdate();
        u.ticks++;
    }
    function postUpdate() {
        frameDelta = 0;
        requestAnimFrame(updateFrame);
    }
})(u || (u = {}));
Number.prototype.clamp = function (min, max) {
    if (min === void 0) { min = 0; }
    if (max === void 0) { max = 1; }
    if (this < min) {
        return min;
    }
    else if (this > max) {
        return max;
    }
    else {
        return this;
    }
};
Number.prototype.wrap = function (min, max) {
    if (min === void 0) { min = 0; }
    if (max === void 0) { max = 1; }
    var w = max - min;
    var v = this - min;
    if (v >= 0) {
        return v % w + min;
    }
    else {
        return w + v % w + min;
    }
};
Number.prototype.normalizeAngle = function () {
    return this.wrap(-180, 180);
};
Number.prototype.randomTo = function () {
    return u.random.to(this);
};
Number.prototype.randomIntTo = function () {
    return u.random.intTo(this);
};
Number.prototype.randomRange = function (to) {
    if (to === void 0) { to = 1; }
    return u.random.range(this, to);
};
Number.prototype.randomIntRange = function (to) {
    if (to === void 0) { to = 1; }
    return u.random.intRange(this, to);
};
Number.prototype.randomToPlusMinus = function () {
    return u.random.toPlusMinus(this);
};
Number.prototype.randomIntToPlusMinus = function () {
    return u.random.intToPlusMinus(this);
};
var u;
(function (u) {
    var Color = (function () {
        function Color(red, green, blue) {
            if (red === void 0) { red = 0; }
            if (green === void 0) { green = 0; }
            if (blue === void 0) { blue = 0; }
            this.red = red;
            this.green = green;
            this.blue = blue;
        }
        Color.prototype.copy = function (color) {
            this.red = color.red;
            this.green = color.green;
            this.blue = color.blue;
            return this;
        };
        Color.prototype.normalize = function () {
            this.red = this.red.clamp();
            this.green = this.green.clamp();
            this.blue = this.blue.clamp();
            return this;
        };
        Color.prototype.getBlinkColor = function () {
            Color.blinkColor.copy(this);
            Color.blinkColor.changeValue(0.25.randomToPlusMinus(), 0.25.randomToPlusMinus(), 0.25.randomToPlusMinus());
            return Color.blinkColor;
        };
        Color.prototype.changeValue = function (red, green, blue) {
            this.red += red;
            this.green += green;
            this.blue += blue;
            this.normalize();
        };
        return Color;
    })();
    u.Color = Color;
    var Color;
    (function (Color) {
        var baseValue = 1;
        var whitnessValue = 0;
        Color.black = instance(0, 0, 0);
        Color.red = instance(1, 0, 0);
        Color.green = instance(0, 1, 0);
        Color.blue = instance(0, 0, 1);
        Color.yellow = instance(1, 1, 0);
        Color.magenta = instance(1, 0, 1);
        Color.cyan = instance(0, 1, 1);
        Color.white = instance(1, 1, 1);
        Color.blinkColor = new Color();
        function instance(red, green, blue) {
            return new Color(red * (baseValue - whitnessValue) + whitnessValue, green * (baseValue - whitnessValue) + whitnessValue, blue * (baseValue - whitnessValue) + whitnessValue);
        }
    })(Color = u.Color || (u.Color = {}));
})(u || (u = {}));
var u;
(function (u) {
    var Cursor;
    (function (Cursor) {
        Cursor.pos;
        Cursor.isPressing = false;
        Cursor.isPressed = false;
        Cursor.isMoving = false;
        Cursor.chasingPos;
        Cursor.chasingTargetPos;
        function init() {
            Cursor.pos = new SAT.Vector().set(0.5);
            currentPos = new SAT.Vector().set(0.5);
            window.addEventListener('mousedown', onMouseDown);
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
            window.addEventListener('touchstart', onTouchStart);
            window.addEventListener('touchmove', onTouchMove);
            window.addEventListener('touchend', onTouchEnd);
        }
        Cursor.init = init;
        function setChasing(pos, speed) {
            if (pos === void 0) { pos = null; }
            if (speed === void 0) { speed = 0; }
            Cursor.chasingPos = pos;
            chasingSpeed = speed;
            prevPos = new SAT.Vector().set(0.5);
            Cursor.chasingTargetPos = new SAT.Vector().set(0.5);
        }
        Cursor.setChasing = setChasing;
        var currentPos;
        var wasPressing = false;
        var wasMoving = false;
        var prevPos;
        var chasingSpeed = 0;
        function setPosByMoving(pageX, pageY) {
            wasMoving = true;
            var rect = u.Display.canvas.canvas.getBoundingClientRect();
            currentPos.set((pageX - rect.left) / rect.width, (pageY - rect.top) / rect.height).
                clamp();
        }
        function onMouseDown(event) {
            Cursor.isPressing = true;
            onMouseMove(event);
            u.resume();
        }
        function onMouseMove(event) {
            event.preventDefault();
            setPosByMoving(event.pageX, event.pageY);
        }
        function onMouseUp(event) {
            Cursor.isPressing = false;
        }
        function onTouchStart(event) {
            Cursor.isPressing = true;
            onTouchMove(event);
            u.resume();
        }
        function onTouchMove(event) {
            event.preventDefault();
            var touch = event.touches[0];
            setPosByMoving(touch.pageX, touch.pageY);
        }
        function onTouchEnd(event) {
            Cursor.isPressing = false;
        }
        function update() {
            Cursor.isPressed = false;
            if (disabledCount > 0) {
                if (!Cursor.isPressing) {
                    disabledCount--;
                }
                Cursor.isPressing = wasPressing = Cursor.isMoving = wasMoving = false;
                return;
            }
            Cursor.pos.copy(currentPos);
            if (Cursor.chasingPos) {
                if (Cursor.isPressing) {
                    if (!wasPressing) {
                        Cursor.isPressed = true;
                        Cursor.chasingTargetPos.copy(Cursor.chasingPos);
                        prevPos.copy(currentPos);
                    }
                    prevPos.sub(currentPos);
                    Cursor.chasingTargetPos.sub(prevPos);
                }
                prevPos.copy(currentPos);
            }
            else {
                if (Cursor.isPressing) {
                    if (!wasPressing) {
                        Cursor.isPressed = true;
                    }
                }
            }
            wasPressing = Cursor.isPressing;
            if (wasMoving) {
                Cursor.isMoving = true;
                wasMoving = false;
                if (Cursor.chasingPos && !Cursor.isPressing) {
                    Cursor.chasingTargetPos.copy(currentPos);
                }
            }
            else {
                Cursor.isMoving = false;
            }
            if (Cursor.chasingPos) {
                Cursor.chasingTargetPos.clamp();
                var angle = Cursor.chasingPos.angleTo(Cursor.chasingTargetPos);
                var distance = Cursor.chasingPos.distanceTo(Cursor.chasingTargetPos);
                Cursor.chasingPos.addAngleLength(angle, distance.clamp(0, chasingSpeed));
            }
        }
        Cursor.update = update;
        var disabledCount = 0;
        function setDisabledCount(count) {
            disabledCount = count;
        }
    })(Cursor = u.Cursor || (u.Cursor = {}));
})(u || (u = {}));
var u;
(function (u) {
    var Display;
    (function (Display) {
        Display.pixelSize = 128;
        function setPixel(x, y, color, bloom) {
            if (bloom === void 0) { bloom = 0; }
            setPixelByPixel(x * Display.pixelSize, y * Display.pixelSize, color, bloom);
        }
        Display.setPixel = setPixel;
        function setPixelByPixel(px, py, color, bloom) {
            if (bloom === void 0) { bloom = 0; }
            if (px < 0 || px >= Display.pixelSize) {
                return;
            }
            if (py < 0 || py >= Display.pixelSize) {
                return;
            }
            var r = color.red * 255;
            var g = color.green * 255;
            var b = color.blue * 255;
            Display.canvas.setPixel(Math.floor(px), Math.floor(py), r, g, b);
            if (bloom > 0) {
                PostEffect.addPixel(px, py, r * bloom, g * bloom, b * bloom);
            }
        }
        Display.setPixelByPixel = setPixelByPixel;
        function fillRect(x, y, width, height, color, bloom) {
            if (bloom === void 0) { bloom = 0; }
            var px = x * Display.pixelSize;
            var py = y * Display.pixelSize;
            var pw = width * Display.pixelSize;
            var ph = height * Display.pixelSize;
            fillRectByPixel(px, py, ph, pw, color, bloom);
        }
        Display.fillRect = fillRect;
        function fillRectByPixel(px, py, pw, ph, color, bloom) {
            if (bloom === void 0) { bloom = 0; }
            var r = color.red * 255;
            var g = color.green * 255;
            var b = color.blue * 255;
            var bx = px - pw / 2;
            var by = py - ph / 2;
            Display.canvas.fillRect(Math.floor(bx), Math.floor(by), Math.floor(pw), Math.floor(ph), r, g, b);
            if (bloom > 0) {
                PostEffect.addRect(bx, by, pw, ph, r * bloom, g * bloom, b * bloom);
            }
        }
        Display.fillRectByPixel = fillRectByPixel;
        function fitPosToPixel(pos) {
            pos.x = (Math.round(pos.x * u.Display.pixelSize) + 0.001) / u.Display.pixelSize;
            pos.y = (Math.round(pos.y * u.Display.pixelSize) + 0.001) / u.Display.pixelSize;
            return pos;
        }
        Display.fitPosToPixel = fitPosToPixel;
        Display.canvas;
        Display.overlayCanvas;
        var effectPixelSize = 32 + 2;
        var mainElement;
        var pixelScale;
        var resizeTimeout;
        function init() {
            mainElement = document.getElementById('main');
            Display.canvas = new PixelCanvas(Display.pixelSize, 'display');
            Display.overlayCanvas = new PixelCanvas(Display.pixelSize, 'overlay', true);
            PostEffect.init();
            resize();
            window.onresize = function () {
                if (resizeTimeout) {
                    clearTimeout(resizeTimeout);
                }
                resizeTimeout = setTimeout(function () {
                    resize();
                    resizeTimeout = null;
                }, 500);
            };
        }
        Display.init = init;
        function resize() {
            var cw = mainElement.clientWidth;
            var ch = mainElement.clientHeight;
            var cm = Math.min(cw, ch);
            pixelScale = Math.max(cm / Display.pixelSize, 1);
            var cs = Display.pixelSize * pixelScale;
            Display.canvas.resize(cs, cs, (cw - cs) / 2, (ch - cs) / 2);
            Display.overlayCanvas.resize(cs, cs, (cw - cs) / 2, (ch - cs) / 2);
            PostEffect.resize(cw, ch);
        }
        function clear() {
            Display.canvas.clearPixels();
            Display.canvas.applyPixels();
            PostEffect.clear();
            Display.overlayCanvas.clearPixels();
            Display.overlayCanvas.applyPixels();
        }
        Display.clear = clear;
        function preRender() {
            Display.canvas.clearPixels();
            PostEffect.preRender();
            Display.overlayCanvas.clearPixels();
        }
        Display.preRender = preRender;
        function postRender() {
            Display.canvas.applyPixels();
            PostEffect.postRender();
            Display.overlayCanvas.applyPixels();
        }
        Display.postRender = postRender;
        function capture(context) {
            Display.canvas.capture(context);
            PostEffect.capture(context);
            Display.overlayCanvas.capture(context);
        }
        Display.capture = capture;
        var PostEffect;
        (function (PostEffect) {
            var multiplier = 4;
            var margin = 2;
            var pixelSizeWithoutMargin = Display.pixelSize / multiplier;
            var pixelSize = pixelSizeWithoutMargin + margin * 2;
            var canvas;
            var isAvailable = false;
            var pixelTotals;
            function init() {
                canvas = new PixelCanvas(pixelSize, 'effect');
                pixelTotals = _.times(pixelSize * pixelSize, function () {
                    return { r: 0, g: 0, b: 0 };
                });
                isAvailable = true;
            }
            PostEffect.init = init;
            function resize(cw, ch) {
                var w = pixelSize * pixelScale * multiplier;
                var h = pixelSize * pixelScale * multiplier;
                canvas.resize(w, h, (cw - w) / 2, (ch - h) / 2);
            }
            PostEffect.resize = resize;
            function clear() {
                if (!isAvailable) {
                    return;
                }
                canvas.clear();
            }
            PostEffect.clear = clear;
            function addPixel(x, y, r, g, b) {
                addRect(x, y, multiplier, multiplier, r, g, b);
            }
            PostEffect.addPixel = addPixel;
            function addRect(x, y, width, height, r, g, b) {
                var w = Math.ceil(width / multiplier);
                var h = Math.ceil(height / multiplier);
                if (w < 1 || h < 1) {
                    return;
                }
                var pxr = x / multiplier;
                var px = Math.floor(pxr);
                pxr -= px + 0.5;
                var pyr = y / multiplier;
                var py = Math.floor(pyr);
                pyr -= py + 0.5;
                if (px < 0) {
                    var sx = -px;
                    px += sx;
                    w -= sx;
                }
                if (px + w > pixelSizeWithoutMargin) {
                    var sx = px + w - pixelSizeWithoutMargin;
                    w -= sx;
                }
                if (py < 0) {
                    var sy = -py;
                    px += sy;
                    h -= sy;
                }
                if (py + h > pixelSizeWithoutMargin) {
                    var sy = py + h - pixelSizeWithoutMargin;
                    h -= sy;
                }
                if (w < 1 || h < 1) {
                    return;
                }
                for (var ox = -1; ox <= w; ox++) {
                    var pox = px + ox + margin;
                    if (pox < 0 || pox >= pixelSize) {
                        continue;
                    }
                    var rx = 0;
                    if (ox === -1) {
                        if (pxr < 0) {
                            rx = -pxr;
                        }
                    }
                    else if (ox < w) {
                        rx = 0.5;
                    }
                    else {
                        if (pxr > 0) {
                            rx = pxr;
                        }
                    }
                    for (var oy = -1; oy <= h; oy++) {
                        var poy = py + oy + margin;
                        if (poy < 0 || poy >= pixelSize) {
                            continue;
                        }
                        var ry = 0;
                        if (oy === -1) {
                            if (pyr < 0) {
                                ry = -pyr;
                            }
                        }
                        else if (oy < h) {
                            ry = 0.5;
                        }
                        else {
                            if (pyr > 0) {
                                ry = pyr;
                            }
                        }
                        var i = pox + poy * pixelSize;
                        var rxy = rx + ry;
                        if (rxy > 0.1) {
                            var pt = pixelTotals[i];
                            pt.r += r * rxy;
                            pt.g += g * rxy;
                            pt.b += b * rxy;
                        }
                    }
                }
            }
            PostEffect.addRect = addRect;
            function preRender() {
                if (!isAvailable) {
                    return;
                }
                _.forEach(pixelTotals, function (pt) {
                    pt.r /= 2;
                    pt.g /= 2;
                    pt.b /= 2;
                });
            }
            PostEffect.preRender = preRender;
            function postRender() {
                if (!isAvailable) {
                    return;
                }
                var i = 0;
                var pi = 0;
                _.forEach(pixelTotals, function (pt) {
                    canvas.pixels[pi] = pt.r;
                    canvas.pixels[pi + 1] = pt.g;
                    canvas.pixels[pi + 2] = pt.b;
                    canvas.pixels[pi + 3] = (pt.r + pt.g + pt.b) / 3 / 3;
                    i++;
                    pi += 4;
                });
                canvas.applyPixels();
            }
            PostEffect.postRender = postRender;
            function capture(context) {
                if (!isAvailable) {
                    return;
                }
                canvas.capture(context);
            }
            PostEffect.capture = capture;
        })(PostEffect || (PostEffect = {}));
        var PixelCanvas = (function () {
            function PixelCanvas(pixelSize, elementId, isTransparent) {
                if (isTransparent === void 0) { isTransparent = false; }
                this.pixelSize = pixelSize;
                this.isTransparent = isTransparent;
                this.canvas = document.getElementById(elementId);
                this.canvas.width = this.canvas.height = pixelSize;
                this.context = this.canvas.getContext('2d');
                if (isTransparent) {
                    this.context.fillStyle = 'rgba(0, 0, 0, 0)';
                }
                else {
                    this.context.fillStyle = 'rgb(0, 0, 0)';
                }
                this.context.fillRect(0, 0, pixelSize, pixelSize);
                this.imageData = this.context.getImageData(0, 0, pixelSize, pixelSize);
                this.pixels = this.imageData.data;
            }
            PixelCanvas.prototype.resize = function (width, height, marginLeft, marginTop) {
                this.canvas.style.width = width + 'px';
                this.canvas.style.height = height + 'px';
                this.canvas.style.marginLeft = marginLeft + 'px';
                this.canvas.style.marginTop = marginTop + 'px';
            };
            PixelCanvas.prototype.clearPixels = function () {
                var pl = this.pixelSize * this.pixelSize * 4;
                if (this.isTransparent) {
                    for (var i = 0; i < pl; i += 4) {
                        this.pixels[i] = 0;
                        this.pixels[i + 1] = 0;
                        this.pixels[i + 2] = 0;
                        this.pixels[i + 3] = 0;
                    }
                }
                else {
                    for (var i = 0; i < pl; i += 4) {
                        this.pixels[i] = 0;
                        this.pixels[i + 1] = 0;
                        this.pixels[i + 2] = 0;
                    }
                }
            };
            PixelCanvas.prototype.setPixel = function (x, y, r, g, b, a) {
                if (a === void 0) { a = null; }
                var i = (x + y * this.pixelSize) * 4;
                this.pixels[i] = r;
                this.pixels[i + 1] = g;
                this.pixels[i + 2] = b;
                if (a) {
                    this.pixels[i + 3] = a;
                }
            };
            PixelCanvas.prototype.fillRect = function (x, y, width, height, r, g, b, a) {
                if (a === void 0) { a = null; }
                if ((x < 0 && x + width - 1 < 0) ||
                    (x >= Display.pixelSize && x + width - 1 >= Display.pixelSize) ||
                    (y < 0 && y + height - 1 < 0) ||
                    (y >= Display.pixelSize && y + height - 1 >= Display.pixelSize)) {
                    return;
                }
                var bx = x.clamp(0, Display.pixelSize - 1);
                var by = y.clamp(0, Display.pixelSize - 1);
                var ex = (x + width - 1).clamp(0, Display.pixelSize - 1);
                var ey = (y + height - 1).clamp(0, Display.pixelSize - 1);
                if (a) {
                    for (var y = by; y <= ey; y++) {
                        var i = (bx + y * Display.pixelSize) * 4;
                        for (var x = bx; x <= ex; x++, i += 4) {
                            this.pixels[i] = r;
                            this.pixels[i + 1] = g;
                            this.pixels[i + 2] = b;
                            this.pixels[i + 3] = a;
                        }
                    }
                }
                else {
                    for (var y = by; y <= ey; y++) {
                        var i = (bx + y * Display.pixelSize) * 4;
                        for (var x = bx; x <= ex; x++, i += 4) {
                            this.pixels[i] = r;
                            this.pixels[i + 1] = g;
                            this.pixels[i + 2] = b;
                        }
                    }
                }
            };
            PixelCanvas.prototype.clear = function () {
                this.clearPixels();
                this.applyPixels();
            };
            PixelCanvas.prototype.applyPixels = function () {
                this.context.putImageData(this.imageData, 0, 0);
            };
            PixelCanvas.prototype.capture = function (context) {
                context.drawImage(this.canvas, 0, 0);
            };
            return PixelCanvas;
        })();
    })(Display = u.Display || (u.Display = {}));
})(u || (u = {}));
var u;
(function (u) {
    var Key = (function () {
        function Key(keyCode) {
            this.isPressed = false;
            this.isPressing = false;
            if (keyCode instanceof Array) {
                this.keyCodes = keyCode;
            }
            else {
                this.keyCodes = [keyCode];
            }
        }
        Key.prototype.update = function () {
            this.isPressed = false;
            var id = this.isDown();
            this.isPressed = (id && !this.isPressing);
            this.isPressing = id;
        };
        Key.prototype.isDown = function () {
            return _.some(this.keyCodes, function (kc) { return Key.isDown[kc]; });
        };
        return Key;
    })();
    u.Key = Key;
    var Key;
    (function (Key) {
        Key.isDown = [];
        Key.up = new Key([38, 87, 73]);
        Key.right = new Key([39, 68, 76]);
        Key.down = new Key([40, 83, 75]);
        Key.left = new Key([37, 65, 74]);
        Key.button = new Key([90, 88, 190, 191, 32, 13, 16, 18]);
        Key.button1 = new Key([90, 190, 32, 13]);
        Key.button2 = new Key([88, 191, 16, 18]);
        Key.pause = new Key([80, 27]);
        Key.stick = new SAT.Vector();
        var keys = [Key.up, Key.right, Key.down, Key.left, Key.button, Key.button1, Key.button2, Key.pause];
        function init() {
            Key.isDown = _.times(256, function () { return false; });
            window.onkeydown = function (e) {
                var kc = e.keyCode;
                Key.isDown[kc] = true;
                if (kc >= 37 && kc <= 40) {
                    e.preventDefault();
                }
            };
            window.onkeyup = function (e) {
                Key.isDown[e.keyCode] = false;
            };
        }
        Key.init = init;
        function update() {
            _.forEach(keys, function (key) {
                key.update();
            });
            Key.stick.x = Key.stick.y = 0;
            if (Key.up.isDown()) {
                Key.stick.y = -1;
            }
            if (Key.right.isDown()) {
                Key.stick.x = 1;
            }
            if (Key.down.isDown()) {
                Key.stick.y = 1;
            }
            if (Key.left.isDown()) {
                Key.stick.x = -1;
            }
            var sl = Key.stick.len();
            if (sl > 1) {
                Key.stick.div(sl);
            }
        }
        Key.update = update;
        function reset() {
            Key.isDown = _.times(256, function () { return false; });
            update();
        }
        Key.reset = reset;
    })(Key = u.Key || (u.Key = {}));
})(u || (u = {}));
var u;
(function (u) {
    var Pad;
    (function (Pad) {
        Pad.stick = new SAT.Vector();
        Pad.isPressing = false;
        Pad.isPressed = false;
        function getStickCombiledWithKeys() {
            stickCombiledWithKeys.copy(Pad.stick).add(u.Key.stick);
            var sl = stickCombiledWithKeys.len();
            if (sl > 1) {
                stickCombiledWithKeys.div(sl);
            }
            return stickCombiledWithKeys;
        }
        Pad.getStickCombiledWithKeys = getStickCombiledWithKeys;
        var stickCombiledWithKeys = new SAT.Vector();
        var stickThreshold = 0.5;
        function update() {
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
            Pad.stick.set();
            _.forEach(gamepad.axes, function (axes, i) {
                if (i % 2 === 0) {
                    var x = axes;
                    if (Math.abs(x) < stickThreshold) {
                        x = 0;
                    }
                    Pad.stick.x += x;
                }
                else {
                    var y = axes;
                    if (Math.abs(y) < stickThreshold) {
                        y = 0;
                    }
                    Pad.stick.y += y;
                }
            });
            var sl = Pad.stick.len();
            if (sl > 1) {
                Pad.stick.div(sl);
            }
            var ip = false;
            _.forEach(gamepad.buttons, function (b) {
                if (b.pressed) {
                    ip = true;
                    return false;
                }
            });
            Pad.isPressed = ip && !Pad.isPressing;
            Pad.isPressing = ip;
        }
        Pad.update = update;
    })(Pad = u.Pad || (u.Pad = {}));
})(u || (u = {}));
var u;
(function (u) {
    var Particle = (function (_super) {
        __extends(Particle, _super);
        function Particle() {
            _super.apply(this, arguments);
            this.number = 1;
            this.angleWidth = 360;
            this.targetSize = 0.02;
            this.duration = 30;
            this.color = new u.Color().copy(u.Color.white);
            this.size = 0.01;
            this.isExpanding = true;
        }
        Particle.prototype.setPos = function (v) {
            _super.prototype.setPos.call(this, v);
            return this;
        };
        Particle.prototype.setXy = function (x, y) {
            if (y === void 0) { y = null; }
            _super.prototype.setXy.call(this, x, y);
            return this;
        };
        Particle.prototype.setNumber = function (number) {
            this.number = number;
            return this;
        };
        Particle.prototype.setAngle = function (angle) {
            _super.prototype.setAngle.call(this, angle);
            return this;
        };
        Particle.prototype.setAngleWidth = function (angleWidth) {
            this.angleWidth = angleWidth;
            return this;
        };
        Particle.prototype.setSpeed = function (speed) {
            _super.prototype.setSpeed.call(this, speed);
            return this;
        };
        Particle.prototype.setSize = function (size) {
            this.targetSize = size;
            return this;
        };
        Particle.prototype.setDuration = function (duration) {
            this.duration = duration;
            return this;
        };
        Particle.prototype.setColor = function (color) {
            this.color.copy(color);
            return this;
        };
        Particle.prototype.init = function () {
            this.speed = 0.01;
            this.setDisplayPriotiry(0);
        };
        Particle.prototype.update = function () {
            var _this = this;
            if (this.number > 0) {
                this.remove();
                var aw = this.angleWidth / 2;
                _.times(this.number, function () {
                    var a = new Particle();
                    a.setPos(_this.pos);
                    a.angle = _this.angle + (-aw).randomRange(aw);
                    a.speed = _this.speed * 0.5.randomRange(1.5);
                    a.color = _this.color;
                    a.targetSize = _this.targetSize;
                    a.duration = _this.duration * 0.5.randomRange(1.5);
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
            }
            else {
                this.size *= 0.95;
            }
            u.Display.fillRect(this.pos.x, this.pos.y, this.size, this.size, this.color.getBlinkColor(), 0.5);
            if (this.ticks >= this.duration - 1) {
                this.remove();
            }
        };
        return Particle;
    })(u.Actor);
    u.Particle = Particle;
})(u || (u = {}));
var u;
(function (u) {
    var Random = (function () {
        function Random() {
            this.setSeed();
        }
        Random.prototype.to = function (to) {
            if (to === void 0) { to = 1; }
            return this.rangeFrom0To1() * to;
        };
        Random.prototype.intTo = function (to) {
            if (to === void 0) { to = 1; }
            return Math.floor(this.to(to + 1));
        };
        Random.prototype.range = function (from, to) {
            if (from === void 0) { from = 0; }
            if (to === void 0) { to = 1; }
            return this.rangeFrom0To1() * (to - from) + from;
        };
        Random.prototype.intRange = function (from, to) {
            if (from === void 0) { from = 0; }
            if (to === void 0) { to = 1; }
            return Math.floor(this.range(from, to + 1));
        };
        Random.prototype.plusMinus = function () {
            return this.intRange() * 2 - 1;
        };
        Random.prototype.toPlusMinus = function (to) {
            if (to === void 0) { to = 1; }
            return this.range(-to, to);
        };
        Random.prototype.intToPlusMinus = function (to) {
            if (to === void 0) { to = 1; }
            return this.intRange(-to, to);
        };
        Random.prototype.setSeed = function (v) {
            if (v === void 0) { v = -0x7fffffff; }
            if (v === -0x7fffffff) {
                v = Math.floor(Math.random() * 0x7fffffff);
            }
            this.x = v = 1812433253 * (v ^ (v >> 30));
            this.y = v = 1812433253 * (v ^ (v >> 30)) + 1;
            this.z = v = 1812433253 * (v ^ (v >> 30)) + 2;
            this.w = v = 1812433253 * (v ^ (v >> 30)) + 3;
            return this;
        };
        Random.prototype.rangeFrom0To1 = function () {
            var t = this.x ^ (this.x << 11);
            this.x = this.y;
            this.y = this.z;
            this.z = this.w;
            this.w = (this.w ^ (this.w >> 19)) ^ (t ^ (t >> 8));
            return this.w / 0x7fffffff;
        };
        return Random;
    })();
    u.Random = Random;
})(u || (u = {}));
SAT.Vector.prototype.angle = function () {
    return Math.atan2(this.x, -this.y) * 180 / Math.PI;
};
SAT.Vector.prototype.set = function (x, y) {
    if (x === void 0) { x = 0; }
    if (y === void 0) { y = null; }
    this.x = x;
    if (!y) {
        this.y = x;
    }
    else {
        this.y = y;
    }
    return this;
};
SAT.Vector.prototype.addAngleLength = function (angle, length) {
    var ag = angle * Math.PI / 180;
    this.x += Math.sin(ag) * length;
    this.y -= Math.cos(ag) * length;
    return this;
};
SAT.Vector.prototype.mul = function (v) {
    this.x *= v;
    this.y *= v;
    return this;
};
SAT.Vector.prototype.div = function (v) {
    this.x /= v;
    this.y /= v;
    return this;
};
SAT.Vector.prototype.rotate = function (angle) {
    var x = this.x;
    var y = this.y;
    var ag = -angle * Math.PI / 180;
    this.x = x * Math.cos(ag) - y * Math.sin(ag);
    this.y = x * Math.sin(ag) + y * Math.cos(ag);
    return this;
};
SAT.Vector.prototype.clamp = function (minX, maxX, minY, maxY) {
    if (minX === void 0) { minX = 0; }
    if (maxX === void 0) { maxX = 1; }
    if (minY === void 0) { minY = null; }
    if (maxY === void 0) { maxY = null; }
    if (!minY) {
        minY = minX;
    }
    if (!maxY) {
        maxY = maxX;
    }
    this.x = this.x.clamp(minX, maxX);
    this.y = this.y.clamp(minY, maxY);
    return this;
};
SAT.Vector.prototype.isIn = function (spacing, minX, maxX, minY, maxY) {
    if (spacing === void 0) { spacing = 0; }
    if (minX === void 0) { minX = 0; }
    if (maxX === void 0) { maxX = 1; }
    if (minY === void 0) { minY = 0; }
    if (maxY === void 0) { maxY = 1; }
    var x = this.x;
    var y = this.y;
    return minX - spacing <= x && x <= maxX + spacing &&
        minY - spacing <= y && y <= maxY + spacing;
};
SAT.Vector.prototype.angleTo = function (other) {
    return Math.atan2(other.x - this.x, this.y - other.y) * 180 / Math.PI;
};
SAT.Vector.prototype.distanceTo = function (other) {
    var ox = other.x - this.x;
    var oy = other.y - this.y;
    return Math.sqrt(ox * ox + oy * oy);
};
/// <reference path="../../typings/pixel-sprite-generator/pixel-sprite-generator.d.ts" />
var u;
(function (u) {
    var Shape = (function () {
        function Shape(patterns, seed, scale, hue, saturation, isMirrorX, isMirrorY) {
            if (seed === void 0) { seed = null; }
            if (scale === void 0) { scale = 1; }
            if (hue === void 0) { hue = null; }
            if (saturation === void 0) { saturation = null; }
            if (isMirrorX === void 0) { isMirrorX = true; }
            if (isMirrorY === void 0) { isMirrorY = false; }
            this.edgeRgb = { r: 255, g: 255, b: 255 };
            var random = new u.Random();
            if (seed) {
                random.setSeed(seed);
            }
            random.rangeFrom0To1 = random.rangeFrom0To1.bind(random);
            psg.setRandomFunction(random.rangeFrom0To1);
            this.mask = this.createMask(patterns, scale, isMirrorX, isMirrorY);
            var options = {};
            if (hue) {
                options.hue = hue;
            }
            if (saturation) {
                options.saturation = saturation;
            }
            this.sprite = new psg.Sprite(this.mask, options);
            this.sprite.init();
            this.removeEmptyLines();
            this.width = this.sprite.width / u.Display.pixelSize;
            this.height = this.sprite.height / u.Display.pixelSize;
            if (hue && saturation) {
                this.sprite.hslToRgb(hue, saturation, 1, this.edgeRgb);
            }
            else {
                var hsl = this.sprite.getLastHsl();
                this.sprite.hslToRgb(hsl.h, hsl.s, 1, this.edgeRgb);
            }
            this.edgeRgb.r *= 255;
            this.edgeRgb.g *= 255;
            this.edgeRgb.b *= 255;
        }
        Shape.prototype.render = function (x, y, angle) {
            if (angle === void 0) { angle = 0; }
            if (angle === 0) {
                this.renderBasic(x, y);
            }
            else {
                this.renderRotate(x, y, angle);
            }
        };
        Shape.prototype.renderBasic = function (x, y) {
            var cp = this.calcPixelBeginEndPos(x, y);
            var overlayRatio = this.calcOverrayRatio();
            for (var py = cp.by, sy = cp.sby; py <= cp.ey; py++, sy++) {
                var pi = (cp.bx + py * u.Display.pixelSize) * 4;
                var sdi = cp.sbx + sy * this.sprite.width;
                var spi = sdi * 4;
                for (var px = cp.bx; px <= cp.ex; px++, pi += 4, sdi++, spi += 4) {
                    this.setPixel(pi, spi, sdi, overlayRatio);
                }
            }
        };
        Shape.prototype.renderRotate = function (x, y, angle) {
            var wh1 = new SAT.Vector(this.sprite.width / 2, this.sprite.height / 2);
            var wh2 = new SAT.Vector(this.sprite.width / 2, -this.sprite.height / 2);
            wh1.rotate(-angle);
            wh2.rotate(-angle);
            var w = Math.ceil(Math.max(Math.abs(wh1.x), Math.abs(wh2.x)) * 2);
            var h = Math.ceil(Math.max(Math.abs(wh1.y), Math.abs(wh2.y)) * 2);
            var cp = this.calcPixelBeginEndPos(x, y, w, h);
            var overlayRatio = this.calcOverrayRatio();
            var cpx = x * u.Display.pixelSize;
            var cpy = y * u.Display.pixelSize;
            var sp = new SAT.Vector();
            for (var py = cp.by; py <= cp.ey; py++) {
                var pi = (cp.bx + py * u.Display.pixelSize) * 4;
                for (var px = cp.bx; px <= cp.ex; px++, pi += 4) {
                    sp.x = (px - cpx);
                    sp.y = (py - cpy);
                    sp.rotate(angle);
                    sp.x = Math.floor(sp.x + this.sprite.width / 2);
                    sp.y = Math.floor(sp.y + this.sprite.height / 2);
                    if (sp.x >= 0 && sp.x < this.sprite.width &&
                        sp.y >= 0 && sp.y < this.sprite.height) {
                        var sdi = sp.x + sp.y * this.sprite.width;
                        var spi = sdi * 4;
                        this.setPixel(pi, spi, sdi, overlayRatio);
                    }
                }
            }
        };
        Shape.prototype.calcPixelBeginEndPos = function (x, y, width, height) {
            if (width === void 0) { width = this.sprite.width; }
            if (height === void 0) { height = this.sprite.height; }
            var pbx = Math.floor(x * u.Display.pixelSize - width / 2);
            var cpbx = pbx.clamp(0, u.Display.pixelSize - 1);
            var sbx = cpbx - pbx;
            var pby = Math.floor(y * u.Display.pixelSize - height / 2);
            var cpby = pby.clamp(0, u.Display.pixelSize - 1);
            var sby = cpby - pby;
            var cpex = (pbx + width - 1).clamp(0, u.Display.pixelSize - 1);
            var cpey = (pby + height - 1).clamp(0, u.Display.pixelSize - 1);
            return { bx: cpbx, ex: cpex, by: cpby, ey: cpey, sbx: sbx, sby: sby };
        };
        Shape.prototype.calcOverrayRatio = function () {
            var s = Math.sin(u.ticks * 3);
            return s * s * s * 0.8;
        };
        Shape.prototype.setPixel = function (pi, spi, sdi, overlayRatio) {
            if (this.sprite.pixels.data[spi + 3] > 0) {
                u.Display.canvas.pixels[pi] = this.sprite.pixels.data[spi];
                u.Display.canvas.pixels[pi + 1] = this.sprite.pixels.data[spi + 1];
                u.Display.canvas.pixels[pi + 2] = this.sprite.pixels.data[spi + 2];
            }
            if (this.sprite.data[sdi] === -1) {
                u.Display.overlayCanvas.pixels[pi] = this.edgeRgb.r * overlayRatio;
                u.Display.overlayCanvas.pixels[pi + 1] = this.edgeRgb.g * overlayRatio;
                u.Display.overlayCanvas.pixels[pi + 2] = this.edgeRgb.b * overlayRatio;
                u.Display.overlayCanvas.pixels[pi + 3] = 250 * overlayRatio;
            }
        };
        Shape.prototype.createMask = function (patterns, scale, isMirrorX, isMirrorY) {
            var pw = patterns[0].length;
            var ph = patterns.length;
            var w = Math.round(pw * scale);
            var h = Math.round(ph * scale);
            if (isMirrorX) {
                w += 1;
            }
            else {
                w += 2;
            }
            if (isMirrorY) {
                h += 1;
            }
            else {
                h += 2;
            }
            var patternArray = [];
            _.times(h, function (y) {
                var py = Math.floor((y - 1) / scale);
                patternArray = patternArray.concat(_.times(w, function (x) {
                    var px = Math.floor((x - 1) / scale);
                    if (px < 0 || px >= pw || py < 0 || py >= ph) {
                        return 0;
                    }
                    else {
                        var c = patterns[py].charAt(px);
                        switch (c) {
                            case '.':
                                return 0;
                            case '-':
                                return 1;
                            case 'x':
                                return 2;
                            case 'o':
                                return -1;
                            default:
                                throw new Error('invalid pattern char: ' + c);
                        }
                    }
                }));
            });
            return new psg.Mask(patternArray, w, h, isMirrorX, isMirrorY);
        };
        Shape.prototype.removeEmptyLines = function () {
            var _this = this;
            var xl = _.times(this.sprite.height, function () { return false; });
            var yl = _.times(this.sprite.width, function () { return false; });
            for (var y = 0; y < this.sprite.height; y++) {
                var si = y * this.sprite.width;
                for (var x = 0; x < this.sprite.width; x++, si++) {
                    if (this.sprite.data[si] != 0) {
                        xl[y] = yl[x] = true;
                    }
                }
            }
            var bx = 0;
            _.forEach(yl, function (l, i) {
                if (l) {
                    bx = i;
                    return false;
                }
            });
            var ex = 0;
            _.forEachRight(yl, function (l, i) {
                if (l) {
                    ex = i;
                    return false;
                }
            });
            var by = 0;
            _.forEach(xl, function (l, i) {
                if (l) {
                    by = i;
                    return false;
                }
            });
            var ey = 0;
            _.forEachRight(xl, function (l, i) {
                if (l) {
                    ey = i;
                    return false;
                }
            });
            var w = ex - bx + 1;
            var h = ey - by + 1;
            var data = [];
            var pixels = [];
            for (var y = by; y <= ey; y++) {
                var di = y * this.sprite.width + bx;
                var pi = di * 4;
                for (var x = bx; x <= ex; x++) {
                    data.push(this.sprite.data[di++]);
                    _.times(4, function () {
                        pixels.push(_this.sprite.pixels.data[pi++]);
                    });
                }
            }
            this.sprite.data = data;
            this.sprite.pixels.data = pixels;
            this.sprite.width = w;
            this.sprite.height = h;
        };
        return Shape;
    })();
    u.Shape = Shape;
})(u || (u = {}));
var u;
(function (u) {
    var Text = (function (_super) {
        __extends(Text, _super);
        function Text() {
            _super.apply(this, arguments);
            this.duration = 1;
            this.showingFrom = 0;
            this.showingTo = 0;
            this.xAlign = 0;
            this.yAlign = 0;
            this.color = new u.Color().copy(u.Color.white);
            this.scale = 1;
        }
        Text.prototype.init = function (text) {
            this.text = text;
            this.pos.set(0.5);
            this.setDisplayPriotiry(2);
        };
        Text.prototype.setPos = function (pos) {
            _super.prototype.setPos.call(this, pos);
            return this;
        };
        Text.prototype.setXy = function (x, y) {
            if (y === void 0) { y = null; }
            _super.prototype.setXy.call(this, x, y);
            return this;
        };
        Text.prototype.setVelocity = function (vel) {
            _super.prototype.setVelocity.call(this, vel);
            return this;
        };
        Text.prototype.setVelocityXy = function (x, y) {
            if (y === void 0) { y = null; }
            _super.prototype.setVelocityXy.call(this, x, y);
            return this;
        };
        Text.prototype.setDuration = function (duration) {
            this.duration = duration;
            return this;
        };
        Text.prototype.setDurationToInfinite = function () {
            return this.setDuration(Number.MAX_VALUE);
        };
        Text.prototype.setShowingFrom = function (from) {
            if (from === void 0) { from = 0; }
            this.showingFrom = from;
            return this;
        };
        Text.prototype.alignLeft = function () {
            this.xAlign = -1;
            return this;
        };
        Text.prototype.alignRight = function () {
            this.xAlign = 1;
            return this;
        };
        Text.prototype.alignTop = function () {
            this.yAlign = -1;
            return this;
        };
        Text.prototype.alignBottom = function () {
            this.yAlign = 1;
            return this;
        };
        Text.prototype.setColor = function (color) {
            this.color = color;
            return this;
        };
        Text.prototype.setScale = function (scale) {
            this.scale = scale;
            return this;
        };
        Text.prototype.update = function () {
            if (this.ticks === 0) {
                this.vel.div(this.duration);
                this.showingTo = this.showingFrom + this.duration;
            }
            if (this.ticks < this.showingFrom) {
                return;
            }
            this.draw();
            if (this.ticks >= this.showingTo) {
                this.remove();
            }
        };
        Text.prototype.draw = function () {
            var _this = this;
            var lw = this.scale * 5;
            var tx = Math.floor(this.pos.x * u.Display.pixelSize -
                (this.xAlign + 1) * this.text.length * lw / 2);
            var ty = Math.floor(this.pos.y * u.Display.pixelSize -
                (this.yAlign + 1) * 5 / 2);
            _.forEach(this.text, function (c) {
                var li = Text.charToIndex[c.charCodeAt(0)];
                if (li >= 0) {
                    Text.draw(li, tx, ty, _this.color, _this.scale);
                }
                else if (li === -2) {
                    throw 'Invalid char ' + c;
                }
                tx += lw;
            });
        };
        return Text;
    })(u.Actor);
    u.Text = Text;
    var Text;
    (function (Text) {
        var count = 66;
        var dotPatterns;
        Text.charToIndex;
        function init() {
            var patterns = [
                0x4644AAA4, 0x6F2496E4, 0xF5646949, 0x167871F4, 0x2489F697,
                0xE9669696, 0x79F99668, 0x91967979, 0x1F799976, 0x1171FF17,
                0xF99ED196, 0xEE444E99, 0x53592544, 0xF9F11119, 0x9DDB9999,
                0x79769996, 0x7ED99611, 0x861E9979, 0x994444E7, 0x46699699,
                0x6996FD99, 0xF4469999, 0x2224F248, 0x26244424, 0x64446622,
                0x84284248, 0x40F0F024, 0x0F0044E4, 0x480A4E40, 0x9A459124,
                0x000A5A16, 0x640444F0, 0x80004049, 0x40400004, 0x44444040,
                0x0AA00044, 0x6476E400, 0xFAFA61D9, 0xE44E4EAA, 0x24F42445,
                0xF244E544, 0x00000042
            ];
            var p = 0;
            var d = 32;
            var pindex = 0;
            dotPatterns = _.times(count, function () {
                var dots = [];
                _.times(5, function (y) {
                    _.times(4, function (x) {
                        if (++d >= 32) {
                            p = patterns[pindex++];
                            d = 0;
                        }
                        if ((p & 1) > 0) {
                            dots.push(new SAT.Vector(x, y));
                        }
                        p >>= 1;
                    });
                });
                return dots;
            });
            var charStr = "()[]<>=+-*/%&_!?,.:|'\"$@#\\urdl";
            Text.charToIndex = _.times(127, function (c) {
                if (c === 32) {
                    return -1;
                }
                else if (48 <= c && c < 58) {
                    return c - 48;
                }
                else if (65 <= c && c < 91) {
                    return c - 65 + 10;
                }
                else {
                    var ci = charStr.indexOf(String.fromCharCode(c));
                    if (ci >= 0) {
                        return ci + 36;
                    }
                    else {
                        return -2;
                    }
                }
            });
        }
        Text.init = init;
        function draw(i, x, y, color, scale) {
            var r = color.red * 255;
            var g = color.green * 255;
            var b = color.blue * 255;
            if (scale === 1) {
                _.forEach(dotPatterns[i], function (p) {
                    u.Display.overlayCanvas.setPixel(x + p.x, y + p.y, r, g, b, 255);
                });
            }
            else {
                _.forEach(dotPatterns[i], function (p) {
                    u.Display.overlayCanvas.fillRect(x + p.x * scale, y + p.y * scale, scale, scale, r, g, b, 255);
                });
            }
        }
        Text.draw = draw;
    })(Text = u.Text || (u.Text = {}));
})(u || (u = {}));
//# sourceMappingURL=app.js.map