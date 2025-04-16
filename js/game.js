/**
 * Core game logic for Blackjack
 * Handles game state, rules, and scoring
 */

const Game = {
    /**
     * Game states
     */
    STATES: {
        BETTING: 'betting',
        PLAYER_TURN: 'playerTurn',
        DEALER_TURN: 'dealerTurn',
        GAME_OVER: 'gameOver'
    },
    
    /**
     * Game outcomes
     */
    OUTCOMES: {
        WIN: 'win',
        LOSE: 'lose',
        PUSH: 'push',
        BLACKJACK: 'blackjack'
    },
    
    /**
     * Current game state
     */
    currentState: null,
    
    /**
     * Current bet amount
     */
    currentBet: 0,
    
    /**
     * Dealer's hand
     */
    dealerHand: [],
    
    /**
     * Player's hands (array to support splitting)
     */
    playerHands: [],
    
    /**
     * Index of the active player hand
     */
    activeHandIndex: 0,
    
    /**
     * Initialize the game
     */
    init() {
        this.reset();
        Deck.init();
    },
    
    /**
     * Reset the game state
     */
    reset() {
        this.currentState = this.STATES.BETTING;
        this.currentBet = 0;
        this.dealerHand = [];
        this.playerHands = [[]]; // Start with one empty hand
        this.activeHandIndex = 0;
    },
    
    /**
     * Place a bet
     * @param {number} amount - Bet amount
     * @returns {boolean} True if bet was placed successfully
     */
    placeBet(amount) {
        if (this.currentState !== this.STATES.BETTING) return false;
        if (!Balance.hasEnough(amount)) return false;
        
        this.currentBet += amount;
        Balance.subtract(amount);
        return true;
    },
    
    /**
     * Clear the current bet
     */
    clearBet() {
        if (this.currentState !== this.STATES.BETTING) return;
        
        Balance.add(this.currentBet);
        this.currentBet = 0;
    },
    
    /**
     * Deal cards to start the game
     * @returns {boolean} True if deal was successful
     */
    deal() {
        if (this.currentState !== this.STATES.BETTING || this.currentBet <= 0) return false;
        
        // Deal two cards to player and dealer (alternating)
        this.playerHands[0].push(Deck.dealCard(true));
        this.dealerHand.push(Deck.dealCard(true));
        this.playerHands[0].push(Deck.dealCard(true));
        this.dealerHand.push(Deck.dealCard(false)); // Dealer's second card is face down
        
        this.currentState = this.STATES.PLAYER_TURN;
        
        // Check for player blackjack
        if (this.getHandValue(this.playerHands[0]) === 21) {
            return this.handlePlayerBlackjack();
        }
        
        return true;
    },
    
    /**
     * Handle player blackjack
     * @returns {boolean} True if player has blackjack
     */
    handlePlayerBlackjack() {
        // Flip dealer's card to check for dealer blackjack
        this.dealerHand[1].isFaceUp = true;
        
        if (this.getHandValue(this.dealerHand) === 21) {
            // Both have blackjack - push
            this.endGame(this.OUTCOMES.PUSH);
        } else {
            // Player has blackjack, dealer doesn't - player wins 3:2
            this.endGame(this.OUTCOMES.BLACKJACK);
        }
        
        return true;
    },
    
    /**
     * Player hits (takes another card)
     * @returns {boolean} True if hit was successful
     */
    hit() {
        if (this.currentState !== this.STATES.PLAYER_TURN) return false;
        
        const currentHand = this.playerHands[this.activeHandIndex];
        currentHand.push(Deck.dealCard(true));
        
        const handValue = this.getHandValue(currentHand);
        
        if (handValue > 21) {
            // Bust - move to next hand or dealer's turn
            return this.handlePlayerBust();
        } else if (handValue === 21) {
            // Automatically stand on 21
            return this.stand();
        }
        
        return true;
    },
    
    /**
     * Handle player bust
     * @returns {boolean} True if handled successfully
     */
    handlePlayerBust() {
        if (this.activeHandIndex < this.playerHands.length - 1) {
            // Move to next split hand
            this.activeHandIndex++;
        } else {
            // All hands are done, end the game
            this.endRound();
        }
        
        return true;
    },
    
    /**
     * Player stands (ends turn)
     * @returns {boolean} True if stand was successful
     */
    stand() {
        if (this.currentState !== this.STATES.PLAYER_TURN) return false;
        
        if (this.activeHandIndex < this.playerHands.length - 1) {
            // Move to next split hand
            this.activeHandIndex++;
        } else {
            // All hands are done, move to dealer's turn
            this.startDealerTurn();
        }
        
        return true;
    },
    
    /**
     * Player doubles down
     * @returns {boolean} True if double down was successful
     */
    doubleDown() {
        if (this.currentState !== this.STATES.PLAYER_TURN) return false;
        
        const currentHand = this.playerHands[this.activeHandIndex];
        
        // Can only double down on first two cards
        if (currentHand.length !== 2) return false;
        
        // Need enough balance to double the bet
        const additionalBet = this.getBetForHand(this.activeHandIndex);
        if (!Balance.hasEnough(additionalBet)) return false;
        
        // Double the bet and take one more card
        Balance.subtract(additionalBet);
        this.currentBet += additionalBet;
        
        // Deal one more card
        currentHand.push(Deck.dealCard(true));
        
        // Move to next hand or dealer's turn
        if (this.getHandValue(currentHand) > 21) {
            return this.handlePlayerBust();
        } else {
            return this.stand();
        }
    },
    
    /**
     * Player splits their hand
     * @returns {boolean} True if split was successful
     */
    split() {
        if (this.currentState !== this.STATES.PLAYER_TURN) return false;
        
        const currentHand = this.playerHands[this.activeHandIndex];
        
        // Can only split with two cards of the same value
        if (currentHand.length !== 2 || 
            currentHand[0].numericValue !== currentHand[1].numericValue) {
            return false;
        }
        
        // Need enough balance for the additional bet
        const additionalBet = this.getBetForHand(this.activeHandIndex);
        if (!Balance.hasEnough(additionalBet)) return false;
        
        // Take the second card from the current hand
        const secondCard = currentHand.pop();
        
        // Create a new hand with the second card
        const newHand = [secondCard];
        this.playerHands.splice(this.activeHandIndex + 1, 0, newHand);
        
        // Add a card to each hand
        currentHand.push(Deck.dealCard(true));
        newHand.push(Deck.dealCard(true));
        
        // Subtract the additional bet
        Balance.subtract(additionalBet);
        this.currentBet += additionalBet;
        
        // Check if current hand is 21
        if (this.getHandValue(currentHand) === 21) {
            return this.stand();
        }
        
        return true;
    },
    
    /**
     * Start the dealer's turn
     */
    startDealerTurn() {
        this.currentState = this.STATES.DEALER_TURN;
        
        // Flip dealer's hidden card
        this.dealerHand[1].isFaceUp = true;
        
        // Dealer draws until 17 or higher
        this.dealerPlay();
    },
    
    /**
     * Dealer plays their turn
     */
    async dealerPlay() {
        let dealerValue = this.getHandValue(this.dealerHand);
        
        // Dealer must hit on 16 or lower, stand on 17 or higher
        while (dealerValue < 17) {
            // Add a delay for animation
            await Utils.delay(1000);
            
            this.dealerHand.push(Deck.dealCard(true));
            dealerValue = this.getHandValue(this.dealerHand);
            
            // Update UI after each card
            UI.updateDealerHand();
        }
        
        this.endRound();
    },
    
    /**
     * End the current round and determine outcomes
     */
    endRound() {
        this.currentState = this.STATES.GAME_OVER;
        
        const dealerValue = this.getHandValue(this.dealerHand);
        const dealerBusted = dealerValue > 21;
        
        // Determine outcome for each hand
        const outcomes = this.playerHands.map(hand => {
            const handValue = this.getHandValue(hand);
            
            // Player busted
            if (handValue > 21) return this.OUTCOMES.LOSE;
            
            // Dealer busted and player didn't
            if (dealerBusted) return this.OUTCOMES.WIN;
            
            // Compare values
            if (handValue > dealerValue) return this.OUTCOMES.WIN;
            if (handValue < dealerValue) return this.OUTCOMES.LOSE;
            
            // Same value - push
            return this.OUTCOMES.PUSH;
        });
        
        // Process payouts
        this.processPayouts(outcomes);
        
        // Update UI with results
        UI.showGameResults(outcomes);
    },
    
    /**
     * Process payouts for all hands
     * @param {Array} outcomes - Array of outcomes for each hand
     */
    processPayouts(outcomes) {
        let totalWinnings = 0;
        
        outcomes.forEach((outcome, index) => {
            const betAmount = this.getBetForHand(index);
            
            switch (outcome) {
                case this.OUTCOMES.WIN:
                    totalWinnings += betAmount * 2; // Original bet + winnings
                    break;
                case this.OUTCOMES.BLACKJACK:
                    totalWinnings += betAmount * 2.5; // Original bet + 3:2 payout
                    break;
                case this.OUTCOMES.PUSH:
                    totalWinnings += betAmount; // Return original bet
                    break;
                // LOSE - no payout
            }
        });
        
        if (totalWinnings > 0) {
            Balance.add(totalWinnings);
        }
    },
    
    /**
     * End the game with a specific outcome
     * @param {string} outcome - Game outcome
     */
    endGame(outcome) {
        this.currentState = this.STATES.GAME_OVER;
        
        // Process payout based on outcome
        this.processPayouts([outcome]);
        
        // Update UI with result
        UI.showGameResults([outcome]);
    },
    
    /**
     * Start a new hand
     */
    newHand() {
        // Check if deck needs reshuffling
        if (Deck.shouldReshuffle()) {
            Deck.init();
        }
        
        this.reset();
        UI.updateUI();
    },
    
    /**
     * Calculate the value of a hand
     * @param {Array} hand - Array of card objects
     * @returns {number} Hand value
     */
    getHandValue(hand) {
        let value = 0;
        let aces = 0;
        
        // Sum up card values
        for (const card of hand) {
            if (card.value === 'A') {
                aces++;
                value += 11; // Initially count Ace as 11
            } else {
                value += card.numericValue;
            }
        }
        
        // Adjust for Aces if needed
        while (value > 21 && aces > 0) {
            value -= 10; // Change Ace from 11 to 1
            aces--;
        }
        
        return value;
    },
    
    /**
     * Get the bet amount for a specific hand
     * @param {number} handIndex - Index of the hand
     * @returns {number} Bet amount for the hand
     */
    getBetForHand(handIndex) {
        // For simplicity, we're dividing the total bet equally among hands
        return this.currentBet / this.playerHands.length;
    },
    
    /**
     * Check if the player can perform a specific action
     * @param {string} action - Action to check (hit, stand, double, split)
     * @returns {boolean} True if action is allowed
     */
    canPerformAction(action) {
        if (this.currentState !== this.STATES.PLAYER_TURN) return false;
        
        const currentHand = this.playerHands[this.activeHandIndex];
        
        switch (action) {
            case 'hit':
            case 'stand':
                return true;
                
            case 'double':
                // Can only double on first two cards
                return currentHand.length === 2 && 
                       Balance.hasEnough(this.getBetForHand(this.activeHandIndex));
                
            case 'split':
                // Can only split with two cards of the same value
                return currentHand.length === 2 && 
                       currentHand[0].numericValue === currentHand[1].numericValue &&
                       Balance.hasEnough(this.getBetForHand(this.activeHandIndex));
                
            default:
                return false;
        }
    },
    
    /**
     * Get the current active hand
     * @returns {Array} Active hand
     */
    getActiveHand() {
        return this.playerHands[this.activeHandIndex];
    }
};