// static/js/tournament.js

import { getCookie, isPowerOfTwo, nextPowerOfTwo, getRoundName, getUsernameById } from './utils.js';
//import { initializeGame } from './game.js';

/**
 * Shows Tournament Menu
 */
export function showTournamentMenu() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="container-fluid d-flex flex-column pt-5 mb-5 mt-5 ">
            <h2 class="text-center mb-3 mt-5 pt-5">Tournament menu</h2>
            <div class="d-flex justify-content-center mb-5 gap-4 p-3">
                <button type="button" id="createTournamentBtn" class="btn btn-success me-3">Create Tournament</button>
                <button type="button" id="listOpenTournamentsBtn" class="btn btn-primary">List Open Tournaments</button>
                <button type="button" id="showResultsBtn" class="btn btn-secondary">Tournament Results</button>
            </div>
            <div id="tournamentContent"></div>
        </div>
    `;

    document.getElementById('createTournamentBtn').addEventListener('click', (e) => {
        e.preventDefault();
        showCreateTournamentForm();
    });

    document.getElementById('listOpenTournamentsBtn').addEventListener('click', (e) => {
        e.preventDefault();
        listOpenTournaments();
    });

    document.getElementById('showResultsBtn').addEventListener('click', (e) => {
        e.preventDefault();
        showTournamentResults();
    });
}

/**
 * Lists currently open tournaments with usernames.
 */
export async function listOpenTournaments() {
    try {
        const response = await fetch('/tournament/list/', {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tournaments = await response.json();

		// Get current user ID
        const currentUserResponse = await fetch('/users/user/', {
            method: 'GET',
            credentials: 'include',
        });
        const currentUser = await currentUserResponse.json();
        const currentUserId = currentUser.id;

        const tournamentContent = document.getElementById('tournamentContent');
        tournamentContent.innerHTML = '<h3 class="mb-2 text-center">Open Tournaments</h3>';

        if (tournaments.length > 0) {
            const list = document.createElement('ul');
            tournaments.forEach(tournament => {
				// Get participants in the tournament
                fetch(`/tournament/${tournament.id}/participants/`, {
                    method: 'GET',
                    credentials: 'include',
                })
                .then(res => res.json())
                .then(participants => {
                    const isEnrolled = participants.some(participant => participant.user_id === currentUserId);
					const isCreator = tournament.creator_id === currentUserId;
                    let actionButton;
					let deleteTournamentButton = '';
                    let startTournamentButton = '';

                    if (isEnrolled) {
                        actionButton = `<div class="d-flex justify-content-center">
                                            <button type="button" onclick="removeUserFromTournament(${tournament.id})" class="btn btn-danger btn-sm">Quit Tournament</button>
                                        </div>`;
                                        }
					if (!isEnrolled && !tournament.is_started) {
                        actionButton = `
                        <div class="d-flex justify-content-center">
                            <button type="button" onclick="addUserToTournament(${tournament.id})" class="btn btn-primary btn-sm">Participate</button>
                        </div>`;
                    }

					if (isCreator && !tournament.is_started) {
						deleteTournamentButton = `
                        <div class="d-flex justify-content-center">
                            <button type="button" onclick="deleteTournament(${tournament.id})" class="btn btn-danger btn-sm">Delete Tournament</button>
                        </div>`;
					}

                    if (isEnrolled && !tournament.is_started) {
                        startTournamentButton = `
                        <div class="d-flex justify-content-center">
                            <button type="button" onclick="startTournament(${tournament.id})" class="btn btn-success btn-sm">Start Tournament</button>
                        </div>`;
                    }

                    const listItem = document.createElement('li');
                    listItem.className = 'list-group-item py-4';
                    listItem.innerHTML = `
                     <div>
                        <div class="text-center mb-2">
                            <strong>${tournament.name}</strong> - Created by <em>${tournament.creator_username}</em>
                        </div>
                        <div class="text-center mb-2">
                            Participants: <span class="fw-bold">${participants.map(p => p.username).join(', ') || 'None'}</span>
                        </div>
                        <div class="d-flex flex-column gap-3 align-items-center">
                            ${deleteTournamentButton || ''}
                            ${actionButton || ''}
                            ${startTournamentButton || ''}
                        </div>
                    </div>`;
                    list.appendChild(listItem);
                })
                .catch(error => {
                    console.error(`Error when searching for tournament participants ${tournament.id}:`, error);
                });
            });
            tournamentContent.appendChild(list);
        } else {
            tournamentContent.innerHTML += '<p class="text-center mb-3 mt-3">No tournaments open at the moment.</p>';
        }
    } catch (error) {
        console.error('Error listing tournaments:', error);
        alert('Error listing tournaments.');
    }
}

/**
 * Add user to the tournament.
 */
export async function addUserToTournament(tournamentId) {
    const csrftoken = getCookie('csrftoken');
    try {
        const response = await fetch(`/tournament/${tournamentId}/join/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
            body: JSON.stringify({ is_accepted: true })
        });
        if (response.ok) {
            alert('Successfully added to the tournament!');
            listOpenTournaments();
        } else {
            const data = await response.json();
            alert('Error adding to tournament: ' + data.detail);
        }
    } catch (error) {
        console.error('Error adding to tournament:', error);
        alert('Error adding to tournament.');
    }
}

