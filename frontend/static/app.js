
//document.addEventListener('DOMContentLoaded', function() {});

// const canvas = document.getElementById("PongGame");
// if (!canvas) {
//     console.error("Canvas element not found");
//     return;
// }
// const context = canvas.getContext("2d");

const canvas = document.getElementById("PongGame");
const context = canvas.getContext("2d");

canvas.width = 650;
canvas.height = 400;

let score1 = 0;
let score2 = 0;

class Element {
    constructor(options){
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
        this.color = options.color;
        this.speed = options.x || 2;
        this.gravity = options.gravity;
    }
}

const player1 = new Element ( {
    x: 10,
    y: 200,
    width: 15,
    height: 80,
    color: "#fff",
    gravity: 2,
});

const player2 = new Element ( {
    x: 625,
    y: 200,
    width: 15,
    height: 80,
    color: "#fff",
    gravity: 2,
});

const ball = new Element ( {
    x: 325,
    y: 200,
    width: 15,
    height: 15,
    color: "#fff",
    speed: 1,
    gravity: 1,
});


function draw(element) {
    context.fillStyle = element.color;
    context.fillRect(element.x, element.y, element.width, element.height);

}

function score_1(){
    context.font = "18px Arial";
    context.fillStyle = "#fff";
    context.fillText(score1, canvas.width / 2 - 60, 30);
}

function score_2(){
    context.font = "18px Arial";
    context.fillStyle = "#fff";
    context.fillText(score2, canvas.width / 2 + 60, 30);
}


function draw_all(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    draw(player1);
    draw(player2);
    draw(ball);
    
}

function loop(){
    draw_all();
    window.requestAnimationFrame(loop);
}

loop();



// const canvas = document.getElementById("PongGame");
// const context = canvas.getContext("2d");





// //define routes
// const routes = {
//     '#home': `
//         <h1>Welcome to Pong</h1>
//         <canvas id="pongCanvas" width="600" height="400" class="border"></canvas>
//         <button id="startGame" class="btn btn-primary mt-3">Start</button>
//     `,
//     // '#leaderboard': `
//     //     <h2>Leaderboard</h2>
//     //     <ul class="list-group">
//     //         <li class="list-group-item">Player 1: 100 points</li>
//     //         <li class="list-group-item">Player 2: 90 points</li>
//     //     </ul>
//     // `
// };

// //function to update content
// function updateContent() {
//     const hash = window.location.hash || '#home';
//     document.getElementById('content').innerHTML = routes[hash] || routes['#home'];
//     if (hash === '#game') {
//         initGame();
//     }
// }

// //listen for hash changes
// window.addEventListener('hashchange', updateContent);

// //initial content load
// document.addEventListener('DOMContentLoaded', updateContent);

// //game init
// function initGame() {
//     const canvas = document.getElementById('pongCanvas');
//     const ctx = canvas.getContext('2d');
//     //add game logic here
// }
