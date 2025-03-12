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
const speedIncrease = 1;
const initialSpeed = 0.5;

let playerScore = 0;

// Context of the Canvas
let ctx;

// Clase para la bola

class Ball extends GameObject {
    constructor(position, width, height, color) {
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
        let angle = Math.random() * (Math.PI / 2) - (Math.PI / 4);
        this.velocity = new Vec(Math.cos(angle), Math.sin(angle)).times(initialSpeed);
        // Select a random direction for the serve
        this.velocity.y *= (Math.random() < 0.5) ? 1 : -1;
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

        if (this.position.y < 0) {
            this.position.y = 0;
        } else if (this.position.y + this.height > canvasHeight) {
            this.position.y = canvasHeight - this.height;
        }
    }
}

const box = new Ball(new Vec(canvasWidth/2, canvasHeight/2), 10, 10, 'white');
const userPaddle = new Paddle(new Vec(canvasHeight-5, canvasWidth/2), 20, 10, 'white');
const leftBarrier = new GameObject(new Vec(0, 0), 5, canvasHeight, 'white', 'barrier');
const rightBarrier = new GameObject(new Vec(canvasWidth-5, 0), 5, canvasHeight, 'white', 'barrier');
const topBarrier = new GameObject(new Vec(0, 0), canvasWidth, 5, 'white', 'barrier');


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
    });
}

function drawScene(newTime) {
    if (oldTime === undefined) {
        oldTime = newTime;
    }
    let deltaTime = newTime - oldTime;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Dibujar 
    userPaddle.draw(ctx);
    box.draw(ctx);
    leftBarrier.draw(ctx);
    rightBarrier.draw(ctx);
    topBarrier.draw(ctx);
    box.update(deltaTime);
    userPaddle.update(deltaTime);

    oldTime = newTime;
    requestAnimationFrame(drawScene);
}

