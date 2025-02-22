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
const aiRefreshView = 1000;

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
	window.paddleGravity = paddleGravity;
	window.aiRefreshView = aiRefreshView;
	ani = window.requestAnimationFrame(loop);
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
		if (keys['1'] && init === 0) {
			ai = 1;
			context.font = "20px 'Courier New', Courier, monospace";
			context.textAlign = "center";
			context.fillStyle = "white";
			context.fillText("PLAYER 1 - Q AND A", canvas.width / 2, 290);
			context.fillText("P - PAUSE", canvas.width / 2, 320);
			context.fillText("S - START", canvas.width / 2, 350);
		}
		if (keys['2'] && init === 0) {
			context.font = "20px 'Courier New', Courier, monospace";
			context.textAlign = "center";
			context.fillStyle = "white";
			context.fillText("PLAYER 1 - Q AND A   ", canvas.width / 2, 260);
			context.fillText("PLAYER 2 - ARROW KEYS", canvas.width / 2, 290);
			context.fillText("P - PAUSE", canvas.width / 2, 320);
			context.fillText("S - START", canvas.width / 2, 350);
		}
		if ((gameOver == true || init == 0) && (keys['s'] || keys['S']))
			{
				//if (gameSocket && gameSocket.readyState === WebSocket.OPEN) {		///REMOTE/// PARA INICIAR JOGO
				//	gameSocket.send(JSON.stringify({type: 'playerReady'}));
				//} else {
					window.cancelAnimationFrame(ani);
					reset_game();
					context.clearRect(0, 0, canvas.width, canvas.height);
					if (window.location.href === `https://${window.location.hostname}:8000/`)
						ani = window.requestAnimationFrame(loop);
					init = 1;
					console.log("start game clicked");
				//}
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
		sendPlayerMove(player1.y); // Send move to server				///<<REMOTE>>///
	} else {
		// Player 2 movement (remote player)
		newY = player2.y;
		if (keys['ArrowUp'] && player2.y > 0)
			newY -= player2.gravity * 2;
		if (keys['ArrowDown'] && player2.y + player2.height < canvas.height)
			newY += player2.gravity * 2;
		player2.y = newY;
	}
}
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
	/////////////////////////////////////CORRIGIIIIRRR!!!!///////////////////////////////////////////
	if (ball.x <= player1.x + player1.width && ball.y + ball.height >= player1.y &&
			ball.y <= player1.y + player1.height && ball.speed < 0) //<collision
		handleEdgeCollisions(player1);
		else if (ball.x + ball.width >= player2.x && ball.y + ball.height >= player2.y &&
			ball.y <= player2.y + player2.height && ball.speed > 0) //<collision
		handleEdgeCollisions(player2);

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
	context.fillText(`${score1}`, canvas.width * 0.4, canvas.height * 0.125);
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

let AiLastUpdateTime = Date.now();

function loop() {
	if (init === 0) {
		reset_game();
		context.font = '20px \'Courier New\', Courier, monospace';
		context.textAlign = 'center';
		context.fillStyle = 'white';
		context.fillText('PRESS NUMBER OF PLAYERS (1, 2 or 4)', canvas.width / 2,  canvas.height * 0.125);
		draw(ball);
		draw(player1);
		draw(player2);
	}
	console.log()
	if (!gameOver && !pause && init === 1 && window.location.href
			=== `https://${window.location.hostname}:8000/`) {
		console.log("loop game");
		handleMoves();
		bounceBall();
		paddleCollision();
		drawAll();
		sendGameState();										///<<REMOTE>>///
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
/*
/////////////////////////////////REMOTE FUNCTIONS//////////////////////////////////////

	///Game State Synchronization, send and receive game state updates:

	function handleGameMsg(message) {
		switch (message.type) {
			case 'gameStart':
					startGameRemote(message.data);
				break;
			case 'gameState':
				updateGameState(message.data);
				break;
			case 'playerMove':
				handleRemotePlayerMove(message.data);
				break;
		}
	}

	function startGameRemote() {
		reset_game();
		init = 1;
		ani = window.requestAnimationFrame(loop);
	}

	//Receives game state data from the server and updates the local game state.
	//Used by clients to synchronize their game with the state being maintained by the server.
	function updateGameState(state) {
		ball.x = state.ball.x;
		ball.y = state.ball.y;
		player2.y = state.player2.y;
		player3.y = state.player3.y;
		player4.y = state.player4.y;
		score1 = state.score1;
		score2 = state.score2;
	}
	//Sends the current state to server to be broadcast to other players.
	//It's used by the players that is considered the "source of truth" for certain aspects of the game
	function sendGameState() {
		if (gameSocket && gameSocket.readyState === WebSocket.OPEN) {
			const gameState = {
				ball: { x: ball.x, y: ball.y },
				player1: { y: player1.y },
				score1: score1,
				score2: score2
			};
			gameSocket.send(JSON.stringify({ type: 'gameState', data: gameState }));
		}
	}
	//Player1 sends it's Y position to server as playerMove type
	function sendPlayerMove(playerNumber, yPosition) {
		if (gameSocket && gameSocket.readyState === WebSocket.OPEN) {
			gameSocket.send(JSON.stringify({
				type: 'playerMove',
				player: playerNumber,
				y: yPosition
			}));
		}
	}

	function handleRemotePlayerMove(data) {
		// Update the position of the remote player
		switch(data.player) {
			case 2:
				player2.y = data.y;
				break;
			case 3:
				player3.y = data.y;
				break;
			case 4:
				player4.y = data.y;
				break;
		}
	}

///////////////////////////////NUNO TEMP////////////////////////////////////

let gameSocket;

//WebSocket Connection for game communication:
function connectToGameSocket() {
	gameSocket = new WebSocket('wss://localhost:8000/ws/game/');

	//sets up an onopen handler for when the WebSocket
	// connection is successfully established.
	gameSocket.onopen = function(event) {
		console.log('Game WebSocket connection established.');
	};
	//sets a message handler when message received from server
	// and an parses message to JSON object to handleGameMessage
	gameSocket.onmessage = function(event) {
		const data = JSON.parse(event.data);
		handleGameMsg(data);
	};
	//Handler for closing
	gameSocket.onclose = function(event) {
		console.log('Game WebSocket connection closed.');
	};
	//handler for error
	gameSocket.onerror = function(error) {
		console.error('Game WebSocket error:', error);
	};
}

///////////////////////PEDRO//////////////////////////

export function sendInvite(user_id) {
    alert('remote Invite sent to user ' + user_id);

    const socket = new WebSocket('wss://localhost:8000/ws/alerts/');

    socket.onopen = function(event) {
        console.log('WebSocket connection established.');
        alert('WebSocket connection established.');

        // Enviar mensagem ao servidor WebSocket
        const message = JSON.stringify({
            recipient_id: user_id,
            message: 'You have a new invite! To a game of Pong!',
        });
        console.log('Sending message:', message);
        socket.send(message);
    };

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
		//handleGameMsg(data);
        console.log('Message received from server:', data);
        alert(data.message);
    };

    socket.onclose = function(event) {
        console.log('WebSocket connection closed.');
    };

    socket.onerror = function(error) {
        console.error('WebSocket error:', error);
    };
}
*/