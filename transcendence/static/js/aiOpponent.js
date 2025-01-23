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
/*
function predictBallPos() {
	// Predict total time to reach left wall
	const totalTime = (window.canvas.width - window.ball.x) / window.ball.speed;
	// Predict the future position of the ball
	const futureY = window.ball.y + window.ball.gravity * totalTime;

	// Handle bounces off the top and bottom walls
	if (futureY <= 0) {
		futureY = -futureY; // Bounce at the top
	} else if (futureY + window.ball.height >= window.canvas.height) { // Bounce at the bottom
		futureY = window.canvas.height - window.ball.height;
	}
	return {futureY};
}
	
function simulateAiKeyPress(player2, predPos) {
	const paddleCenter = window.player2.y + player2.height / 2;
	console.log('predPos', predPos);
	// AI logic to decide movement
	if (predPos < paddleCenter) {
		window.player2.y -= window.paddle2.gravity;
		console.log('movingUp:');
	} else if (predPos > paddleCenter) {
		window.player2.y += window.paddle2.gravity;
		console.log('movingDown');
	}

*/
function predictBallYPos(ball, canvas) {
    let predictedY = ball.y;
    let ballX = ball.x;

    while (ballX < canvas.width - paddleWidth - 10) {
        // Simulate the ball's movement
        ballX += ball.speed;
        predictedY += ball.gravity;

        // Check for wall collisions
        if (predictedY - ball.radius < 0 || predictedY + ball.radius > canvas.height) {
            ball.gravity = -ball.gravity; // Reverse Y velocity on wall collision
        }
    }
    return predictedY;
}

function updateAI(player2, ball, canvas) {
    const targetY = predictBallYPosition(ball, canvas);

    // Move AI paddle toward the predicted position
    if (Math.abs(player2.y + player2.height / 2 - targetY) > player2.gravity) {
        const direction = targetY < player2.y + player2.height / 2 ? -1 : 1;
        player2.y += direction * player2.gravity;
		console.log('movingAI:');
    }
    // Ensure paddle stays within canvas bounds
    player2.y = Math.max(Math.min(player2.y, canvas.height - player2.height), 0);
}

function aiLogic(aiRefreshView, aiLastUpdateTime) {
	console.log('window.aiLastUpdateTime', window.aiLastUpdateTime);
	const currentTime = Date.now();
	if ((currentTime - aiLastUpdateTime >= aiRefreshView) && window.ball.speed > 0) {
		console.log('enter ailogic');
		updateAI(window.player2, window.ball, window.canvas);
		drawPredPos(window.context, predPos);
		simulateAiKeyPress(window.player2, predPos);
		window.aiLastUpdateTime = currentTime;
	}
}

// Export the aiLogic function to the global window object
window.aiLogic = aiLogic;1