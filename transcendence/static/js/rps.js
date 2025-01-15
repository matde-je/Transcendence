// static/js/rps.js

import { playSinglePlayerGame } from './rps-singleplayer.js';
import { playMultiplayerGame } from './rps-multiplayer.js';

/**
 * Displays the Single Player mode interface.
 */
export function showSinglePlayer() {
    const singlePlayerContent = `
    <div class="container mb-5 mt-5 pt-5">
        <h2 class="text-center mb-4 mt-5 pt-5 ">Rock - Paper - Scissors</h2>
        <div class="d-flex justify-content-center mb-4 mt-4 pt-3">
            <button class="btn btn-success mx-2" id="rockBtn">👊 Rock</button>
            <button class="btn btn-info mx-2" id="paperBtn">✋ Paper</button>
            <button class="btn btn-danger mx-2" id="scissorsBtn" >✌️ Scissors</button>
        </div>
        <div id="singlePlayerDisplay" class="container text-center mt-5">
        <h5 class="mb-4 mt-4 pt-2">Game Status</h5>
        <div class="row mb-3">
            <div class="col-md-6">
                <p id="playerDisplay" class="fs-6 fw-bold mb-2">Player:</p>
                <p id="playerScoreDisplay" class="fs-6 mb-2">Score: 0</p>
            </div>
            <div class="col-md-6">
                <p id="computerDisplay" class="fs-6 fw-bold mb-2">Computer:</p>
                <p id="computerScoreDisplay" class="fs-6 mb-2">Score: 0</p>
            </div>
        </div>
        <p id="resultDisplay" class="mb-4 fw-bold" ></p>
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

export function showMultiplayer() {
    const multiplayerContent = `
        <div class="container mb-5" >
        <h3 class="text-center mb-5 mt-5 pt-5">Rock - Paper - Scissors</h3>
        <div class="row justify-content-center mb-5">
            <div class="col-md-4 text-center">
                <h5 class="mb-3 pt-3">Player 1</h5>
                <button class="btn btn-success mb-2 w-100" id="player1RockBtn">👊 Rock (Key Q)</button>
                <button class="btn btn-info mb-2 w-100" id="player1PaperBtn">✋ Paper (Key W)</button>
                <button class="btn btn-danger mb-2 w-100" id="player1ScissorsBtn">✌️ Scissors (Key E)</button>
            </div>
            <div class="col-md-4 text-center">
                <h5 class="mb-3 pt-3">Player 2</h5>
                <button class="btn btn-success mb-2 w-100" id="player2RockBtn">👊 Rock (Arrow Left)</button>
                <button class="btn btn-info mb-2 w-100" id="player2PaperBtn">✋ Paper (Arrow Down)</button>
                <button class="btn btn-danger mb-2 w-100" id="player2ScissorsBtn">✌️ Scissors (Arrow Right)</button>
            </div>
        </div>
    </div>
    <div id="multiplayerDisplay" class="container text-center mt-5">
        <h5 class="mb-4">Game Status</h5>
        <div class="row mb-5">
            <div class="col-md-6">
                <p id="player1Display" class="fs-6 fw-bold mb-2">Player 1:</p>
                <p id="player1ScoreDisplay" class="fs-6">Score: 0</p>
            </div>
            <div class="col-md-6">
                <p id="player2Display" class="fs-6 fw-bold mb-2">Player 2:</p>
                <p id="player2ScoreDisplay" class="fs-6">Score: 0</p>
            </div>
        </div>
        <p id="resultDisplay" class="mb-3 fw-bold fs-5"></p> 
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