// ai.js

// AI difficulty setting, adjust this value for more or less challenge
const aiSpeed = 2;

function predictBallPosition(ball, deltaTime) {
	// Predict future ball position based on current speed/gravity and direction
	let futureX = ball.x + ball.speed * deltaTime;
	let futureY = ball.y + ball.gravity * deltaTime;
	// Consider for ball bouncing off walls
	if (futureY < 0) // Bounce the ball at the top
		futureY = 0;
	else if
		(futureY + ball.height > cavas.height) { // Bounce the ball at the bottom
			futureY = canvas.height - ball.height;
	}
}

function moveAI() {
	if (ball.y < player2.y + player2.height / 2) {
		player2.y -= aiSpeed;
	} else if (ball.y > player2.y + player2.height / 2) {
		player2.y += aiSpeed;
	}

	// Keep player2 within canvas bounds
	if (player2.y < 0) {
		player2.y = 0;
	} else if (player2.y + player2.height > canvas.height) {
		player2.y = canvas.height - player2.height;
	}
}

// Export moveAI function if using ES6 modules, or attach to window for global access
window.moveAI = moveAI;