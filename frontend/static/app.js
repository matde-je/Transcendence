
//document.addEventListener('DOMContentLoaded', function() {});
// const canvas = document.getElementById("game");
// const context = canvas.getContext("2d");

const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

canvas.width = 650;
canvas.height = 400;

let score1 = 0;
let score2 = 0;

class Element {
    constructor(options){
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
        this.color = options.color;
        this.speed = options.speed || 2;
        this.gravity = options.gravity;
    }
}

const player1 = new Element ( {
    x: 10,
    y: 200,
    width: 15,
    height: 80,
    color: "#fff",
    gravity: 2,
});

const player2 = new Element ( {
    x: 625,
    y: 200,
    width: 15,
    height: 80,
    color: "#fff",
    gravity: 2,
});

const ball = new Element ( {
    x: 325,
    y: 200,
    width: 15,
    height: 15,
    color: "#fff",
    speed: 5,
    gravity: 1,
});

function draw(element) {
    context.fillStyle = element.color;
    context.fillRect(element.x, element.y, element.width, element.height);
}

function score_1(){
    context.font = "25px Arial";
    context.fillStyle = "#fff";
    context.fillText(score1, canvas.width / 2 - 60, 30);
}

function score_2(){
    context.font = "25px Arial";
    context.fillStyle = "#fff";
    context.fillText(score2, canvas.width / 2 + 60, 30);
}

function draw_all(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    draw(player1);
    draw(player2);
    draw(ball);
    score_1();
    score_2();
}

function collision(){
    if (ball.x + ball.speed <= 0 || ball.x + ball.speed + ball.width >= canvas.width)
        ball.speed *= -1;
    ball.y += ball.gravity;
    ball.x += ball.speed;
    draw_all();
}

function bounce_ball() {
    if (ball.y + ball.gravity <= 0 || ball.y + ball.gravity >= canvas.height) 
        ball.gravity *= -1;
    ball.y += ball.gravity;
    ball.x += ball.speed;
    collision();
}

function loop(){
    bounce_ball();
    window.requestAnimationFrame(loop);
}

loop();




