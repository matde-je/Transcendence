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
        }
    }

    if (result === 'You win!') {
        playerScore++;
    } else if (result === 'You lose!') {
        computerScore++;
    }

    playerDisplay.innerText = `Player: ${playerChoice}`;
    computerDisplay.innerText = `Computer: ${computerChoice}`;
    resultDisplay.innerText = result;
    playerScoreDisplay.innerText = `Player Score: ${playerScore}`;
    computerScoreDisplay.innerText = `Computer Score: ${computerScore}`;

    if (playerScore === 5 || computerScore === 5) {
        const finalResult = playerScore === 5 ? 'You won the game!' : 'You lost the game!';
        alert(finalResult);  // Exibe um alerta com o resultado final
        resultDisplay.innerText = finalResult;
        registerMatch(finalResult);
        playerScore = 0;
        computerScore = 0;
    }
}

/**
 * Registers the match result with the backend.
 * @param {string} result - The result of the match.
 */
async function registerMatch(result) {
    const response = await fetch('/api/register_match/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            result: result.includes('won') ? 'win' : 'lose'
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
 * Gets the CSRF token from the cookies.
 * @param {string} name - The name of the cookie.
 * @returns {string|null} - The value of the cookie.
 */
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}