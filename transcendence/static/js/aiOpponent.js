// static/js/aiOpponent.js

'use strict';

function predictBallYPos(ball, canvas, player2) {
	let predictedY = ball.y;
	let ballX = ball.x;
	let tempGravity = ball.gravity;
	const maxIterations = 100;
	let iterations = 0;

	while (ballX < canvas.width - player2.width - 10 && iterations < maxIterations) {
		// Simulate the ball's movement
		ballX += ball.speed;
		predictedY += tempGravity;

		// Check for wall collisions
		if (predictedY - ball.diamet < 0 || predictedY + ball.diamet > canvas.height) {
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

		const targetY = predictBallYPos(ball, canvas, player2);
		//console.log("targetY", targetY);
		let newY = player2.y;

		//Se distancia do centro da paddle ate a previsao targetY for maior que a
		//aiPistancia percorrida em 1seg, a velocidade gravity mover na direcao da bola
		const aiPaddleCenterPos = newY + player2.height / 2;
		if (Math.abs(aiPaddleCenterPos - targetY) > player2.gravity) {
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