/**
 * Remove user from Tournament.
 */
export async function removeUserFromTournament(tournamentId) {
    const csrftoken = getCookie('csrftoken');
    try {
        const response = await fetch(`/tournament/${tournamentId}/leave/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
        });
        if (response.ok) {
            alert('Successfully removed from the tournament!');
            listOpenTournaments();
        } else {
            const data = await response.json();
            alert('Error removing from tournament: ' + data.detail);
        }
    } catch (error) {
        console.error('Error removing from tournament:', error);
        alert('Error removing from tournament.');
    }
}

/**
 * Lists results of finished tournaments.
 */
export async function showTournamentResults() {
    try {
        const response = await fetch('/tournament/results/', {
            method: 'GET',
            credentials: 'include',
        });
        const data = await response.json();
        const tournamentContent = document.getElementById('tournamentContent');
        tournamentContent.innerHTML = '<h3 class="text-center mb-3">Tournament Results</h3>';
        if (data.length > 0) {
            const list = document.createElement('ul');
            data.forEach(tournament => {
                const listItem = document.createElement('li');
                listItem.textContent = `${tournament.name} - Winner ${tournament.winner_username}`;
                list.appendChild(listItem);
            });
            tournamentContent.appendChild(list);
        } else {
            tournamentContent.innerHTML += '<p class="text-center mb-3">No results available.</p>';
        }
    } catch (error) {
        console.error('Error showing results:', error);
        alert('Error showing results.');
    }
}

/**
 * Shows the form to create a new tournament.
 */
export function showCreateTournamentForm() {
    const formContent = `
        <div class="container" >
        <h1 class="text-center mb-5 mt-5 pt-5">Create Tournament</h1>
        <div class="row justify-content-center mb-4">
            <div class="col-md-6 col-lg-4">
                <form id="createTournamentForm">
                    <div class="form-group mb-3">
                        <label for="tournamentName" class="form-label">Tournament Name:</label>
                        <input type="text" id="tournamentName" name="tournamentName" class="form-control" placeholder="Enter tournament name" required>
                    </div>
                    <div class="d-grid">
                        <button type="submit" class="btn btn-secondary">Create Tournament</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `;
    document.getElementById('content').innerHTML = formContent;

    // Add form submission event
    document.getElementById('createTournamentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('tournamentName').value;

        const csrftoken = getCookie('csrftoken');

        const response = await fetch('/tournament/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
            body: JSON.stringify({ name })
        });

        if (response.ok) {
            alert('Tournament created successfully!');
            showTournamentMenu();
        } else {
            const data = await response.json();
            alert('Error creating tournament: ' + JSON.stringify(data));
        }
    });
}

async function deleteTournament(tournamentId) {
    const csrftoken = getCookie('csrftoken');
    if (!confirm('Are you sure you want to delete this tournament?')) {
        return;
    }
    try {
        const response = await fetch(`/tournament/${tournamentId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
        });
        if (response.ok) {
            alert('Tournament deleted successfully!');
            listOpenTournaments();
        } else {
            const data = await response.json();
            alert('Error when deleting tournament: ' + JSON.stringify(data));
        }
    } catch (error) {
        console.error('Error when deleting tournament:', error);
        alert('Error when deleting tournament.');
    }
}

