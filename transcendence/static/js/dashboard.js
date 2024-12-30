// static/js/dashboard.js

import { checkAuthentication } from './app.js';
import { getCookie } from './utils.js';
import { sendFriendRequest, acceptFriendRequest, removeFriend } from './friendship.js';

// Exporting functions so they can be used in other modules
export { sendFriendRequest, acceptFriendRequest, removeFriend };
window.sendFriendRequest = sendFriendRequest;
window.acceptFriendRequest = acceptFriendRequest;
window.removeFriend = removeFriend;
window.showDashboard = showDashboard;

/**
 * Creates a list section with a title and items, and appends it to the given content element.
 *
 * @param {HTMLElement} content - The parent element to which the list section will be appended.
 * @param {string} title - The title of the list section.
 * @param {string[]} items - An array of strings representing the items to be included in the list section.
 */

function createList(content, title, items) {
    const section = document.createElement('section');
    section.className = 'mb-4';
    const heading = document.createElement('h3');
    heading.textContent = title;
    heading.className = 'mb-3 text-center ';
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
 * Shows user's dashboard.
 */
export function showDashboard() {
    const content = document.getElementById('content');
    content.innerHTML = '';
	// Fetch user data
    fetch('/users/api/user/', {
        method: 'GET',
        credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
        content.innerHTML = `
            <div style="margin-top: 100px;">
            <div class="container my-5">
            <h2 class="text-center mb-4">Dashboard</h2>
            <div class="card shadow-sm">
            <div class="card-body">
            <div class="text-center mb-3">
                    <img src="${data.avatar}" alt="Avatar" width="100">
                    </div>
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item"><strong>ID:</strong> ${data.id}</li>
                        <li class="list-group-item"><strong>Email:</strong> ${data.email}</li>
                        <li class="list-group-item"><strong>Username:</strong> ${data.username}</li>
                        <li class="list-group-item"><strong>Nickname:</strong> ${data.nickname}</li>
                        <li class="list-group-item"><strong>Nome:</strong> ${data.first_name} ${data.last_name}</li>
                        <li class="list-group-item">
                            <strong>Registration Date:</strong> ${new Date(data.date_joined).toLocaleString('pt-PT')}
                        </li>
                        <li class="list-group-item">
                            <strong>Last Login:</strong> ${new Date(data.last_login).toLocaleString('pt-PT')}
                        </li>
                    </ul>
                    <div class="text-center mt-4">
                        <button id="edit-user" class="btn btn-secondary btn-lg">Edit Profile</button>
                    </div>
                </div>
            </div>
        </div>
    `;
        checkAuthentication();
        document.getElementById('edit-user').addEventListener('click', (e) => {
            e.preventDefault();
            showEditUserForm(data);
        });
        Promise.all([ // Uses Promise.all to fetch users, sent friend requests, and friends simultaneously
            fetch('/users/api/users/', {
                method: 'GET',
                credentials: 'include',
            }).then(response => response.json()),
            fetch('/users/api/friend_requests/sent/', {
                method: 'GET',
                credentials: 'include',
            }).then(response => response.json()),
			// Fetch received friend requests
            fetch('/users/api/friend_requests/received/', {
                method: 'GET',
                credentials: 'include',
            }).then(response => response.json()),
            fetch('/users/api/friends/', {
                method: 'GET',
                credentials: 'include',
            }).then(response => response.json())
        ])
        .then(([users, sentRequests, receivedRequests, friends]) => {
            const currentUserId = data.id;
            const sentUserIds = sentRequests.map(request => request.to_user.id);
			// Get IDs of received requests
            const receivedUserIds = receivedRequests.map(request => request.from_user.id);
            const friendIds = friends.map(friend => friend.id);
			// Combines IDs of sent and received requests
            const invalidUserIds = new Set([...sentUserIds, ...receivedUserIds, ...friendIds]);
			// Filter users to exclude:
			// - The user himself
			// - Superusers
			// - Users who have already sent or received friend requests
			// - Users who are already friends
            const filteredUsers = users.filter(user => 
                user.id !== currentUserId && 
                !user.is_superuser && 
                !invalidUserIds.has(user.id)
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
            } else {
                const noUsersItem = document.createElement('div');
                noUsersItem.className = 'list-group-item text-muted text-center';
                noUsersItem.textContent = 'No users found.';
                createList(content, 'All Users', [noUsersItem]); 
            }
        })
        .catch(error => alert('Error fetching users and friend requests:', error));
		// fetch friends and received friend requests
        fetch('/users/api/friends/')
            .then(response => response.json())
            .then(friends => {
                const friendItems = friends.map(friend => {
                    const listItem = document.createElement('a');
                    listItem.className = 'list-group-item text-center list-group-item-action d-flex justify-content-between align-items-center gap-3'; 
                    const usernameText = document.createElement('span');
                    usernameText.textContent = friend.username;
                    // usernameText.className = 'me-3'; // Margin for spacing between username and button
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
            });

        fetch('/users/api/friend_requests/received/')
            .then(response => response.json())
            .then(receivedRequests => {
				// Fetch sent friend requests
                fetch('/users/api/friend_requests/sent/')
                    .then(response => response.json())
                    .then(sentRequests => {
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
                                // Create the 'Accept' button
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
                    });
            })
            .catch(error => {
                console.error('Error fetching friend requests:', error);
                alert('Error fetching friend requests.');
            });
    })
    .catch(error => console.error('Erro:', error));
	// Get CSRF token
    const csrftoken = getCookie('csrftoken');
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
        <div style="margin-top: 100px;">
        <h2>Editar Perfil</h2>
        <form id="edit-user-form" enctype="multipart/form-data">
            <div class="form-group">
                <label for="nickname">Nickname:</label>
                <input type="text" id="nickname" name="nickname" class="form-control" value="${userData.nickname}" required>
            </div>
            <div class="form-group">
                <label for="first_name">Nome:</label>
                <input type="text" id="first_name" name="first_name" class="form-control" value="${userData.first_name}" required>
            </div>
            <div class="form-group">
                <label for="last_name">Sobrenome:</label>
                <input type="text" id="last_name" name="last_name" class="form-control" value="${userData.last_name}" required>
            </div>
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" class="form-control" value="${userData.email}" required>
            </div>
            <div class="form-group">
                <label for="avatar">Avatar:</label>
                <input type="file" id="avatar" name="avatar" class="form-control">
            </div>
            <button type="submit" class="btn btn-success">Save</button>
            <button type="button" id="cancel-edit" class="btn btn-secondary">Cancel</button>
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
            const response = await fetch('/users/api/user/update/', {
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
                alert('Error updating data: ' + JSON.stringify(data.errors));
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