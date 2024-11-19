document.addEventListener('DOMContentLoaded', function () {
    // Carrega o dashboard ao inicializar
    loadDashboard();

    document.getElementById('invite-friend-button').addEventListener('click', function () {
        const userId = this.getAttribute('data-user-id');
        sendFriendRequest(userId);
    });
});

function loadDashboard() {
    fetch('/api/dashboard/', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        displayDashboard(data);
    })
    .catch(error => console.error('Erro ao carregar o dashboard:', error));
}

function sendFriendRequest(userId) {
    fetch(`/api/invite_friend/${userId}/`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadDashboard();  // Recarregar o dashboard para atualizar o status
    })
    .catch(error => console.error('Erro ao enviar solicitação de amizade:', error));
}

function displayDashboard(data) {
    // Atualiza o DOM com as informações do dashboard, amigos, e usuários disponíveis
    const friendsList = document.getElementById('friends-list');
    friendsList.innerHTML = data.friends.map(friend => `<li>${friend.username}</li>`).join('');

    const availableUsers = document.getElementById('available-users');
    availableUsers.innerHTML = data.available_users.map(user => `
        <li>${user.username} <button onclick="sendFriendRequest(${user.id})">Add Friend</button></li>
    `).join('');
}
