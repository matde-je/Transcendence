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
if (typeof window.init === 'undefined') {
    window.init = 0;
}
// const gameSocket = new WebSocket(`wss://${window.location.hostname}:8000/ws/game/`);

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

window.addEventListener("keydown", async (e) => {
	keys[e.key] = true; //mark the key as pressed

	if (window.location.pathname === '/rock-paper-scissors/multiplayer')
		return;

	const loggedInUser = await getUserData();
	const loggedInUserId = loggedInUser.id;
	const inviteDetails = await getAcceptedInvite(loggedInUserId)
	console.log('inviteDetails:', inviteDetails);
	console.log('key-init:', window.init);


	if (gameOver || (window.init === 0) && (keys['r'] || keys['R'])) {
		console.log("Player pressed 'R'");
		const player1 = inviteDetails.invite.sender_id;
		const player2 = inviteDetails.invite.recipient_id;
		if(player1 === loggedInUserId){
			console.log('Player1');
			const message = JSON.stringify({
				sender_id: inviteDetails.invite.sender_id,
				recipient_id: inviteDetails.invite.recipient_id,
				//message: `Player1-The remote player is ready!`,
				invite_status: 'accepted',
				init_opponent: 1,
			});
			console.log('p1-inviteDetails.invite.init_opponent:', inviteDetails.invite.init_opponent);
			updateInviteInit(inviteDetails.invite.invite_id, 1);
			console.log('p1-inviteDetails.invite.init_opponent:', inviteDetails.invite.init_opponent);

			window.init++;
			window.remoteSocket.send(message);
		}else if(player2 === loggedInUserId){
			console.log('Player2');
			const message = JSON.stringify({
				sender_id: inviteDetails.invite.recipient_id,
				recipient_id: inviteDetails.invite.sender_id,
				message: `Player1-The remote player is ready!`,
				invite_status: 'accepted',
				init_opponent: 1,
			});
			console.log('p2-inviteDetails.invite.init_opponent:', inviteDetails.invite.init_opponent);
			updateInviteInit(inviteDetails.invite.invite_id, 1);
			console.log('p2-inviteDetails.invite.init_opponent:', inviteDetails.invite.init_opponent);

			window.remoteSocket.send(message);
			window.init++;
		}
		loop();
	}
	if (gameOver || (window.init === 1 && inviteDetails.invite.init_opponent === 1) && (keys['r'] || keys['R'])) {

		window.remoteSocket.send(JSON.stringify({ message: "playerReady" }));

		window.cancelAnimationFrame(ani);
		context.clearRect(0, 0, canvas.width, canvas.height);
		startCountdown(() => {
			reset_game();
			ani = window.requestAnimationFrame(loop);
			window.init = 2;
		});
	}

	if (keys['p'] && gameOver == false && window.init == 2 && inviteDetails.invite.init_opponent === 2) {
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

		// Send movement only if it changed
		window.gameSocket.send(JSON.stringify({
			type: "playerMove",
			player: 1,
			y: player1.y
		}));
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

/*Sends the current state to server to be broadcast to other players.
It's used by the players that is considered the "source of truth" for certain aspects of the game*/
function sendGameState(id) {
	if (window.gameSocket && window.gameSocket.readyState === WebSocket.OPEN) {
		const gameState = {
			ball: { x: ball.x, y: ball.y },
			player1: { y: player1.y },
			score1: score1,
			score2: score2
		};
		window.gameSocket.send(JSON.stringify({ type: 'gameState', data: gameState }));
	}
}

/*Receives game state data from the server and updates the local game state.
Used by clients to synchronize their game with the state being maintained by the server.*/
function updateGameState(data) {
	// Sync game state with received data
	player1.y = data.player1Y;
	player2.y = data.player2Y;
	ball.x = data.ballX;
	ball.y = data.ballY;
	ball.speed = data.ballSpeed;
	ball.gravity = data.ballGravity;
	score1 = data.score1;
	score2 = data.score2;
}

///////////////////////PEDRO//////////////////////////

export async function sendInvite(recipient_id) {
	alert('Your remote game invite has been sent to ' + await getUsernameById(recipient_id));

	const loggedInUser = await getUserData();

	const response = await fetch('/users/create_invite/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
		},
		credentials: 'include',
		body: JSON.stringify({ recipient_id: recipient_id }),
	});

	let inviteData
	if (response.ok) {
		inviteData = await response.json();
		//console.log('Invite created successfully:', inviteData);
	} else {
		const errorData = await response.json();
		//console.error('Failed to create invite, status:', response.status, 'error:', errorData);
	}
	const message = JSON.stringify({
		sender_id: inviteData.sender_id,
		recipient_id: inviteData.recipient_id,
		message: `You have received a new game invite from ${await getUsernameById(inviteData.sender_id)}! Join the Pong game now!`,
		invite_status: 'pending',
	});

	//console.log('message:', message);
	updateInviteButtons();
	window.remoteSocket.send(message);
}


export async function updateInviteButtons() {
	const allFriendItems = document.querySelectorAll('[data-friend-id]');
	allFriendItems.forEach(async friendItem => {
		const friendId = friendItem.getAttribute('data-friend-id');
		const isOnline = window.onlineFriends.some(f => f.id == friendId);
		const buttonContainer = friendItem.querySelector('.ms-auto');
		const loggedInUser = await getUserData();
		const loggedInUserId = loggedInUser.id;
		const invite_type = await getPendingInvitesForLoggedInUser(loggedInUserId);
		const invite_type_friend = await getPendingInviteId(loggedInUserId);
		const invite_type_friend2 = await getPendingInviteId(friendId);

		const inviteId = await getPendingInviteId(loggedInUserId);
		const friendIdNumber = parseInt(friendId, 10);

		const inviteDetails = await getInviteDetails(inviteId);
		/* console.log('***********************');
		
		console.log('isOnline:', isOnline);
		console.log('inviteDetails:', inviteDetails);
		console.log('ivite_type:', invite_type.includes('sender'));
		console.log('loggedInUserId:', loggedInUserId);
		console.log('friendId:', friendId); */
/* 		if(inviteId){
			const inviteDetails = await getInviteDetails(inviteId);
			console.log('inviteDetailsSender_id:', inviteDetails.invite.sender_id);
			console.log('inviteDetailsRecipient_id:', inviteDetails.invite.recipient_id);
			console.log('inviteDetailsInvite_status:', inviteDetails.invite.invite_status);
		} */
		
	
	if (inviteDetails && isOnline && invite_type.includes('sender') && inviteDetails.invite.sender_id === loggedInUserId  && inviteDetails.invite.recipient_id === friendIdNumber) {
		//console.log('***********2***********');
			removeButtons(buttonContainer);
			let cancelButton = buttonContainer.querySelector('#cancelButton');
			if (!cancelButton) {
				cancelButton = document.createElement('button');
				cancelButton.textContent = 'Cancel Invite';
				cancelButton.className = 'btn btn-sm btn-info';
				cancelButton.id = 'cancelButton';
				cancelButton.onclick = function() {
					cancelInvite(inviteId);
				};
				buttonContainer.insertBefore(cancelButton, buttonContainer.firstChild);
			}
	} else if (inviteDetails && isOnline && invite_type.includes('recipient') && inviteDetails.invite.recipient_id === loggedInUserId && inviteDetails.invite.sender_id === friendIdNumber) {
		//console.log('***********3***********');
/* 			console.log('isOnline:', isOnline);
		console.log('invite_type:', invite_type);
		console.log('intiveDetails:', inviteDetails);
		console.log('inviteDetailsInvite_status:', inviteDetails.invite.invite_status);
		console.log('loggedInUserId:', loggedInUserId);
		console.log('friendId:', friendId);
		console.log('inviteDetailsSender_id:', inviteDetails.invite.sender_id);
		console.log('inviteDetailsRecipient_id:', inviteDetails.invite.recipient_id); */
		removeButtons(buttonContainer);
		const rejectButton = document.createElement('button');
		rejectButton.textContent = 'Reject';
		rejectButton.className = 'btn btn-sm btn-danger';
		rejectButton.id = 'rejectButton';
		rejectButton.onclick = function() {
			declineInvite(inviteId)
		};
		buttonContainer.insertBefore(rejectButton, buttonContainer.firstChild);

		const acceptButton = document.createElement('button');
		acceptButton.textContent = 'Accept';
		acceptButton.className = 'btn btn-sm btn-success';
		acceptButton.id = 'acceptButton';
		acceptButton.onclick = function() {
			acceptInvite(inviteId)
		};
		buttonContainer.insertBefore(acceptButton, buttonContainer.firstChild);
	}else if(isOnline && !inviteDetails && inviteId){
	//	console.log('***********4***********');
/* 			console.log('isOnline:', isOnline);
		console.log('inviteId:', !inviteId);
		console.log('inviteDetails:', !inviteDetails);
		console.log('invite_type_friend:', invite_type_friend);
		console.log('invite_type_friend2:', !invite_type_friend2); */

		removeButtons(buttonContainer);
	} else if (isOnline) {
		//console.log('***********1***********');
/* 			console.log('isOnline:', isOnline);
		console.log('inviteId:', !inviteId);
		console.log('inviteDetails:', !inviteDetails); */
		removeButtons(buttonContainer);
		let inviteButton = buttonContainer.querySelector('#inviteButton');
		if (!inviteButton) {
			inviteButton = document.createElement('button');
			inviteButton.textContent = 'Invite to Remote Play';
			inviteButton.className = 'btn btn-sm btn-primary';
			inviteButton.id = 'inviteButton';
			inviteButton.addEventListener('click', () => {
				sendInvite(friendId);
			});
			buttonContainer.insertBefore(inviteButton, buttonContainer.firstChild);
		}
	}
	});
}

async function cancelInvite(inviteId) {
    try {
        const response = await fetch(`/users/invite/${inviteId}/cancel/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'include'
        });

        if (response.ok) {
          //  alert('Invite canceled');
           // console.log('Invite canceled:', inviteId);

            // Fetch invite details after canceling
            const inviteDetails = await getInviteDetails(inviteId);
            if (inviteDetails) {
             //   console.log('Invite details after cancellation:', inviteDetails);
				const message = JSON.stringify({
					sender_id: inviteDetails.invite.sender_id,
					recipient_id: inviteDetails.invite.recipient_id,
					message: 'The ' + await getUsernameById(inviteDetails.invite.sender_id) + ' canceled the invitation!',
				});
				window.remoteSocket.send(message);
				updateInviteButtons();
            } else {
                console.log('No invite details after cancellation');
            }
        } else {
            const data = await response.json();
            console.error('Failed to cancel invite:', data);
            alert('Failed to cancel invite');
        }
    } catch (error) {
        console.error('Error canceling invite:', error);
        alert('Error canceling invite');
    }
}

async function declineInvite(inviteId) {
	try {
        const response = await fetch(`/users/invite/${inviteId}/reject/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'include'
        });

        if (response.ok) {
          //  alert('Invite rejected');
          //  console.log('Invite rejected:', inviteId);


            const inviteDetails = await getInviteDetails(inviteId);
            if (inviteDetails) {
             //   console.log('Invite details after rejected:', inviteDetails);
				const message = JSON.stringify({
					sender_id: inviteDetails.invite.recipient_id,
					recipient_id: inviteDetails.invite.sender_id,
					message: 'The ' + await getUsernameById(inviteDetails.invite.recipient_id) + ' rejected the invitation!',
				});
				window.remoteSocket.send(message);
				updateInviteButtons();
            } else {
                console.log('No invite details after rejected');
            }
        } else {
            const data = await response.json();
            console.error('Failed to rejected invite:', data);
            alert('Failed to rejected invite');
        }
    } catch (error) {
        console.error('Error rejecting invite:', error);
        alert('Error rejecting invite');
    }

}

