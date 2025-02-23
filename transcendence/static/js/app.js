// static/js/app.js
import { showLogin } from './login.js';
import { showRegister } from './register.js';
import { showDashboard } from './dashboard.js';
import { showSinglePlayer, showMultiplayer, showWaitingList } from './rps.js';
import { showTournamentMenu } from './tournament.js';
import { update_onlinestatus_ui } from './friendship.js';
import { getCookie, getAuthenticationStatus, checkAuthentication } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
//	alert("PFV " + getAuthenticationStatus());
//    initializeNavbar(getAuthenticationStatus());
	checkAuthentication();
    handleNavigation(window.location.pathname);
    window.addEventListener('popstate', (event) => {
        handleNavigation(event.state?.path || '/');
    });
});

function handleNavigation(path) {
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
//    } else if (path === '/tournament/create/') {
//        showCreateTournamentForm();
    } else if (path === '/tournament') {
        showTournamentMenu();
    } else {
        showHome();
    }
}

window.socket = 0;
// Function to initialize and update the navbar
export function initializeNavbar(authenticated) {
	// Remove existing navbar if present to avoid duplicates
	const existingNavbar = document.getElementById('navbar');
	if (existingNavbar) {
		existingNavbar.remove();
	}
	const navBarContainer = document.createElement('nav'); //navigation
	navBarContainer.id = 'navbar';
	navBarContainer.className = 'navbar navbar-expand-lg navbar-light bg-light fixed-top';
	const container = document.createElement('div'); //group
	container.className = 'container-fluid';
	const navbarBrand = document.createElement('a'); //hyperlink
	navbarBrand.className = 'navbar-brand';
	navbarBrand.href = '/';
	navbarBrand.innerText = 'Pong';
	navbarBrand.addEventListener('click', (e) => {
		e.preventDefault();
		showHome();
		history.pushState({ page: 'home' }, 'Home', '/');
	});

	container.appendChild(navbarBrand);
	const navbarCollapse = document.createElement('div');
	navbarCollapse.className = 'collapse navbar-collapse';
	navbarCollapse.id = 'navbarNav';
	const navLinksLeft = document.createElement('ul'); // Left side links
	navLinksLeft.className = 'navbar-nav'; // Default left-aligned links
	const navLinksRight = document.createElement('ul'); // Right side links (avatar & logout)
	navLinksRight.className = 'navbar-nav ml-auto';
	navbarCollapse.appendChild(navLinksLeft);
	navbarCollapse.appendChild(navLinksRight);
	container.appendChild(navbarCollapse);
	navBarContainer.appendChild(container);
	document.body.appendChild(navBarContainer);
	if (authenticated) {
		window.socket = new WebSocket('wss://localhost:8000/ws/online_status/');
		window.socket.onopen = function() {
			console.log("WebSocket connection established.");
		};
		window.socket.onerror = function(error) {
			console.error("WebSocket error:", error);
		};
		window.socket.onmessage = function(e) {
			const data = JSON.parse(e.data);
			console.log("Parsed data:", data);
			if (data.online_friends) {
				window.onlineFriends = data.online_friends;
				update_onlinestatus_ui();
			}
		};
		window.socket.onclose = function(e) {
			console.log("WebSocket connection closed.");
		};
		fetch('/users/user/', {
			method: 'GET',
			credentials: 'include',
		})
		.then(response => response.json())
		.then(data => {
			const tournamentLink = document.createElement('li');
			tournamentLink.className = 'nav-item';
			tournamentLink.innerHTML = '<a class="nav-link" href="/tournament" id="tournament" data-link>Pong Tournament</a>';
			navLinksLeft.appendChild(tournamentLink);

            const tournamentAnchor = tournamentLink.querySelector('a');
            if (tournamentAnchor) {
                tournamentAnchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    showTournamentMenu();
                    history.pushState({ page: 'tournament' }, 'Tournament', '/tournament');
                });
            }
			const rpsLink = document.createElement('li');
			rpsLink.className = 'nav-item';
			rpsLink.innerHTML = '<a class="nav-link" href="/rock-paper-scissors" data-link>Rock Paper Scissors</a>';
			navLinksLeft.appendChild(rpsLink);

			const rpsAnchor = rpsLink.querySelector('a');
            if (rpsAnchor) {
                rpsAnchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    showRPS();
                    history.pushState({ page: 'rock-paper-scissors' }, 'Rock Paper Scissors', '/rock-paper-scissors');
                });
            }

			const usernameLink = document.createElement('li');
			usernameLink.className = 'nav-item';

			// Create the anchor element
			const dashboardAnchor = document.createElement('a');
			dashboardAnchor.className = 'nav-link';
			dashboardAnchor.href = '/dashboard';
			dashboardAnchor.setAttribute('data-link', '');

			// Create the image element
			const avatarImg = document.createElement('img');
			avatarImg.src = data.avatar;
			avatarImg.alt = 'Avatar';
			avatarImg.className = 'rounded-circle';
			avatarImg.style.width = '30px';
			avatarImg.style.height = '30px';
			avatarImg.style.objectFit = 'cover';

			// Add the image to the anchor element
			dashboardAnchor.appendChild(avatarImg);
			usernameLink.appendChild(dashboardAnchor);

			const existingAvatar = navLinksRight.querySelector('img');
			// If the avatar is not already present, add usernameLink to the navbar
			if (!existingAvatar) {
				navLinksRight.appendChild(usernameLink);
			}

			dashboardAnchor.addEventListener('click', (e) => {
				e.preventDefault();
				showDashboard();
				history.pushState({ page: 'dashboard' }, 'Dashboard', '/dashboard');
			});

			const logoutLink = document.createElement('li');
			logoutLink.className = 'nav-item';

			// Create the Logout link
			const logoutAnchor = document.createElement('a');
			logoutAnchor.className = 'nav-link';
			logoutAnchor.href = '#';
			logoutAnchor.innerText = 'Logout';
			logoutAnchor.setAttribute('data-link', '');
			logoutAnchor.addEventListener('click', (e) => {
				e.preventDefault();
				logout();
			});
			logoutLink.appendChild(logoutAnchor);
			navLinksRight.appendChild(logoutLink);
		})
		.catch((error) => {
			console.error('Error:', error);
			alert(`Error: ${error.message}`);
		});
	}
	else {
		// Cria o link Login
		const loginLink = document.createElement('li'); //list
		loginLink.className = 'nav-item';
		const loginAnchor = document.createElement('a');
		loginAnchor.className = 'nav-link';
		loginAnchor.href = '/login';
		loginAnchor.innerText = 'Login';
		loginAnchor.setAttribute('data-link', '');
		loginAnchor.addEventListener('click', (e) => {
			e.preventDefault();
			showLogin();
			history.pushState({ page: 'login' }, 'Login', '/login');
			console.log("login log");
		});
		loginLink.appendChild(loginAnchor);
		navLinksRight.appendChild(loginLink);

		// Cria o link Register
		const registerLink = document.createElement('li');
		registerLink.className = 'nav-item';
		const registerAnchor = document.createElement('a');
		registerAnchor.className = 'nav-link';
		registerAnchor.href = '/register';
		registerAnchor.innerText = 'Register';
		registerAnchor.setAttribute('data-link', '');
		registerAnchor.addEventListener('click', (e) => {
			e.preventDefault();
			showRegister();
			history.pushState({ page: 'register' }, 'Register', '/register');
			console.log("register log");
		});
		registerLink.appendChild(registerAnchor);
		navLinksRight.appendChild(registerLink);
	}

	const navLinks = document.querySelectorAll('a[data-link]');
	navLinks.forEach(link => {
		link.addEventListener('click', (event) => {
			event.preventDefault();
			const path = event.target.getAttribute('href');
			history.pushState({ path }, '', path);
			handleNavigation(path);
		});
	});
}

