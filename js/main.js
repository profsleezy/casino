/**
 * Main entry point for the Blackjack game
 * Initializes all game components
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize game components
    Balance.init();
    Game.init();
    UI.init();
    
    console.log('Blackjack game initialized');
});