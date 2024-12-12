"use strict"

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

//Gameplay / Speeds
let initialBallGravity = 1;
let maxGravity = initialBallGravity * 2;
let ballSpeed = 7;

let multiplayer = 0;

//AI settings
let ai = 0;
let aiSpeed = 70;
let AiRefreshView = 1000; // 1 sec, 1000 ms

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
	y: 70,
	width: 12,
	height: 60,
	color: "#fff",
	gravity: 2,
});

const player2 = new Element ( {
	x: 625,
	y: 230,
	width: 12,
	height: 60,
	color: "#fff",
	gravity: 2,
});

const player3 = new Element({
	x: 10,
	y: 230,
	width: 12,
	height: 60,
	color: "#fff",
	gravity: 2,
});

const player4 = new Element({
	x: 625,
	y: 70,
	width: 12,
	height: 60,
	color: "#fff",
	gravity: 2,
});

const ball = new Element ( {
	x: 325,
	y: 200,
	width: 12,
	height: 12,
	color: "#fff",
	speed: ballSpeed,
	gravity: initialBallGravity,
});

function reset_game() {
	score1 = 0;
	score2 = 0;
	ball.x = canvas.width / 2 - ball.width / 2;
	ball.y = canvas.height / 2 - ball.height / 2;
	ball.speed = ballSpeed;
	ball.gravity = initialBallGravity;
	game_over = false;
	context.clearRect(0, 0, canvas.width, canvas.height);
	ani = window.requestAnimationFrame(loop);
}

let keys = {};

window.addEventListener("keydown", (e) => {
	keys[e.key] = true; //mark the key as pressed
	if (keys['2']) {
		context.font = "20px 'Courier New', Courier, monospace";
		context.textAlign = "center";
		context.fillStyle = "white";
		context.fillText("PLAYER 1 - ARROW KEYS", canvas.width / 2, 260);
		context.fillText("PLAYER 2 - Q AND A", canvas.width / 2, 290);
		context.fillText("P - PAUSE", canvas.width / 2, 320);
		context.fillText("G - START", canvas.width / 2, 350);
	}
	if (keys['1']) {
		ai = 1;
		context.font = "20px 'Courier New', Courier, monospace";
		context.textAlign = "center";
		context.fillStyle = "white";
		context.fillText("PLAYER 1 - Q AND A", canvas.width / 2, 290);
		context.fillText("P - PAUSE", canvas.width / 2, 320);
		context.fillText("G - START", canvas.width / 2, 350);
	}
	if (keys['4']) {
		multiplayer = 1;
		context.font = "20px 'Courier New', Courier, monospace";
		context.textAlign = "center";
		context.fillStyle = "white";
		context.fillText("PLAYER 1 - ARROW KEYS", canvas.width / 2, 200);
		context.fillText("PLAYER 2 - Q AND A", canvas.width / 2, 230);
		context.fillText("PLAYER 3 - F AND V", canvas.width / 2, 260);
		context.fillText("PLAYER 4 - J AND M", canvas.width / 2, 290);
		context.fillText("P - PAUSE", canvas.width / 2, 320);
		context.fillText("G - START", canvas.width / 2, 350);
	}
	if ((game_over == true || init == 0) && (keys['g'])) {
		window.cancelAnimationFrame(ani);
		reset_game();
		init = 1;
	}
	if (keys['p'] && game_over == false && init == 1) {
		pause = !pause;
		if (pause == true) {
			context.font = "20px 'Courier New', Courier, monospace";
			context.textAlign = "center";
			context.fillStyle = "white";
			context.fillText("Paused, press P to continue", canvas.width / 4 + 10, 350);
		}
		keys['p'] = false;
	}
});

window.addEventListener("keyup", (e) => {
	keys[e.key] = false; //mark the key as released
});

//handle player movement based on pressed keys
function handle_moves() {
	if (!game_over && !pause) {
		let newY;
		newY = player1.y;
		if (keys['q'] && player1.y > 0)
			newY -= player1.gravity * 2; //up
		if (keys['a'] && player1.y + player2.height < canvas.height)
			newY += player1.gravity * 2; //down
		if (!multiplayer || preventPaddleOverlap({...player1, y: newY}, player3))
			player1.y = newY;

		newY = player2.y;
		if (keys['ArrowUp'] && player2.y - player1.height > 0 && !ai)
			newY -= player2.gravity * 2; //up
		if (keys['ArrowDown'] && player2.y + player1.height < canvas.height && !ai)
			newY += player2.gravity * 2; //down
		if (!multiplayer || preventPaddleOverlap({...player2, y: newY}, player4) && multiplayer)
			player2.y = newY;
	}
	if (multiplayer && !game_over && !pause) {
		let newY;
		newY = player3.y;
		if (keys['f'] && player3.y - player1.height > 0)
			newY -= player3.gravity * 2; // move up
		if (keys['v'] && player3.y + player3.height < canvas.height)
			newY += player3.gravity * 2; // move down, but don't cross Player 2
		if (!multiplayer || preventPaddleOverlap(player1, {...player3, y: newY}) && multiplayer)
			player3.y = newY;

		newY = player4.y;
		if (keys['j'] && player4.y > 0)
			newY -= player4.gravity * 2; // move up, but don't go out
		if (keys['m'] && player4.y + player3.height < canvas.height)
			newY += player4.gravity * 2; // move down
		if (!multiplayer || preventPaddleOverlap(player2, {...player4, y: newY}) && multiplayer)
			player4.y = newY;
	}
}

