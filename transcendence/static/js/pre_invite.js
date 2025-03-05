////////////////////// "GAME.JS" remote only 1Vs1 ////////////////////////////////

import { getCookie, checkAuthentication, getAuthenticationStatus } from './utils.js';

"use strict"

let canvas;
let context;
let score1 = 0;
let score2 = 0;
let ani;
let gameOver = false;
let pause = false;
let init = 0;
let initialBallGravity = 1;
let maxGravity = initialBallGravity * 2;
let ballSpeed = 7;
let paddleGravity = 2;
let isHost = false; // Determines which player controls ball updates
let gameSocket;

export async function initializeGame() {

	pause = false;
	canvas = document.getElementById("game");
	context = canvas.getContext("2d");
	canvas.width = 700;
	canvas.height = 500;
	window.canvas = canvas;
	window.context = context;
	score1 = 0;
	score2 = 0;
	init = 0;
	initialBallGravity = 1;
	maxGravity = initialBallGravity * 2;
	ballSpeed = 7;

	setupGameSocket();
}

class Element {
	constructor(options) {
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
	y: 170,
	width: 12,
	height: 60,
	color: "#fff",
	gravity: paddleGravity,
});

const player2 = new Element ( {
	x: 530,
	y: 170,
	width: 12,
	height: 60,
	color: "#fff",
	gravity: paddleGravity,
});

window.ball = new Element ( {
	x: 175,
	y: 200,
	width: 10,
	height: 10,
	color: "#fff",
	speed: ballSpeed,
	gravity: initialBallGravity,
});


function reset_game() {
	pause = false;
	score1 = score2 = 0;
	player1.x = 10 * (window.canvas.width / 550);
	player1.y = 170 * (window.canvas.height / 400);
	player2.x = 530 * (window.canvas.width / 550);
	player2.y = 170 * (window.canvas.height / 400);

	ball.x = canvas.width / 2 - ball.width / 2;
	ball.y = canvas.height / 2 - ball.width / 2;
	ball.speed = ballSpeed;
	ball.gravity = initialBallGravity;
	gameOver = false;
}

//////////////////////////////KEYBOARD, EVENTLISTENER///////////////////////////////////

window.keys = {};

window.addEventListener("keydown", (e) => {
	keys[e.key] = true; //mark the key as pressed
	if (window.location.pathname === '/rock-paper-scissors/multiplayer') {
		return;

	} else {
		if ((keys['r'] || keys['R']) && init === 0) {
			ai = 1;
			context.font = "20px 'Courier New', Courier, monospace";
			context.textAlign = "center";
			context.fillStyle = "white";
			context.fillText("Waiting...", canvas.width / 2, 290);
			if ("remote oponente ready") {
				window.cancelAnimationFrame(ani);
				context.clearRect(0, 0, canvas.width, canvas.height);
				startCountdown(() => {
					reset_game();
					ani = window.requestAnimationFrame(loop);
					window.init = 2;
				});
			}
		}

		if (keys['p'] && gameOver == false && init == 1) {
			pause = !pause;
			if (pause == true) {
				context.font = "20px 'Courier New', Courier, monospace";
				context.textAlign = "center";
				context.fillStyle = "white";
				context.fillText("Paused, press P to continue", canvas.width / 2, canvas.height / 2);
			}
			keys['p'] = false;
		}
	}
});

window.addEventListener("keyup", (e) => {
	keys[e.key] = false;//mark the key as released
});

/////////////////////////////////MOVES ENGINE//////////////////////////////////////

