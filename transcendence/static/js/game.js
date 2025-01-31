import { getCookie, checkAuthentication, getAuthenticationStatus } from './utils.js';
"use strict"

////////////////////////////////VARIABLES/////////////////////////////////////

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
const aiRefreshView = 1000;

window.isTournament = false;

export async function initializeGame() {
	if (window.isTournament)
	{
		username1 = window.username1;
		username2 = window.username2;
	}
	else
	{
		checkAuthentication().then((username) => {
			username1 = username;
		});
	}
	canvas = document.getElementById("game");
	context = canvas.getContext("2d");
	canvas.width = 700
	canvas.height = 500;
	window.canvas = canvas;
	window.context = context;
	window.keys = {};
	score1 = score2 = 0;
	init = 0;
	pause = false;
	initialBallGravity = 1;
	maxGravity = initialBallGravity * 2;
	ballSpeed = 4;
	multiplayer = 0;
	window.ai = 0;
	window.previousBallDirection = 1;
	window.lastLeftHitTime = 0;
	window.ballTurnedRight = true;
	window.aiRefreshView = aiRefreshView;
	ani = window.requestAnimationFrame(loop);
}

class Element {
	constructor(options) {
		this.x = options.x ; // Assuming 550 was the original width
		this.y = options.y; // Assuming 400 was the original height
		this.width = options.width ;
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
	x: 530,
	y: 230,
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
	score1 = score2 = 0;
	player1.x = 10 * (window.canvas.width / 550);
	player1.y = 170 * (window.canvas.height / 400);
	player2.x = 530 * (window.canvas.width / 550);
	player2.y = 170 * (window.canvas.height / 400);
	
	if (multiplayer) {
		player3.x = 10 * (window.canvas.width / 550);
		player3.y = 230 * (window.canvas.height / 400);
		player4.x = 530 * (window.canvas.width / 550);
		player4.y = 230 * (window.canvas.height / 400);
	}

	ball.x = canvas.width / 2 - ball.width / 2;
	ball.y = canvas.height / 2 - ball.width / 2;
	ball.speed = ballSpeed;
	ball.gravity = initialBallGravity;
	gameOver = false;
	pause = false;
}

//////////////////////////////KEYBOARD, EVENTLISTENER///////////////////////////////////

window.addEventListener("keydown", (e) => {
	keys[e.key] = true; //mark the key as pressed
	if (keys['1'] && init === 0) {
		ai = 1;
		context.font = "20px 'Courier New', Courier, monospace";
		context.textAlign = "center";
		context.fillStyle = "white";
		context.fillText("PLAYER 1 - Q AND A", canvas.width / 2, canvas.height * 0.725);
		context.fillText("P - PAUSE", canvas.width / 2, canvas.height * 0.80);
		context.fillText("S - START",canvas.width / 2, canvas.height * 0.875);
		username2 = "		AI";
	}
	if (keys['2'] && init === 0) {
		context.font = "20px 'Courier New', Courier, monospace";
		context.textAlign = "center";
		context.fillStyle = "white";
		context.fillText("PLAYER 1 - ARROW KEYS", canvas.width / 2, canvas.height * 0.65);
		context.fillText("PLAYER 2 - Q AND A", canvas.width / 2, canvas.height * 0.725);
		context.fillText("P - PAUSE", canvas.width / 2, canvas.height * 0.80);
		context.fillText("S - START",canvas.width / 2, canvas.height * 0.875);
		username2 = "	 HUMAN";
	}
	if (keys['4'] && init === 0) {
		multiplayer = 1;
		context.font = "20px 'Courier New', Courier, monospace";
		context.textAlign = "center";
		context.fillStyle = "white";
		context.fillText("PLAYER 1 - ARROW KEYS", canvas.width / 2, canvas.height * 0.50);
		context.fillText("PLAYER 2 - Q AND A", canvas.width / 2, canvas.height * 0.575);
		context.fillText("PLAYER 3 - F AND V", canvas.width / 2, canvas.height * 0.65);
		context.fillText("PLAYER 4 - J AND M", canvas.width / 2, canvas.height * 0.725);
		context.fillText("P - PAUSE", canvas.width / 2, canvas.height * 0.80);
		context.fillText("S - START",canvas.width / 2, canvas.height * 0.875);
		username2 = "HUMAN PAIR";
	}
	if ((gameOver == true || init == 0) && (keys['s'] || keys['S']))
	{
		window.cancelAnimationFrame(ani);
		reset_game();
		context.clearRect(0, 0, canvas.width, canvas.height);
	    ani = window.requestAnimationFrame(loop);
		init = 1;
		console.log("start game clicked");
	}

	if ((gameOver == true || init == 0) && (keys['n'] || keys['N']) && window.isTournament)
	{
		console.log("Get ready for next tournament game");
		let winnerId = (score1 === 10) ? window.player1Id : window.player2Id;
		window.onGameOver(winnerId);
	}

	if (keys['p'] && gameOver == false && init == 1) {
		pause = !pause;
		if (pause == true) {
			context.font = `${canvas.height * 0.05}px 'Courier New', Courier, monospace`;
			context.textAlign = "center";
			context.fillStyle = "white";
			context.fillText("Paused, press P to continue", canvas.width / 2, canvas.height * 0.8);
		}
		keys['p'] = false;
	}
});

window.addEventListener("keyup", (e) => {
	keys[e.key] = false; //mark the key as released
});

/////////////////////////////////MOVES ENGINE//////////////////////////////////////

//handle player movement based on pressed keys
function handleMoves() {
	if (!gameOver && !pause)
	{
		let newY;

		// Player 1 movement
		newY = player1.y;
		if (keys['q'] && player1.y > 0)
			newY -= player1.gravity * 2; // move up
		if (keys['a'] && player1.y + player1.height < canvas.height)
			newY += player1.gravity * 2; //move down
		if (!multiplayer || preventPaddleOverlap({...player1, y: newY}, player3))
			player1.y = newY;

		// Player 2 movement
		newY = player2.y;
		if (keys['ArrowUp'] && player2.y > 0 && !ai)
			newY -= player2.gravity * 2;
		if (keys['ArrowDown'] && player2.y + player2.height < canvas.height && !ai)
			newY += player2.gravity * 2;
		if (!multiplayer || preventPaddleOverlap({...player2, y: newY}, player4) && multiplayer)
			player2.y = newY;

		if (multiplayer)
		{
			// Player 3 movement
			newY = player3.y;
			if (keys['f'] && player3.y - player1.height > 0)
				newY -= player3.gravity * 2;
			if (keys['v'] && player3.y + player3.height < canvas.height)
				newY += player3.gravity * 2;
			if (preventPaddleOverlap(player1, {...player3, y: newY}))
				player3.y = newY;

			// Player 4 movement
			newY = player4.y;
			if (keys['j'] && player4.y > 0)
				newY -= player4.gravity * 2;
			if (keys['m'] && player4.y + player4.height < canvas.height)
				newY += player4.gravity * 2;
			if (preventPaddleOverlap(player2, {...player4, y: newY}))
				player4.y = newY;
		}
	}
}

function preventPaddleOverlap(paddle1, paddle2) {
	if (paddle1.y < paddle2.y) {
		return paddle1.y + paddle1.height <= paddle2.y;
	} else {
		return paddle2.y + paddle2.height <= paddle1.y;
	}
}

function handleEdgeHit(player) {
	ball.speed *= -1;
	if (ball.y + (ball.width / 2) <= player.y + (player.height / 6)) //Thouch upper edge!!
		ball.gravity = -1 * maxGravity;
	else if (ball.y + (ball.width / 2) >= player.y + (player.height * 5) / 6) // Thouch lower edge!!
		ball.gravity = maxGravity;
	else
	ball.gravity = Math.sign(ball.gravity) * initialBallGravity; // Thouch center!!
}

function ballHitPaddle() {
	if (gameOver == true)
		return ;
	// Left side paddles (player1 and player3)
	if (ball.x <= player1.x + player1.width && ball.speed < 0) {
		if (ball.y + ball.width >= player1.y && ball.y <= player1.y + player1.height)
			handleEdgeHit(player1);
		else if (multiplayer && ball.y + ball.width >= player3.y && ball.y <= player3.y + player3.height)
			handleEdgeHit(player3);
	}
	// Right side paddles (player2 and player4)
	else if (ball.x + ball.width >= player2.x && ball.speed > 0) {
		if (ball.y + ball.width >= player2.y && ball.y <= player2.y + player2.height)
			handleEdgeHit(player2);
		else if (multiplayer && ball.y + ball.width >= player4.y && ball.y <= player4.y + player4.height)
			handleEdgeHit(player4);
	}
	if (ball.x <= player1.x + player1.width && ball.y + ball.width >= player1.y &&
			ball.y <= player1.y + player1.height && ball.speed < 0) // There is collision!!
		handleEdgeHit(player1);
	else if (ball.x + ball.width >= player2.x && ball.y + ball.width >= player2.y &&
				ball.y <= player2.y + player2.height && ball.speed > 0) // There is collision!!
		handleEdgeHit(player2);

	//point scored
	let randomSign = Math.random() < 0.5 ? -1 : 1;
	if (ball.x + ball.width < 0) {
		score2 += 1;
		ball.x = canvas.width / 2 - ball.width / 2;
		ball.y = canvas.height / 2 - ball.width / 2;
		ball.gravity = initialBallGravity * randomSign;
	} else if (ball.x > canvas.width) {
		score1 += 1;
		ball.x = canvas.width / 2 - ball.width / 2;
		ball.y = canvas.height / 2 - ball.width / 2;
		ball.gravity = initialBallGravity * randomSign;
	}
}

function moveBall() {
	if (gameOver == true)
		return ;
	ball.x += ball.speed;
	ball.y += ball.gravity;

	console.log("previousBallDirection:", window.lastLeftHitTime);

	// Update previousBallDirection and reset ballTurnedRight if necessary
	if (ball.speed > 0 && window.previousBallDirection == -1) {
		window.previousBallDirection = 1;
		ballTurnedRight = true;
		window.lastLeftHitTime = Date.now();
		console.log("moveBall,lastLeftHitTime", window.lastLeftHitTime);
	} else if (ball.speed < 0 && window.previousBallDirection == 1) {
		window.previousBallDirection = -1;
		ballTurnedRight = false;
	}
	//Keep in bounds
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

function drawElements(element) {
	context.fillStyle = element.color;
	context.fillRect(element.x, element.y, element.width, element.height);
}

function score_1(){
	context.font = "50px 'Courier New', Courier, monospace";
	context.fillStyle = "#fff";
	context.fillText(`${score1}`, canvas.width * 0.4, canvas.height * 0.125);
	context.font = "20px 'Courier New', Courier, monospace";
	context.fillText(`${username1}`, canvas.width * 0.11, canvas.height * 0.975);
}

function score_2(){
	context.font = "50px 'Courier New', Courier, monospace";
	context.fillStyle = "#fff";
	context.fillText(score2, canvas.width * 0.6, canvas.height * 0.125);
	context.font = "20px 'Courier New', Courier, monospace";
	context.fillText(`${username2}`, canvas.width * 0.875, canvas.height * 0.975);

}
function drawFirstMenu() {
	context.font = '20px \'Courier New\', Courier, monospace';
	context.textAlign = 'center';
	context.fillStyle = 'white';
	context.fillText('PRESS NUMBER OF PLAYERS (1, 2 or 4)', canvas.width / 2,  canvas.height * 0.125);
}

function drawWinGameMenu() {
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

function drawAll(){
	context.clearRect(0, 0, canvas.width, canvas.height);
	center_line();
	drawElements(ball);
	drawElements(player1);
	drawElements(player2);
	if (multiplayer) {
		drawElements(player3);
		drawElements(player4);
	}
	score_1();
	score_2();
}

/////////////////////////////////TOURNAMMENT//////////////////////////////////////

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

function tournamentEndGame() {
	let finalResult;
	let opponentType;

	// Determines the opponent type based on the game mode
	if (window.isTournament)
			opponentType = username2;
	else
	{
		if (ai === 1 && multiplayer === 0) {
			opponentType = 'AI';
		} else if (ai === 0 && multiplayer === 0) {
			opponentType = 'HUMAN';
		} else if (ai === 0 && multiplayer === 1) {
			opponentType = 'HUMAN PAIR';
		}
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

	// Register the result in the backend if not in a tournament
	if (!window.isTournament)
		registerMatchResult(opponentType, finalResult, score);
}

/////////////////////////////////MAIN LOOP/////////////////////////////////////

function loop() {
	if (init === 0) {
		reset_game();
	drawFirstMenu();
	drawElements(ball);
	drawElements(player1);
	drawElements(player2);
	}
	if (!gameOver && !pause && init === 1) {
		handleMoves();
		if (window.ai) {
			aiLogic(window.ball, window.canvas);
		}
		moveBall();
		ballHitPaddle();
		drawAll();
		drawWinGameMenu();
	}
	if (!gameOver && score1 < 10 && score2 < 10 && init === 1) {
		ani = window.requestAnimationFrame(loop);
	} else if (gameOver && getAuthenticationStatus())
		tournamentEndGame();
}