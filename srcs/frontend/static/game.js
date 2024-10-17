
const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

canvas.width = 650;
canvas.height = 400;

let score1 = 0;
let score2 = 0;

let ani;
let game_over = false;
let pause = false;
let init = 0;

window.addEventListener("keydown", key_down, false);

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

function reset_game() {
    score1 = 0;
    score2 = 0;
    ball.x = canvas.width / 2 - ball.width / 2;
    ball.y = canvas.height / 2 - ball.height / 2;
    ball.speed = 5;
    game_over = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    ani = window.requestAnimationFrame(loop);

}

function key_down(e) {
    const key = e.key;
    if (game_over == false) {
        if (key == "s" && player1.y - player1.gravity > 0)
            player1.y -= player1.gravity * 4;
        else if (key == "x" && player1.y + player1.height + player1.gravity < canvas.height)
            player1.y += player1.gravity * 4;
        if (key == "ArrowUp" && player2.y - player2.gravity > 0)
            player2.y -= player2.gravity * 4;
        else if (key == "ArrowDown" && player2.y + player2.height + player2.gravity < canvas.height)
            player2.y += player2.gravity * 4;
        if (key == "p")
            pause = !pause;
        // if (key == "1") {

        // }
        if (key == "2") {
            context.font = "20px Arial";  
            context.textAlign = "center"; 
            context.fillStyle = "white";
            context.fillText("Player 1 - Arrow keys", canvas.width / 2, 60);
            context.fillText("Player 2 - S AND X", canvas.width / 2, 90);
            context.fillText("P - to pause", canvas.width / 2, 120);
            context.fillText("G - to start", canvas.width / 2, 150);
        }
        // if (key == "3")
    }
    if ((game_over == true || init == 0) && (key == 'g' || key == 'G')) {
        window.cancelAnimationFrame(ani);
        reset_game();
        init = 1;
    }
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
    if (game_over == true)
        return ;
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
    //ball.gravity += (Math.random() -0.5);
    draw_all();
}

function bounce_ball() {
    if (game_over == true)
        return ;
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
    if (init == 0) {
        context.font = "20px Arial";  
        context.textAlign = "center"; 
        context.fillStyle = "white";
        context.fillText("Press number of players (1-4)", canvas.width / 2, 30);
    }
    if (game_over == false && pause == false && init == 1) {
        bounce_ball();
        if (score1 == 10 || score2 == 10) {
            context.font = "20px Arial";  
            context.textAlign = "center"; 
            context.fillStyle = "white";
            context.fillText("Game Over", canvas.width / 2, 60);
            context.fillText("Press G to play again", canvas.width / 2, 80);
            game_over = true;
            window.cancelAnimationFrame(ani);
        }
    }
    if (game_over == false && score1 < 10 && score2 < 10 && init == 1)
        ani = window.requestAnimationFrame(loop);
}

ani = window.requestAnimationFrame(loop);
