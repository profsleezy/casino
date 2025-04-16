/**
 * Utility functions for the Blackjack game
 */

const Utils = {
    /**
     * Generates a random number between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random number
     */
    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Delays execution for a specified amount of time
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after the delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Formats a number as currency
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount) {
        return amount.toLocaleString();
    },

    /**
     * Creates a DOM element with specified attributes
     * @param {string} tag - HTML tag name
     * @param {Object} attributes - Element attributes
     * @param {string} textContent - Element text content
     * @returns {HTMLElement} Created element
     */
    createElement(tag, attributes = {}, textContent = '') {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // Set text content if provided
        if (textContent) {
            element.textContent = textContent;
        }
        
        return element;
    },

    /**
     * Adds a class to an element for a specified duration then removes it
     * @param {HTMLElement} element - Element to add class to
     * @param {string} className - Class to add
     * @param {number} duration - Duration in milliseconds
     * @returns {Promise} Promise that resolves after the class is removed
     */
    async addTemporaryClass(element, className, duration) {
        element.classList.add(className);
        await this.delay(duration);
        element.classList.remove(className);
    },

    /**
     * Shuffles an array using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};