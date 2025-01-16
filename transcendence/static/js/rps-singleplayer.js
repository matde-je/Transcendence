// static/js/rps-singleplayer.js

import { getCookie, capitalizeFirstLetter } from './utils.js';

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

    playGame(playerChoice, playerDisplay, computerDisplay, resultDisplay, playerScoreDisplay, computerScoreDisplay);
}

/**
 * Executes the game logic for Single Player mode.
 * @param {string} playerChoice - The player's choice.
 */
function playGame(playerChoice, playerDisplay, computerDisplay, resultDisplay, playerScoreDisplay, computerScoreDisplay) {
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    let result = '';

    if (playerScore === 3 || computerScore === 3)
        resetScores();

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
        }
    }

    if (result === 'You win!') {
        playerScore++;
    } else if (result === 'You lose!') {
        computerScore++;
    }

    playerDisplay.textContent = `Player: ${capitalizeFirstLetter(playerChoice)}`;
    computerDisplay.textContent = `Computer: ${capitalizeFirstLetter(computerChoice)}`;
    resultDisplay.textContent = result;
    playerScoreDisplay.innerText = `Score: ${playerScore}`;
    computerScoreDisplay.innerText = `Score: ${computerScore}`;

    if (playerScore === 3 || computerScore === 3) {
        const finalResult = playerScore === 3 ? 'You won the game!' : 'You lost the game!';
        resultDisplay.innerText = finalResult;
        registerMatch(finalResult);
    }
}

/**
 * Registers the match result with the backend.
 * @param {string} result - The result of the match.
 */
async function registerMatch(result, opponent) {
    const response = await fetch('/rps/register_match/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            result: result.includes('won') ? 'win' : 'lose',
            opponent: "AI"
        })
    });

    const data = await response.json();
    if (data.status === 'success') {
        console.log('Match registered successfully');
    } else {
        console.error('Error registering match:', data.error);
    }
}

/**
 * Resets the scores for both players.
 */
function resetScores() {
    playerScore = 0;
    computerScore = 0;
    document.getElementById('playerScoreDisplay').innerText = `Player Score: ${playerScore}`;
    document.getElementById('computerScoreDisplay').innerText = `Computer Score: ${computerScore}`;
}