async function startTournament(tournamentId) {
	const csrftoken = getCookie('csrftoken');
    try {
        // Get participants
        const participantsResponse = await fetch(`/tournament/${tournamentId}/participants/`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!participantsResponse.ok) {
            const data = await participantsResponse.json();
            alert('Error getting participants: ' + JSON.stringify(data));
            return;
        }

        const participants = await participantsResponse.json();
        const count = participants.length;

        // Checks if the number of participants is a power of 2
        if (!isPowerOfTwo(count)) {
            const needed = nextPowerOfTwo(count) - count;
            alert(`The tournament cannot be started with ${count} players. \n\nIt's needed more ${needed} players.`);
            return;
        }

        // Start tournament
        const names = participants.map((p) => p.username).join('\n');

        const response = await fetch(`/tournament/${tournamentId}/start/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
        });
        if (response.ok) {
            startMatchmaking(tournamentId);
        } else {
            const data = await response.json();
            alert('Error starting tournament: ' + JSON.stringify(data));
        }
    } catch (error) {
        console.error('Error starting tournament:', error);
        alert('Error starting tournament.');
    }
}

export async function startMatchmaking(tournamentId)
{
	const csrftoken = getCookie('csrftoken');

    try {
        // Get all participants of the started tournament
        const participantsResponse = await fetch(`/tournament/${tournamentId}/participants/`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!participantsResponse.ok) {
            throw new Error(`Error fetching participants: ${participantsResponse.status}`);
        }
        const participants = await participantsResponse.json();

        const numberOfParticipants = participants.length;
        const numberOfMatches = numberOfParticipants - 1;

        // Calculate the number of rounds based on the number of participants
        const numberOfRounds = Math.log2(numberOfParticipants);

		if (!Number.isInteger(numberOfRounds)) {
            alert('The number of participants must be a power of 2.');
            return;
        }

        // Shuffle the participants
        for (let i = participants.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [participants[i], participants[j]] = [participants[j], participants[i]];
        }

        // Assign pairs of players
        const matches = [];
        let currentRound = numberOfRounds;
        for (let i = 0; i < participants.length; i += 2) {
            const player1 = participants[i].user_id;
            const player2 = participants[i + 1].user_id;
			const player1_username = participants[i].username;
			const player2_username = participants[i + 1].username;
            matches.push({
                player1: player1,
                player2: player2,
				player1_username: player1_username,
				player2_username: player2_username,
                round: currentRound,
                tournament: tournamentId,
                started_at: new Date().toISOString(),
                completed: false,
            });
        }

        // Send the matches to the API
        for (const match of matches) {
            const response = await fetch(`/tournament/${tournamentId}/matches/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                credentials: 'include',
                body: JSON.stringify(match),
            });
            if (!response.ok) {
                throw new Error(`Error creating match: ${response.status}`);
            }

			// Get the created match ID
			const createdMatch = await response.json();
        	match.id = createdMatch.id;
        }

		// Shows the round and the names of the participants
		content.innerHTML = `
        <div class="text-center mb-5 mt-5 pt-5">
			<h2 class="mb-4">Tournament Match Making</h2>
			<p class="mb-3">Round: <strong>${getRoundName(numberOfRounds)}</strong></p>
            <div class="matches-list">
                <ul class="list-group">
                    ${matches.map((match, index) => `
                        <li class="list-group-item">
                            <strong>Match ${index + 1}:</strong><br>
                            ${match.player1_username} vs ${match.player2_username}
                        </li>
                    `).join('')}
				</ul>
			</p>
            <div class="mb-5 mt-3 pt-2">
			<button type="button" id="start-matches" class="btn btn-primary">Start Matches</button>
		</div>
        </div>`;

		document.getElementById('start-matches').addEventListener('click', async (e) => {
			e.preventDefault();
			await executeMatches(matches, tournamentId, currentRound);
		});

    } catch (error) {
        console.error('Matchmaking error:', error);
        alert('Matchmaking error: ' + error.message);
    }
}

