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

function handleAiMove() {
	//let ramdomMoveFactor = Math.random() * 0.4 + 0.8;
	if (keys['ArrowUp'] && player2.y > 0)
		player2.y -= (aiSpeed); //up
	if (keys['ArrowDown'] && player2.y + player2.height < canvas.height)
		player2.y += (aiSpeed); //down
}

function simulateAiKeyPress(player2, predictBallPosition) {
	let keyToPress = null;
	if (predictBallPosition.y < player2.y + player2.height / 2)
		keyToPress = 'ArrowUp'; //move up
	else if (predictBallPosition.y > player2.y + player2.height / 2)
		keyToPress = 'ArrowDown'; //move down

	keys['ArrowUp'] = false;
	keys['ArrowDown'] = false;

	if (keyToPress) {
		keys[keyToPress] = true;
		setTimeout(() => { // Simulate key release after a short delay
			keys[keyToPress] = false;
		}, 300); //100 1ms delay
	}
	if (player2.y < 0)
		keys['ArrowUp'] = false;
	else if (player2.y + player2.height > canvas.height)
		keys['ArrowDown'] = false;
		handleAiMove();
}

function aiLogic(AiRefreshView) {
	const currentTime = Date.now();
	console.log("CurrentTime - AiLastUpdateTime: ", currentTime - AiLastUpdateTime);
	// AI can only refresh once per second (1000 ms)
	if (currentTime - AiLastUpdateTime >= AiRefreshView) {
		const predictedPosition = predictBallPosition();
		console.log("Predicted ball position: ", predictedPosition);
		simulateAiKeyPress(player2, predictedPosition);
		AiLastUpdateTime = currentTime;
	}
}

// Export moveAI function if using ES6 modules, or attach to window for global access
window.aiLogic = aiLogic;