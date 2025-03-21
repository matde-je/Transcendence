// static/js/tournament.js

import { getCookie, checkAuthentication, isPowerOfTwo, nextPowerOfTwo, getRoundName, getUsernameById } from './utils.js';
import { initializeGame } from './game.js';
// Declare global window.currentRound
window.currentRound = 0;

/**
 * Shows Tournament Menu
 */
export function showTournamentMenu() {
    const content = document.getElementById('content');
    content.innerHTML = `
    <h2 class="text-center mb-5 mt-5 pt-5">Tournament Menu</h2>
            <div class="d-flex justify-content-center mb-5 gap-4 p-3">
                <button type="button" id="createTournamentBtn" class="btn btn-success me-3">Create Tournament</button>
                <button type="button" id="listOpenTournamentsBtn" class="btn btn-primary me-3">List Open Tournaments</button>
                <button type="button" id="showResultsBtn" class="btn btn-secondary">Tournament Results</button>
            </div>
            <div id="tournamentContent"></div>
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
            console.log('Successfully added to the tournament!');
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
            console.log('Successfully removed from the tournament!');
            listOpenTournaments();
        } else {
            const data = await response.json();
            alert('Error quiting from tournament: ' + data.detail);
			listOpenTournaments();
        }
    } catch (error) {
        console.error('Error quiting from tournament:', error);
        alert('Error quiting from tournament.');
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
        tournamentContent.innerHTML = '<h4 class="text-center mb-3">Tournament Results</h4>';
        if (data.length > 0) {
            const list = document.createElement('div');
            data.forEach(tournament => {
                const listItem = document.createElement('div');
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
        <h2 class="mb-5 mt-5 pt-5">Create Tournament</h2>
        <div class="row justify-content-center">
            <div class="col-md-6 col-lg-4">
                <form id="createTournamentForm">
                    <div class="form-group mb-3 mt-3">
                        <label for="tournamentName" class="form-label fs-5">Name:</label>
                        <input type="text" id="tournamentName" name="tournamentName" class="form-control text-center" placeholder="Enter tournament name" required>
                    </div>
                    <div class="d-flex justify-content-center">
                        <button type="submit" class="btn btn-secondary">Create</button>
                    </div>
                </form>
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
            console.log('Tournament created successfully!');
            showTournamentMenu();
        } else {
            const data = await response.json();
            alert('Error creating tournament: ' + data.detail);
        }
    });
}

async function deleteTournament(tournamentId) {

    const csrftoken = getCookie('csrftoken');

    if (!confirm('Are you sure you want to delete this tournament?')) {
        return;
    }
    try {
        const response = await fetch(`/tournament/${tournamentId}/delete/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
        });
        if (response.ok) {
            console.log('Tournament and related users deleted successfully.');
            listOpenTournaments();
        } else {
            const data = await response.json();
            alert('Error when deleting tournament: ' + data.detail);
			listOpenTournaments();
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
            alert('Error getting participants: ' + data.detail);
            listOpenTournaments();
        }
		else
		{

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
				window.isTournament = true;
				checkAuthentication();
				startMatchmaking(tournamentId);
			} else {
				const data = await response.json();
				alert(data.detail || 'Error starting tournament.');
				listOpenTournaments();
			}
		}
    } catch (error) {
        console.error('Error starting tournament:', error);
        alert('Error starting tournament.');
		listOpenTournaments();
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
        window.currentRound = numberOfRounds;
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
                round: window.currentRound,
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
			<button type="button" id="start-matches" class="btn btn-secondary">Start Matches</button>
		</div>
        </div>`;

		document.getElementById('start-matches').addEventListener('click', async (e) => {
			e.preventDefault();
			window.isTournament = true;
			await executeMatches(matches, tournamentId, window.currentRound);
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
 * @param {number} round - The current round number of the tournament.
 * @returns {Promise<void>} A promise that resolves when all matches have been executed.
 */
async function executeMatches(matches, tournamentId, round) {
	let winnerId;
	let winnerUsername;
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
			console.log('Error when fetching match data.');
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
        winnerId = await startPongMatch(match.player1, match.player2, round);

		// Update the match result in the backend
        await updateMatch(tournamentId, match.id, winnerId);

        // Shows the winner of the match
        winnerUsername = winnerId === match.player1 ? match.player1_username : match.player2_username;
		console.log('Match Winner: ', winnerUsername);
    }

	console.log(`Round ${getRoundName(round)} finished.`);

	if(round === 1) {

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
			window.isTournament = false;
			checkAuthentication();
			console.log('Tournament updated successfully:', data);
			content.innerHTML = `
				<h3 class="mb-5 mt-5 pt-5">Pong Tournament</h3>
				<div class="fs-8 fw-bold mb-3">Congratulations!</div>
				<div class="fs-6 mb-3">Player <span class="fw-bold">${winnerUsername}</span> has won the Tournament!</div>
				<div class="fs-6">Thank you for playing!</p>
			`;
			})
		.catch(error => {
			console.error('Error updating tournament:', error);
		});
	}
	else
	{
		const nextRound = round - 1;
//		alert(`Next Round: ${getRoundName(nextRound)}`);
		selectWinnersAndMatchMake(tournamentId, nextRound);
	}
}

export async function startPongMatch(idPlayer1, idPlayer2, round) {
    let contentElement = document.getElementById('content');
    if (!contentElement) {
        contentElement = document.createElement('div');
        contentElement.id = 'content';
        document.body.appendChild(contentElement);
    } else {
        contentElement.innerHTML = '';
    }

	// Set the usernames in the global object
	window.username1 = await getUsernameById(idPlayer1);
	window.username2 = await getUsernameById(idPlayer2);

	// Set the player IDs in the global object
	window.player1Id = idPlayer1;
    window.player2Id = idPlayer2;

	// Set the current round in the global object
	window.currentRound = round;

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
            resolve(winnerId);
        };

        // Load and initialize the game script
        const pongMatch = document.createElement('script');
        pongMatch.type = 'module';
        pongMatch.src = '/static/js/game.js';
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
    console.log('updateMatch with tournamentId: ', tournamentId);
    console.log('updateMatch with matchId: ', matchId);
    console.log('updateMatch with winnerId: ', winnerId);

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
export async function selectWinnersAndMatchMake(tournamentId, roundNumber) {
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
            const matches = data.matches;

            roundNumber = data.round;
			
            console.log('Matchmaking carried out successfully!');
			console.log('Matches:', matches);

            // Shows the round and the names of the participants
            content.innerHTML = `
                <h2 class="mb-5 mt-5 pt-5">Tournament Match Making</h2>
                <p>Round: ${getRoundName(roundNumber)}</p>
                <div class="mb-3 mt-3">
                    ${matches.map((match, index) => `Match: ${index + 1}<br class="mt-4 mb-4"><b >${match.player1_username}</b> vs <b>${match.player2_username}</b><br>`).join('')}
                </div>
                <button type="button" id="start-round" class="btn btn-secondary">Start Round</button>
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