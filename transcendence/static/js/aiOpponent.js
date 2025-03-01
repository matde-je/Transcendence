// static/js/aiOpponent.js

'use strict';

let lastPredicUpdateTime = 0;
let lastPredicY = 0;

function addPredicError(predictedY, player2, canvas) {
	const paddleCenter = player2.y + player2.height / 2;
	const maxOffset = player2.height / 2; // Max deviation within paddle height

	// Generate a random\\ number to determine the error type
	const randomFactor = Math.random(); // Value between 0 and 1

	if (randomFactor < 0.03) {
		// 3% chance: completely wrong predic (outside the paddle)
		return Math.random() * canvas.height;
	} else if (randomFactor < 0.4) {
		// 37% chance: high deviation (closer to edges)
		return predictedY + (Math.random() * maxOffset * 2 - maxOffset);
	} else {
		// 60% chance: small deviation (close to the center)
		return predictedY + (Math.random() * maxOffset * 1.2 - maxOffset * 0.6);
	}
}

function predBallYPos(ball, canvas, player2) {
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

function aiLogic(ball, canvas, aiRefreshView, inicialTime) {

	const currentTime = Date.now();
			//console.log("aioppon.js: lastLeftHitTime", window.lastLeftHitTime);
			//console.log("aioppon.js: currentTime", currentTime);
			//console.log("aioppon.js: curr - LLHTime", currentTime - window.lastLeftHitTime);

	if (ball.speed > 0) {
		if (window.ballTurnedRight && (currentTime - window.lastLeftHitTime <= aiRefreshView))
			return;

		if (!lastPredicUpdateTime || (currentTime - lastPredicUpdateTime >= aiRefreshView)) {
				//console.log("currentTime - lastPredic:", currentTime - lastPredicUpdateTime);

			const predictedY = predBallYPos(ball, canvas, player2);
			lastPredicY = addPredicError(predictedY, player2, canvas);
			lastPredicUpdateTime = currentTime;

				//console.log("aioppon.js: lastPredicUpdateTime:", lastPredicUpdateTime);
		}
		let newY = player2.y;

		/* Se distancia do centro da paddle ate a previsao targetY for maior que a deadzone,
		mover na direcao da bola, proximo da paddle já não mexe*/
		const aiPaddleCenterPos = newY + player2.height / 2;
		const deadZone = Math.max(player2.gravity, 10);
		if (Math.abs(aiPaddleCenterPos - lastPredicY) > deadZone) {
			const direction = lastPredicY < aiPaddleCenterPos ? -1 : 1;
			newY += direction * player2.gravity;
				//console.log("AI moving Y, newY");
		}
		// Move and Ensure paddle stays within canvas bounds if ball moving towards AI
				//console.log("AI moving Y, newY");
		window.player2.y = Math.max(Math.min(newY, canvas.height - player2.height), 0);
	} else
		return;
}

// Export the aiLogic function to the global window object
window.aiLogic = aiLogic;