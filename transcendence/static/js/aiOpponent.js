// static/js/aiOpponent.js

'use strict';

let lastPredicUpdateTime = 0;
let predicYWithError = 0;

function addPredicError(predictedY, player2, canvas) {
	const maxOffset = player2.height / 2; // Max deviation within paddle height

	// Generate a random\\ number to determine the error type
	const randomFactor = Math.random(); // Value between 0 and 1

	if (randomFactor < 0.10) {
		// 10% chance: High deviation (closer to edges and sometimes outside)
		return predictedY + (Math.random() * maxOffset * 2.7 - maxOffset * 1.35);
	} else {
		// 90% chance: small deviation (close to the center)
		return predictedY + (Math.random() * maxOffset * 1.4 - maxOffset * 0.70);
	}
}

function predBallYPos(ball, canvas, player2) {
	let predictedY = ball.y;
	let ballX = ball.x;
	let tempGravity = ball.gravity;
	const maxIterations = 100;
	let iterations = 0;

	while (ballX < canvas.width - player2.width - ball.width && iterations < maxIterations) {
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

function moveAiPaddleBallComming(ball, canvas, aiRefreshView) {
	const currentTime = Date.now();
			//console.log("aioppon.js: lastLeftHitTime", window.lastLeftHitTime);
			//console.log("aioppon.js: currentTime", currentTime);
			//console.log("aioppon.js: curr - LLHTime", currentTime - window.lastLeftHitTime);

	if (!lastPredicUpdateTime || (currentTime - lastPredicUpdateTime >= aiRefreshView)) {
			//console.log("currentTime - lastPredic:", currentTime - lastPredicUpdateTime);
		const predictedY = predBallYPos(ball, canvas, player2);
			console.log("PredictedY:", predictedY);
		predicYWithError = addPredicError(predictedY, player2, canvas);
		lastPredicUpdateTime = currentTime;
			//console.log("aioppon.js: lastPredicUpdateTime:", lastPredicUpdateTime);
	}
	let newY = player2.y;

	// Se distancia do centro da paddle ate a previsao targetY for maior que a deadzone,
		// mover na direcao da bola, proximo da paddle já não mexe
	const aiPaddleCenterPos = newY + player2.height / 2;
	const deadZone = Math.max(player2.gravity, 10);
	if (Math.abs(aiPaddleCenterPos - predicYWithError) > deadZone) {
		const direction = predicYWithError < aiPaddleCenterPos ? -1 : 1;
		newY += direction * player2.gravity;
			//console.log("AI moving Y, newY");
	}
	// Move and Ensure paddle stays within canvas bounds
	window.player2.y = Math.max(Math.min(newY, canvas.height - player2.height), 0);
}

function aiLogic(ball, canvas, aiRefreshView) {
	const currentTime = Date.now();

	if (ball.speed > 0) {
		if (window.ballTurnedRight && (currentTime - window.lastLeftHitTime <= aiRefreshView))
			return;

		moveAiPaddleBallComming(ball, canvas, aiRefreshView);

	} else
		return;
}

// Export the aiLogic function to the global window object
window.aiLogic = aiLogic;