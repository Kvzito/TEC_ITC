/*
 * Collection of classes that will be used in the games
 *
 * Gilberto Echeverria
 * 2025-02-25
 */

class Vec {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    plus(other) {
        return new Vec(this.x + other.x, this.y + other.y);
    }

    minus(other) {
        return new Vec(this.x - other.x, this.y - other.y);
    }

    times(scalar) {
        return new Vec(this.x * scalar, this.y * scalar);
    }

    magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
}


/*
 * Test the Vector class
 */
//let p = new Vec(0, 8);
//let v = new Vec(1, 1);
//console.log("Initial position: ", p);
//p = p.plus(v.times(1));
//console.log("New position: ", p);
//console.log("plus: ", p.plus(v));
//console.log("minus: ", p.minus(v));
//console.log("times: ", p.times(3));
//console.log("magnitude: ", p.magnitude());

class Rect {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}


class GameObject {
    constructor(position, width, height, color, type) {
        this.position = position;
        this.width = width;
        this.height = height;
        this.color = color;
        this.type = type;

        // Sprite properties
        this.spriteImage = undefined;
        this.spriteRect = undefined;
    }

    setSprite(imagePath, rect) {
        this.spriteImage = new Image();
        this.spriteImage.src = imagePath;
        if (rect) {
            this.spriteRect = rect;
        }
    }

    draw(ctx) {
        if (this.spriteImage) {
            if (this.spriteRect) {
                ctx.drawImage(this.spriteImage,
                            this.spriteRect.x, this.spriteRect.y,
                            this.spriteRect.width, this.spriteRect.height,
                            this.position.x, this.position.y,
                            this.width, this.height);
            } else {
                ctx.drawImage(this.spriteImage,
                              this.position.x, this.position.y,
                              this.width, this.height);
                              //this.position.x * scale, this.position.y * scale,
                              //this.width * scale, this.height * scale);       
            }
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.position.x, this.position.y,
                         this.width, this.height);
        }
    }

    // Empty template for all GameObjects to be able to update
    update() {

    }
}

class TextLabel {
    constructor(x, y, font, color) {
        this.x = x;
        this.y = y;
        this.font = font;
        this.color = color;
    }

    draw(ctx, text) {
        ctx.font = this.font;
        ctx.fillStyle = this.color;
        ctx.fillText(text, this.x, this.y);
    }
}

// Detect a collision of two box objects
function boxOverlap(obj1, obj2) {
    return obj1.position.x + obj1.width > obj2.position.x &&
           obj1.position.x < obj2.position.x + obj2.width &&
           obj1.position.y + obj1.height > obj2.position.y &&
           obj1.position.y < obj2.position.y + obj2.height;
}

class AnimatedObject extends GameObject {
    constructor (color, width, height, x, y, type){
        super(color, width, height, x, y, type);
        this.frame = 0;
        this.minFrame = 0;
        this.maxFrame = 0;
        this.sheetCols = 0;
        this.frameTime = 0;
        this.totalTime = 0;
    }

    setAnimation(minFrame, maxFrame){
        this.minFrame = minFrame;
        this.maxFrame = maxFrame;
        this.frame = minFrame;
    }

    updateFrame(deltaTime){
        this.totalTime += deltaTime;
        if (this.totalTime > this.frameTime){
            this.frame = this.frame < this.maxFrame ? this.frame + 1 : this.minFrame;
            this.spriteRect.x = this.frame % this.sheetCols;
            this.spriteRect.y = Math.floor(this.frame / this.sheetCols);
            this.totalTime = 0;
        }
    }
}
