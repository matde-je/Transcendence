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
    console.log('PFV - Iniciando torneio ID:', tournamentId);
    
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

		console.log('PFV - Participantes:', count);
		console.log('PFV - Potencia de 2:', isPowerOfTwo(count));

        // Checks if the number of participants is a power of 2
        if (!isPowerOfTwo(count)) {
            const needed = nextPowerOfTwo(count) - count;
            alert(`The tournament cannot be started with ${count} players. \n\nIt's needed more ${needed} players.`);
            return;
        }

        // Starts the tournament
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

export async function getMatches() {
    try {
        const response = await fetch('/api/matches/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`Request error: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting matches:', error);
        throw error;
    }
}

export async function startMatchmaking(tournamentId) {
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

		console.log('PFV - Numero de Participantes:', numberOfParticipants);
		console.log('PFV - Numero de Jogos:', numberOfMatches);

        // Calculate the number of rounds based on the number of participants
        const numberOfRounds = Math.log2(numberOfParticipants);

		console.log('PFV - Numero de Rounds:', numberOfRounds);

		if (!Number.isInteger(numberOfRounds)) {
            alert('The number of participants must be a power of 2.');
            return;
        }

		console.log('PFV - Participantes antes de embaralhados:', participants);

        // Shuffle the participants
        for (let i = participants.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [participants[i], participants[j]] = [participants[j], participants[i]];
        }

		console.log('PFV - Participantes depois de embaralhados:', participants);

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
    } catch (error) {
        console.error('Matchmaking error:', error);
        alert('Matchmaking error: ' + error.message);
    }
}

window.addUserToTournament = addUserToTournament;
window.removeUserFromTournament = removeUserFromTournament;
window.deleteTournament = deleteTournament;
window.startTournament = startTournament;