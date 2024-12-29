// static/js/tournament.js

import { getCookie } from './utils.js';

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
            showDashboard();
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
    console.log('Iniciando torneio ID:', tournamentId);
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

        // Starts the tournament
        const names = participants.map((p) => p.username).join('\n');
        alert(`Tournament started successfully! \n\nParticipants: ${names}`);

        const response = await fetch(`/tournament/tournaments/${tournamentId}/start/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
        });
        if (response.ok) {
            listOpenTournaments();
        } else {
            const data = await response.json();
            alert('Error starting tournament: ' + JSON.stringify(data));
        }
    } catch (error) {
        console.error('Error starting tournament:', error);
        alert('Error starting tournament.');
    }
}

function isPowerOfTwo(n) {
    return n > 0 && (n & (n - 1)) === 0;
}

function nextPowerOfTwo(n) {
    let power = 1;
    while (power < n) {
        power <<= 1;
    }
    return power;
}

window.addUserToTournament = addUserToTournament;
window.removeUserFromTournament = removeUserFromTournament;
window.deleteTournament = deleteTournament;
window.startTournament = startTournament;