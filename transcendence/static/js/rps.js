// static/js/rps.js

import { playSinglePlayerGame } from './rps-singleplayer.js';
import { playMultiplayerGame } from './rps-multiplayer.js';

/**
 * Displays the Single Player mode interface.
 */
export function showSinglePlayer() {
    const singlePlayerContent = `
        <h1>Single Player - Rock Paper Scissors</h1>
        <div class='choices'>
            <button class='btn btn-success' id='rockBtn'>👊 Rock</button>
            <button class='btn btn-info' id='paperBtn'>✋ Paper</button>
            <button class='btn btn-danger' id='scissorsBtn'>✌️ Scissors</button>
        </div>
        <div id='singlePlayerDisplay'>
            <p id='playerDisplay'>PLAYER:</p>
            <p id='computerDisplay'>COMPUTER:</p>
            <p id='resultDisplay'></p>
            <p>Player Score: <span id='playerScoreDisplay'>0</span></p>
            <p>Computer Score: <span id='computerScoreDisplay'>0</span></p>
        </div>
    `;
    document.getElementById('content').innerHTML = singlePlayerContent;

    // Ensure elements are available before adding event listeners
    const rockBtn = document.getElementById('rockBtn');
    const paperBtn = document.getElementById('paperBtn');
    const scissorsBtn = document.getElementById('scissorsBtn');

    if (rockBtn && paperBtn && scissorsBtn) {
        rockBtn.addEventListener('click', (e) => {
            e.preventDefault();
            playSinglePlayerGame('rock');
        });
        paperBtn.addEventListener('click', (e) => {
            e.preventDefault();
            playSinglePlayerGame('paper');
        });
        scissorsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            playSinglePlayerGame('scissors');
        });
    } else {
        console.error('One or more choice buttons are missing.');
    }
}

/**
 * Displays the Multiplayer mode interface.
 */
export function showMultiplayer() {
    const multiplayerContent = `
        <h1>Multiplayer - Rock Paper Scissors</h1>
        <div class="choices">
            <button class="btn btn-success" id="player1RockBtn">👊 Player 1 - Rock</button>
            <button class="btn btn-info" id="player1PaperBtn">✋ Player 1 - Paper</button>
            <button class="btn btn-danger" id="player1ScissorsBtn">✌️ Player 1 - Scissors</button>
        </div>
        <div class="choices">
            <button class="btn btn-success" id="player2RockBtn">👊 Player 2 - Rock</button>
            <button class="btn btn-info" id="player2PaperBtn">✋ Player 2 - Paper</button>
            <button class="btn btn-danger" id="player2ScissorsBtn">✌️ Player 2 - Scissors</button>
        </div>
        <div id="multiplayerDisplay">
            <p id="player1Display">PLAYER 1:</p>
            <p id="player2Display">PLAYER 2:</p>
            <p id="resultDisplay"></p>
            <p>Player 1 Score: <span id="player1ScoreDisplay">0</span></p>
            <p>Player 2 Score: <span id="player2ScoreDisplay">0</span></p>
        </div>
    `;
    document.getElementById('content').innerHTML = multiplayerContent;
    // Add event listeners for the choices
    document.getElementById('player1RockBtn').addEventListener('click', (e) => {
        e.preventDefault();
        playMultiplayerGame('rock', 1);
    });
    document.getElementById('player1PaperBtn').addEventListener('click', (e) => {
        e.preventDefault();
        playMultiplayerGame('paper', 1);
    });
    document.getElementById('player1ScissorsBtn').addEventListener('click', (e) => {
        e.preventDefault();
        playMultiplayerGame('scissors', 1);
    });
    document.getElementById('player2RockBtn').addEventListener('click', (e) => {
        e.preventDefault();
        playMultiplayerGame('rock', 2);
    });
    document.getElementById('player2PaperBtn').addEventListener('click', (e) => {
        e.preventDefault();
        playMultiplayerGame('paper', 2);
    });
    document.getElementById('player2ScissorsBtn').addEventListener('click', (e) => {
        e.preventDefault();
        playMultiplayerGame('scissors', 2);
    });
}