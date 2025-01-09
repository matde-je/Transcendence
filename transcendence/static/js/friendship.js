// static/js/friendship.js

import { getCookie } from './utils.js';

/**
 * Creates a list section with a title and items, and appends it to the given content element.
 *
 * @param {HTMLElement} content - The parent element to which the list section will be appended.
 * @param {string} title - The title of the list section.
 * @param {string[]} items - An array of strings representing the items to be included in the list section.
 */
function createList(content, title, items) {
    const section = document.createElement('section');
    const heading = document.createElement('h3');
    heading.textContent = title;
    section.appendChild(heading);

    for (let item of items) {
        const div = document.createElement('div');
        div.innerHTML = item;
        section.appendChild(div);
    }
    content.appendChild(section);
}

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
            showFriends();
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

export async function showFriends() {
    const content = document.getElementById('content');
    content.innerHTML = '';

    // Fetch current user data
    const userResponse = await fetch('/users/user/', {
        method: 'GET',
        credentials: 'include',
    });
    const currentUser = await userResponse.json();

    // Uses Promise.all to fetch users, sent friend requests, and friends simultaneously
    Promise.all([
        fetch('/users/users/', {
            method: 'GET',
            credentials: 'include',
        }).then(response => response.json()),
        fetch('/users/friend_requests/sent/', {
            method: 'GET',
            credentials: 'include',
        }).then(response => response.json()),
        // Fetch received friend requests
        fetch('/users/friend_requests/received/', {
            method: 'GET',
            credentials: 'include',
        }).then(response => response.json()),
        fetch('/users/friends/', {
            method: 'GET',
            credentials: 'include',
        }).then(response => response.json())
    ])
    .then(([users, sentRequests, receivedRequests, friends]) => {
        const currentuser_id = currentUser.id;

        const sentuser_ids = sentRequests.map(request => request.to_user.id);
		// Get IDs of received requests
        const receiveduser_ids = receivedRequests.map(request => request.from_user.id);
        const friendIds = friends.map(friend => friend.id);

		// Combines IDs of sent and received requests
        const invaliduser_ids = new Set([...sentuser_ids, ...receiveduser_ids, ...friendIds]);

		// Filter users to exclude:
		// - The user himself
		// - Superusers
		// - Users who have already sent or received friend requests
		// - Users who are already friends
        const filteredUsers = users.filter(user => 
            user.id !== currentuser_id && 
            !user.is_superuser && 
            !invaliduser_ids.has(user.id)
        );

        if (filteredUsers.length > 0) {
            const userItems = filteredUsers.map(user => {
                return `
                    ${user.username} 
                    <button onclick="sendFriendRequest(${user.id})" class="btn btn-sm btn-primary">
                        Send Friend Request
                    </button>
                `;
            });
            createList(content, 'All Users', userItems);
        } else {
            createList(content, 'All Users', ['No users found.']);
        }
    })
    .catch(error => alert('Error fetching users and friend requests:', error));

	// fetch friends and received friend requests
    fetch('/users/friends/')
        .then(response => response.json())
        .then(friends => {
            const friendItems = friends.map(friend => {
                return `
                    ${friend.username} 
                    <button onclick="removeFriend(${friend.id})" class="btn btn-sm btn-danger">
                        Remove Friendship
                    </button>
                `;
            });
            createList(content, 'Friends', friendItems);
        });

    fetch('/users/friend_requests/received/')
        .then(response => response.json())
        .then(receivedRequests => {
			// Fetch sent friend requests
            fetch('/users/friend_requests/sent/')
                .then(response => response.json())
                .then(sentRequests => {
                    const allRequests = [
                        ...receivedRequests.map(request => ({ ...request, type: 'received' })),
                        ...sentRequests.map(request => ({ ...request, type: 'sent' }))
                    ];

                    const requestItems = allRequests.map(request => {
                        const formattedDate = new Date(request.created_at).toLocaleString();
                        if (request.type === 'received') {
                            return `
                                ${request.from_user.username} - Received: ${formattedDate}
                                <button onclick="acceptFriendRequest(${request.id})" class="btn btn-sm btn-success">
                                    Accept
                                </button>
                            `;
                        } else {
                            return `
                                To: ${request.to_user.username} - Sent: ${formattedDate}
                            `;
                        }
                    });

                    createList(content, 'Friend Requests', requestItems);
                });
        })
        .catch(error => {
            console.error('Error fetching friend requests:', error);
            alert('Error fetching friend requests.');
        });
}
