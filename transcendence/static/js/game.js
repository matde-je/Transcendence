import { getCookie, checkAuthentication, getAuthenticationStatus } from './utils.js';
import { choose } from './rps-multiplayer.js';

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
let paddleGravity = 3;
let multiplayer = 0;
let username1 = " Anonymous";
let username2 = "";
const aiRefreshView = 1000;

window.isTournament = false;

export async function initializeGame() {
	pause = false;
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
	multiplayer = 0;
	window.ai = 0;
	window.paddleGravity = paddleGravity;
	window.aiRefreshView = aiRefreshView;
	ani = window.requestAnimationFrame(loop);
}

class Element {
	constructor(options) {
	this.x = options.x; // Assuming 550 was the original width
	this.y = options.y; // Assuming 400 was the original height
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
	window.player2.x = 530 * (window.canvas.width / 550);
	window.player2.y = 170 * (window.canvas.height / 400);

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
}

//////////////////////////////KEYBOARD, EVENTLISTENER///////////////////////////////////

window.keys = {};

window.addEventListener("keydown", (e) => {
	keys[e.key] = true; //mark the key as pressed
	if (window.location.pathname === '/rock-paper-scissors/multiplayer'){
		return;
	}else{
		if (keys['1'] && init === 0 && window.isTournament === false) {
			ai = 1;
			context.font = "20px 'Courier New', Courier, monospace";
			context.textAlign = "center";
			context.fillStyle = "white";
			context.fillText("PLAYER 1 - Q AND A", canvas.width / 2, 290);
			context.fillText("P - PAUSE", canvas.width / 2, 410);
			context.fillText("S - START", canvas.width / 2, 440);
			username2 = "        AI";
		}
		if (keys['2'] && init === 0) {
			context.font = "20px 'Courier New', Courier, monospace";
			context.textAlign = "center";
			context.fillStyle = "white";
			context.fillText("PLAYER 1 - Q AND A   ", canvas.width / 2, 260);
			context.fillText("PLAYER 2 - ARROW KEYS", canvas.width / 2, 290);
			context.fillText("P - PAUSE", canvas.width / 2, 410);
			context.fillText("S - START", canvas.width / 2, 440);
			if (!window.isTournament)
				username2 = "     HUMAN";
		}

		if (keys['4'] && init === 0 && window.isTournament === false) {
			multiplayer = 1;
			context.font = "20px 'Courier New', Courier, monospace";
			context.textAlign = "center";
			context.fillStyle = "white";
			context.fillText("PLAYER 1 - Q AND A   ", canvas.width / 2, 200);
			context.fillText("PLAYER 2 - ARROW KEYS", canvas.width / 2, 230);
			context.fillText("PLAYER 3 - F AND V   ", canvas.width / 2, 260);
			context.fillText("PLAYER 4 - J AND M   ", canvas.width / 2, 290);
			context.fillText("P - PAUSE", canvas.width / 2, 410);
			context.fillText("S - START", canvas.width / 2, 440);
			username2 = "HUMAN PAIR";
		}

		if (((gameOver == true && window.isTournament == false) || init == 0) && (keys['s'] || keys['S']))
		{
			window.cancelAnimationFrame(ani);
			reset_game();
			context.clearRect(0, 0, canvas.width, canvas.height);
			if (window.location.href === `https://${window.location.hostname}:8000/` || window.isTournament == true)
				ani = window.requestAnimationFrame(loop);
			init = 1;
			// console.log("start game clicked");
		}

		if (gameOver === true && (keys['n'] || keys['N']) && window.isTournament === true)
		{
			console.log("Get ready for next tournament game");
			let winnerId = (score1 === 10) ? window.player1Id : window.player2Id;
			window.onGameOver(winnerId);
		}

		if (keys['p'] || keys['P'] && gameOver == false && init == 1) {
			pause = !pause;
			if (pause == true) {
				context.font = "20px 'Courier New', Courier, monospace";
				context.textAlign = "center";
				context.fillStyle = "white";
				context.fillText("Paused, press P to continue", canvas.width / 4, canvas.height * 0.9);
			}
			keys['p'] = false;
		}
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
		if (keys['q'] || keys['Q'] && player1.y > 0)
			newY -= player1.gravity * 2; //up
		if (keys['a'] || keys['A'] && player1.y + player1.height < canvas.height)
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
			if (keys['f'] || keys['F'] && player3.y - player1.height > 0)
				newY -= player3.gravity * 2; // move up
			if (keys['v'] || keys['V'] && player3.y + player3.height < canvas.height)
				newY += player3.gravity * 2; // move down, but don't cross Player 2
			if (preventPaddleOverlap(player1, {...player3, y: newY}))
				player3.y = newY;

			// Player 4 movement
			newY = player4.y;
			if (keys['j'] || keys['J'] && player4.y > 0)
				newY -= player4.gravity * 2; // move up, but don't go out
			if (keys['m'] || keys['M'] && player4.y + player4.height < canvas.height)
				newY += player4.gravity * 2; // move down
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
	if (gameOver == true)
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
		else if (multiplayer && ball.y + ball.height >= player4.y && ball.y <= player4.y + player4.height)
			handleEdgeCollisions(player4);
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

function bounceBall() {
	if (gameOver == true)
		return ;
	ball.x += ball.speed;
	ball.y += ball.gravity;

	// Update previousBallDirection and reset ballTurnedRight if necessary
	if (ball.speed > 0 && window.previousBallDirection == -1) {
		window.previousBallDirection = 1;
		ballTurnedRight = true;
		window.lastLeftHitTime = Date.now();

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

function draw(element) {
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

let AiLastUpdateTime = Date.now();

function loop() {
	if (init === 0) {
		reset_game();
		if (window.isTournament)
		{
			const event = new KeyboardEvent('keydown', {
				key: '2',
				keyCode: 50,
				which: 50,
				code: 'Digit2',
				bubbles: true,
				cancelable: true
			});
			document.dispatchEvent(event);
		}
		else
		{
			context.font = '20px \'Courier New\', Courier, monospace';
			context.textAlign = 'center';
			context.fillStyle = 'white';
			context.fillText('PRESS NUMBER OF PLAYERS (1, 2 or 4)', canvas.width / 2,  canvas.height * 0.125);
		}
		draw(player1);
		draw(player2);
	}
	console.log()
    if (!gameOver && !pause && init === 1 && (window.location.href === `https://${window.location.hostname}:8000/` || window.isTournament == true)) {
		console.log("loop game");
		handleMoves();
		bounceBall();
		paddleCollision();
		if (window.ai) {
			aiLogic(window.ball, window.canvas);
		}
		drawAll();
		if (score1 === 10 || score2 === 10) {
			let x;
			if (score1 === 10)
				x = canvas.width / 4;
			else
				x = (canvas.width / 2) + (canvas.width / 4);

			if (window.isTournament)
				{
					context.font = '50px \'Courier New\', Courier, monospace';
					context.textAlign = 'center';
					context.fillStyle = 'white';
					context.fillText('WIN', x, canvas.height * 0.375);
					context.font = '20px \'Courier New\', Courier, monospace';
					if (window.currentRound === 1)
					{
						context.fillText('TOURNAMENT FINISHED', x, canvas.height * 0.750);
						context.fillText('PRESS N TO CONTINUE', x, canvas.height * 0.850);
					}
					else
					context.fillText('N - PLAY NEXT GAME', x, canvas.height * 0.875);
				}
				else
				{
					context.font = '50px \'Courier New\', Courier, monospace';
					context.textAlign = 'center';
					context.fillStyle = 'white';
					context.fillText('WIN', x, canvas.height * 0.375);
					context.font = '30px \'Courier New\', Courier, monospace';
					context.fillText('S - START NEW GAME', x, canvas.height * 0.875);
				}
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
		if (window.isTournament)
		{
			opponentType = username2;
		}
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