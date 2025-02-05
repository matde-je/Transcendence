// static/js/rps-multiplayer.js

import { getCookie, capitalizeFirstLetter } from './utils.js';

const choices = ['rock', 'paper', 'scissors'];
const player1Display = document.getElementById('player1Display');
const player2Display = document.getElementById('player2Display');
const resultDisplay = document.getElementById('resultDisplay');
const player1ScoreDisplay = document.getElementById('player1ScoreDisplay');
const player2ScoreDisplay = document.getElementById('player2ScoreDisplay');
let player1Score = 0;
let player2Score = 0;
let player1Choice = null;
let player2Choice = null;

/**
 * Plays a multiplayer round of the RPS game.
 * @param {string} choice - The player's choice ('rock', 'paper', 'scissors').
 * @param {number} player - The player number (1 or 2).
 */
export function playMultiplayerGame(choice, player) {
    const player1Display = document.getElementById('player1Display');
    const player2Display = document.getElementById('player2Display');
    const resultDisplay = document.getElementById('resultDisplay');
    const player1ScoreDisplay = document.getElementById('player1ScoreDisplay');
    const player2ScoreDisplay = document.getElementById('player2ScoreDisplay');
    if (!player1Display || !player2Display || !resultDisplay || !player1ScoreDisplay || !player2ScoreDisplay) {
        console.error('One or more display elements are missing.');
        return;
    }
    // Rest of the playGame function...
    choose(choice, player);
}

/**
 * Handles the player's choice and triggers the game logic when both players have made their choices.
 * @param {string} choice - The player's choice.
 * @param {number} player - The player number.
 */
function choose(choice, player) {
    if (player === 1) {
        player1Choice = choice;
    } else if (player === 2) {
        player2Choice = choice;
    }

    if (player1Choice && player2Choice) {
        playGame();
    }
}

/**
 * Executes the game logic for Multiplayer mode.
 */
function playGame() {
    const player1Display = document.getElementById('player1Display');
    const player2Display = document.getElementById('player2Display');
    const resultDisplay = document.getElementById('resultDisplay');
    const player1ScoreDisplay = document.getElementById('player1ScoreDisplay');
    const player2ScoreDisplay = document.getElementById('player2ScoreDisplay');

    if (!player1Display || !player2Display || !resultDisplay || !player1ScoreDisplay || !player2ScoreDisplay) {
        console.error('One or more display elements are missing.');
        return;
    }
    let result = '';

    if (player1Score === 3 || player2Score === 3)
        resetScores();

    if (player1Choice === player2Choice) {
        result = "It's a tie!";
    } else {
        switch (player1Choice) {
            case 'rock':
                result = player2Choice === 'scissors' ? 'Player 1 wins!' : 'Player 2 wins!';
                break;
            case 'paper':
                result = player2Choice === 'rock' ? 'Player 1 wins!' : 'Player 2 wins!';
                break;
            case 'scissors':
                result = player2Choice === 'paper' ? 'Player 1 wins!' : 'Player 2 wins!';
                break;
        }
    }

    if (result === 'Player 1 wins!') {
        player1Score++;
    } else if (result === 'Player 2 wins!') {
        player2Score++;
    }

    player1Display.textContent = `Player 1: ${capitalizeFirstLetter(player1Choice)}`;
    player2Display.textContent = `Player 2: ${capitalizeFirstLetter(player2Choice)}`;
    resultDisplay.textContent = result;
    player1ScoreDisplay.innerText = `Score: ${player1Score}`;
    player2ScoreDisplay.innerText = `Score: ${player2Score}`;


    if (player1Score === 3 || player2Score === 3) {
        const finalResult = player1Score === 3 ? 'Player 1 won the game!' : 'Player 2 won the game!';
        resultDisplay.textContent = finalResult;
        registerMultiplayerMatch(finalResult, player1Score === 3 ? 'Player 2' : 'Player 1');
    }

    // Reset choices after the round
    player1Choice = null;
    player2Choice = null;
}

/**
 * Registers the multiplayer match result with the backend.
 * @param {string} result - The result of the match.
 */
async function registerMultiplayerMatch(result) {
    let opponent = sessionStorage.getItem('opponent');
    if (!opponent) {
        opponent = 'HUMAN';
    }

    const response = await fetch('/rps/register_match/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            result: result.includes('Player 1') ? 'win' : 'lose',
            opponent: opponent
        })
    });

    const data = await response.json();
    if (data.status === 'success') {
        console.log('Match registered successfully');
        sessionStorage.removeItem('opponent'); // Clear the opponent variable
    } else {
        console.error('Error registering match:', data.error);
    }
}

/**
 * Resets the scores for both players.
 */
function resetScores() {
    player1Score = 0;
    player2Score = 0;
    document.getElementById('player1ScoreDisplay').textContent = player1Score;
    document.getElementById('player2ScoreDisplay').textContent = player2Score;
}

// Add event listener for key presses
window.addEventListener('keydown', (event) => {
    const key = event.key;
    if (window.location.pathname === '/rock-paper-scissors/multiplayer') {
        switch (key) {
            // Player 1 keys
            case 'q':
                choose('rock', 1);
                break;
            case 'w':
                choose('paper', 1);
                break;
            case 'e':
                choose('scissors', 1);
                break;
            // Player 2 keys
            case 'ArrowLeft':
                choose('rock', 2);
                break;
            case 'ArrowDown':
                choose('paper', 2);
                break;
            case 'ArrowRight':
                choose('scissors', 2);
                break;
            default:
                break;
        }
    }
});