/**
 * Displays the Home page.
 */
//import { initializeGame } from './game.js';
import { initializeGame } from './remote1Vs1.js'; //Temp

export function showHome() {
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
        <h2 class="text-center text-dark mb-5">Pong Game</h2>
        <div class="text-center">
            <div class="d-flex justify-content-center">
                <canvas id="game" width="550" height="400" style="background-color: #000;"></canvas>
            </div>
        </div>
        <div class="text-center mt-4">
            <p class="fs-6 text-dark">To unlock new features and games,</p>
            <p class="fs-6 text-dark">Register your User and Login!</p>
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
            <h2 class="text-center mb-3 mt-5 pt-5"> Rock - Paper - Scissors</h2>
            <div class="d-flex justify-content-center gap-4 p-3">
                <button class="btn btn-secondary m-3" id="singlePlayerBtn">Single Player</button>
                <button class="btn btn-secondary m-3" id="multiplayerBtn">Multiplayer</button>
            </div>
            <div class="d-flex justify-content-center gap-4 p-3">
                <button class="btn btn-secondary m-3" id="WaitingListBtn">WaitingList</button>
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
	if (window.socket && window.socket.readyState === WebSocket.OPEN)
    	window.socket.send(JSON.stringify({"action": "logout"}));
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
			// Close the WebSocket connection to signal to the server that the user is offline
            if (window.socket) {
				console.log("web socket closing")
                window.socket.close();
            }
//			alert("PFV " + getAuthenticationStatus());
//			initializeNavbar(getAuthenticationStatus());
			checkAuthentication();
            showHome();
            history.pushState({ page: 'home' }, 'Home', '/');
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        });
}
