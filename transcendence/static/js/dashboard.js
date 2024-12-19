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
            <h2>Dashboard</h2>
            <p>Avatar: <img src="${data.avatar}" alt="Avatar" width="100"></p>
            <p>ID: ${data.id}</p>
            <p>Email: ${data.email}</p>
            <p>Username: ${data.username}</p>
            <p>Nickname: ${data.nickname}</p>
            <p>Nome: ${data.first_name} ${data.last_name}</p>
            <p>Registration date: ${new Date(data.date_joined).toLocaleString('pt-PT')}</p>
            <p>Last login: ${new Date(data.last_login).toLocaleString('pt-PT')}</p>
            <button id="edit-user" class="btn btn-primary">Edit Profile</button>
            <hr>
        `;

        checkAuthentication();

        document.getElementById('edit-user').addEventListener('click', (e) => {
            e.preventDefault();
            showEditUserForm(data);
        });

		// Uses Promise.all to fetch users, sent friend requests, and friends simultaneously
        Promise.all([
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
            const currentuser_id = data.id;

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
        fetch('/users/api/friends/')
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
