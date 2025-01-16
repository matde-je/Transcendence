// static/js/login.js

import { showDashboard } from './dashboard.js';
import { getCookie, checkAuthentication } from './utils.js';

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
        <h2>Login</h2>
        <form id="login-form">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" class="form-control" id="username" name="username" required>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" class="form-control" id="password" name="password" required>
            </div>
            <button type="submit" class="btn btn-primary">Login</button>
        </form>
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
            const data = await response.json();
            showDashboard();
            history.pushState({ page: 'dashboard' }, 'Dashboard', '/dashboard');
            checkAuthentication();
        } else {
            const data = await response.json();
            alert('Login failed: ' + JSON.stringify(data.errors));
        }
    });
}