/**
 * Executes a series of matches for a given tournament round.
 *
 * @param {Array} matches - An array of match objects to be played.
 * @param {number} tournamentId - The ID of the tournament.
 * @param {number} currentRound - The current round number of the tournament.
 * @returns {Promise<void>} A promise that resolves when all matches have been executed.
 */
async function executeMatches(matches, tournamentId, currentRound) {
	let winnerId;
    for (const match of matches) {

		// Check if the match ID is defined
		if (!match.id) {
            alert('Error: Match ID is undefined.');
            continue;
        }

		// Get most recent match data from database
        const matchResponse = await fetch(`/tournament/${tournamentId}/matches/${match.id}/`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!matchResponse.ok) {
            alert('Error when fetching match data.');
            continue;
        }

        const matchData = await matchResponse.json();

        // Check if the match is completed
        if (matchData.completed) {
            alert('This game has already been completed.');
            return;
        }

		// Start the Pong match
        winnerId = await startPongMatch(match.player1, match.player2);

		// Update the match result in the backend
        await updateMatch(tournamentId, match.id, winnerId);

        // Shows the winner of the match
        const winnerUsername = winnerId === match.player1 ? match.player1_username : match.player2_username;
		console.log('PFV - Vencedor da Partida:', winnerUsername);
    }

    alert(`Round ${getRoundName(currentRound)} finished.`);

	if(currentRound === 1) {
		alert('The tournament has ended.');

		const csrftoken = getCookie('csrftoken');

		fetch(`/tournament/${tournamentId}/finish/`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': csrftoken,
			},
			credentials: 'include',
			body: JSON.stringify({
				winner_id: winnerId,
				is_finished: true
			}),
		})
		.then(response => {
			if (!response.ok) {
				throw new Error(`Error HTTP! status: ${response.status}`);
			}
			return response.json();
		})
		.then(data => {
			console.log('Tournament updated successfully:', data);
			content.innerHTML = `
				<h3 class="text-center mb-3 mt-5 pt-5">Welcome to Pong Tournament</h3>
				<p class="text-center">The tournament has concluded. Thank you for playing!</p>
			`;
			})
		.catch(error => {
			console.error('Error updating tournament:', error);
		});
	}
	else
	{
		const nextRound = currentRound - 1;
		alert(`Next Round: ${getRoundName(nextRound)}`);
		selectWinnersAndMatchmake(tournamentId, nextRound);
	}
}

export async function startPongMatch(idPlayer1, idPlayer2) {
    let contentElement = document.getElementById('content');
    if (!contentElement) {
        contentElement = document.createElement('div');
        contentElement.id = 'content';
        document.body.appendChild(contentElement);
    } else {
        contentElement.innerHTML = '';
    }

	window.isTournament = true;
	// Set the usernames in the global object
	window.username1 = await getUsernameById(idPlayer1);
	window.username2 = await getUsernameById(idPlayer2);

	// Set the player IDs in the global object
	window.player1Id = idPlayer1;
    window.player2Id = idPlayer2;

	// Remove previous scripts, if they exist
    document.getElementById('gameScript')?.remove();
    document.getElementById('aiScript')?.remove();

    contentElement.innerHTML = `
        <div class="text-center mt-5 pt-5">
            <h2 class="text-dark fw-bold mb-5">Tournament Pong Match</h2>
        </div>
        <div class="text-center">
			<div class='d-flex justify-content-between'>
				<p><b>Player 1</b>: ${window.username1}</p>
				<p><b>Player 2</b>: ${window.username2}</p>
			</div>
            <div class="d-flex justify-content-center">
                <canvas id="game" width="550" height="400" style="background-color: #000;"></canvas>
            </div>
        </div>
    `;

    // Create a Promise that resolves when the game is over
    return new Promise((resolve, reject) => {
        // Define a global callback to receive the winnerId
        window.onGameOver = (winnerId) => {
            // Clean up the global callback
            delete window.onGameOver;
			console.log('PFV - a chamar resolve winnerID:', winnerId);
            resolve(winnerId);
        };

        // Load and initialize the game script
        const pongMatch = document.createElement('script');
        pongMatch.type = 'module';
        //pongMatch.src = '/static/js/game.js';
        pongMatch.id = 'gameScript';
        pongMatch.onload = () => {
            initializeGame();
        };
        document.body.appendChild(pongMatch);
    });
}
/**
 * Updates the match with the given matchId by setting the winner to the specified winnerId.
 *
 * @param {number} tournamentId - The ID of the tournament.
 * @param {number} matchId - The ID of the match to update.
 * @param {number} winnerId - The ID of the winner to set for the match.
 * @returns {Promise<void>} A promise that resolves when the match is successfully updated.
 * @throws {Error} Throws an error if the update request fails.
 */
