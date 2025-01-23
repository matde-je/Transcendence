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

function updateAI(player2, ball, canvas) {
	// Don't move the AI paddle if not enough time has passed
	const currentTime = Date.now();
	if (currentTime - window.lastLeftHitTime < window.aiRefreshView)
		return;

	const targetY = predictBallYPos(ball, canvas, player2);

	// Move AI paddle toward the predicted position
	let newY = player2.y;
	if (Math.abs(newY + player2.height / 2 - targetY) > player2.gravity) {
		const direction = targetY < newY + player2.height / 2 ? -1 : 1;
		newY += direction * player2.gravity;
	}
	// Move and Ensure paddle stays within canvas bounds if ball moving towards AI
	if (ball.speed > 0)
		player2.y = Math.max(Math.min(newY, canvas.height - player2.height), 0);
}

function aiLogic() {
		updateAI(player2, ball, canvas);
}

// Export the aiLogic function to the global window object
window.aiLogic = aiLogic;