async function acceptInvite(inviteId) {
	try {
        const response = await fetch(`/users/invite/${inviteId}/accept/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'include'
        });

        if (response.ok) {
            alert('Invite accept');
        //    console.log('Invite accept:', inviteId);


            const inviteDetails = await getInviteDetails(inviteId);
            if (inviteDetails) {
             //   console.log('Invite details after accept:', inviteDetails);
				const message = JSON.stringify({
					sender_id: inviteDetails.invite.recipient_id,
					recipient_id: inviteDetails.invite.sender_id,
					message: 'The ' + await getUsernameById(inviteDetails.invite.recipient_id) + ' accept the invitation!',
					invite_status: 'accepted',
				});
				window.remoteSocket.send(message);
				updateInviteButtons();
				showHome()
            } else {
                console.log('No invite details after accept');
            }
        } else {
            const data = await response.json();
            console.error('Failed to accept invite:', data);
            alert('Failed to accept invite');
        }
    } catch (error) {
        console.error('Error accepting invite:', error);
        alert('Error accepting invite');
    }


}

////////////////////////////////////LOOP///////////////////////////////////

async function loop() {

	const loggedInUser = await getUserData();
	const loggedInUserId = loggedInUser.id;
	//console.log('loggedInUserId:', loggedInUserId);
	const inviteDetails = await getAcceptedInvite(loggedInUserId)

	if (window.init === 0 && inviteDetails.invite.init_opponent === 0) {
		reset_game();
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.font = '20px \'Courier New\', Courier, monospace';
		context.textAlign = 'center';
		context.fillStyle = 'white';
		context.fillText('WAITING FOR REMOTE PLAYER...\n Press (r) for Ready!', canvas.width / 2,  canvas.height * 0.125);
		draw(ball);
		draw(player1);
		draw(player2);
	}
	if (window.init === 1 && inviteDetails.invite.init_opponent === 1) {
		reset_game();
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.font = '20px \'Courier New\', Courier, monospace';
		context.textAlign = 'center';
		context.fillStyle = 'white';
		context.fillText('WAITING FOR REMOTE PLAYER...', canvas.width / 2,  canvas.height * 0.125);
		draw(ball);
		draw(player1);
		draw(player2);
	}
	if (window.init === 0 && inviteDetails.invite.init_opponent === 1) {
		reset_game();
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.font = '20px \'Courier New\', Courier, monospace';
		context.textAlign = 'center';
		context.fillStyle = 'white';
		context.fillText('Remote player is ready! Press (r) to start the game.', canvas.width / 2, canvas.height * 0.125);
		draw(ball);
		draw(player1);
		draw(player2);
	}

 	console.log('loop-remote_init:', inviteDetails.invite.init_opponent);
	console.log('loop-init:', window.init);
	console.log('Enter loop');
	if(loggedInUser.id === inviteDetails.invite.sender_id){
		const id = inviteDetails.invite.recipient_id;
	}else{
		const id = inviteDetails.invite.sender_id;
	}

	if (!gameOver && !pause && window.init === 2) {
		console.log("loop game");
		handleMoves();
		bounceBall();
		paddleCollision();
		drawAll();
		sendGameState(id);

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

	if (!gameOver && score1 < 10 && score2 < 10 && window.init === 2)
		ani = window.requestAnimationFrame(loop);
}
