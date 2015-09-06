/**
 * Pixel Sprite Generator v0.0.2
 *
 * This is a JavaScript version of David Bollinger's pixelrobots and
 * pixelspaceships algorithm.
 *
 * More info:
 * http://www.davebollinger.com/works/pixelrobots/
 * http://www.davebollinger.com/works/pixelspaceships/
 *
 * Archived website (links above are down):
 * http://web.archive.org/web/20080228054405/http://www.davebollinger.com/works/pixelrobots/
 * http://web.archive.org/web/20080228054410/http://www.davebollinger.com/works/pixelspaceships/
 *
 */
 /*
  * Slightly changed by @abagames
  * - Pixels are directly stored in array. Canvas.context isn't used.
  * - Empty pixels are transparent.
  * - Hue and saturation can be specified directly.
  * - Enable to set the random function.
  */
(function(root) {

    /**
     *   The Mask class defines a 2D template form which sprites can be generated.
     *
     *   @class Mask
     *   @constructor
     *   @param {data} Integer array describing which parts of the sprite should be
     *   empty, body, and border. The mask only defines a semi-ridgid stucture
     *   which might not strictly be followed based on randomly generated numbers.
     *
     *      -1 = Always border (black)
     *       0 = Empty
     *       1 = Randomly chosen Empty/Body
     *       2 = Randomly chosen Border/Body
     *
     *   @param {width} Width of the mask data array
     *   @param {height} Height of the mask data array
     *   @param {mirrorX} A boolean describing whether the mask should be mirrored on the x axis
     *   @param {mirrorY} A boolean describing whether the mask should be mirrored on the y axis
     */
    function Mask(data, width, height, mirrorX, mirrorY) {
        this.width   = width;
        this.height  = height;
        this.data    = data;
        this.mirrorX = typeof mirrorX !== 'undefined' ? mirrorX : true;
        this.mirrorY = typeof mirrorY !== 'undefined' ? mirrorY : true;
    }

    /**
    *   The Sprite class makes use of a Mask instance to generate a 2D sprite on a
    *   HTML canvas.
    *
    *   var options = {
    *       colored         : true,   // boolean
    *       edgeBrightness  : 0.3,    // value from 0 to 1
    *       colorVariations : 0.2,    // value from 0 to 1
    *       brightnessNoise : 0.3,    // value from 0 to 1
    *       saturation      : 0.5     // value from 0 to 1
    *   }
    *
    *   @class Sprite
    *   @param {mask}
    *   @param {options} 
    *   @constructor
    */
    function Sprite(mask, options) {
        this.width     = mask.width * (mask.mirrorX ? 2 : 1);
        this.height    = mask.height * (mask.mirrorY ? 2 : 1);
        this.mask      = mask;
        this.data      = new Array(this.width * this.height);

        this.options = options || {};

        var defaults = {
            colored         : true,
            edgeBrightness  : 0.3,
            colorVariations : 0.2,
            brightnessNoise : 0.3,
            saturation      : 0.5,
            hue             : null
        };

        // Set default options
        for (var prop in defaults) {
            if (defaults.hasOwnProperty(prop)) {
                var val = this.options[prop];

                // If the option was not provided
                if (typeof val === 'undefined') {

                    // Set it to the default value
                    val = defaults[prop];
                }

                this.options[prop] = val;
            }
        }

        this.init();
    }


    /**
    *   The init method calls all functions required to generate the sprite.
    *
    *   @method init
    *   @returns {undefined}
    */
    Sprite.prototype.init = function() {
        //this.initCanvas();
        this.initContext();
        this.initData();

        this.applyMask();
        this.generateRandomSample();

        if (this.mask.mirrorX) {
            this.mirrorX();
        }

        if (this.mask.mirrorY) {
            this.mirrorY();
        }

        this.generateEdges();
        this.renderPixelData();
    };

    /**
    *   The initCanvas method creates a HTML canvas element for internal use.
    *
    *   (note: the canvas element is not added to the DOM)
    *
    *   @method initCanvas
    *   @returns {undefined}
    */
    Sprite.prototype.initCanvas = function() {
      this.canvas = document.createElement('canvas');
       
      this.canvas.width  = this.width;
      this.canvas.height = this.height;
    };

    /**
    *   The initContext method requests a CanvasRenderingContext2D from the
    *   internal canvas object.
    *
    *   @method 
    *   @returns {undefined}
    */
    Sprite.prototype.initContext = function() {
      //this.ctx    = this.canvas.getContext('2d');
      //this.pixels = this.ctx.createImageData(this.width, this.height);
      this.pixels = {};
      this.pixels.data = new Array(this.width * this.height * 4);
    };

    /**
    *   The getData method returns the sprite template data at location (x, y)
    *
    *      -1 = Always border (black)
    *       0 = Empty
    *       1 = Randomly chosen Empty/Body
    *       2 = Randomly chosen Border/Body
    *
    *   @method getData
    *   @param {x}
    *   @param {y}
    *   @returns {undefined}
    */
    Sprite.prototype.getData = function(x, y) {
        return this.data[y * this.width + x];
    };

    /**
    *   The setData method sets the sprite template data at location (x, y)
    *
    *      -1 = Always border (black)
    *       0 = Empty
    *       1 = Randomly chosen Empty/Body
    *       2 = Randomly chosen Border/Body
    *
    *   @method setData
    *   @param {x}
    *   @param {y}
    *   @param {value}
    *   @returns {undefined}
    */
    Sprite.prototype.setData = function(x, y, value) {
        this.data[y * this.width + x] = value;
    };

    /**
    *   The initData method initializes the sprite data to completely solid.
    *
    *   @method initData
    *   @returns {undefined}
    */
    Sprite.prototype.initData = function() {
        var h = this.height;
        var w = this.width;
        var x, y;
        for (y = 0; y < h; y++) {
            for (x = 0; x < w; x++) {
                this.setData(x, y, -1);
            }
        }
    };

    /**
    *   The mirrorX method mirrors the template data horizontally.
    *
    *   @method mirrorX
    *   @returns {undefined}
    */
    Sprite.prototype.mirrorX = function() {
        var h = this.height;
        var w = Math.floor(this.width/2);
        var x, y;
        for (y = 0; y < h; y++) {
            for (x = 0; x < w; x++) {
                this.setData(this.width - x - 1, y, this.getData(x, y));
            }
        }
    };

    /**
    *   The mirrorY method mirrors the template data vertically.
    *
    *   @method 
    *   @returns {undefined}
    */
    Sprite.prototype.mirrorY = function() {
        var h = Math.floor(this.height/2);
        var w = this.width;
        var x, y;
        for (y = 0; y < h; y++) {
            for (x = 0; x < w; x++) {
                this.setData(x, this.height - y - 1, this.getData(x, y));
            }
        }
    };

    /**
    *   The applyMask method copies the mask data into the template data array at
    *   location (0, 0).
    *
    *   (note: the mask may be smaller than the template data array)
    *
    *   @method applyMask
    *   @returns {undefined}
    */
    Sprite.prototype.applyMask = function() {
        var h = this.mask.height;
        var w = this.mask.width;

        var x, y;
        for (y = 0; y < h; y++) {
            for (x = 0; x < w; x++) {
                this.setData(x, y, this.mask.data[y * w + x]);
            }
        }
    };

    /**
    *   Apply a random sample to the sprite template.
    *
    *   If the template contains a 1 (internal body part) at location (x, y), then
    *   there is a 50% chance it will be turned empty. If there is a 2, then there
    *   is a 50% chance it will be turned into a body or border.
    *
    *   (feel free to play with this logic for interesting results)
    *
    *   @method generateRandomSample
    *   @returns {undefined}
    */
    Sprite.prototype.generateRandomSample = function() {
        var h = this.height;
        var w = this.width;

        var x, y;
        for (y = 0; y < h; y++) {
            for (x = 0; x < w; x++) {
                var val = this.getData(x, y);

                if (val === 1) {
                    val = val * Math.round(randomFunc());
                } else if (val === 2) {
                    if (randomFunc() > 0.5) {
                        val = 1;
                    } else {
                        val = -1;
                    }
                } 

                this.setData(x, y, val);
            }
        }
    };

    /**
    *   This method applies edges to any template location that is positive in
    *   value and is surrounded by empty (0) pixels.
    *
    *   @method generateEdges
    *   @returns {undefined}
    */
    Sprite.prototype.generateEdges = function() {
        var h = this.height;
        var w = this.width;

        var x, y;
        for (y = 0; y < h; y++) {
            for (x = 0; x < w; x++) {
                if (this.getData(x, y) > 0) {
                    if (y - 1 >= 0 && this.getData(x, y-1) === 0) {
                        this.setData(x, y-1, -1);
                    }
                    if (y + 1 < this.height && this.getData(x, y+1) === 0) {
                        this.setData(x, y+1, -1);
                    }
                    if (x - 1 >= 0 && this.getData(x-1, y) === 0) {
                        this.setData(x-1, y, -1);
                    }
                    if (x + 1 < this.width && this.getData(x+1, y) === 0) {
                        this.setData(x+1, y, -1);
                    }
                }
            }
        }
    };

    /**
    *   This method renders out the template data to a HTML canvas to finally
    *   create the sprite.
    *
    *   (note: only template locations with the values of -1 (border) are rendered)
    *
    *   @method renderPixelData
    *   @returns {undefined}
    */
    Sprite.prototype.renderPixelData = function() {
        var isVerticalGradient = randomFunc() > 0.5;
        var saturation         = Math.max(Math.min(this.options.saturation + randomFunc() * 0.2 - 0.1, 1), 0);
        var hue                = this.getHueValue();

        var u, v, ulen, vlen;
        if (isVerticalGradient) {
            ulen = this.height;
            vlen = this.width;
        } else {
            ulen = this.width;
            vlen = this.height;
        }

        for (u = 0; u < ulen; u++) {
            // Create a non-uniform random number between 0 and 1 (lower numbers more likely)
            var isNewColor = Math.abs(((randomFunc() * 2 - 1) 
                                     + (randomFunc() * 2 - 1) 
                                     + (randomFunc() * 2 - 1)) / 3);

            // Only change the color sometimes (values above 0.8 are less likely than others)
            if (isNewColor > (1 - this.options.colorVariations)) {
                hue = this.getHueValue();
            }

            for (v = 0; v < vlen; v++) {
                var val, index;
                if (isVerticalGradient) {
                    val   = this.getData(v, u);
                    index = (u * vlen + v) * 4;
                } else {
                    val   = this.getData(u, v);
                    index = (v * ulen + u) * 4;
                }

                var rgb = { r: 0, g: 0, b: 0, a: 0 };

                if (val !== 0) {
                    rgb.a = 1;
                    if (this.options.colored) {
                        // Fade brightness away towards the edges
                        var brightness = Math.sin((u / ulen) * Math.PI) * (1 - this.options.brightnessNoise) 
                                       + randomFunc() * this.options.brightnessNoise;

                        // Get the RGB color value
                        this.hslToRgb(hue, saturation, brightness, /*out*/ rgb);

                        // If this is an edge, then darken the pixel
                        if (val === -1) {
                            rgb.r *= this.options.edgeBrightness;
                            rgb.g *= this.options.edgeBrightness;
                            rgb.b *= this.options.edgeBrightness;
                        }

                    }  else {
                        // Not colored, simply output black
                        if (val === -1) {
                            rgb.r = 0;
                            rgb.g = 0;
                            rgb.b = 0;
                        }
                    }
                }

                this.pixels.data[index + 0] = rgb.r * 255;
                this.pixels.data[index + 1] = rgb.g * 255;
                this.pixels.data[index + 2] = rgb.b * 255;
                this.pixels.data[index + 3] = rgb.a * 255;
            }
        }

        //this.ctx.putImageData(this.pixels, 0, 0);
    };

    Sprite.prototype.getHueValue = function() {
        var hue;
        if (this.options.hue) {
            hue = this.options.hue + randomFunc() * 0.2 - 0.1;
            if (hue >= 1) {
                hue -= 1;
            } else if (hue < 0) {
                hue += 1;
            }
        } else {
            hue = randomFunc();
        }
        return hue;
    };
    
    var lastHsl;

    /**
    *   This method converts HSL color values to RGB color values.
    *
    *   @method hslToRgb
    *   @param {h}
    *   @param {s}
    *   @param {l}
    *   @param {result}
    *   @returns {result}
    */
    Sprite.prototype.hslToRgb = function(h, s, l, result) {
        if (typeof result === 'undefined') {
            result = { r: 0, g: 0, b: 0 };
        }

        var i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = l * (1 - s);
        q = l * (1 - f * s);
        t = l * (1 - (1 - f) * s);
        
        switch (i % 6) {
            case 0: result.r = l, result.g = t, result.b = p; break;
            case 1: result.r = q, result.g = l, result.b = p; break;
            case 2: result.r = p, result.g = l, result.b = t; break;
            case 3: result.r = p, result.g = q, result.b = l; break;
            case 4: result.r = t, result.g = p, result.b = l; break;
            case 5: result.r = l, result.g = p, result.b = q; break;
        }

        lastHsl = { h: h, s: s, l: l};
        return result;
    };
    
    Sprite.prototype.getLastHsl = function() {
        return lastHsl;
    };

    /**
    *   This method converts the template data to a string value for debugging
    *   purposes.
    *
    *   @method toString
    *   @returns {undefined}
    */
    Sprite.prototype.toString = function() {
        var h = this.height;
        var w = this.width;
        var x, y, output = '';
        for (y = 0; y < h; y++) {
            for (x = 0; x < w; x++) {
                var val = this.getData(x, y);
                output += val >= 0 ? ' ' + val : '' + val;
            }
            output += '\n';
        }
        return output;
    };
    
    var randomFunc = Math.random;

    function setRandomFunction(func) {
        randomFunc = func;
    };

    // Pixel Sprite Generator module
    var psg = {
        version: "v0.0.2",
        Sprite: Sprite,
        Mask: Mask,
        setRandomFunction: setRandomFunction
    };

    // Export psg module
    root.psg = psg;
})(window);
