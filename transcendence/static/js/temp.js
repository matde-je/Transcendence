let username1 = " Anonymous";
let username2 = "";
let lastLeftHitTime = 0;
window.previousBallDirection = 0;
window.ballTurnedRight = 0;
window.aiRefreshView = 1000;

	//point scored

	if (ball.x + ball.width < 0) {
		score2 += 1;
		ballToCenterAndMove()

	} else if (ball.x > canvas.width) {
		score1 += 1;
		ballToCenterAndMove()
	}
}

// Put ball back in center and start to more 50/50 to left or right, up or down.
function ballToCenterAndMove() {
	ball.x = canvas.width / 2 - ball.width / 2;
	ball.y = canvas.height / 2 - ball.width / 2;
	let randomSign = Math.random() < 0.5 ? -1 : 1;
	ball.gravity = initialBallGravity * randomSign;
	ball.speed = ball.speed * randomSign;
	window.previousBallDirection = randomSign;
}

function bounceBall() {
	//console.log("bounceBall() foi chamada");
	if (gameOver == true)
		return ;
	ball.x += ball.speed;
	ball.y += ball.gravity;

	//console.log("ball.speed:", ball.speed);
	//console.log("window.previousBallDirection:", window.previousBallDirection);
	// Update previousBallDirection and reset ballTurnedRight if necessary
	if (ball.speed > 0 && window.previousBallDirection == -1) {
		window.previousBallDirection = 1;
		window.ballTurnedRight = true;
		window.lastLeftHitTime = Date.now();
		console.log("game.js: lastLeftHitTime", window.lastLeftHitTime);

	} else if (ball.speed < 0 && window.previousBallDirection == 1) {
		window.previousBallDirection = -1;
		ballTurnedRight = false;
	}

	//Keep in bounds
	if (ball.y <= 0 || ball.y + ball.width >= canvas.height) {
		ball.gravity *= -1;
		if (ball.y <= 0)
			ball.y = 0;
		else
			ball.y = canvas.height - ball.width;
	}
}
