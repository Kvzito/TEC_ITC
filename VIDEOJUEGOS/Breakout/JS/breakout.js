/*
Práctica Conceptos Básicos de Videojuegos

Kevin Javier Esquivel Villafuerte
2025-03-11
*/

"use strict;"

const canvasWidth = 800;
const canvasHeight = 600;

let oldTime;
const paddleVelocity = 1.0;
const speedIncrease = 1.01;
const initialSpeed = 0.5;
let playerLives = 2;
let playerScore = 0;
let brickRows = 5;
let brickCols = 10;
let instaWin = false;



// Context of the Canvas
let ctx;

// Clase para la bola

class Ball extends GameObject {
    constructor(position, width, height, color, type) {
        super(position, width, height, color, "ball");
        this.reset();
    }
    
    draw(ctx) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update(deltaTime) {
        this.position = this.position.plus(this.velocity.times(deltaTime));
    }

    initVelocity() {
        this.inPlay = true;
        let angle = Math.random() * (Math.PI) - (Math.PI / 18);
        this.velocity = new Vec(Math.cos(angle), Math.sin(angle)).times(initialSpeed);
        // Select a random direction for the serve
        this.velocity.x *= (Math.random() < 0.5) ? 1 : -1;
    }

    reset() {
        this.inPlay = false;
        this.position = new Vec(canvasWidth / 2, canvasHeight / 2);
        this.velocity = new Vec(0, 0);
    }
}

// Clase para la paleta del jugador

class Paddle extends GameObject {
    constructor(position, width, height, color) {
        super(position, width, height, color, "paddle");
        this.velocity = new Vec(0.0, 0.0);
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update(deltaTime) {
        this.position = this.position.plus(this.velocity.times(deltaTime));

        if (this.position.x < 0) {
            this.position.x = 0;
        } else if (this.position.x + this.width > canvasWidth) {
            this.position.x = canvasWidth - this.width;
        }
    }
}

// Clase para los ladrillos
class Brick extends GameObject {
    constructor(position, width, height, color) {
        super(position, width, height, color, "brick");
        this.destroyed = false;
    }

    draw(ctx) {
        if (!this.destroyed) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
    }

    destroy() {
        this.destroyed = true;
    }
}

const bricks = [];
const brickWidth = 70;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 10;

for (let row = 0; row < brickRows; row++) {
    for (let col = 0; col < brickCols; col++) {
        const x = col * (brickWidth + brickPadding) + brickOffsetLeft;
        const y = row * (brickHeight + brickPadding) + brickOffsetTop;
        bricks.push(new Brick(new Vec(x, y), brickWidth, brickHeight, 'red'));
    }
}


const box = new Ball(new Vec(canvasWidth/2, canvasHeight*3/40   ), 15, 15, 'black');
const userPaddle = new Paddle(new Vec(canvasWidth*41/100, canvasHeight-25), 150, 10, 'darkblue');
const leftBarrier = new GameObject(new Vec(0, 0), 8, canvasHeight, 'black', 'barrier');
const rightBarrier = new GameObject(new Vec(canvasWidth-8, 0), 8, canvasHeight, 'black', 'barrier');
const topBarrier = new GameObject(new Vec(0, 0), canvasWidth, 8, 'black', 'barrier');
const bottomGoal = new GameObject(new Vec(8, canvasHeight-8), canvasWidth-16, 8, 'purple', 'goal');
const vidasLabel = new TextLabel(30, canvasHeight-60, "15px Ubuntu Mono", "black");
const startLabel = new TextLabel(canvasWidth*39/100, canvasHeight-100, "15px Ubuntu Mono", "black");
const scoreLabel = new TextLabel(30, canvasHeight-30, "15px Ubuntu Mono", "black");
const winLabel = new TextLabel(canvasWidth*25/100, canvasHeight/2, "30px Ubuntu Mono", "black");

function main(){
    const canvas = document.getElementById('canvas');
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx = canvas.getContext('2d');


    createEventListeners();

    drawScene(0);
}

function createEventListeners(){
    // Eventos para movimiento de la paleta que va a hacer rebotar la bola
    window.addEventListener('keydown', (event) => {
        if (event.key === 'a' || event.code === 'ArrowLeft') {
            userPaddle.velocity = new Vec(-paddleVelocity, 0);
        } else if (event.key === 'd' || event.code === 'ArrowRight') {
            userPaddle.velocity = new Vec(paddleVelocity, 0);
        }
    });
    // Evento para que la paleta se detenga cuando el jugador deje de presionar las teclas previamente asignadas
    window.addEventListener('keyup', (event) => {
        if (event.key === 'a' || event.key === 'd') {
            userPaddle.velocity = new Vec(0, 0);
        } else if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
            userPaddle.velocity = new Vec(0, 0);
        }
        if (event.key == 's' && !box.inPlay) {
            box.initVelocity();
        }
        if (event.key == 'r' && (playerLives <= -1 || playerScore == brickRows*brickCols || instaWin)) {
            location.reload();
            instaWin = false;
        }
        if (event.key === 'k') { // Sorpresa, ganas automaticamente!
            bricks.forEach(brick => brick.destroy());
            instaWin = true;
        }
    });
}

function drawScene(newTime) {
    if (oldTime === undefined) {
        oldTime = newTime;
    }
    let deltaTime = newTime - oldTime;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    let allBricksDestroyed = true;
    bricks.forEach((brick, index) => {
        const row = Math.floor(index / brickCols);
        switch (row) {
            case 0:
                brick.color = 'red';
                break;
            case 1:
                brick.color = 'orange';
                break;
            case 2:
                brick.color = 'yellow';
                break;
            case 3:
                brick.color = 'green';
                break;
            case 4:
                brick.color = 'blue';
                break;
        }
        brick.draw(ctx);
        if (boxOverlap(box, brick) && !brick.destroyed) {
            brick.destroy();
            box.velocity.y *= -1;
            playerScore++;
        }
        if (!brick.destroyed) {
            allBricksDestroyed = false;
        }
    });

    if (allBricksDestroyed) {
        winLabel.draw(ctx, "Ganaste! Presiona 'r' para reiniciar");
        return;
    }
    // Dibujar 
    scoreLabel.draw(ctx, `${playerScore} bloques destruidos`);
    vidasLabel.draw(ctx,`${playerLives} vidas restantes`);
    userPaddle.draw(ctx);
    box.draw(ctx);
    leftBarrier.draw(ctx);
    rightBarrier.draw(ctx);
    topBarrier.draw(ctx);
    bottomGoal.draw(ctx);

    box.update(deltaTime);
    userPaddle.update(deltaTime);

    if (boxOverlap(box, userPaddle)) {
        box.velocity.y *= -1;
    }
    if (boxOverlap(box, leftBarrier) || boxOverlap(box, rightBarrier)) {
        box.velocity.x *= -1;
    }
    if (boxOverlap(box, topBarrier)) {
        box.velocity.y *= -1;
    }
    if (boxOverlap(box, bottomGoal)) {
        box.reset();
        playerLives--;
    }

    if (!box.inPlay && playerLives > -1) {
        startLabel.draw(ctx, "Presiona 's' para comenzar");
    }

    if (playerLives <= -1) {
        ctx.fillStyle = 'black';
        ctx.font = '30px Ubuntu Mono';
        ctx.fillText('GAME OVER', canvasWidth/2 - 90, canvasHeight/2);
        return;
    }

    oldTime = newTime;
    requestAnimationFrame(drawScene);
}

