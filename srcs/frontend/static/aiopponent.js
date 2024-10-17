// ai.js

// AI difficulty setting, adjust this value for more or less challenge
const aiSpeed = 2;

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