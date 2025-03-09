// static/js/app.js
import { showLogin } from './login.js';
import { showRegister } from './register.js';
import { showDashboard, showEditUserForm, showRockPaperScissor, showTournamentResults, showPongResults } from './dashboard.js';
import { getCookie, checkAuthentication } from './utils.js';
import { showSinglePlayer, showMultiplayer, showWaitingList } from './rps.js';
import { update_onlinestatus_ui, showFriends } from './friendship.js';
import { playSinglePlayerGame } from './rps-singleplayer.js';
import { showTournamentMenu, showCreateTournamentForm} from './tournament.js';
import { updateInviteButtons } from './remote1Vs1.js'
import { loop } from './remote1Vs1.js';

async function handleRouteChange() {
    const path = window.location.pathname;
    const username = await checkAuthentication();
    if (path === '/login') {
        showLogin();
    } else if (path === '/register') {
        showRegister();
    } else if (username === ' Anonymous')
        showHome();
    else if (path === '/dashboard') {
        showDashboard();
    } else if (path === '/rock-paper-scissors') {
        showRPS();
    } else if (path === '/rps-results') {
        showRockPaperScissor();
    } else if (path === '/pong-results') {
        showPongResults();
    } else if (path === '/tournament-results') {
        showTournamentResults();
    } else if (path === '/friends') {
        showFriends();
    } else if (path === '/rock-paper-scissors/singleplayer') {
        showSinglePlayer();
    } else if (path === '/rock-paper-scissors/multiplayer') {
        showMultiplayer();
    } else if (path === '/rock-paper-scissors/WaitingList') {
        showWaitingList();
    } else if (path === '/tournament/create/') {
        showCreateTournamentForm();
    } else if (path === '/tournament') {
        showTournamentMenu();
    } else {
        showHome();
    }
}
window.addEventListener('popstate', handleRouteChange);
document.addEventListener('DOMContentLoaded', handleRouteChange);

export async function fetchWithRetry(url, options, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            return await response.json();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
    }
}

window.socket = null;

