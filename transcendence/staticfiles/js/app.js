// static/js/app.js
import { showLogin } from './login.js';
import { showRegister } from './register.js';
import { showDashboard, showEditUserForm } from './dashboard.js';
import { getCookie, checkAuthentication } from './utils.js';
import { showSinglePlayer, showMultiplayer, showWaitingList } from './rps.js';
import { playSinglePlayerGame } from './rps-singleplayer.js';
import { showTournamentMenu, showCreateTournamentForm} from './tournament.js';

document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();

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
    } else if (path === '/tournament') {
        showTournamentMenu();
    } else {
        showHome();
    }
});

// Function to initialize and update the navbar
export function initializeNavbar(authenticated) {
    let navBarContainer = document.getElementById('navbar');
    navBarContainer = document.createElement('nav'); //navigation
    navBarContainer.id = 'navbar';
    navBarContainer.className = 'navbar navbar-expand-lg navbar-light bg-light fixed-top mb-5';
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
            
            document.getElementById('tournament').addEventListener('click', (e) => {
                e.preventDefault();
                showTournamentMenu();
                history.pushState({ page: 'tournament' }, 'Tournament', '/tournament');
            });

            const rpsLink = document.createElement('li');
            rpsLink.className = 'nav-item';
            rpsLink.innerHTML = '<a class="nav-link" href="/rock-paper-scissors" data-link>Rock Paper Scissors</a>';
            navLinksLeft.appendChild(rpsLink);
            rpsLink.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                showRPS();
                history.pushState({ page: 'rock-paper-scissors' }, 'Rock Paper Scissors', '/rock-paper-scissors');
                console.log("rps log");
            });

                const usernameLink = document.createElement('li');
                usernameLink.className = 'nav-item';
                usernameLink.innerHTML = `
                        <a class="nav-link" href="/dashboard" data-link>
                            <img src="${data.avatar}" alt="Avatar" class="rounded-circle" style="width: 30px; height: 30px; object-fit: cover;">
                        </a>
                `;
                const existingAvatar = navLinksRight.querySelector('img');
                if (!existingAvatar) {
                    navLinksRight.appendChild(usernameLink);
                    usernameLink.querySelector('a').addEventListener('click', (e) => {
                        e.preventDefault();
                        showDashboard();
                        history.pushState({ page: 'dashboard' }, 'Dashboard', '/dashboard'); 
                    });
                }
                const logoutLink = document.createElement('li');
                logoutLink.className = 'nav-item';
                logoutLink.innerHTML = '<a class="nav-link" href="#" id="logout" data-link>Logout</a>';
                navLinksRight.appendChild(logoutLink);
        
                logoutLink.querySelector('#logout').addEventListener('click', (e) => {
                    e.preventDefault();
                    logout();
                });
            })
            .catch((error) => {
                console.error('Error:', error);
                alert(`Error: ${error.message}`);
            }); 
    }
    else {
        const loginLink = document.createElement('li'); //list 
        loginLink.className = 'nav-item';
        loginLink.innerHTML = '<a class="nav-link" href="/login" data-link>Login</a>';
        navLinksRight.appendChild(loginLink);

        const registerLink = document.createElement('li');
        registerLink.className = 'nav-item';
        registerLink.innerHTML = '<a class="nav-link" href="/register" data-link>Register</a>';
        navLinksRight.appendChild(registerLink);

        loginLink.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            showLogin();
            history.pushState({ page: 'login' }, 'Login', '/login');
            console.log("login log");
        });
        registerLink.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
        showRegister();
            history.pushState({ page: 'register' }, 'Register', '/register');
            console.log("register log");
        });
    }
}

/**
 * Displays the Home page.
 */
import { initializeGame } from './game.js';

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
        <div class="text-center mt-5 pt-5">
            <h2 class="text-dark fw-bold mb-5">Pong Game</h2>
        </div>
        <div class="text-center"> 
            <div class="d-flex justify-content-center">
                <canvas id="game" width="550" height="400" style="background-color: #000;"></canvas>
            </div>
        </div>
        <div class="text-center mt-4">
            <p class="fs-6 fw-bold text-dark">To unlock new features and games,</p>
            <p class="fs-6 text-dark">Register your User and Login!</p>
        </div>
        `;
        const gameScript = document.createElement('script');
        gameScript.type = 'module';
        gameScript.src = '/static/js/game.js';
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
        <div class="container-fluid d-flex flex-column pt-5 mb-5 mt-5 ">
            <h2 class="text-center mb-3 mt-5 pt-5"> Rock - Paper - Scissors</h2>
            <div class="d-flex justify-content-center mb-3 gap-4 p-3">
                <button class="btn btn-secondary m-3" id="singlePlayerBtn" >Single Player</button>
                <button class="btn btn-secondary m-3" id="multiplayerBtn" >Multiplayer</button>
            </div>
            <div class="d-flex justify-content-center mb-3 gap-4 p-3">
                <button class="btn btn-secondary m-3" id="WaitingListBtn">WaitingList</button>
            </div>
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
