//define routes
const routes = {
    '#home': `
        <h1>Welcome to Pong</h1>
        <p>Click 'Game' to start playing!</p>
    `,
    '#game': `
        <h2>Pong Game</h2>
        <canvas id="pongCanvas" width="600" height="400" class="border"></canvas>
        <button id="startGame" class="btn btn-primary mt-3">Start Game</button>
    `,
    // '#leaderboard': `
    //     <h2>Leaderboard</h2>
    //     <ul class="list-group">
    //         <li class="list-group-item">Player 1: 100 points</li>
    //         <li class="list-group-item">Player 2: 90 points</li>
    //     </ul>
    // `
};

//function to update content
function updateContent() {
    const hash = window.location.hash || '#home';
    document.getElementById('content').innerHTML = routes[hash] || routes['#home'];
    if (hash === '#game') {
        initGame();
    }
}

//listen for hash changes
window.addEventListener('hashchange', updateContent);

//initial content load
document.addEventListener('DOMContentLoaded', updateContent);

//game init
function initGame() {
    const canvas = document.getElementById('pongCanvas');
    const ctx = canvas.getContext('2d');
    //add game logic here
}
