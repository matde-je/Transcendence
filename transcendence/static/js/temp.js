//////////////////////remote1Vs1.js////////////////////////////////

import { getCookie, checkAuthentication, getAuthenticationStatus, getUserData, getUsernameById, updateInviteInit } from './utils.js';
import { getPendingInvitesForLoggedInUser, getPendingInviteId, getInviteDetails, removeButtons, getAcceptedInvite, getAcceptedInviteId } from './utils.js';
import { showHome } from './app.js';
"use strict"

let canvas;
let context;
let score1 = 0;
let score2 = 0;
let ani;
let gameOver = false;
let pause = false;
let initialBallGravity = 1;
let maxGravity = initialBallGravity * 2;
let ballSpeed = 7;
let paddleGravity = 2;
let remoteReady = 0;
let isHost = false; // Determines which player controls ball updates
if (typeof window.init === 'undefined') {
	window.init = 0;
}
if (typeof window.init_opp === 'undefined') {
	window.init_opp = 0;
}

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
	initialBallGravity = 1;
	maxGravity = initialBallGravity * 2;
	ballSpeed = 7;
	window.paddleGravity = paddleGravity;
	if (window.init != 3)
		ani = window.requestAnimationFrame(loop);
	setupGameSocket();
}

class Element {
	constructor(options) {this.x = options.x;this.y = options.y; this.width = options.width;
		this.height = options.height; this.color = options.color;
		this.speed = options.speed || 2;this.gravity = options.gravity;}
}

const player1 = new Element ( { x: 10, y: 170, width: 12, height: 60, color: "#fff", gravity: paddleGravity,});

const player2 = new Element ( { x: 530, y: 170, width: 12, height: 60, color: "#fff", gravity: paddleGravity,});

window.ball = new Element ( { x: 175, y: 200, width: 10, height: 10, color: "#fff",
								speed: ballSpeed, gravity: initialBallGravity,});

//////////////////////////////KEYBOARD, EVENTLISTENER///////////////////////////////////

window.keys = {};

