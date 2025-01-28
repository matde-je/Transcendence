import { getCookie, checkAuthentication, getAuthenticationStatus } from './utils.js';

"use strict"

let canvas;
let context;
let score1 = 0;
let score2 = 0;
let ani;
let gameOver = false;
let pause;
let init = 0;
let initialBallGravity;
let maxGravity;
let ballSpeed;
let multiplayer = 0;
let username1 = " Anonymous";
let username2 = "";
let paddleGravity = 3;
const keys = {};

export async function initializeGame() {
	checkAuthentication().then((username) => {
		username1 = username;
		canvas = document.getElementById("game");
		context = canvas.getContext("2d");
		canvas.width = 550;
		canvas.height = 400;
		window.canvas = canvas;
		window.context = context;
		score1 = 0;
		score2 = 0;
		init = 0;
		pause = false;
		initialBallGravity = 1;
		maxGravity = initialBallGravity * 2;
		ballSpeed = 7;
		multiplayer = 0;
		window.ai = 0;
		window.aiSpeed = 70;
		window.aiRefreshView = 1000; // 1 sec, 1000 ms
		window.aiLastUpdateTime = Date.now();
		ani = window.requestAnimationFrame(loop);
	});
}
class Element {
	constructor(options) {
	this.x = options.x;
	this.y = options.y;
	this.width = options.width;
	this.height = options.height;
	this.diamet = options.diamet;
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

window.player2 = new Element ( {
	x: 530,
	y: 170, // Center vertically
	width: 12,
	height: 60,
	color: "#fff",
	gravity: paddleGravity,
});

const player3 = new Element({
	x: 10,
	y: 230,
	width: 12,
	height: 60,
	color: "#fff",
	gravity: paddleGravity,
});

const player4 = new Element({
	x: 525,
	y: 230,
	width: 12,
	height: 60,
	color: "#fff",
	gravity: paddleGravity,
});

window.ball = new Element ( {
	x: 175,
	y: 200,
	diamet: 8,
	color: "#fff",
	speed: ballSpeed,
	gravity: initialBallGravity,
});


function reset_game() {
	score1 = 0;
	score2 = 0;
	player1.x = 10;
	player1.y = 170;
	player2.x = 525;
	player2.y = 170;
	ball.x = canvas.width / 2 - ball.diamet / 2;
	ball.y = canvas.height / 2 - ball.diamet / 2;
	ball.speed = ballSpeed;
	ball.gravity = initialBallGravity;
	gameOver = false;
	pause = false;
}

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
		username2 = "	 HUMAN";
	}
	if (keys['1']) {
		ai = 1;
		context.font = "20px 'Courier New', Courier, monospace";
		context.textAlign = "center";
		context.fillStyle = "white";
		context.fillText("PLAYER 1 - Q AND A", canvas.width / 2, 290);
		context.fillText("P - PAUSE", canvas.width / 2, 320);
		context.fillText("G - START", canvas.width / 2, 350);
		username2 = "		AI";
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
		username2 = "HUMAN PAIR";
	}
	if ((gameOver == true || init == 0) && (keys['g'])) {
		window.cancelAnimationFrame(ani);
		reset_game();
		context.clearRect(0, 0, canvas.width, canvas.height);
		ani = window.requestAnimationFrame(loop);
		init = 1;
		console.log("reset game g clicked");
	}
	if (keys['p'] && gameOver == false && init == 1) {
		pause = !pause;
		if (pause == true) {
			context.font = "20px 'Courier New', Courier, monospace";
			context.textAlign = "center";
			context.fillStyle = "white";
			context.fillText("Paused, press P to continue", canvas.width / 4 + 50, 355);
		}
		keys['p'] = false;
	}
});

window.addEventListener("keyup", (e) => {
	keys[e.key] = false; //mark the key as released
});

