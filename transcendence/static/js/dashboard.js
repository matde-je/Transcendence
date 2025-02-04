// static/js/dashboard.js

import { checkAuthentication, getCookie } from './utils.js';
import { showHome } from './app.js';
import { sendFriendRequest, acceptFriendRequest, removeFriend, showFriends } from './friendship.js';

window.sendFriendRequest = sendFriendRequest;
window.acceptFriendRequest = acceptFriendRequest;
window.removeFriend = removeFriend;
window.showDashboard = showDashboard;

/**
 * Creates a list section with a title and items, and appends it to the given content element.
 * @param {HTMLElement} content - The parent element to which the list section will be appended.
 * @param {string} title - The title of the list section.
 * @param {string[]} items - An array of strings representing the items to be included in the list section.
 */

/**
 * Shows user's dashboard.
 */
export async function showDashboard() {

	const username = await checkAuthentication();

    if (username === ' Anonymous') {
        showHome();
        return;
    }
	
	// Get CSRF token
	const csrftoken = getCookie('csrftoken');

    const content = document.getElementById('content');
    content.innerHTML = '';
	// Fetch user data
    fetch('/users/user/', {
        method: 'GET',
        credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
        content.innerHTML = `
            <div class="card shadow-sm text-left">
            	<div class="card-body mt-3">
            		<div class="text-center">
                    	<img src="${data.avatar}" alt="Avatar" width="70" class="rounded-circle" style="width: 70px; height: 70px; object-fit: cover;">
                    </div>
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item mb-3 mt-3"><strong>Email:</strong> ${data.email}</li>
                        <li class="list-group-item mb-3"><strong>Username:</strong> ${data.username}</li>
                        <li class="list-group-item mb-3"><strong>Nickname:</strong> ${data.nickname}</li>
                        <li class="list-group-item mb-3">
                        <strong>Registration Date:</strong> ${new Date(data.date_joined).toLocaleString('pt-PT')}
                        </li>
                        <li class="list-group-item">
                            <strong>Last Login:</strong> ${new Date(data.last_login).toLocaleString('pt-PT')}
                        </li>
                    </ul>
                    <div class="text-center mt-3">
                        <button id="edit-user" class="btn btn-secondary ">Edit Profile</button>
                    </div>
                </div>
            </div>
            <div class="mt-5">
			    <button id="show-friends" class="btn btn-secondary">Show Friends</button>
			    <button id="show-tournaments" class="btn btn-secondary">Show Tournaments Results</button>
			    <button id="show-results" class="btn btn-secondary">Show Pong Results</button>
			<hr>
            <button id="show-rps" class="btn btn-secondary">Show Rock-Paper-Scissors Results</button>
            </div>
        	`;
        checkAuthentication();
        document.getElementById('edit-user').addEventListener('click', (e) => {
            e.preventDefault();
            showEditUserForm(data);
        });
		document.getElementById('show-friends').addEventListener('click', (e) => {
            e.preventDefault();
            showFriends();
        });
		document.getElementById('show-tournaments').addEventListener('click', (e) => {
            e.preventDefault();
            showUserTournamentResults()
        });
		document.getElementById('show-results').addEventListener('click', (e) => {
            e.preventDefault();
            showUserResults()
        });

        document.getElementById('show-rps').addEventListener('click', (e) => {
            e.preventDefault();
            showRockPaperScissor()
        });
	})
    .catch(error => console.error('Error:', error));
	
}

/**
 * Displays edit user form with pre-filled user data and handles form submission.
 *
 * @param {Object} userData - The user data to pre-fill the form.
 * @param {string} userData.nickname - The user's nickname.
 * @param {string} userData.first_name - The user's first name.
 * @param {string} userData.last_name - The user's last name.
 * @param {string} userData.email - The user's email address.
 */
