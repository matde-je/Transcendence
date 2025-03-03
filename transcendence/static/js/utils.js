// static/js/utils.js

import { initializeNavbar, fetchWithRetry } from './app.js';

let isAuthenticated = false;

/**
 * Retrieves the authentication status.
 *
 * @returns {boolean} True if authenticated, false otherwise.
 */
export function getAuthenticationStatus() {
    return isAuthenticated;
}

/**
 * Retrieves the value of a specified cookie by name.
 *
 * @param {string} name - The name of the cookie to retrieve.
 * @returns {string|null} The value of the cookie if found, otherwise null.
 */
export function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Check if this cookie starts with the desired name
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Function to check authentication and update navbar
export async function checkAuthentication() {
    try {
        const data = await fetchWithRetry('/users/check-auth/', {
            method: 'GET',
            credentials: 'include',
        });
        
        // if (!data.ok) {
        //     throw new Error(`HTTP error! status: ${data.status}`);
        // }
        // const data = await response.json();
		localStorage.setItem('username', data.username);
        isAuthenticated = data.is_authenticated || false;

		initializeNavbar(isAuthenticated);
        
        return isAuthenticated ? data.username : ' Anonymous';
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
        return ' Anonymous';
    }
}

export async function getUsernameById(userId) {
    try {
        const response = await fetch(`/users/user/${userId}/`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`Error getting user details: ${response.status}`);
        }
        const userData = await response.json();
        return userData.username;
    } catch (error) {
        console.error('Error getting username:', error);
        return 'Unknown User';
    }
}

/**
 * Checks if a given number is a power of two.
 *
 * @param {number} n - The number to check.
 * @returns {boolean} True if the number is a power of two, false otherwise.
 */
export function isPowerOfTwo(n) {
	return n > 1 && (n & (n - 1)) === 0;
}

/**
 * Calculates the next power of two greater than or equal to the given number.
 *
 * @param {number} n - The input number.
 * @returns {number} The next power of two greater than or equal to the input number.
 */
export function nextPowerOfTwo(n) {
	let power = 2;
	while (power < n) {
		power <<= 1;
	}
	return power;
}

/**
 * Returns the name of the round based on the provided round number.
 *
 * @param {number} round - The round number.
 * @returns {string} The name of the round. 
 * If the round number is greater than the maximum defined round, 
 * it returns a string in the format "Round of X", where X is calculated as 2^(9 - round). 
 * If the round number is not defined and not greater than the maximum defined round, it returns "Unknown Round".
 */
export function getRoundName(round) {
	const round_names = {
		1: 'Final',
		2: 'Semi-final',
		3: 'Quarter-final',
//		4: 'Round of 16',
	};

    const max_defined_round = 3;

    if (round_names[round]) {
        return round_names[round];
    } else if (round > max_defined_round) {
        return `Round of ${Math.pow(2, round)}`;
    } else {
        return 'Unknown Round';
    }
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} string - The string to capitalize.
 * @returns {string} - The capitalized string.
 */
export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


export async function getUserData() {
    try {
        const response = await fetch('/users/user/');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

export async function getUserById(userId) {
    try {
        const users = await getUserData();
        console.log('Users obtained:', users);
        console.log('Searching for userId:', userId);
        const user = Array.isArray(users) ? users.find(user => user.id === userId) : null;
        if (!user) {
            console.log('User not found');
            return null;
        }
        console.log('User found:', user.username);
        return user;
    } catch (error) {
        console.error('Error getting user by ID:', error);
        return null;
    }
}


export async function fetchUserById(userId) {
    try {
        const response = await fetch(`users/user/${userId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        return null;
    }
}


export async function getPendingInvitesForLoggedInUser(loggedInUserId) {
    return fetch('/users/user/' + loggedInUserId + '/invites/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        const inviteRoles = data.invites.map(invite => {
            if (invite.sender_id === loggedInUserId) {
                return 'sender';
            } else if (invite.recipient_id === loggedInUserId) {
                return 'recipient';
            }
        });
        return inviteRoles;
    })
    .catch(error => {
        console.error('Error fetching invites:', error);
    });
}


export async function getPendingInviteId(loggedInUserId) {
    try {
        const response = await fetch(`/users/user/${loggedInUserId}/invites/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        const data = await response.json();
        const invite = data.invites.find(invite => 
            invite.invite_status === 'pending' && (invite.sender_id === loggedInUserId || invite.recipient_id === loggedInUserId)
        );

        if (invite) {
            return invite.invite_id;
        } else {
           // console.log('No pending invites found for the logged in user.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching invites:', error);
        return null;
    }
}

export function removeButtons(buttonContainer) {
	const inviteButton = buttonContainer.querySelector('#inviteButton');
	if (inviteButton) {
		inviteButton.remove();
	}
	const rejectButton = buttonContainer.querySelector('#rejectButton');
	if (rejectButton){
		rejectButton.remove();
	}
	const acceptButton = buttonContainer.querySelector('#acceptButton');
	if (acceptButton){
		acceptButton.remove();
	}
	const cancelButton = buttonContainer.querySelector('#cancelButton');
	if (cancelButton){
		cancelButton.remove();
	}
}

export async function getInviteDetails(inviteId) {
	try {
        if(!inviteId) {
           // console.log('No invite ID provided');
            return null;
        }
		const response = await fetch(`/users/invite/${inviteId}/details/`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': getCookie('csrftoken')
			}
		});
		if (response.ok) {
			const inviteDetails = await response.json();
			//console.log('Invite details:', inviteDetails);
			return inviteDetails;
		} else {
			console.error('Failed to fetch invite details, status:', response.status);
			return null;
		}
	} catch (error) {
		console.log('Error fetching invite details');
		return null;
	}
}

export async function getAcceptedInvite(user_id)
{
    try {
    const response = await fetch(`/users/invite/${user_id}/user_accept/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    });
    if (response.ok) {
        const inviteDetails = await response.json();
        console.log('Invite details:', inviteDetails);
        return inviteDetails;
    } else {
        console.error('Failed to fetch invite details, status:', response.status);
        return null;
    }
    } catch (error) {
        console.log('Error fetching invite details');
        return null;
    }
}

export async function updateInviteInit(inviteId, newInitValue) {
    try {
        // Buscar os detalhes atuais do convite
        const inviteDetails = await getInviteDetails(inviteId);
        if (!inviteDetails) {
            throw new Error('Falha ao buscar detalhes do convite');
        }

        // Calcular o novo valor de init_opponent
        const updatedInitValue = (inviteDetails.init_opponent || 0) + newInitValue;

        // Enviar o valor atualizado para o servidor
        const response = await fetch(`/users/invite/${inviteId}/update_init/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ init_opponent: updatedInitValue })
        });

        if (!response.ok) {
            throw new Error(`Falha ao atualizar init do convite, status: ${response.status}`);
        }

        const updatedInvite = await response.json();
        return updatedInvite;
    } catch (error) {
        console.error('Erro ao atualizar init do convite:', error);
        return null;
    }
}

export async function getAcceptedInviteId(loggedInUserId) {
    try {
        const response = await fetch(`/users/invite/${loggedInUserId}/invites_id_accepted/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        const data = await response.json();
        const invite = data.invites.find(invite => 
            invite.invite_status === 'accepted' && (invite.sender_id === loggedInUserId || invite.recipient_id === loggedInUserId)
        );

        if (invite) {
            return invite.invite_id;
        } else {
           // console.log('No pending invites found for the logged in user.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching invites:', error);
        return null;
    }
}

