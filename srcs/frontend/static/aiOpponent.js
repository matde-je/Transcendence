// AI difficulty setting, adjust this value for more or less challenge

function predictBallPosition() {
	// Predict future ball position based on current speed/gravity and direction
	let futureX = ball.x + ball.speed * AiRefreshView;
	let futureY = ball.y + ball.gravity * AiRefreshView;

	// Consider for ball bouncing off walls
	if (futureY < 0) // Bounce the ball at the top
		futureY = 0;
	else if
		(futureY + ball.height > canvas.height) { // Bounce the ball at the bottom
			futureY = canvas.height - ball.height;
	}
	return { x: futureX, y: futureY };
}

function simulateAIKeyPress(player2, predictBallPosition) {
	// Simulate pressing "i" key (move up)
	if (predictBallPosition.y < player2.y + player2.height / 2)
		player2.y -= aiSpeed;
	// Simulate pressing "k" key (move down)
	else if (predictBallPosition.y > player2.y + player2.height / 2)
		player2.y += aiSpeed;
	if (player2.y < 0) {
		player2 = 0;
	} else if (player2.y + player2.height > canvas.height) {
		player2.y = canvas.height - player2.height;
	}
}

function aiLogic(AiRefreshView) {
	const currentTime = Date.now();
	console.log("AI last update: " + AiLastUpdateTime);
	console.log("Current time: " + currentTime);
	// AI can only refresh once per second (1000 ms)
	if (currentTime - AiLastUpdateTime >= AiRefreshView) {
		const predictedPosition = predictBallPosition();
		console.log("Predicted ball position: ", predictedPosition);
		simulateAIKeyPress(player2, predictedPosition);
		AiLastUpdateTime = currentTime;
	} else {
		console.log("AI is waiting to refresh...");
	}
}


// Export moveAI function if using ES6 modules, or attach to window for global access
window.aiLogic = aiLogic;