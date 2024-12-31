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