export function showEditUserForm(userData) {
    document.getElementById('content').innerHTML = `
        <h2 class="mb-4 mt-4 text-center">Editar Perfil</h2>
        <form id="edit-user-form" enctype="multipart/form-data">
            <div class="form-group text-left">
                <label for="nickname">Nickname:</label>
                <input type="text" id="nickname" name="nickname" class="form-control" value="${userData.nickname}" required>
            </div>
            <div class="form-group text-left">
                <label for="first_name">Nome:</label>
                <input type="text" id="first_name" name="first_name" class="form-control" value="${userData.first_name}" required>
            </div>
            <div class="form-group text-left">
                <label for="last_name">Sobrenome:</label>
                <input type="text" id="last_name" name="last_name" class="form-control" value="${userData.last_name}" required>
            </div>
            <div class="form-group text-left">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" class="form-control" value="${userData.email}" required>
            </div>
            <div class="form-group mb-3 text-left">
                <label for="avatar">Avatar:</label>
                <input type="file" id="avatar" name="avatar" class="form-control">
            </div>
            <div class="text-left mt-4">
                <button type="submit" class="btn btn-success">Save</button>
                <button type="button" id="cancel-edit" class="btn btn-secondary">Cancel</button>
            </div>
        </form> 
    `;
    document.getElementById('edit-user-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nickname = document.getElementById('nickname').value;
        const first_name = document.getElementById('first_name').value;
        const last_name = document.getElementById('last_name').value;
        const email = document.getElementById('email').value;
        const avatar = document.getElementById('avatar').files[0];

        const formData = new FormData();
        formData.append('nickname', nickname);
        formData.append('first_name', first_name);
        formData.append('last_name', last_name);
        formData.append('email', email);
        if (avatar) {
            formData.append('avatar', avatar);
        }
        const csrfToken = getCookie('csrftoken');
        try {
            const response = await fetch('/users/user/update/', {
                method: 'PUT',
                headers: {
                    'X-CSRFToken': csrfToken
                },
                credentials: 'include',
                body: formData
            });
            if (response.ok) {
                const data = await response.json();
                alert('Data saved successfully!');
                showDashboard();
                history.pushState({ page: 'dashboard' }, 'Dashboard', '/dashboard');
            } else {
                const data = await response.json();
                alert('Error updating data: ' + JSON.stringify(data.errors));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating data.');
        }
    });
    document.getElementById('cancel-edit').addEventListener('click', (e) => {
        e.preventDefault();
        showDashboard();
    });
}

export async function showUserTournamentResults() {
    try {
        const response = await fetch('/tournament/user/results/', {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`Error HTTP! status: ${response.status}`);
        }
        const tournaments = await response.json();
        const content = document.getElementById('content');
        content.innerHTML = '<h2>Tournament Results</h2>';
        if (tournaments.length > 0) {
            tournaments.forEach(tournament => {
                const div = document.createElement('div');
                div.innerHTML = `
                    <p>${tournament.tournament_name}
                       ---   Finished on: ${new Date(tournament.finished_on).toLocaleString()}
                       ---   Winner: ${tournament.is_winner ? 'Yes' : 'No'}</p>
                `;
                content.appendChild(div);
            });
			// Calculate statistics
            const total = tournaments.length;
            const wins = tournaments.filter(t => t.is_winner).length;
            const losses = total - wins;
            const winPercentage = ((wins / total) * 100).toFixed(2);
			// Show statistics
            const statsDiv = document.createElement('div');
            statsDiv.innerHTML = `
                <h3>Statistics</h3>
                <p>Total Tournaments: ${total}</p>
                <p>Total Wins: ${wins}</p>
                <p>Total Losses: ${losses}</p>
                <p>Win Percentage: ${winPercentage}%</p>
            `;
            content.appendChild(statsDiv);
        } else {
            content.innerHTML += '<p>You have not participated in any tournaments.</p>';
        } 
    } catch (error) {
        console.error('Error fetching tournament results:', error);
        alert('Error fetching tournament results.');
    }
}

export async function showUserResults() {
    try {
        const response = await fetch('/users/results/', {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const content = document.getElementById('content');
        content.innerHTML = '<h3 class="text-center mb-3">User Results</h3>';
        content.innerHTML += `
            <p>Total Matches: ${data.total_matches}</p>
            <p>Wins: ${data.total_wins}</p>
            <p>Win Percentage: ${data.win_percentage}%</p>
        `;
    } catch (error) {
        console.error('Error getting results:', error);
        alert('Error getting results.');
    }
}

export async function showRockPaperScissor() {
    try {
        const response = await fetch('/rps/get_rps_results/', {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Error HTTP! status: ${response.status}`);
        }
        const results = await response.json();
        const content = document.getElementById('content');
        content.innerHTML = '';
        const rpsResults = results;
        const rpsResultsDiv = document.createElement('div');
        rpsResultsDiv.innerHTML = `
            <h3>Rock-Paper-Scissors Results</h3>
            <p>Total Games: ${rpsResults.total_games}</p>
            <p>Win Percentage: ${rpsResults.win_percentage}%</p>
            <p>Wins: ${rpsResults.wins}</p>
            <p>Losses: ${rpsResults.losses}</p>
        `;
        content.appendChild(rpsResultsDiv);
    } catch (error) {
        console.error('Error fetching Rock-Paper-Scissors results:', error);
        alert('Error fetching Rock-Paper-Scissors results.');
    }
}
