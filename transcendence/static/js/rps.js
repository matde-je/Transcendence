// static/js/rps.js

import { playSinglePlayerGame } from './rps-singleplayer.js';
import { playMultiplayerGame } from './rps-multiplayer.js';
import { showRPS } from './app.js';
import { getCookie, checkAuthentication } from './utils.js';


/**
 * Displays the Single Player mode interface.
 */
export function showSinglePlayer() {
    const singlePlayerContent = `
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
        <h3 id="resultDisplay" class="mb-4 fw-bold" ></h3>
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
        <h3 class="text-center mb-5 mt-5">Rock - Paper - Scissors</h3>
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
        <h3 id="resultDisplay" class="mb-4 fw-bold" ></h3> 
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

export async function showWaitingList() {
    try {
        const csrftoken = getCookie('csrftoken');
        const response = await fetch('/rps/get_waiting_list/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'X-CSRFToken': csrftoken
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP! status: ${response.status}`);
        }

        const data = await response.json();
        const waitinglist = data.users;
        const content = document.getElementById('content');
         content.innerHTML = `
            <h2 class="mb-4 mt-5">Waiting List</h2>
            <div id="waitingListContainer"></div>
        `;

        const waiting_list_count = data.waiting_list_count;
        
        if(waiting_list_count > 1)
            {
                content.innerHTML += `
                    <div class="text-center mb-4">
                        <button class="btn btn-success" id="matchMakingBtn">MatchMaking</button>
                    </div>
                `;
            }
        const waitingListContainer = document.getElementById('waitingListContainer');

        if (waitinglist.length > 0) {
            waitinglist.forEach(element => {
                const div = document.createElement('div');
                div.innerHTML = `
                <div class="container mb-5 mt-5">
                    <h5 class="text-center">${element.username}</h5>
                </div>
            `;
                waitingListContainer.appendChild(div);
            });
        } else {
            waitingListContainer.innerHTML = '<p class="mb-4">No users in the waiting list.</p>';
        }

        const isUserInWaitingList = data.is_in_waiting_list;
       

        if (isUserInWaitingList) {
            content.innerHTML += `
                <button class="btn btn-danger" id="removeToWaitingListBtn">Remove from Waiting List</button>
            `;
        } else {
            content.innerHTML += `
                <button class="btn btn-secondary" id="addToWaitingListBtn">Add to Waiting List</button>
                `;
        }

        if (!isUserInWaitingList) {
            document.getElementById('addToWaitingListBtn').addEventListener('click', async (e) => {
                e.preventDefault();
                const addResponse = await fetch('/rps/add-to-waiting-list/', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'X-CSRFToken': csrftoken
                    }
                });

                if (!addResponse.ok) {
                    throw new Error(`Error HTTP! status: ${addResponse.status}`);
                }

                alert('User added to the waiting list.');
                showWaitingList(); // Refresh the waiting list
            });
        } else {
            document.getElementById('removeToWaitingListBtn').addEventListener('click', async (e) => {
                e.preventDefault();
                const removeResponse = await fetch('/rps/remove_from_waiting_list/', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'X-CSRFToken': csrftoken
                    }
                });

                if (!removeResponse.ok) {
                    throw new Error(`Error HTTP! status: ${removeResponse.status}`);
                }

                alert('User removed from the waiting list.');
                showWaitingList(); // Refresh the waiting list
            });
        }

        if(waiting_list_count > 1){
            document.getElementById('matchMakingBtn').addEventListener('click', async (e) => {
                e.preventDefault();
                const matchResponse = await fetch('/rps/find_match/', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'X-CSRFToken': csrftoken
                    }
                });

                if (!matchResponse.ok) {
                    throw new Error(`Error HTTP! status: ${matchResponse.status}`);
                }

                const matchData = await matchResponse.json();
                const opponent = matchData.opponent;
                alert(`Match found: ${opponent}`);
                sessionStorage.setItem('opponent', opponent);

                showMultiplayer();
                history.pushState(
                    { page: 'rps-multiplayer' },
                    'Rock Paper Scissors Multiplayer',
                    '/rock-paper-scissors/multiplayer'
                );
            });
        }
    } catch (error) {
        console.error('Error fetching tournament results:', error);
        alert('Error fetching tournament results.');
    }
}