//handle player movement based on pressed keys
function handleMoves() {
	let newY;
	if (!gameOver && !pause) {
		// Player 1 movement (local player)
		newY = player1.y;
		if (keys['q'] && player1.y > 0)
			newY -= player1.gravity * 2; //up
		if (keys['a'] && player1.y + player1.height < canvas.height)
			newY += player1.gravity * 2; //down
		player1.y = newY;
	}
	/*window.gameSocket.send(JSON.stringify({
			type: "playerMove",
			player: 1,
			y: player1.y
		}));*/
}
//
/*Invert X ball movement and determine ball effect (gravity) according to point of contact*/
function handleEdgeCollisions(player) {
	ball.speed *= -1;
	if (ball.y + (ball.height / 2) <= player.y + (player.height / 6)) //Thouch upper edge
		ball.gravity = -1 * maxGravity;
	else if (ball.y + (ball.height / 2) >= player.y + (player.height * 5) / 6) // Thouch lower edge
		ball.gravity = maxGravity;
	else
		ball.gravity = Math.sign(ball.gravity) * initialBallGravity; // Thouch center
}
/*Hitting paddle or scoring*/
function paddleCollision() {
	if (gameOver == true)
		return ;
	if (ball.x <= player1.x + player1.width && ball.speed < 0) { //<Player 1
		if (ball.y + ball.height >= player1.y && ball.y <= player1.y + player1.height) //<collision
			handleEdgeCollisions(player1); //determine ball effect according to point contatct
	} else if (ball.x + ball.width >= player2.x && ball.speed > 0) { //<Player 2
		if (ball.y + ball.height >= player2.y && ball.y <= player2.y + player2.height) //<collision
			handleEdgeCollisions(player2);
	}

	/*Scoring and random initial move*/
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
/*Move ball and bounce on top and bottom walls*/
function bounceBall() {
	if (gameOver == true)
		return ;
	ball.x += ball.speed;
	ball.y += ball.gravity;
	//Keep in canvas bounds
	if (ball.y <= 0 || ball.y + ball.width >= canvas.height) {
		ball.gravity *= -1;
		if (ball.y <= 0)
			ball.y = 0;
		else
			ball.y = canvas.height - ball.width;
	}
}

///////////////////////////////DRAW FUNCTIONS////////////////////////////////////

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
	context.fillText(${score1}, canvas.width * 0.4, canvas.height * 0.125);
}

function score_2(){
	context.font = "50px 'Courier New', Courier, monospace";
	context.fillStyle = "#fff";
	context.fillText(score2, canvas.width * 0.6, canvas.height * 0.125);
}

function drawAll(){
	context.clearRect(0, 0, canvas.width, canvas.height);
	center_line();
	draw(ball);
	draw(player1);
	draw(player2);
	score_1();
	score_2();
}

function startCountdown(callback) {
	let countdown = 3;
	const countdownInterval = setInterval(() => {
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.font = "60px 'Courier New', Courier, monospace";
		context.fillStyle = "white";
		context.textAlign = "center";
		context.fillText(countdown, canvas.width / 2, canvas.height / 2);
		countdown--;

		if (countdown < 0) {
			clearInterval(countdownInterval);
			callback(); // Start the game after countdown
		}
	}, 1000);
}

////////////////////////////////////REMOTE///////////////////////////////////
	////////////////NUNO//////////////////

function setupGameSocket() {
	gameSocket = new WebSocket("wss://your-server-url/game");

	gameSocket.onmessage = function (e) {
		const data = JSON.parse(e.data);
		if (data.type === "gameState") {
			receiveGameState(data);
		}
	};
}

function sendGameState() {
	const gameState = {
		type: "gameState",
		playerY: player1.y,
		opponentY: player2.y,
		ballX: ball.x,
		ballY: ball.y,
		ballSpeed: ball.speed,
		ballGravity: ball.gravity,
		score1: score1,
		score2: score2,
		isHost: isHost
	};
	gameSocket.send(JSON.stringify(gameState));
}

function receiveGameState(data) {
	player2.y = data.playerY;
	if (!isHost) {
		ball.x = data.ballX;
		ball.y = data.ballY;
		ball.speed = data.ballSpeed;
		ball.gravity = data.ballGravity;
	}
	score1 = data.score1;
	score2 = data.score2;
}


////////////////////////////////////LOOP///////////////////////////////////

function loop() {
	if (init === 0) {
		reset_game();
		context.font = '20px \'Courier New\', Courier, monospace';
		context.textAlign = 'center';
		context.fillStyle = 'white';
		context.fillText('Welcome to the pong game! Lets play a fantastic duel with a friend!', canvas.width / 2,  canvas.height * 0.125);
		draw(ball);
		draw(player1);
		draw(player2);
	}
	console.log()
	if (!gameOver && !pause && init === 1) {
		console.log("loop game");
		handleMoves();
		if (isHost) {
			bounceBall();
			paddleCollision();
			sendGameState();
		}

		if (score1 === 10 || score2 === 10) {
			let x;
			if (score1 === 10)
				x = canvas.width / 4;
			else
				x = (canvas.width / 2) + (canvas.width / 4);

			context.font = '50px \'Courier New\', Courier, monospace';
			context.textAlign = 'center';
			context.fillStyle = 'white';
			context.fillText('WIN', x, canvas.height * 0.375);
			context.font = '30px \'Courier New\', Courier, monospace';
			context.fillText('S - START NEW GAME', x, canvas.height * 0.875);
			gameOver = true;
			window.cancelAnimationFrame(ani);
		}
	}

	if (!gameOver && score1 < 10 && score2 < 10 && init === 1)
		ani = window.requestAnimationFrame(loop);
}