async function updateMatch(tournamentId, matchId, winnerId) {
    console.log('PFV - updateMatch(tournamentId):', tournamentId);
    console.log('PFV - updateMatch(matchId):', matchId);
    console.log('PFV - updateMatch(winnerId):', winnerId);

    const csrftoken = getCookie('csrftoken');

    try {
        // Get match info
        const getResponse = await fetch(`/tournament/${tournamentId}/matches/${matchId}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
        });

        if (!getResponse.ok) {
            console.error('Error getting match:', getResponse.status);
            alert('Error getting match.');
            return;
        }

        const match = await getResponse.json();

        if (match.completed) {
            alert('This match has already been completed.');
            return;
        }

        // Update match info
        const response = await fetch(`/tournament/${tournamentId}/matches/${matchId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            credentials: 'include',
            body: JSON.stringify({ winner: parseInt(winnerId, 10), completed: true }),
        });

        if (!response.ok) {
            console.error('Error updating match:', response.status);
            alert('Error updating match.');
        } else {
            const updatedMatch = await response.json();
        }
    } catch (error) {
        console.error('Error updating match:', error);
        alert('Error updating match.');
    }
}

/**
 * Seleciona os vencedores de um round e realiza o matchmaking.
 *
 * @param {number} tournamentId - ID do torneio.
 * @param {number} roundNumber - Número do round.
 */
export async function selectWinnersAndMatchmake(tournamentId, roundNumber) {
	let lastRound = roundNumber + 1;

    const csrftoken = getCookie('csrftoken');

    try {
        const response = await fetch(`/tournament/${tournamentId}/select_winners/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
            body: JSON.stringify({ round_number: lastRound })
        });

        if (response.ok) {
            const data = await response.json();
            alert('Matchmaking carried out successfully!');

            const matches = data.matches;
            roundNumber = data.round;

			console.log('PFV - Matches:', matches);

            // Shows the round and the names of the participants
            content.innerHTML = `
                <h2>Tournament Match Making</h2>
                <p>Round: ${getRoundName(roundNumber)}</p>
                <p>
                    <ul>
                        ${matches.map((match, index) => `<li>Match: ${index + 1}<br>${match.player1_username} vs ${match.player2_username}</li><br>`).join('')}
                    </ul>
                </p>
                <button type="button" id="start-round" class="btn btn-primary">Start Round</button>
            `;

            document.getElementById('start-round').addEventListener('click', async (e) => {
                e.preventDefault();
                await executeMatches(matches, tournamentId, roundNumber);
            });
        } else {
            const errorData = await response.json();
            alert('Error: ' + errorData.detail);
        }
    } catch (error) {
        console.error('Error when performing matchmaking:', error);
        alert('Error when performing matchmaking.');
    }
}

// Export functions
window.addUserToTournament = addUserToTournament;
window.removeUserFromTournament = removeUserFromTournament;
window.deleteTournament = deleteTournament;
window.startTournament = startTournament;
window.executeMatches = executeMatches;
window.updateMatch = updateMatch;