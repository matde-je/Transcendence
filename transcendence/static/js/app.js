// static/js/app.js

import { showLogin } from './login.js';
import { showRegister } from './register.js';
import { showDashboard, showEditUserForm } from './dashboard.js';
import { getCookie } from './utils.js';
import { showSinglePlayer, showMultiplayer } from './rps.js';
import { playSinglePlayerGame } from './rps-singleplayer.js';
import { showTournamentMenu, showCreateTournamentForm} from './tournament.js';

document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();

    window.addEventListener('popstate', (event) => {
        if (event.state) {
            switch (event.state.page) {
                case 'home':
                    showHome();
                    break;
                case 'login':
                    showLogin();
                    break;
                case 'register':
                    showRegister();
                    break;
                case 'dashboard':
                    showDashboard();
                    break;
                case 'rock-paper-scissors':
                    showRPS();
                    break;
                case 'rock-paper-scissors-singleplayer':
                    showSinglePlayer();
                    break;
                case 'rock-paper-scissors-multiplayer':
                    showMultiplayer();
                    break;
                case 'create_tournament':
                    showCreateTournamentForm();
                    break;
                default:
                    showHome();
                    break;
            }
        } else {
            showHome();
        }
    });

    const path = window.location.pathname;
    if (path === '/login') {
        showLogin();
    } else if (path === '/register') {
        showRegister();
    } else if (path === '/dashboard') {
        showDashboard();
    } else if (path === '/rock-paper-scissors') {
        showRPS();
    } else if (path === '/rock-paper-scissors/singleplayer') {
        showSinglePlayer();
    } else if (path === '/rock-paper-scissors/multiplayer') {
        showMultiplayer();
    } else if (path === '/tournament/create/') {
        showCreateTournamentForm();
    } else {
        showHome();
    }
});

/**
 * Checks the user's authentication status.
 */
export function checkAuthentication() {
    fetch('/users/check-auth/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            const navLinks = document.getElementById('nav-links');
            navLinks.innerHTML = '';

            const homeLink = document.createElement('li');
            homeLink.className = 'nav-item';
            homeLink.innerHTML = '<a class="nav-link" href="/" id="home" data-link>Home</a>';
            navLinks.appendChild(homeLink);

			document.getElementById('home').addEventListener('click', (e) => {
                e.preventDefault();
                showHome();
                history.pushState({ page: 'home' }, 'Home', '/');
            });

            if (data.is_authenticated) {
                const logoutLink = document.createElement('li');
                logoutLink.className = 'nav-item';
                logoutLink.innerHTML = '<a class="nav-link" href="#" id="logout" data-link>Logout</a>';
                navLinks.appendChild(logoutLink);

				document.getElementById('logout').addEventListener('click', (e) => {
					e.preventDefault();
					logout();
				});

                const usernameLink = document.createElement('li');
                usernameLink.className = 'nav-item';
                usernameLink.innerHTML = `<a class="nav-link" href="/dashboard" id="dashboard" data-link>${data.username}</a>`;
                navLinks.appendChild(usernameLink);
				
                document.getElementById('dashboard').addEventListener('click', (e) => {
                    e.preventDefault();
                    showDashboard();
                    history.pushState({ page: 'dashboard' }, 'Dashboard', '/dashboard');
                });

				const tournamentLink = document.createElement('li');
				tournamentLink.className = 'nav-item';
				tournamentLink.innerHTML = '<a class="nav-link" href="/tournament" id="tournament" data-link>Pong Tournament</a>';
				navLinks.appendChild(tournamentLink);

				document.getElementById('tournament').addEventListener('click', (e) => {
				    e.preventDefault();
				    showTournamentMenu();
				    history.pushState({ page: 'tournament' }, 'Tournament', '/tournament');
				});
            } else {
                const loginLink = document.createElement('li');
                loginLink.className = 'nav-item';
                loginLink.innerHTML = '<a class="nav-link" href="#" id="login">Login</a>';
                navLinks.appendChild(loginLink);

                const registerLink = document.createElement('li');
                registerLink.className = 'nav-item';
                registerLink.innerHTML = '<a class="nav-link" href="#" id="register">Register</a>';
                navLinks.appendChild(registerLink);

                document.getElementById('login').addEventListener('click', (e) => {
                    e.preventDefault();
                    showLogin();
                    history.pushState({ page: 'login' }, 'Login', '/login');
                });

                document.getElementById('register').addEventListener('click', (e) => {
                    e.preventDefault();
                    showRegister();
                    history.pushState({ page: 'register' }, 'Register', '/register');
                });
            }

			const rpsLink = document.createElement('li');
			rpsLink.className = 'nav-item';
			rpsLink.innerHTML = '<a class="nav-link" href="/rock-paper-scissors" id="rockPaperScissors" data-link>Rock Paper Scissors</a>';
			navLinks.appendChild(rpsLink);

            document.getElementById('rockPaperScissors').addEventListener('click', (e) => {
                e.preventDefault();
                showRPS();
                history.pushState({ page: 'rock-paper-scissors' }, 'Rock Paper Scissors', '/rock-paper-scissors');
            });
        })
        .catch((error) => {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        });
}

