// static/js/utils.js

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