export function initializeNavbar(authenticated) {
    // Remove existing navbar if present
    const existingNavbar = document.getElementById('navbar');
    if (existingNavbar) {
        existingNavbar.remove();
    }
    // Create navbar container, and Bootstrap classes to style it
    const navBarContainer = document.createElement('nav'); // navigation
    navBarContainer.id = 'navbar';
    navBarContainer.className =
        'navbar navbar-expand-lg navbar-light bg-light fixed-top';
    const container = document.createElement('div'); // grouping
    container.className = 'container-fluid';

    // If tournament mode is on, prevents extra navigation links from appearing during tournaments
    if (window.isTournament === true) {
        /* Create an empty navbar for Tournament mode.
           No additional links will be added. */
        container.innerHTML = '';
        navBarContainer.appendChild(container);
        document.body.appendChild(navBarContainer);
        return;
    }
    // Create brand link, that redirects to the homepage when clicked
    const navbarBrand = document.createElement('a'); // hyperlink
    navbarBrand.className = 'navbar-brand';
    navbarBrand.href = '/';
    navbarBrand.innerText = 'Pong';
    navbarBrand.addEventListener('click', (e) => {
        e.preventDefault();
        showHome();
        history.pushState({ page: 'home' }, 'Home', '/');
    });
    container.appendChild(navbarBrand);

	// Create Navbar Toggle button that allows navbar to collapse on smaller screens
    const toggleButton = document.createElement('button');
    toggleButton.className = 'navbar-toggler';
    toggleButton.type = 'button';
    toggleButton.setAttribute('data-bs-toggle', 'collapse');
    toggleButton.setAttribute('data-bs-target', '#navbarNav');
    toggleButton.setAttribute('aria-controls', 'navbarNav');
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-label', 'Toggle navigation');
    toggleButton.innerHTML = '<span class="navbar-toggler-icon"></span>';

    container.appendChild(toggleButton);
    // Create collapse container for nav links
    const navbarCollapse = document.createElement('div');
    navbarCollapse.className = 'collapse navbar-collapse';
    navbarCollapse.id = 'navbarNav';

	// Two lists are created for navigation links, navLinksLeft, navLinksRight, aligned to left/right
    const navLinksLeft = document.createElement('ul'); // left side links
    navLinksLeft.className = 'navbar-nav me-auto mb-2 mb-lg-0';

    const navLinksRight = document.createElement('ul'); // right side links
    navLinksRight.className = 'navbar-nav';
	// Lists are added inside the navbar:
    navbarCollapse.appendChild(navLinksLeft);
    navbarCollapse.appendChild(navLinksRight);
    container.appendChild(navbarCollapse);
    navBarContainer.appendChild(container);
    document.body.appendChild(navBarContainer);

	// If the user is authenticated, WebSocket connections are established
    if (authenticated) {
		// Online Status WebSocket tracks online friends
        if (!window.socket) {
            window.socket = new WebSocket(`wss://${window.location.hostname}:8000/ws/online_status/`);
            window.socket.onopen = function() {};
            window.socket.onerror = function(error) {
                console.error('WebSocket error:', error);
            };
            window.socket.onclose = function(e) {};

        }
        window.socket.onmessage = function(e) {
            const data = JSON.parse(e.data);
        //    console.log('socket - Parsed data:', data);
            if (data.online_friends) {
                window.onlineFriends = data.online_friends;
                update_onlinestatus_ui();
            }
        };
		// Remote Notifications WebSocket, listens for alerts (e.g., game invitations)
		if (!window.remoteSocket) {
			window.remoteSocket = new WebSocket(`wss://${window.location.hostname}:8000/ws/alerts/`);
			window.remoteSocket.onopen = function() {
				console.log("Remote WebSocket connection established.");
			};
			window.remoteSocket.onmessage = async function (e) {
				const data = JSON.parse(e.data);
                if(data.message) {
					//alert(data.message);
					console.log(data.message);
				}
                if(data.invite_status === 'accepted') {
                    showHome();
                }
                if(data.init_opponent === 1){
                    window.init_opp++;
                }
                if(data.init_opponent === 3){
                    window.init++;
                    loop();
                }
                if(data.message)
				    console.log('message:', data.message);
				updateInviteButtons();
			};
			window.remoteSocket.onclose = function(e) {
				console.log("Remote WebSocket connection closed.");
			};
		};


		// Fetch User Data & Add Authenticated Links, if authenticated, the function
		//  fetches user data and adds additional navigation links
        fetchWithRetry('/users/user/', {
            method: 'GET',
            credentials: 'include',
        })
        // .then((response) => response.json())
        .then((data) => {
            const tournamentLink = document.createElement('li');
            tournamentLink.className = 'nav-item';
            tournamentLink.innerHTML =
            '<a class="nav-link" href="/tournament" id="tournament" data-link>Pong Tournament</a>';
            navLinksLeft.appendChild(tournamentLink);
            tournamentLink.querySelector('a').addEventListener('click',
                (e) => {
                    e.preventDefault();
                    showTournamentMenu();
                    history.pushState(
                        { page: 'tournament' },
                        'Tournament',
                        '/tournament'
                    );
            });
            const rpsLink = document.createElement('li');
            rpsLink.className = 'nav-item';
            rpsLink.innerHTML =
                '<a class="nav-link" href="/rock-paper-scissors" data-link>Rock Paper Scissors</a>';
            navLinksLeft.appendChild(rpsLink);
            rpsLink.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                showRPS();
                history.pushState(
                    { page: 'rock-paper-scissors' },
                    'Rock Paper Scissors',
                    '/rock-paper-scissors'
                );
            });
            const usernameLink = document.createElement('li');
            usernameLink.className = 'nav-item';
            usernameLink.innerHTML = `
                <a class="nav-link" href="/dashboard" data-link>
                    <img src="${data.avatar}" alt="Avatar" class="rounded-circle"
                    style="width: 30px; height: 30px; object-fit: cover;">
                    </a>
                    `;
                    const existingAvatar = navLinksRight.querySelector('img');
            if (!existingAvatar) {
                navLinksRight.appendChild(usernameLink);
                usernameLink.querySelector('a').addEventListener('click',
                    (e) => {
                        e.preventDefault();
                        showDashboard();
                        history.pushState(
                            { page: 'dashboard' },
                            'Dashboard',
                            '/dashboard'
                        );
                });
            }
            const logoutLink = document.createElement('li');
            logoutLink.className = 'nav-item';
            logoutLink.innerHTML =
                '<a class="nav-link" href="#" id="logout" data-link>Logout</a>';
            navLinksRight.appendChild(logoutLink);
            logoutLink
                .querySelector('#logout')
                .addEventListener('click', (e) => {
                    e.preventDefault();
                    logout();
            });
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        });
    } else {
		// Add Links for Non-Authenticated Users, if the user is not
		//  authenticated, only Login and Register links are shown
        const loginLink = document.createElement('li'); // list item
        loginLink.className = 'nav-item';
        loginLink.innerHTML =
            '<a class="nav-link" href="/login" data-link>Login</a>';
        navLinksRight.appendChild(loginLink);
        const registerLink = document.createElement('li');
        registerLink.className = 'nav-item';
        registerLink.innerHTML =
            '<a class="nav-link" href="/register" data-link>Register</a>';
        navLinksRight.appendChild(registerLink);
        loginLink.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            showLogin();
            history.pushState({ page: 'login' }, 'Login', '/login');
        });
        registerLink.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            showRegister();
            history.pushState({ page: 'register' }, 'Register', '/register');
        });
    }
}

