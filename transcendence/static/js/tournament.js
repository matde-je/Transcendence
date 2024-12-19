// static/js/tournament.js

import { getCookie } from './utils.js';

/**
 * Shows Tournament Menu
 */
export function showTournamentMenu() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>Tournament Menu</h2>
        <button id="createTournamentBtn" class="btn btn-success">Criar Torneio</button> <!-- Novo botão -->
        <button id="listOpenTournamentsBtn" class="btn btn-primary">Listar Torneios Abertos</button>
        <button id="showResultsBtn" class="btn btn-secondary">Resultados dos Torneios</button>
        <div id="tournamentContent"></div>
    `;

    document.getElementById('listOpenTournamentsBtn').addEventListener('click', (e) => {
        e.preventDefault();
        listOpenTournaments();
    });

    document.getElementById('showResultsBtn').addEventListener('click', (e) => {
        e.preventDefault();
        showTournamentResults();
    });

    document.getElementById('createTournamentBtn').addEventListener('click', (e) => { // Evento do novo botão
        e.preventDefault();
        showCreateTournamentForm();
    });
}

/**
 * Lists currently open tournaments.
 */
export function listOpenTournaments() {
    fetch('/tournament/api/open/', {
        method: 'GET',
        credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
        const tournamentContent = document.getElementById('tournamentContent');
        tournamentContent.innerHTML = '<h3>Open Tournaments</h3>';
        if (data.length > 0) {
            const list = document.createElement('ul');
            data.forEach(tournament => {
                const listItem = document.createElement('li');
                listItem.textContent = `${tournament.name} - Created by ID ${tournament.creator_id}`;
                list.appendChild(listItem);
            });
            tournamentContent.appendChild(list);
        } else {
            tournamentContent.innerHTML += '<p>No tournaments open at the moment.</p>';
        }
    })
    .catch(error => {
        console.error('Error listing tournaments:', error);
        alert('Error listing tournaments.');
    });
}

/**
 * Lists results of finished tournaments.
 */
export function showTournamentResults() {
    fetch('/tournament/api/results/', {
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
                listItem.textContent = `${tournament.name} - Winner ID ${tournament.winner_id}`;
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
            const data = await response.json();
            alert('Tournament created successfully!');
            showDashboard();
        } else {
            const data = await response.json();
            alert('Error creating tournament: ' + JSON.stringify(data));
        }
    });
}