function preventPaddleOverlap(paddle1, paddle2) {
	if (paddle1.y < paddle2.y) {
		return paddle1.y + paddle1.height <= paddle2.y;
	} else {
		return paddle2.y + paddle2.height <= paddle1.y;
	}
}


function handleEdgeCollisions(player) {
	ball.speed *= -1;
	if (ball.y + (ball.height / 2) <= player.y + (player.height / 6)) //Thouch upper edge!!
		ball.gravity = -1 * maxGravity;
	else if (ball.y + (ball.height / 2) >= player.y + (player.height * 5) / 6) // Thouch lower edge!!
		ball.gravity = maxGravity;
	else
		ball.gravity = Math.sign(ball.gravity) * initialBallGravity; // Thouch center!!
}

function paddleCollision() {
	if (game_over == true)
		return ;
		// Left side paddles (player1 and player3)
		if (ball.x <= player1.x + player1.width && ball.speed < 0) {
			if (ball.y + ball.height >= player1.y && ball.y <= player1.y + player1.height)
				handleEdgeCollisions(player1);
			else if (multiplayer && ball.y + ball.height >= player3.y && ball.y <= player3.y + player3.height)
				handleEdgeCollisions(player3);
		}
		// Right side paddles (player2 and player4)
		else if (ball.x + ball.width >= player2.x && ball.speed > 0) {
			if (ball.y + ball.height >= player2.y && ball.y <= player2.y + player2.height)
				handleEdgeCollisions(player2);
			else if (multiplayer && ball.y + ball.height >= player4.y && ball.y <= player4.y + player4.height) {
				handleEdgeCollisions(player4);
			}
		}
	if (ball.x <= player1.x + player1.width && ball.y + ball.height >= player1.y &&
			ball.y <= player1.y + player1.height && ball.speed < 0) // There is collision!!
				handleEdgeCollisions(player1);
	else if (ball.x + ball.width >= player2.x && ball.y + ball.height >= player2.y &&
			ball.y <= player2.y + player2.height && ball.speed > 0) // There is collision!!
				handleEdgeCollisions(player2);
	//point scored
	let randomSign = Math.random() < 0.5 ? -1 : 1;
	if (ball.x + ball.width < 0) {
		score2 += 1;
		ball.x = canvas.width / 2 - ball.width / 2;
		ball.y = canvas.height / 2 - ball.height / 2;
		ball.gravity = initialBallGravity * randomSign;
	} else if (ball.x > canvas.width) {
		score1 += 1;
		ball.x = canvas.width / 2 - ball.width / 2;
		ball.y = canvas.height / 2 - ball.height / 2;
		ball.gravity = initialBallGravity * randomSign;
	}
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
}

function center_line() {
	context.beginPath();
	context.setLineDash([10, 10]); //set dash pattern: 10px dash, 5px gap
	context.moveTo(canvas.width / 2, 0); //move to top center of canvas
	context.lineTo(canvas.width / 2, canvas.height); //to  bottom center
	context.strokeStyle = "#fff"; //color white
	context.lineWidth = 10;
	context.stroke(); //draw line
	context.setLineDash([]); //reset line dash to solid for other drawings
}

function draw(element) {
	context.fillStyle = element.color;
	context.fillRect(element.x, element.y, element.width, element.height);
}

function score_1(){
	context.font = "50px 'Courier New', Courier, monospace";
	context.fillStyle = "#fff";
	context.fillText(score1, canvas.width / 2 - 60, 50);
}

function score_2(){
	context.font = "50px 'Courier New', Courier, monospace";
	context.fillStyle = "#fff";
	context.fillText(score2, canvas.width / 2 + 60, 50);
}

function draw_all(){
	context.clearRect(0, 0, canvas.width, canvas.height);
	center_line();
	draw(ball);
	draw(player1);
	draw(player2);
	if (multiplayer) {
		draw(player3);
		draw(player4);
	}
	score_1();
	score_2();
}

let AiLastUpdateTime = Date.now();

function loop() {
	if (init == 0) {
		context.font = "20px 'Courier New', Courier, monospace";
		context.textAlign = "center";
		context.fillStyle = "white";
		context.fillText("PRESS NUMBER OF PLAYERS (1, 2 or 4)", canvas.width / 2, 50);
	}
	if (game_over == false && pause == false && init == 1) {
		handle_moves();
		bounce_ball();
		paddleCollision();
		if (ai)
			aiLogic(AiRefreshView); // Call the AI movement function
		draw_all();
		//draw_allied_players();
		if (score1 == 10 || score2 == 10) {
			let x;
			if (score1 == 10)
				x = canvas.width / 4;
			else
				x = canvas.width / 2 + canvas.width / 4;
			context.font = "50px 'Courier New', Courier, monospace";
			context.textAlign = "center";
			context.fillStyle = "white";
			context.fillText("WIN", x, 80);
			context.font = "30px 'Courier New', Courier, monospace";
			context.fillText("G - PLAY AGAIN", x, 350);
			game_over = true;
			window.cancelAnimationFrame(ani);
		}
	}
	if (game_over == false && score1 < 10 && score2 < 10 && init == 1)
		ani = window.requestAnimationFrame(loop);
}

ani = window.requestAnimationFrame(loop);