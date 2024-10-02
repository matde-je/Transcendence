//document.addEventListener('DOMContentLoaded', function() {});
// const canvas = document.getElementById("game");
// const context = canvas.getContext("2d");

const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

canvas.width = 650;
canvas.height = 400;

let score1 = 0;
let score2 = 0;

window.addEventListener("keypress", key_down, false);

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
    speed: 8,
    gravity: 1,
});

function key_down(e) {
    const key = e.key;
    if (key == "w" && player1.y - player1.gravity > 0)
        player1.y -= player1.gravity * 4;
    else if (key == "s" && player1.y + player1.height + player1.gravity < canvas.height)
        player1.y += player1.gravity * 4;
    if (key == "i" && player2.y - player2.gravity > 0)
        player2.y -= player2.gravity * 4;
    else if (key == "k" && player2.y + player2.height + player2.gravity < canvas.height)
        player2.y += player2.gravity * 4;
}

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
    draw(ball);
    draw(player1);
    draw(player2);
    score_1();
    score_2();
}

function collision() {
    if (ball.x <= player1.x + player1.width && ball.y + ball.height >= player1.y && 
            ball.y <= player1.y + player1.height && ball.speed < 0)
        ball.speed *= -1;
    else if (ball.x + ball.width >= player2.x && ball.y + ball.height >= player2.y && 
               ball.y <= player2.y + player2.height && ball.speed > 0) 
        ball.speed *= -1;

    if (ball.x + ball.width < 0) {
        score2 += 1;
        ball.x = canvas.width / 2 - ball.width / 2;
        ball.y = canvas.height / 2 - ball.height / 2;
    } else if (ball.x > canvas.width) {
        score1 += 1;
        ball.x = canvas.width / 2 - ball.width / 2;
        ball.y = canvas.height / 2 - ball.height / 2;
    }
    draw_all();
}

function bounce_ball() {
    ball.x += ball.speed;
    ball.y += ball.gravity;
    if (ball.y <= 0 || ball.y + ball.height >= canvas.height) { 
        ball.gravity *= -1;
        if (ball.y <= 0) 
            ball.y = 0;
        else 
            ball.y = canvas.height - ball.height;
    }
    collision();
}

function loop() {
    bounce_ball();
    window.requestAnimationFrame(loop);
}

loop();

