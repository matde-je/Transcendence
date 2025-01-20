// static/js/aiOpponent.js

'use strict';

//Temporary draw function
function drawPredPos(ctx, position, lineLength = 30, color = 'green') {
	if (!ctx) {
		console.error("Context is undefined. Cannot draw predicted position.");
		return;
	}
	const { x, y } = position;

	ctx.strokeStyle = color;
	ctx.lineWidth = 4;

	ctx.beginPath();
	ctx.moveTo(x, y - lineLength / 2); // Start point
	ctx.lineTo(x, y + lineLength / 2); // End point
	ctx.stroke();
}

function predictBallPos() {
	// Predict total time to reach left wall
	const totalTime = (window.canvas.width - window.ball.x) / window.ball.speed;
	// Predict the future position of the ball
	let futureY = window.ball.y + window.ball.gravity * totalTime;

	// Handle bounces off the top and bottom walls
	if (futureY <= 0) {
		futureY = -futureY; // Bounce at the top
	} else if (futureY + window.ball.height >= window.canvas.height) { // Bounce at the bottom
		futureY = window.canvas.height - window.ball.height;
	}
	return {futureY};
}

function simulateAiKeyPress(player2, predPos) {
	const paddleCenter = player2.y + player2.height / 2;
	console.log('paddleCenter:', paddleCenter);
	console.log('predPos', predPos);
	console.log('window.paddleGravity', window.paddleGravity);
	// AI logic to decide movement
	if (predPos < paddleCenter) {
		player2.y -= window.paddleGravity;
		console.log('movingUp:');
	} else if (predPos > paddleCenter) {
		player2.y += window.paddleGravity;
		console.log('movingDown');
	}
}

let aiLastUpdateTime = 0;

function aiLogic(aiRefreshView) {
	const currentTime = Date.now();
	if (currentTime - aiLastUpdateTime >= aiRefreshView && window.ball.speed > 0) {
		const predPos = predictBallPos();
		console.log('Predicted ball position:', predPos);
		drawPredPos(window.context, predPos);
		simulateAiKeyPress(window.player2, predPos);
		aiLastUpdateTime = currentTime;
	}
}

// Export the aiLogic function to the global window object
window.aiLogic = aiLogic;