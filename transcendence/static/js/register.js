// static/js/register.js

import { checkAuthentication } from './app.js';
import { showLogin } from './login.js';
import { getCookie } from './utils.js';

/**
 * Displays the registration form and handles the form submission.
 * The form includes fields for username, nickname, email, password, password confirmation, and avatar upload.
 * On form submission, it sends a POST request to the server to register the user.
 * If the registration is successful, it redirects to the login page.
 * If there are errors, it displays them.
 */
export function showRegister() {
	// Dynamically insert the registration form into the element with the ID 'content'
    document.getElementById('content').innerHTML = `
        <h2>Register</h2>
        <form id="registerForm" enctype="multipart/form-data">
            <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="nickname">Nickname:</label>
                <input type="text" id="nickname" name="nickname" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="password1">Password:</label>
                <input type="password" id="password1" name="password1" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="password2">Confirm Password:</label>
                <input type="password" id="password2" name="password2" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="avatar">Avatar:</label>
                <input type="file" id="avatar" name="avatar" class="form-control">
            </div>
            <button type="submit" class="btn btn-primary">Register</button>
        </form>
    `;

	// Add event listener for form submission
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const nickname = document.getElementById('nickname').value;
        const email = document.getElementById('email').value;
        const password1 = document.getElementById('password1').value;
        const password2 = document.getElementById('password2').value;
        const avatar = document.getElementById('avatar').files[0];

		// Get the CSRF token from the cookie
        const csrftoken = getCookie('csrftoken');

		// Create a FormData object and append the form data
        const formData = new FormData();
        formData.append('username', username);
        formData.append('nickname', nickname);
        formData.append('email', email);
        formData.append('password1', password1);
        formData.append('password2', password2);
        formData.append('avatar', avatar);

		// Send a POST request to the server to register the user
        const response = await fetch('/users/register/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            alert('Registration successful');
            showLogin();
            history.pushState({ page: 'login' }, 'Login', '/login');
        } else {
            const data = await response.json();
            displayErrors(data.errors);
        }
    });
}

/**
 * Displays error messages in an alert dialog.
 *
 * @param {Object} errors - An object containing error messages for each field.
 * @param {string[]} errors.field - An array of error messages for the field.
 */
function displayErrors(errors) {
    let errorMessages = '';
    for (let field in errors) {
        errorMessages += `${field}: ${errors[field].join(', ')}\n`;
    }
    alert(errorMessages);
}