window.addEventListener("keydown", async (e) => {
	keys[e.key] = true; //mark the key as pressed

	if (window.location.pathname === '/rock-paper-scissors/multiplayer')
		return;

	const loggedInUser = await getUserData();
	const loggedInUserId = loggedInUser.id;
	const inviteDetails = await getAcceptedInvite(loggedInUserId)

	if (gameOver || (window.init === 0) && (keys['r'] || keys['R'])) {
		const player1 = inviteDetails.invite.sender_id;
		const player2 = inviteDetails.invite.recipient_id;
		if(player1 === loggedInUserId){

			const message = JSON.stringify({
				sender_id: inviteDetails.invite.sender_id,
				recipient_id: inviteDetails.invite.recipient_id,
				//message: `Player1-The remote player is ready!`,
				//invite_status: 'accepted',
				init_opponent: 1,
			});
			window.init++;
			window.remoteSocket.send(message);
		}else if(player2 === loggedInUserId){
			const message = JSON.stringify({
				sender_id: inviteDetails.invite.recipient_id,
				recipient_id: inviteDetails.invite.sender_id,
				//message: `Player1-The remote player is ready!`,
				//invite_status: 'accepted',
				init_opponent: 1,
			});
			window.remoteSocket.send(message);
			window.init++;
		}
		loop();
	}
	if (gameOver || (window.init === 1 && window.init_opp === 1) && (keys['r'] || keys['R'])) {
		const player1 = inviteDetails.invite.sender_id;
		const player2 = inviteDetails.invite.recipient_id;
		if(player1 === loggedInUserId){

			const message = JSON.stringify({
				sender_id: player1,
				recipient_id: player2,
				//message: `Player1-The remote player is ready!`,
				//invite_status: 'accepted',
				init_opponent: 3,
			});
			window.init++;
			window.init_opp++;
			window.remoteSocket.send(message);
		}else if(player2 === loggedInUserId){

			const message = JSON.stringify({
				sender_id: player2,
				recipient_id: player1,
				//message: `Player1-The remote player is ready!`,
				//invite_status: 'accepted',
				init_opponent: 3,
			});
			window.init++;
			window.init_opp++;
			window.remoteSocket.send(message);
		}
		loop();
	}

	if (keys['p'] && gameOver == false && window.init == 2 && window.init_opp === 2) {
		pause = !pause;
		if (pause == true) {
			context.font = "20px 'Courier New', Courier, monospace";
			context.textAlign = "center";
			context.fillStyle = "white";
			context.fillText("Paused, press P to continue", canvas.width / 2, canvas.height / 2);
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
	if (!gameOver && !pause) {
		// Player 1 movement (local player)
		let newY = player1.y;
		if (keys['q'] && player1.y > 0)
			newY -= player1.gravity * 2; //up
		if (keys['a'] && player1.y + player1.height < canvas.height)
			newY += player1.gravity * 2; //down
		player1.y = newY;
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

function whoIsHost() {
	console.log('Who is the host: ', isHost);
	if (isHost) {
		context.font = "15px 'Courier New', Courier, monospace";
		context.fillStyle = "#fff";
		context.fillText(`Im host`, canvas.width * 0.1, canvas.height * 0.975);
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
	console.log('scor1: ', score1);
	context.font = "50px 'Courier New', Courier, monospace";
	context.fillStyle = "#fff";
	context.fillText(`${score1}`, canvas.width * 0.4, canvas.height * 0.125);
}

function score_2(){
	console.log('scor2: ', score2);
	context.font = "50px 'Courier New', Courier, monospace";
	context.fillStyle = "#fff";
	context.fillText(score2, canvas.width * 0.6, canvas.height * 0.125);
}

function drawAll(){
	context.clearRect(0, 0, canvas.width, canvas.height);
	whoIsHost();
	center_line();
	draw(ball);
	draw(player1);
	draw(player2);
	score_1();
	score_2();
}

////////////////////////////////////REMOTE///////////////////////////////////
	////////////////NUNO//////////////////

// Iniciada na initializeGame()
async function setupGameSocket() {
	const isAuthenticated = await checkAuthentication();
	if (!window.gameSocket)
		window.gameSocket = new WebSocket(`wss://${window.location.hostname}:8000/ws/game/`);

	window.gameSocket.onopen = function (event) {
		console.log('✅ Gamesocket connection established.');
		//alert('Gamesocket connection established.');
	};
	window.gameSocket.onmessage = function (event) {
		const data = JSON.parse(event.data);
		console.log("Received gameState:", data);
		if (data.type === "gameState") {
			receiveGameState(data);
		}
	};
	window.gameSocket.onerror = function (error) {
		console.error('❌ Game Gamesocket error:', error);
	};
	window.gameSocket.onclose = function () {
		console.log('✅ Game Gamesocket connection closed.');
	};
}
// Sends paddle positions, ball movement (only from the host), and scores
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
	console.log('sending:\n',gameState);
	gameSocket.send(JSON.stringify({ type: 'gameState', data: gameState }));
}
// Update the opponent's paddle and (if not the host) the ball
function receiveGameState(data) {
	console.log('receiving:\n',data);
	player2.y = data.data.playerY;
	if (!isHost) {
		ball.x = data.data.ballX;
		ball.y = data.data.ballY;
		ball.speed = data.data.ballSpeed;
		ball.gravity = data.data.ballGravity;
	}
	score1 = data.data.score1;
	score2 = data.data.score2;
}

////////////////////////////////////LOOP///////////////////////////////////

function logGameMove(message) {
	console.count(message);
}

export async function loop() {

	const displayMessage = (message) => {
		reset_game();
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.font = '20px \'Courier New\', Courier, monospace';
		context.textAlign = 'center';
		context.fillStyle = 'white';
		context.fillText(message, canvas.width / 2, canvas.height * 0.125);
		draw(ball);
		draw(player1);
		draw(player2);
	};

	// Handle different waiting states
	if (window.init === 0 && window.init_opp === 0) {
		displayMessage('You and the opponent need to press (r) for Ready!');
	}
	else if (window.init === 1 && window.init_opp === 0) {
		displayMessage('You pressed (r) already! WAITING FOR REMOTE PLAYER...');
	}
	else if (window.init === 0 && window.init_opp === 1) {
		displayMessage('Remote player is ready! Press (r) to start the game.');
	}

	if(!gameOver && !pause && window.init === 2){
		logGameMove('Game Anymations Iteractions:');
		window.cancelAnimationFrame(ani);
		context.clearRect(0, 0, canvas.width, canvas.height);

		handleMoves();
		if (isHost) {
			bounceBall();
			paddleCollision();
			sendGameState();
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
		context.fillText('WIN', x, canvas.height * 0.375);
		context.font = '30px \'Courier New\', Courier, monospace';
		context.fillText('S - START NEW GAME', x, canvas.height * 0.875);
		gameOver = true;
		window.cancelAnimationFrame(ani);
		}
	}

	if (!gameOver && score1 < 10 && score2 < 10 && window.init === 2) {
		ani = window.requestAnimationFrame(loop);
	}
}
