// static/js/login.js

import { showDashboard } from './dashboard.js';
import { update_onlinestatus_ui } from './friendship.js';
import { getCookie, checkAuthentication } from './utils.js';
// import { initializeNavbar } from './app.js';

window.socket = 0;
/**
 * Displays the login form and handles the login process.
 *
 * This function dynamically inserts a login form into the element with the ID 'content'.
 * It also sets up an event listener for the form submission to handle the login process.
 * On successful login, it redirects the user to the dashboard and updates the browser history.
 * On failure, it displays an alert with the error message.
 *
 * @function
 */
export function showLogin() {
	// Dynamically insert the login form into the element with the ID 'content'
    document.getElementById('content').innerHTML = `
        <h3 class="text-center pt-5 mb-4">Log in</h3>
        <div class="row justify-content-center text-left">
            <div class="col-md-6 col-lg-4">
                <form id="login-form">
                    <div class="form-group mb-4">
                        <label for="username" class="form-label">Username:</label>
                        <input type="text" class="form-control" id="username" name="username" required placeholder="Enter your username">
                    </div>
                    <div class="form-group mb-4">
                        <label for="password" class="form-label">Password:</label>
                        <input type="password" class="form-control" id="password" name="password" required placeholder="Enter your password">
                    </div>
                    <div class="d-grid">
                        <button type="submit" class="btn btn-secondary">Login</button>
                    </div>
                </form>
            </div>
        </div>
        `;
	// Add event listener for form submission
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
		// Get the CSRF token from the cookie
        const csrftoken = getCookie('csrftoken');
		// Send a POST request to the server to log in the user
        const response = await fetch('/users/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });
		// Handle the response from the server
        if (response.ok) {
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
            const data = await response.json();
            showDashboard();
            history.pushState({ page: 'dashboard' }, 'Dashboard', '/dashboard');

//			alert("PFV " + getAuthenticationStatus());
//			initializeNavbar(getAuthenticationStatus());
            checkAuthentication();
        } else {
            const data = await response.json();
            alert('Login failed: ' + JSON.stringify(data.errors));
        }
    });
}