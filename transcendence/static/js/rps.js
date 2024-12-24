// static/js/rps.js

import { playSinglePlayerGame } from './rps-singleplayer.js';
import { playMultiplayerGame } from './rps-multiplayer.js';

/**
 * Displays the Single Player mode interface.
 */
export function showSinglePlayer() {
    const singlePlayerContent = `
    <div class="container" style="margin-top: 100px;">
        <h1 class="text-center mb-5">Single Player - Rock Paper Scissors</h1>
        <div class="d-flex justify-content-center mb-4">
            <button class="btn btn-success mx-3" id="rockBtn" style="font-size: 1.5rem;">👊 Rock</button>
            <button class="btn btn-info mx-3" id="paperBtn" style="font-size: 1.5rem;">✋ Paper</button>
            <button class="btn btn-danger mx-3" id="scissorsBtn" style="font-size: 1.5rem;">✌️ Scissors</button>
        </div>
        <div id="singlePlayerDisplay" class="text-center">
            <p id="playerDisplay" class="mb-3">PLAYER:</p>
            <p id="computerDisplay" class="mb-3">COMPUTER:</p>
            <p id="resultDisplay" class="mb-3"></p>
            <p class="mb-3">Player Score: <span id="playerScoreDisplay">0</span></p>
            <p>Computer Score: <span id="computerScoreDisplay">0</span></p>
        </div>
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
    <div class="container" style="margin-top: 100px;">
        <h1 class="text-center mb-5">Multiplayer - Rock Paper Scissors</h1>
         <div class="row justify-content-center mb-4">
        <div class="col-md-4 text-center">
            <h4>Player 1</h4>
            <button class="btn btn-success mb-2 w-100" id="player1RockBtn">👊 Rock</button>
            <button class="btn btn-info mb-2 w-100" id="player1PaperBtn">✋ Paper</button>
            <button class="btn btn-danger mb-2 w-100" id="player1ScissorsBtn">✌️ Scissors</button>
        </div>
    </div>
    
    <!-- Player 2 Choices -->
    <div class="row justify-content-center mb-4">
        <div class="col-md-4 text-center">
            <h4>Player 2</h4>
            <button class="btn btn-success mb-2 w-100" id="player2RockBtn">👊 Rock</button>
            <button class="btn btn-info mb-2 w-100" id="player2PaperBtn">✋ Paper</button>
            <button class="btn btn-danger mb-2 w-100" id="player2ScissorsBtn">✌️ Scissors</button>
        </div>
    </div>
    
    <!-- Multiplayer Display -->
    <div id="multiplayerDisplay" class="text-center">
        <p id="player1Display" class="mb-2">PLAYER 1:</p>
        <p id="player2Display" class="mb-2">PLAYER 2:</p>
        <p id="resultDisplay" class="mb-3"></p>
        <p class="mb-2">Player 1 Score: <span id="player1ScoreDisplay">0</span></p>
        <p>Player 2 Score: <span id="player2ScoreDisplay">0</span></p>
    </div>
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