// static/js/aiOpponent.js

'use strict';

/* AI logic for controlling the opponent */

/**
 * Predicts the future position of the ball based on its current position, speed, and gravity.
 * Handles the ball bouncing off the top and bottom walls of the canvas.
 *
 * @returns {Object} An object containing the predicted x and y coordinates of the ball.
 * @returns {number} return.x - The predicted x-coordinate of the ball.
 * @returns {number} return.y - The predicted y-coordinate of the ball.
 */
function predictBallPosition() {
    // Predict the future position of the ball
    let futureX = window.ball.x + window.ball.speed * window.aiRefreshView;
    let futureY = window.ball.y + window.ball.gravity * window.aiRefreshView;

    // Handle ball bouncing off the walls
    if (futureY < 0) { // Bounce at the top
        futureY = 0;
    } else if (futureY + window.ball.height > window.canvas.height) { // Bounce at the bottom
        futureY = window.canvas.height - window.ball.height;
    }
    return { x: futureX, y: futureY };
}

/**
 * Handles the movement of the AI paddle based on key presses.
 * Moves the AI paddle up when the 'ArrowUp' key is pressed and down when the 'ArrowDown' key is pressed.
 * Ensures the paddle stays within the bounds of the canvas.
 */
function handleAiMove() {
    // Move the AI paddle based on key presses
    if (window.keys['ArrowUp'] && window.player2.y > 0) {
        window.player2.y -= window.aiSpeed; // Move up
    }
    if (window.keys['ArrowDown'] && window.player2.y + window.player2.height < window.canvas.height) {
        window.player2.y += window.aiSpeed; // Move down
    }
}

/**
 * Simulates AI key press actions to control the paddle movement based on the predicted ball position.
 *
 * @param {Object} player2 - The AI player object.
 * @param {number} player2.y - The current y-coordinate of the AI player.
 * @param {number} player2.height - The height of the AI player.
 * @param {Object} predictedPosition - The predicted position of the ball.
 * @param {number} predictedPosition.y - The predicted y-coordinate of the ball.
 */
function simulateAiKeyPress(player2, predictedPosition) {
    // Determine which key to press based on the predicted ball position
    let keyToPress = null;
    if (predictedPosition.y < player2.y + player2.height / 2) {
        keyToPress = 'ArrowUp'; // Move up
    } else if (predictedPosition.y > player2.y + player2.height / 2) {
        keyToPress = 'ArrowDown'; // Move down
    }

    // Reset key presses
    window.keys['ArrowUp'] = false;
    window.keys['ArrowDown'] = false;

    if (keyToPress) {
        window.keys[keyToPress] = true;
        setTimeout(() => { // Simulate key release after a short delay
            window.keys[keyToPress] = false;
        }, 300); // 300 ms delay
    }

    // Prevent the AI paddle from moving out of bounds
    if (player2.y < 0) {
        window.keys['ArrowUp'] = false;
    } else if (player2.y + player2.height > window.canvas.height) {
        window.keys['ArrowDown'] = false;
    }

    handleAiMove();
}

/**
 * Controls the AI logic for updating the opponent's position in a game.
 *
 * @param {number} aiRefreshView - The interval in milliseconds at which the AI is allowed to update.
 */
function aiLogic(aiRefreshView) {
    const currentTime = Date.now();
    console.log('Current Time - aiLastUpdateTime:', currentTime - window.aiLastUpdateTime);
    // AI can only update once per specified refresh interval
    if (currentTime - window.aiLastUpdateTime >= aiRefreshView) {
        const predictedPosition = predictBallPosition();
        console.log('Predicted ball position:', predictedPosition);
        simulateAiKeyPress(window.player2, predictedPosition);
        window.aiLastUpdateTime = currentTime;
    }
}

// Export the aiLogic function to the global window object
window.aiLogic = aiLogic;