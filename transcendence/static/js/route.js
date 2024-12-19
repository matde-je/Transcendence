// static/js/route.js

import { showHome, showRPS } from './app.js';
import { showSinglePlayer, showMultiplayer } from './rps.js';
import { showTournamentMenu } from './tournament.js';

/**
 * Navigates to the specified URL by updating the browser's history state and invoking the router function.
 *
 * @param {string} url - The URL to navigate to.
 */
const navigateTo = (url) => {
    history.pushState(null, null, url);
    router();
};

/**
 * Router function to handle view changes based on the current path.
 */
const router = async () => {
    const routes = [
        { path: '/', elementId: 'home' },
        { path: '/rock-paper-scissors', elementId: 'rockPaperScissors' },
        { path: '/rock-paper-scissors/singleplayer', elementId: 'rockPaperScissorsSinglePlayer' },
        { path: '/rock-paper-scissors/multiplayer', elementId: 'rockPaperScissorsMultiplayer' },
        { path: '/tournament', elementId: 'tournament' }, // Rota adicionada
    ];

    const match = routes.find((route) => route.path === location.pathname) || routes[0]; // Padrão para home se não houver correspondência

	// Hide all pages
    document.querySelectorAll('.page').forEach((page) => {
        page.style.display = 'none';
    });

	// Show the page based on the matched elementId
    if (match.elementId === 'rockPaperScissors') {
        showRPS();
    } else if (match.elementId === 'rockPaperScissorsSinglePlayer') {
        showSinglePlayer();
    } else if (match.elementId === 'rockPaperScissorsMultiplayer') {
        showMultiplayer();
    } else if (match.elementId === 'tournament') {
        showTournamentMenu();
    } else if (match.elementId === 'home') {
        showHome();
    } else {
        showHome();
    }
};

// Add event listeners for popstate and DOMContentLoaded
window.addEventListener('popstate', router);

// Wait for the DOM content to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (event) => {
        if (event.target.matches('[data-link]')) {
            event.preventDefault();
            navigateTo(event.target.href);
        }
    });
    router();
});

// Blocks default behavior for ArrowUp and ArrowDown keys
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
    }
});
