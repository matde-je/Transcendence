// static/js/dashboard.js

import { checkAuthentication, getCookie } from './utils.js';
import { fetchWithRetry, showHome } from './app.js';
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
export function showDashboard() {
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
            history.pushState({ page: 'friends' }, 'friends', '/friends');
        });
		document.getElementById('show-tournaments').addEventListener('click', (e) => {
            e.preventDefault();
            showTournamentResults()
            history.pushState({ page: 'tournament-results' }, 'tournament-results', '/tournament-results');
        });
		document.getElementById('show-results').addEventListener('click', (e) => {
            e.preventDefault();
            showPongResults()
            history.pushState({ page: 'pong-results' }, 'pong-results', '/pong-results');
        });

        document.getElementById('show-rps').addEventListener('click', (e) => {
            e.preventDefault();
            showRockPaperScissor()
            history.pushState({ page: 'rps' }, 'RPS', '/rps-results');
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
                alert('Error updating data: ' + data.errors);
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

export async function showTournamentResults() {
    try {
        const tournaments = await fetchWithRetry('/tournament/user/results/', {
            method: 'GET',
            credentials: 'include',
        });
        const labels = [];
        const wins1 = [];  
        const content = document.getElementById('content');
            tournaments.forEach(tournament => {
                const div = document.createElement('div');
                const date = formatDate(tournament.finished_on);

				labels.push(date); // X-axis labels 
                wins1.push(tournament.is_winner  ? 1 : 0); // Y-axis data 
                content.appendChild(div);
            });
			// Calculate statistics
            const total = tournaments.length;
            const wins = tournaments.filter(t => t.is_winner).length;
            const losses = total - wins;
            const winPercentage = Math.ceil((wins / total) * 100); //round up
            content.innerHTML = `
            <div class="container-fluid">
                <div class="row justify-content-center align-items-center">
                    <div class="col-xl-4 col-lg-5 col-md-6 mb-4 mb-md-0">
                        <div class="card shadow-sm p-3 mx-auto">
                            <h4 class="text-center mb-4">Tournament Results</h4>
                            <div class="row">
                                <div class="col-6 text-end fw-bold">Total Games:</div>
                                <div class="col-6">${total}</div>
                                <div class="col-6 text-end fw-bold">Wins:</div>
                                <div class="col-6">${wins}</div>
                                <div class="col-6 text-end fw-bold">Losses:</div>
                                <div class="col-6">${losses}</div>
                                <div class="col-6 text-end fw-bold">Win Percentage:</div>
                                <div class="col-6">${winPercentage}%</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4 col-lg-5 col-md-6 d-flex justify-content-center">
                        <div class="chart-container">
                            <canvas id="resultspie"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="chart-container mb-5">
                <canvas id="resultsChart"><canvas>
            </div>
            `;  
            if (window.pie instanceof Chart) {
                window.pie.destroy();
            }
            window.pie = document.getElementById('resultspie').getContext('2d');
            window.pie.canvas.width = 200; // Set desired width
            window.pie.canvas.height = 200; // Set desired height
            window.pie = new Chart(window.pie, {
                type: 'pie',
                data: {
                    labels: ['Wins', 'Losses'],
                    datasets: [{
                        data: [wins, losses],
                        backgroundColor: [
                            'rgba(63, 205, 58, 0.77)',
                            'rgba(226, 127, 40, 0.8)',
                        ],
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                    }
                }
            });
            if (window.myChart instanceof Chart) {
                window.myChart.destroy();
            }
            window.myChart = document.getElementById("resultsChart").getContext('2d');
            window.myChart.canvas.height = 100; 
            window.myChart = new Chart(window.myChart, {
                type: "line",
                data: {
                    labels: labels, // X-axis 
                    datasets: [{
                        label: "Wins Over Time",
                        data: wins1,
                        borderColor: "#28a745",
                        backgroundColor: "rgba(40, 167, 69, 0.2)",
                        borderWidth: 2,
                        fill: true,
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Date",
                                font: {
                                    weight: 'bold', 
                                    size: 14
                                }
                            },
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Wins",
                                font: {
                                    weight: 'bold',
                                    size: 14 
                                },
                            },
                            ticks: {
                                stepSize: 1,
                            },
                            grid: {
                                display: false 
                            },
                        }
                    },
                    layout: {
                        padding: {
                            left: 20,
                            right: 20,
                            top: 20, 
                        }          
                    }
                }
            });
    } catch (error) {
        alert('Error fetching tournament results.');
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('default', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        hour12: true
    });
}

window.myChart = null;
window.pie = null;
export async function showPongResults() {
    try {
        const data = await fetchWithRetry('/users/results/', {
            method: 'GET',
            credentials: 'include',
        });
        const content = document.getElementById('content');
        const percent = Math.ceil(data.win_percentage);
        let loss = data.total_matches - data.total_wins;
        content.innerHTML = `
        <div class="container-fluid">
         <div class="row justify-content-center align-items-center">
            <div class="col-xl-4 col-lg-5 col-md-6 mb-4 mb-md-0">
                <div class="card shadow-sm p-3 mx-auto">
                    <h4 class="text-center mb-4">Pong Results</h4>
                    <div class="row">
                        <div class="col-6 text-end fw-bold">Total Games:</div>
                        <div class="col-6">${data.total_matches}</div>
                        <div class="col-6 text-end fw-bold">Wins:</div>
                        <div class="col-6">${data.total_wins}</div>
                        <div class="col-6 text-end fw-bold">Losses:</div>
                        <div class="col-6">${loss}</div>
                        <div class="col-6 text-end fw-bold">Win Percentage:</div>
                        <div class="col-6">${percent}%</div>
                    </div>
                </div>
            </div>
            <div class="col-xl-4 col-lg-5 col-md-6 d-flex justify-content-center">
                <div class="chart-container">
                    <canvas id="resultspie"></canvas>
                </div>
            </div>
        </div>
        </div>
        <div class="chart-container mb-5">
            <canvas id="resultsChart"><canvas>
        </div>
        `;  
            if (window.pie instanceof Chart) {
                window.pie.destroy();
            }
            window.pie = document.getElementById('resultspie').getContext('2d');
            window.pie.canvas.width = 200; // Set desired width
            window.pie.canvas.height = 200; // Set desired height
            window.pie = new Chart(window.pie, {
                type: 'pie',
                data: {
                    labels: ['Wins', 'Losses'],
                    datasets: [{
                        data: [data.total_wins, loss],
                        backgroundColor: [
                            'rgba(63, 205, 58, 0.77)',
                            'rgba(219, 123, 38, 0.8)',
                        ],
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                    }
                }
            });
           
        const labels = [];
        const wins = [];  
        if (data.matches && data.matches.length > 0) {
            data.matches.forEach(match => {
                const date = formatDate(match.date_played);
                labels.push(date); // X-axis labels 
                wins.push(match.result === "win" ? 1 : 0); // Y-axis data 
            });
        } 
        if (window.myChart instanceof Chart) {
            window.myChart.destroy();
        }
        window.myChart = document.getElementById("resultsChart").getContext('2d');
        window.myChart.canvas.height = 100; 
        window.myChart = new Chart(window.myChart, {
            type: "line",
            data: {
                labels: labels, // X-axis 
                datasets: [{
                    label: "Wins Over Time",
                    data: wins,
                    borderColor: "#28a745",
                    backgroundColor: "rgba(40, 167, 69, 0.2)",
                    borderWidth: 2,
                    fill: true,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Date",
                            font: {
                                weight: 'bold', 
                                size: 14
                            }
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Wins",
                            font: {
                                weight: 'bold',
                                size: 14 
                            },
                        },
                        ticks: {
                            stepSize: 1,
                        },
                        grid: {
                            display: false 
                        },
                    }
                },
                layout: {
                    padding: {
                        left: 20,
                        right: 20,
                        top: 20, 
                    }          
                }
            }
        });
    } catch (error) {
        alert('Error getting results.');
    }
}

export async function showRockPaperScissor() {
    try {
        const response = await fetchWithRetry('/rps/get_rps_results/', {
            method: 'GET',
            credentials: 'include',
        });
        const content = document.getElementById('content');
        const rpsResults = response;
        content.innerHTML = `
        <div class="container-fluid">
            <div class="row justify-content-center align-items-center">
                <div class="col-xl-4 col-lg-5 col-md-6 mb-4 mb-md-0">
                    <div class="card shadow-sm p-3 mx-auto">
                        <h4 class="text-center mb-4">Rock-Paper-Scissors Results</h4>
                        <div class="row">
                            <div class="col-6 text-end fw-bold">Total Games:</div>
                            <div class="col-6">${rpsResults.total_games}</div>
                            <div class="col-6 text-end fw-bold">Wins:</div>
                            <div class="col-6">${rpsResults.wins}</div>
                            <div class="col-6 text-end fw-bold">Losses:</div>
                            <div class="col-6">${rpsResults.losses}</div>
                            <div class="col-6 text-end fw-bold">Win Percentage:</div>
                            <div class="col-6">${rpsResults.win_percentage}%</div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-5 col-md-6 d-flex justify-content-center">
                    <div class="chart-container">
                        <canvas id="resultspie"></canvas>
                    </div>
                </div>
            </div>
        </div>
        <div class="chart-container mb-5">
            <canvas id="resultsChart"><canvas>
        </div>
        `;  
            if (window.pie instanceof Chart) {
                window.pie.destroy();
            }
            window.pie = document.getElementById('resultspie').getContext('2d');
            window.pie.canvas.width = 200; // Set desired width
            window.pie.canvas.height = 200; // Set desired height
            window.pie = new Chart(window.pie, {
                type: 'pie',
                data: {
                    labels: ['Wins', 'Losses'],
                    datasets: [{
                        data: [rpsResults.wins, rpsResults.losses],
                        backgroundColor: [
                            'rgba(63, 205, 58, 0.77)',
                            'rgba(222, 124, 39, 0.8)',
                        ],
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                    }
                }
            });
        const labels = [];
        const wins = [];  
        if (rpsResults.matches && rpsResults.matches.length > 0) {
            rpsResults.matches.forEach(match => {
                const date = formatDate(match.date_played);
                labels.push(date); // X-axis labels 
                wins.push(match.result === "win" ? 1 : 0); // Y-axis data 
            });
        }
        if (window.myChart instanceof Chart) {
            window.myChart.destroy();
        }
        window.myChart = document.getElementById("resultsChart").getContext('2d');
        window.myChart.canvas.height = 100; 
        window.myChart = new Chart(window.myChart, {
            type: 'bar',  // Bar chart type
            data: {
                labels: labels, // X-axis (dates)
                datasets: [{
                    label: 'Wins Over Time',
                    data: wins, // Y-axis (1 for win, 0 for loss)
                    borderColor: "#28a745",
                    backgroundColor: "rgba(40, 167, 69, 0.2)",
                    borderWidth: 2,
                    borderSkipped: false, // Makes sure bars are not skipped
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Date",
                            font: {
                                weight: 'bold',
                                size: 14
                            }
                        },
                        grid: {
                            display: false  // Hide grid lines on the y-axis
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Wins",
                            font: {
                                weight: 'bold',
                                size: 14
                            }
                        },
                        ticks: {
                            beginAtZero: true,
                            stepSize: 1
                        },
                        grid: {
                            display: false  // Hide grid lines on the y-axis
                        }
                    }
                },
                barPercentage: 0.5, // Controls the width of the bars
                categoryPercentage: 0.7,
                layout: {
                    padding: {
                        left: 20,
                        right: 20,
                        top: 20, 
                    }          
                }
            }
        });
    } catch (error) {
        console.error('Error fetching Rock-Paper-Scissors results:', error);
        alert('Error fetching Rock-Paper-Scissors results.');
    }
}