/**
 * Displays the Home page.
 */
//import { initializeGame } from './game.js';
import { initializeGame } from './remote1Vs1.js';

export function showHome() {
	window.isTournament = false;
    let contentElement = document.getElementById('content');
    if (!contentElement) {
        contentElement = document.createElement('div');
        contentElement.id = 'content';
        document.body.appendChild(contentElement);  // Append to body or to a specific container
    }
    else
        contentElement.innerHTML = '';
    document.getElementById('gameScript')?.remove();
    document.getElementById('aiScript')?.remove();
    contentElement.innerHTML = `
        <h2 class="text-center text-dark fw-bold mb-5">Pong Game</h2>
        <div class="text-center">
            <div class="d-flex justify-content-center">
                <canvas id="game" width="550" height="400" style="background-color: #000;"></canvas>
            </div>
        </div>
        <div class="text-center mt-4">
            <p class="fs-6 fw-bold">To unlock new features and games,</p>
            <p class="fs-6">Register your User and Login!</p>
        </div>
        `;
        const gameScript = document.createElement('script');
        gameScript.type = 'module';
        //gameScript.src = '/static/js/game.js';
		gameScript.src = '/static/js/remote1Vs1.js';
        gameScript.id = 'gameScript';
        gameScript.onload = () => {
            initializeGame();

        };
        document.body.appendChild(gameScript);
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
    const rpsContent = `
            <h2 class="text-center mb-5 mt-5 pt-5"> Rock - Paper - Scissors</h2>
            <div class="d-flex justify-content-center mb-5 gap-4 p-3">
                <button class="btn btn-secondary me-3" id="singlePlayerBtn">Single Player</button>
                <button class="btn btn-secondary me-3" id="multiplayerBtn">Multiplayer</button>
                <button class="btn btn-secondary " id="WaitingListBtn">Waiting List</button>
            </div>
            `;
    // Insert content into the main content area
    document.getElementById('content').innerHTML = rpsContent;

    // Add listener for the Single Player button
    document.getElementById('singlePlayerBtn').addEventListener('click', (e) => {
        e.preventDefault();
        showSinglePlayer();
        history.pushState(
            {page: 'rock-paper-scissors-singleplayer'},
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
        // Add listener for the WaitingList button
        document.getElementById('WaitingListBtn').addEventListener('click', (e) => {
            e.preventDefault();
            showWaitingList();
            history.pushState(
                { page: 'rock-paper-scissors-WaitingList' },
                'WaitingList',
                '/rock-paper-scissors/WaitingList'
            );
        });
    //history.pushState({ page: 'rock-paper-scissors' }, 'Rock Paper Scissors', '/rock-paper-scissors');
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
            if (window.socket)
                window.socket.close();
            window.socket = null;
            showHome();
            history.pushState({ page: 'home' }, 'Home', '/');
            checkAuthentication();
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        });
}