//handle player movement based on pressed keys
function handleMoves() {
	if (!gameOver && !pause)
	{
		let newY;

		// Player 1 movement
		newY = player1.y;
		if (keys['q'] && player1.y > 0)
			newY -= player1.gravity * 2; //up
		if (keys['a'] && player1.y + player1.height < canvas.height)
			newY += player1.gravity * 2; //down
		if (!multiplayer || preventPaddleOverlap({...player1, y: newY}, player3))
			player1.y = newY;

		// Player 2 movement
		newY = player2.y;
		if (keys['ArrowUp'] && player2.y > 0 && !ai)
			newY -= player2.gravity * 2; //up
		if (keys['ArrowDown'] && player2.y + player2.height < canvas.height && !ai)
			newY += player2.gravity * 2; //down
		if (!multiplayer || preventPaddleOverlap({...player2, y: newY}, player4) && multiplayer)
			player2.y = newY;

		if (multiplayer)
		{
			// Player 3 movement
			newY = player3.y;
			if (keys['f'] && player3.y - player1.height > 0)
				newY -= player3.gravity * 2; // move up
			if (keys['v'] && player3.y + player3.height < canvas.height)
				newY += player3.gravity * 2; // move down, but don't cross Player 2
			if (preventPaddleOverlap(player1, {...player3, y: newY}))
				player3.y = newY;

			// Player 4 movement
			newY = player4.y;
			if (keys['j'] && player4.y > 0)
				newY -= player4.gravity * 2; // move up, but don't go out
			if (keys['m'] && player4.y + player4.height < canvas.height)
				newY += player4.gravity * 2; // move down
			if (preventPaddleOverlap(player2, {...player4, y: newY}))
				player4.y = newY;
		}
	}
	if (multiplayer && !gameOver && !pause) {
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
	if (ball.y + (ball.diamet / 2) <= player.y + (player.height / 6)) //Thouch upper edge!!
	ball.gravity = -1 * maxGravity;
	else if (ball.y + (ball.diamet / 2) >= player.y + (player.height * 5) / 6) // Thouch lower edge!!
	ball.gravity = maxGravity;
	else
	ball.gravity = Math.sign(ball.gravity) * initialBallGravity; // Thouch center!!
}

function paddleCollision() {
	if (gameOver == true)
		return ;
	// Left side paddles (player1 and player3)
	if (ball.x <= player1.x + player1.width && ball.speed < 0) {
		if (ball.y + ball.diamet >= player1.y && ball.y <= player1.y + player1.height)
			handleEdgeCollisions(player1);
		else if (multiplayer && ball.y + ball.diamet >= player3.y && ball.y <= player3.y + player3.height)
			handleEdgeCollisions(player3);
	}
	// Right side paddles (player2 and player4)
	else if (ball.x + ball.diamet >= player2.x && ball.speed > 0) {
		if (ball.y + ball.diamet >= player2.y && ball.y <= player2.y + player2.height)
			handleEdgeCollisions(player2);
		else if (multiplayer && ball.y + ball.diamet >= player4.y && ball.y <= player4.y + player4.height)
			handleEdgeCollisions(player4);
	}
	if (ball.x <= player1.x + player1.width && ball.y + ball.diamet >= player1.y &&
			ball.y <= player1.y + player1.height && ball.speed < 0) // There is collision!!
		handleEdgeCollisions(player1);
	else if (ball.x + ball.diamet >= player2.x && ball.y + ball.diamet >= player2.y &&
				ball.y <= player2.y + player2.height && ball.speed > 0) // There is collision!!
		handleEdgeCollisions(player2);
	//point scored
	let randomSign = Math.random() < 0.5 ? -1 : 1;
	if (ball.x + ball.diamet < 0) {
		score2 += 1;
		ball.x = canvas.width / 2 - ball.diamet / 2;
		ball.y = canvas.height / 2 - ball.diamet / 2;
		ball.gravity = initialBallGravity * randomSign;
	} else if (ball.x > canvas.width) {
		score1 += 1;
		ball.x = canvas.width / 2 - ball.diamet / 2;
		ball.y = canvas.height / 2 - ball.diamet / 2;
		ball.gravity = initialBallGravity * randomSign;
	}
}

function moveBall() {
	if (gameOver == true)
		return ;
	ball.x += ball.speed;
	ball.y += ball.gravity;

	if (ball.y <= 0 || ball.y + ball.diamet >= canvas.height) {
		ball.gravity *= -1;
		if (ball.y <= 0)
			ball.y = 0;
		else
			ball.y = canvas.height - ball.diamet;
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

	if (element.diamet) {
		context.beginPath();
		context.arc(element.x, element.y, element.diamet, 0, Math.PI * 2);
		context.fill();
	}
		context.fillRect(element.x, element.y, element.width, element.height);
}

function score_1(){
	context.font = "50px 'Courier New', Courier, monospace";
	context.fillStyle = "#fff";
	context.fillText(`${score1}`, canvas.width / 2 - 60, 50);
	context.font = "20px 'Courier New', Courier, monospace";
	context.fillText(`${username1}`, canvas.width - canvas.width + 60, canvas.height - 10);
}

function score_2(){
	context.font = "50px 'Courier New', Courier, monospace";
	context.fillStyle = "#fff";
	context.fillText(score2, canvas.width / 2 + 60, 50);
	context.font = "20px 'Courier New', Courier, monospace";
	context.fillText(`${username2}`, canvas.width - 70, canvas.height - 10);

}

function drawAll(){
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

function loop() {
	if (init === 0) {
		reset_game();
		context.font = '20px \'Courier New\', Courier, monospace';
		context.textAlign = 'center';
		context.fillStyle = 'white';
		context.fillText('PRESS NUMBER OF PLAYERS (1, 2 or 4)', canvas.width / 2, 50);
		draw(ball);
		draw(player1);
		draw(player2);
	}
	if (!gameOver && !pause && init === 1) {
		handleMoves();
		moveBall();
		paddleCollision();
		if (window.ai) {
			aiLogic(window.aiRefreshView);
		}
		drawAll();
		if (score1 === 10 || score2 === 10) {
			let x;
			if (score1 === 10)
				x = canvas.width / 4;
			else
				x = (canvas.width / 2) + (canvas.width / 4);
			context.font = '50px \'Courier New\', Courier, monospace';
			context.textAlign = 'center';
			context.fillStyle = 'white';
			context.fillText('WIN', x, 150);
			context.font = '30px \'Courier New\', Courier, monospace';
			context.fillText('G - PLAY AGAIN', x, 350);
			gameOver = true;
			window.cancelAnimationFrame(ani);
		}
	}
	if (!gameOver && score1 < 10 && score2 < 10 && init === 1) {
		ani = window.requestAnimationFrame(loop);
	} else if (gameOver && getAuthenticationStatus()) {
		let finalResult;
		let opponentType;

		// Determines the opponent type based on the game mode
		if (ai === 1 && multiplayer === 0) {
			opponentType = 'AI';
		} else if (ai === 0 && multiplayer === 0) {
			opponentType = 'HUMAN';
		} else if (ai === 0 && multiplayer === 1) {
			opponentType = 'HUMAN PAIR';
		}

		// Determines the result based on the score
		if (score1 === 10) {
			finalResult = 'win';
		} else {
			finalResult = 'lose';
		}
		console.log('Final result:', finalResult);
		console.log('Opponent type:', opponentType);
		console.log('Final score:', score1 + '-' + score2);
		let score = score1 + '-' + score2;
		console.log('Score:', score);
		// Register the result in the backend
		registerMatchResult(opponentType, finalResult, score);

	}
}

/**
 * Registers the result of a match by sending a POST request to the server.
 *
 * @param {string} opponent - The name of the opponent.
 * @param {string} result - The result of the match (e.g., 'win', 'lose', 'draw').
 * @param {number} score - The score of the match.
 */
function registerMatchResult(opponent, result, score) {

	const csrftoken = getCookie('csrftoken');

	fetch('/pong/register_pong_history/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,
		},
		body: JSON.stringify({
			opponent: opponent,
			result: result,
			score: score,
		}),
	})
	.then(response => response.json())
	.then(data => {
		console.log('Result successfully recorded:', data);
	})
	.catch((error) => {
		console.error('Error registering result:', error);
	});
}