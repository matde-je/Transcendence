// static/js/tournament.js

import { getCookie, isPowerOfTwo, nextPowerOfTwo, getRoundName } from './utils.js';

/**
 * Shows Tournament Menu
 */
export function showTournamentMenu() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>Tournament Menu</h2>
        <button id="createTournamentBtn" class="btn btn-success">Create Tournament</button>
        <button id="listOpenTournamentsBtn" class="btn btn-primary">List Open Tournaments</button>
        <button id="showResultsBtn" class="btn btn-secondary">Tournament Results</button>
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
        tournamentContent.innerHTML = '<h3>Open Tournaments</h3>';

        if (tournaments.length > 0) {
            const list = document.createElement('ul');
            tournaments.forEach(tournament => {
				// Get participants in the tournament
                fetch(`/tournament/tournaments/${tournament.id}/participants/`, {
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
                        actionButton = `<button onclick="removeUserFromTournament(${tournament.id})" class="btn btn-danger btn-sm">Quit Tournament</button>`;
                    } 
					if (!isEnrolled && !tournament.is_started) {
                        actionButton = `<button onclick="addUserToTournament(${tournament.id})" class="btn btn-primary btn-sm">Participate</button>`;
                    }

					if (isCreator && !tournament.is_started) {
						deleteTournamentButton = `<button onclick="deleteTournament(${tournament.id})" class="btn btn-danger btn-sm">Delete Tournament</button>`;
					}

                    if (isEnrolled && !tournament.is_started) {
                        startTournamentButton = `<button onclick="startTournament(${tournament.id})" class="btn btn-success btn-sm">Start Tournament</button>`;
                    }
                    
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <strong>${tournament.name}</strong> - Created by ${tournament.creator_username} - ${deleteTournamentButton}
                        <br>
                        Participants: ${participants.map(p => p.username).join(', ')}
                        <br>
                        ${actionButton} - ${startTournamentButton}
                    `;
                    list.appendChild(listItem);
                })
                .catch(error => {
                    console.error(`Error when searching for tournament participants ${tournament.id}:`, error);
                });
            });
            tournamentContent.appendChild(list);
        } else {
            tournamentContent.innerHTML += '<p>No tournaments open at the moment.</p>';
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
        const response = await fetch(`/tournament/tournaments/${tournamentId}/join/`, {
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
        const response = await fetch(`/tournament/tournaments/${tournamentId}/leave/`, {
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
export function showTournamentResults() {
    fetch('/tournament/results/', {
        method: 'GET',
        credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
        const tournamentContent = document.getElementById('tournamentContent');
        tournamentContent.innerHTML = '<h3>Tournament Results</h3>';
        if (data.length > 0) {
            const list = document.createElement('ul');
            data.forEach(tournament => {
                const listItem = document.createElement('li');
                listItem.textContent = `${tournament.name} - Winner ${tournament.winner_username}`;
                list.appendChild(listItem);
            });
            tournamentContent.appendChild(list);
        } else {
            tournamentContent.innerHTML += '<p>No results available.</p>';
        }
    })
    .catch(error => {
        console.error('Error showing results:', error);
        alert('Error showing results.');
    });
}

/**
 * Shows the form to create a new tournament.
 */
export function showCreateTournamentForm() {
    const formContent = `
        <h2>Create Tournament</h2>
        <form id="createTournamentForm">
            <div class="form-group">
                <label for="tournamentName">Tournament Name:</label>
                <input type="text" id="tournamentName" name="tournamentName" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-primary">Create Tournament</button>
        </form>
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
        const response = await fetch(`/tournament/tournaments/${tournamentId}/`, {
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
        const participantsResponse = await fetch(`/tournament/tournaments/${tournamentId}/participants/`, {
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
		
        const response = await fetch(`/tournament/tournaments/${tournamentId}/start/`, {
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
        const participantsResponse = await fetch(`/tournament/tournaments/${tournamentId}/participants/`, {
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
            const response = await fetch(`/tournament/tournaments/${tournamentId}/matches/`, {
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
			<h2>Tournament Match Making</h2>
			<p>Round: ${getRoundName(numberOfRounds)}</p>
			<p>
				<ul>
					${matches.map((match, index) => `<li>Match: ${index + 1}<br>${match.player1_username} vs ${match.player2_username}</li><br>`).join('')}
				</ul>
			</p>
			<button id="start-matches" class="btn btn-primary">Start Matches</button>
		`;

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
        const matchResponse = await fetch(`/tournament/tournaments/${tournamentId}/matches/${match.id}/`, {
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

		// Inform the players who will play
        alert(`Start a Match between ${match.player1_username} and ${match.player2_username}`);

		// Simulate the match and determine the winner
        winnerId = await simulatePlayMatch(match.player1, match.player2);

		console.log('PFV - ID Vencedor da Partida:', winnerId);

		// Update the match result in the backend
        await updateMatch(tournamentId, match.id, winnerId);

        // Shows the winner of the match
        const winnerUsername = winnerId === match.player1 ? match.player1_username : match.player2_username;
        alert(`Match Winner: ${winnerUsername}`);
		console.log('PFV - Vencedor da Partida:', winnerUsername);
    }

    alert(`Round ${currentRound} finished.`);

	if(currentRound === 1) {
		alert('The tournament has ended.');

		const csrftoken = getCookie('csrftoken');
	
		fetch(`/tournament/tournaments/${tournamentId}/finish/`, {
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
				<h1>Welcome to Pong Tournament</h1>
				<p>The tournament has concluded. Thank you for playing!</p>
			`;
			})
		.catch(error => {
			console.error('Error updating tournament:', error);
		});
	}
}

/**
 * Simulates a match between two players and returns the winner.
 *
 * @param {string} player1 - The name of the first player.
 * @param {string} player2 - The name of the second player.
 * @returns {Promise<string>} A promise that resolves to the name of the winning player.
 */
function simulatePlayMatch(player1, player2) {
    return new Promise((resolve) => {
        // Simulates a match with a 50% chance of each player winning
        const winner = Math.random() < 0.5 ? player1 : player2;
        setTimeout(() => {
            resolve(winner);
        }, 1000);
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
        const getResponse = await fetch(`/tournament/tournaments/${tournamentId}/matches/${matchId}/`, {
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
        const response = await fetch(`/tournament/tournaments/${tournamentId}/matches/${matchId}/`, {
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

// Export functions
window.addUserToTournament = addUserToTournament;
window.removeUserFromTournament = removeUserFromTournament;
window.deleteTournament = deleteTournament;
window.startTournament = startTournament;
window.executeMatches = executeMatches;
window.updateMatch = updateMatch;
