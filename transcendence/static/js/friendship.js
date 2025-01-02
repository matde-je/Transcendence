// static/js/friendship.js

import { getCookie } from './utils.js';

/**
 * Sends a friend request to the specified user.
 *
 * @param {number} user_id - The ID of the user to whom the friend request is being sent.
 * @returns {void}
 */
export function sendFriendRequest(user_id) {
	// Send a POST request to the server to create a new friendship request
    fetch('/users/friendships/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        credentials: 'include',
        body: JSON.stringify({ to_user_id: user_id })
    })
	// Handle the response from the server
    .then(response => {
        if (response.ok) {
            alert('Friend request sent.');
            showDashboard();
        } else {
            response.json().then(data => {
                alert('Error sending request: ' + data.detail);
            });
        }
    })
	// Handle any errors that occur during the request
    .catch(error => {
        console.error('Error:', error);
        alert('Error sending request.');
    });
}

/**
 * Accepts a friend request by sending a POST request to the server.
 *
 * @param {number} requestId - The ID of the friend request to accept.
 * @returns {void}
 *
 * Fetches the API endpoint to accept the friend request, handles the response,
 * and updates the UI accordingly. If the request is successful, it alerts the user
 * and shows the dashboard. If there is an error, it logs the error and alerts the user.
 */
export function acceptFriendRequest(requestId) {
    fetch(`/users/friendships/${requestId}/accept/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        credentials: 'include',
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then(data => {
                throw new Error(data.detail || 'Error accepting request.');
            });
        }
    })
    .then(data => {
        alert(data.detail || 'Friend request accepted.');
        showDashboard();
    })
    .catch(error => {
        console.error('Error accepting request:', error);
        alert('Error accepting request: ' + error.message);
    });
}

/**
 * Removes a friend by sending a DELETE request to the server.
 *
 * @param {number} user_id - The ID of the user to remove from friends.
 * @returns {void}
 */
export function removeFriend(user_id) {
    fetch(`/users/friends/${user_id}/remove/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        credentials: 'include',
    })
    .then(response => {
        if (response.ok) {
            alert('Friendship removed.');
            window.showDashboard();
        } else {
            response.json().then(data => {
                alert('Error removing friendship: ' + JSON.stringify(data));
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error removing friendship.');
    });
}