/**
 * Displays the Home page.
 */
export function showHome() {
    document.getElementById('content').innerHTML = `
        <h1>Welcome to The Pong42 Arena</h1>
        <canvas id="game" width="650" height="400" style="background-color: black; max-width: 100%; display: block; margin: auto;"></canvas>
    `;

    // Add the game script first
    if (!document.getElementById('gameScript')) {
        const gameScript = document.createElement('script');
        gameScript.type = 'module';
        gameScript.src = '/static/js/game.js';
        gameScript.id = 'gameScript';
        document.body.appendChild(gameScript);
    }

    // Then add the AI opponent script
    if (!document.getElementById('aiScript')) {
        const aiScript = document.createElement('script');
        aiScript.type = 'module';
        aiScript.src = '/static/js/aiOpponent.js';
        aiScript.id = 'aiScript';
        document.body.appendChild(aiScript);
    }
}

/**
 * Displays the Rock Paper Scissors interface.
 */
export function showRPS() {
    // Define HTML content for the Rock Paper Scissors page
    const rpsContent = `
        <h1>Rock - Paper - Scissors</h1>
        <div class="mode-selection">
            <button class="btn btn-primary m-2" id="singlePlayerBtn">Single Player</button>
            <button class="btn btn-secondary m-2" id="multiplayerBtn">Multiplayer</button>
        </div>
    `;

    // Insert content into the main content area
    document.getElementById('content').innerHTML = rpsContent;

    // Add listener for the Single Player button
    document.getElementById('singlePlayerBtn').addEventListener('click', (e) => {
        e.preventDefault();
        showSinglePlayer();
        history.pushState(
            { page: 'rock-paper-scissors-singleplayer' },
            'Single Player',
            '/rock-paper-scissors/singleplayer'
        );
    });

    // Add listener for the Multiplayer button
    document.getElementById('multiplayerBtn').addEventListener('click', (e) => {
        e.preventDefault();
        showMultiplayer();
        history.pushState(
            { page: 'rock-paper-scissors-multiplayer' },
            'Multiplayer',
            '/rock-paper-scissors/multiplayer'
        );
    });

    // Update history
    history.pushState({ page: 'rock-paper-scissors' }, 'Rock Paper Scissors', '/rock-paper-scissors');
}

/**
 * Logs out the user by making a POST request to the server.
 */
function logout() {
    const csrftoken = getCookie('csrftoken');

    fetch('/users/logout/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken,
        },
        credentials: 'include',
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            alert(data.message);
            showHome();
            history.pushState({ page: 'home' }, 'Home', '/');
            checkAuthentication();
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        });
}

// Exposed the function to the global object if it is not already
window.playSinglePlayerGame = playSinglePlayerGame;

// Use a função showMultiplayer
showMultiplayer();