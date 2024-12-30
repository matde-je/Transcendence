// static/js/rps-multiplayer.js

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
            default:
                result = 'Invalid choice!';
                break;
        }
    }
    player1Display.textContent = `PLAYER 1: ${capitalizeFirstLetter(player1Choice)}`;
    player2Display.textContent = `PLAYER 2: ${capitalizeFirstLetter(player2Choice)}`;
    resultDisplay.textContent = result;
    resultDisplay.classList.remove('greenText', 'redText');
    switch (result) {
        case 'Player 1 wins!':
            resultDisplay.classList.add('greenText');
            player1Score++;
            player1ScoreDisplay.textContent = player1Score;
            break;
        case 'Player 2 wins!':
            resultDisplay.classList.add('redText');
            player2Score++;
            player2ScoreDisplay.textContent = player2Score;
            break;
        default:
            // No score update for a tie or invalid choice
            break;
    }
	// Reset choices after the round
    player1Choice = null;
    player2Choice = null;
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} string - The string to capitalize.
 * @returns {string} - The capitalized string.
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}