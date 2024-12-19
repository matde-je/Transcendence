// static/js/rps-singleplayer.js

const choices = ['rock', 'paper', 'scissors'];
let playerScore = 0;
let computerScore = 0;

/**
 * Plays a single round of the Single Player RPS game.
 * @param {string} playerChoice - The player's choice ('rock', 'paper', 'scissors').
 */
export function playSinglePlayerGame(playerChoice) {
    const playerDisplay = document.getElementById('playerDisplay');
    const computerDisplay = document.getElementById('computerDisplay');
    const resultDisplay = document.getElementById('resultDisplay');
    const playerScoreDisplay = document.getElementById('playerScoreDisplay');
    const computerScoreDisplay = document.getElementById('computerScoreDisplay');

    if (!playerDisplay || !computerDisplay || !resultDisplay || !playerScoreDisplay || !computerScoreDisplay) {
        console.error('One or more display elements are missing.');
        return;
    }

    // Rest of the playGame function...
    playGame(playerChoice, playerDisplay, computerDisplay, resultDisplay, playerScoreDisplay, computerScoreDisplay);
}

/**
 * Executes the game logic for Single Player mode.
 * @param {string} playerChoice - The player's choice.
 */
function playGame(playerChoice, playerDisplay, computerDisplay, resultDisplay, playerScoreDisplay, computerScoreDisplay) {
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    let result = '';

    if (playerChoice === computerChoice) {
        result = "It's a tie!";
    } else {
        switch (playerChoice) {
            case 'rock':
                result = computerChoice === 'scissors' ? 'You win!' : 'You lose!';
                break;
            case 'paper':
                result = computerChoice === 'rock' ? 'You win!' : 'You lose!';
                break;
            case 'scissors':
                result = computerChoice === 'paper' ? 'You win!' : 'You lose!';
                break;
            default:
                result = 'Invalid choice!';
                break;
        }
    }

    playerDisplay.textContent = `PLAYER: ${capitalizeFirstLetter(playerChoice)}`;
    computerDisplay.textContent = `COMPUTER: ${capitalizeFirstLetter(computerChoice)}`;
    resultDisplay.textContent = result;

    resultDisplay.classList.remove('greenText', 'redText');

    switch (result) {
        case 'You win!':
            resultDisplay.classList.add('greenText');
            playerScore++;
            playerScoreDisplay.textContent = playerScore;
            break;
        case 'You lose!':
            resultDisplay.classList.add('redText');
            computerScore++;
            computerScoreDisplay.textContent = computerScore;
            break;
        default:
            // No score update for a tie or invalid choice
            break;
    }
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} string - The string to capitalize.
 * @returns {string} - The capitalized string.
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}