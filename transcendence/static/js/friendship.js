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
    section.className = 'mt-5 mb-5';
    const heading = document.createElement('h4');
    heading.textContent = title;
    if (title === 'Friends')
        heading.className = 'mb-4 text-center pt-5';
    else
        heading.className = 'mb-4 text-center mt-4';
    section.appendChild(heading);
    const listGroup = document.createElement('div');
    listGroup.className = 'list-group';
    if (items.length > 0) {
        items.forEach(item => {
            listGroup.appendChild(item);
        });
    } else {
        const emptyItem = document.createElement('div');
        emptyItem.className = 'list-group-item text-muted text-center';
        emptyItem.textContent = 'No users found.';
        listGroup.appendChild(emptyItem);
    }
    section.appendChild(listGroup);
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
            window.showFriends();
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
        const friendItems = friends.map(friend => {
            const listItem = document.createElement('a');
            listItem.className = 'list-group-item text-center list-group-item-action d-flex justify-content-between align-items-center gap-3'; 
            const usernameText = document.createElement('span');
            usernameText.textContent = friend.username;
            listItem.appendChild(usernameText);
            const button = document.createElement('button');
            button.textContent = 'Remove Friendship';
            button.className = 'btn btn-sm btn-danger';
            button.onclick = function() {
                removeFriend(friend.id); // Use the friend.id when the button is clicked
            };
            listItem.appendChild(button);
            return listItem;
        });
        createList(content, 'Friends', friendItems);
        let socket;
        if (!document.getElementById('friends-list-container')) {
            const friendsListContainer = document.createElement('div');
            friendsListContainer.id = 'friends-list-container';
            content.appendChild(friendsListContainer);
            socket = new WebSocket('wss://localhost:8000/ws/online_status/');
            socket.onopen = function() {
                console.log("WebSocket connection established.");
            };
            socket.onerror = function(error) {
                console.error("WebSocket error:", error);
            };
            socket.onmessage = function(e) {
                const data = JSON.parse(e.data);
                console.log("Parsed data:", data);
                let onlineFriends = [];
                if (data.online_friends && data.online_friends.online_friends) {
                    onlineFriends = data.online_friends.online_friends;
                }
                console.log("Online friends:", onlineFriends);
                friendsListContainer.innerHTML = '';
                createList(friendsListContainer, 'Online Friends', onlineFriends.map(friend => {
                    const li = document.createElement('li');
                    li.textContent = friend.username;
                    return li;
                }));
            };
            socket.onclose = function(e) {
                console.log("WebSocket connection closed.");
            };
        }
        const allRequests = [
            ...receivedRequests.map(request => ({ ...request, type: 'received' })),
            ...sentRequests.map(request => ({ ...request, type: 'sent' }))
        ];
        const requestItems = allRequests.map(request => {
            const formattedDate = new Date(request.created_at).toLocaleString();
            // Create the list item (DOM element)
            const listItem = document.createElement('a');
            listItem.className = 'list-group-item text-center list-group-item-action d-flex justify-content-between align-items-center';
            // Check if the request is received or sent
            if (request.type === 'received') {
                // Create the text for the received request
                const textContent = document.createElement('span');
                textContent.textContent = `${request.from_user.username} - Received: ${formattedDate}`;
                listItem.appendChild(textContent);
                const acceptButton = document.createElement('button');
                acceptButton.textContent = 'Accept';
                acceptButton.className = 'btn btn-sm btn-success';
                acceptButton.onclick = function() {
                    acceptFriendRequest(request.id); // Call the function when the button is clicked
                };
                listItem.appendChild(acceptButton);
            } else {
                // For sent requests, just display the text
                const textContent = document.createElement('span');
                textContent.textContent = `To: ${request.to_user.username} - Sent: ${formattedDate}`;
                textContent.className = 'd-block text-center w-100';
                listItem.appendChild(textContent);
            }
            return listItem; // Return the DOM element
        });
        createList(content, 'Friend Requests', requestItems);
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
        const filteredUsers = users.filter(user => 
            user.id !== currentuser_id && 
            !user.is_superuser && 
            !invaliduser_ids.has(user.id)
        );
        if (filteredUsers.length > 0) {
            const userItems = filteredUsers.map(user => {
                const listItem = document.createElement('a');
                listItem.className = 'list-group-item text-center list-group-item-action d-flex justify-content-between align-items-center gap-2';
                const usernameText = document.createElement('span');
                usernameText.textContent = user.username;
                listItem.appendChild(usernameText);
                const button = document.createElement('button');
                button.textContent = 'Send Friend Request';
                button.className = 'btn btn-sm btn-secondary';
                button.onclick = function() {
                    sendFriendRequest(user.id); // Use the user.id when the button is clicked
                };
                listItem.appendChild(button);
                return listItem;
            });
            createList(content, 'All Users', userItems);
        } else 
            createList(content, 'All Users', []); 
    })
    .catch(error => {
        console.error("Error fetching data:", error);
        alert('Error fetching users and friend requests.');
    });
}