// static/js/aiOpponent.js

'use strict';

function addPredictionError(predictedY, player2, canvas) {
	const paddleCenter = player2.y + player2.height / 2;
	const maxOffset = player2.height / 2; // Max deviation within paddle height

	// Generate a random number to determine the error type
	const randomFactor = Math.random(); // Value between 0 and 1

	if (randomFactor < 0.01) {
		// 1% chance: completely wrong prediction (outside the paddle)
		return Math.random() * canvas.height;
	} else if (randomFactor < 0.2) {
		// 19% chance: high deviation (closer to edges)
		return predictedY + (Math.random() * maxOffset * 1.5 - maxOffset * 0.75);
	} else {
		// 80% chance: small deviation (close to the center)
		return predictedY + (Math.random() * maxOffset * 0.5 - maxOffset * 0.25);
	}
}

function predictBallYPos(ball, canvas, player2) {
	let predictedY = ball.y;
	let ballX = ball.x;
	let tempGravity = ball.gravity;
	const maxIterations = 100;
	let iterations = 0;

	while (ballX < canvas.width - player2.width - ball.width / 2 && iterations < maxIterations) {
		// Simulate the ball's movement
		ballX += ball.speed;
		predictedY += tempGravity;

		// Check for wall collisions
		if (predictedY - ball.width < 0 || predictedY + ball.width > canvas.height) {
			tempGravity = -tempGravity; // Reverse Y velocity on wall collision
		}
		iterations++;
	}
	return predictedY;
}

function aiLogic(ball, canvas) {

	const currentTime = Date.now();
	//console.log("Time since last hit:", currentTime - window.lastLeftHitTime);


	if (ball.speed > 0) {
		if (window.ballTurnedRight && (currentTime - window.lastLeftHitTime <= window.aiRefreshView))
			return;

		const targetY = addPredictionError(predictBallYPos(ball, canvas, player2), player2, canvas);
		//console.log("targetY", targetY);
		let newY = player2.y;

		//Se distancia do centro da paddle ate a previsao targetY for maior que a
		//distancia percorrida em 1seg, que é a velocidade gravity, mover na direcao da bola
		const aiPaddleCenterPos = newY + player2.height / 2;

		// Define a dead zone to stop jittering when close enough
		const deadZone = player2.width; // Pixels of tolerance

		if (Math.abs(aiPaddleCenterPos - targetY) > deadZone) {
			const direction = targetY < aiPaddleCenterPos ? -1 : 1;
			newY += direction * player2.gravity;
		}
		// Move and Ensure paddle stays within canvas bounds if ball moving towards AI
		if (ball.speed > 0)
			//console.log("Paddle moved");
			window.player2.y = Math.max(Math.min(newY, canvas.height - player2.height), 0);

		//Reset ballTurnedRight after AI has processed it
		window.ballTurnedRight = false;
}
	else
		return;
}

// Export the aiLogic function to the global window object
window.aiLogic = aiLogic;