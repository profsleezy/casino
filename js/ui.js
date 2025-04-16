/**
 * UI management for the Blackjack game
 * Handles rendering and animations
 */

const UI = {
    /**
     * DOM elements
     */
    elements: {
        dealerCards: null,
        dealerScore: null,
        playerHands: null,
        betChips: null,
        currentBet: null,
        messageOverlay: null,
        resultMessage: null,
        resultDetails: null,
        nextHandBtn: null,
        dealBtn: null,
        clearBetBtn: null,
        hitBtn: null,
        standBtn: null,
        doubleBtn: null,
        splitBtn: null,
        actionControls: null,
        bettingControls: null
    },
    
    /**
     * Animation durations
     */
    ANIMATION: {
        DEAL: 500,
        FLIP: 500,
        CHIP: 500
    },
    
    /**
     * Initialize the UI
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.updateUI();
        
        // Hide the message overlay initially
        this.hideMessage();
    },
    
    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements.dealerCards = document.getElementById('dealer-cards');
        this.elements.dealerScore = document.getElementById('dealer-score');
        this.elements.playerHands = document.getElementById('player-hands');
        this.elements.betChips = document.getElementById('bet-chips');
        this.elements.currentBet = document.getElementById('current-bet');
        this.elements.messageOverlay = document.getElementById('message-overlay');
        this.elements.resultMessage = document.getElementById('result-message');
        this.elements.resultDetails = document.getElementById('result-details');
        this.elements.nextHandBtn = document.getElementById('next-hand-btn');
        this.elements.dealBtn = document.getElementById('deal-btn');
        this.elements.clearBetBtn = document.getElementById('clear-bet-btn');
        this.elements.hitBtn = document.getElementById('hit-btn');
        this.elements.standBtn = document.getElementById('stand-btn');
        this.elements.doubleBtn = document.getElementById('double-btn');
        this.elements.splitBtn = document.getElementById('split-btn');
        this.elements.actionControls = document.querySelector('.action-controls');
        this.elements.bettingControls = document.querySelector('.betting-controls');
    },
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Chip selection
        document.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const value = parseInt(chip.dataset.value);
                this.handleChipClick(value, chip);
            });
        });
        
        // Game control buttons
        this.elements.dealBtn.addEventListener('click', () => this.handleDealClick());
        this.elements.clearBetBtn.addEventListener('click', () => this.handleClearBetClick());
        this.elements.hitBtn.addEventListener('click', () => this.handleHitClick());
        this.elements.standBtn.addEventListener('click', () => this.handleStandClick());
        this.elements.doubleBtn.addEventListener('click', () => this.handleDoubleClick());
        this.elements.splitBtn.addEventListener('click', () => this.handleSplitClick());
        this.elements.nextHandBtn.addEventListener('click', () => this.handleNextHandClick());
    },
    
    /**
     * Update the entire UI based on game state
     */
    updateUI() {
        this.updateDealerHand();
        this.updatePlayerHands();
        this.updateBetDisplay();
        this.updateControls();
    },
    
    /**
     * Update dealer's hand display
     */
    updateDealerHand() {
        this.elements.dealerCards.innerHTML = '';
        
        // Render dealer cards
        Game.dealerHand.forEach(card => {
            const cardElement = this.createCardElement(card);
            this.elements.dealerCards.appendChild(cardElement);
        });
        
        // Update dealer score
        if (Game.dealerHand.length > 0 && Game.dealerHand[0].isFaceUp) {
            this.elements.dealerScore.textContent = Game.getHandValue(Game.dealerHand);
        } else {
            this.elements.dealerScore.textContent = '?';
        }
    },
    
    /**
     * Update player's hands display
     */
    updatePlayerHands() {
        this.elements.playerHands.innerHTML = '';
        
        // Render each player hand
        Game.playerHands.forEach((hand, index) => {
            const handElement = document.createElement('div');
            handElement.className = `player-hand ${index === Game.activeHandIndex ? 'active' : ''}`;
            handElement.id = `player-hand-${index}`;
            
            // Hand info (title and score)
            const infoElement = document.createElement('div');
            infoElement.className = 'player-info';
            
            const titleElement = document.createElement('h2');
            titleElement.textContent = Game.playerHands.length > 1 ? `Hand ${index + 1}` : 'Your Hand';
            
            const scoreElement = document.createElement('div');
            scoreElement.className = 'score';
            scoreElement.id = `player-score-${index}`;
            scoreElement.textContent = Game.getHandValue(hand);
            
            infoElement.appendChild(titleElement);
            infoElement.appendChild(scoreElement);
            
            // Cards container
            const cardsElement = document.createElement('div');
            cardsElement.className = 'player-cards';
            cardsElement.id = `player-cards-${index}`;
            
            // Render cards
            hand.forEach(card => {
                const cardElement = this.createCardElement(card);
                cardsElement.appendChild(cardElement);
            });
            
            handElement.appendChild(infoElement);
            handElement.appendChild(cardsElement);
            
            this.elements.playerHands.appendChild(handElement);
        });
    },
    
    /**
     * Update bet display
     */
    updateBetDisplay() {
        this.elements.currentBet.textContent = Utils.formatCurrency(Game.currentBet);
        
        // Clear and re-render bet chips
        this.elements.betChips.innerHTML = '';
        
        if (Game.currentBet > 0) {
            // Create visual representation of chips based on bet amount
            const chipValues = [100, 50, 25, 5];
            let remainingBet = Game.currentBet;
            
            chipValues.forEach(value => {
                const count = Math.floor(remainingBet / value);
                remainingBet %= value;
                
                for (let i = 0; i < count; i++) {
                    const chipElement = document.createElement('div');
                    chipElement.className = `chip chip-${value}`;
                    chipElement.innerHTML = `<div class="chip-inner">${value}</div>`;
                    this.elements.betChips.appendChild(chipElement);
                }
            });
        }
    },
    
    /**
     * Update game controls based on game state
     */
    updateControls() {
        const state = Game.currentState;
        
        // Show/hide control groups
        this.elements.bettingControls.style.display = 
            (state === Game.STATES.BETTING) ? 'flex' : 'none';
            
        this.elements.actionControls.style.display = 
            (state === Game.STATES.PLAYER_TURN) ? 'flex' : 'none';
        
        // Update action button states
        if (state === Game.STATES.PLAYER_TURN) {
            this.elements.doubleBtn.disabled = !Game.canPerformAction('double');
            this.elements.splitBtn.disabled = !Game.canPerformAction('split');
        }
        
        // Disable deal button if bet is 0
        this.elements.dealBtn.disabled = Game.currentBet <= 0;
    },
    
    /**
     * Create a card element
     * @param {Object} card - Card object
     * @returns {HTMLElement} Card element
     */
    createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.isFaceUp ? '' : 'hidden'}`;
        
        if (card.isFaceUp) {
            // Create card content
            const colorClass = card.isRed ? 'red' : 'black';
            
            // Top left corner
            const topLeftCorner = document.createElement('div');
            topLeftCorner.className = 'corner top-left';
            topLeftCorner.innerHTML = `
                <div class="value">${card.value}</div>
                <div class="suit ${colorClass}">${card.suit}</div>
            `;
            
            // Center suit
            const centerSuit = document.createElement('div');
            centerSuit.className = `suit ${colorClass}`;
            centerSuit.textContent = card.suit;
            
            // Bottom right corner
            const bottomRightCorner = document.createElement('div');
            bottomRightCorner.className = 'corner bottom-right';
            bottomRightCorner.innerHTML = `
                <div class="value">${card.value}</div>
                <div class="suit ${colorClass}">${card.suit}</div>
            `;
            
            cardElement.appendChild(topLeftCorner);
            cardElement.appendChild(centerSuit);
            cardElement.appendChild(bottomRightCorner);
        }
        
        return cardElement;
    },
    
    /**
     * Handle chip click
     * @param {number} value - Chip value
     * @param {HTMLElement} chipElement - Chip element
     */
    async handleChipClick(value, chipElement) {
        if (Game.currentState !== Game.STATES.BETTING) return;
        
        // Check if player has enough balance
        if (!Balance.hasEnough(value)) {
            this.showMessage('Insufficient Funds', 'You don\'t have enough balance for this bet.', false);
            return;
        }
        
        // Animate chip
        await Utils.addTemporaryClass(chipElement, 'betting', this.ANIMATION.CHIP);
        
        // Place bet
        if (Game.placeBet(value)) {
            this.updateBetDisplay();
            this.updateControls();
        }
    },
    
    /**
     * Handle deal button click
     */
    async handleDealClick() {
        if (Game.currentBet <= 0) return;
        
        if (Game.deal()) {
            // Deal animation
            await this.animateDeal();
            this.updateUI();
        }
    },
    
    /**
     * Handle clear bet button click
     */
    handleClearBetClick() {
        Game.clearBet();
        this.updateBetDisplay();
        this.updateControls();
    },
    
    /**
     * Handle hit button click
     */
    async handleHitClick() {
        if (Game.hit()) {
            await this.animateHit();
            this.updateUI();
        }
    },
    
    /**
     * Handle stand button click
     */
    handleStandClick() {
        if (Game.stand()) {
            this.updateUI();
        }
    },
    
    /**
     * Handle double button click
     */
    async handleDoubleClick() {
        if (Game.doubleDown()) {
            await this.animateHit();
            this.updateUI();
        }
    },
    
    /**
     * Handle split button click
     */
    async handleSplitClick() {
        if (Game.split()) {
            this.updateUI();
        }
    },
    
    /**
     * Handle next hand button click
     */
    handleNextHandClick() {
        this.hideMessage();
        Game.newHand();
    },
    
    /**
     * Animate dealing cards
     */
    async animateDeal() {
        // Clear previous cards
        this.elements.dealerCards.innerHTML = '';
        document.querySelector('#player-cards-0').innerHTML = '';
        
        // Animate player's first card
        const playerCard1 = this.createCardElement(Game.playerHands[0][0]);
        playerCard1.classList.add('dealing');
        document.querySelector('#player-cards-0').appendChild(playerCard1);
        await Utils.delay(this.ANIMATION.DEAL / 2);
        
        // Animate dealer's first card
        const dealerCard1 = this.createCardElement(Game.dealerHand[0]);
        dealerCard1.classList.add('dealing');
        this.elements.dealerCards.appendChild(dealerCard1);
        await Utils.delay(this.ANIMATION.DEAL / 2);
        
        // Animate player's second card
        const playerCard2 = this.createCardElement(Game.playerHands[0][1]);
        playerCard2.classList.add('dealing');
        document.querySelector('#player-cards-0').appendChild(playerCard2);
        await Utils.delay(this.ANIMATION.DEAL / 2);
        
        // Animate dealer's second card
        const dealerCard2 = this.createCardElement(Game.dealerHand[1]);
        dealerCard2.classList.add('dealing');
        this.elements.dealerCards.appendChild(dealerCard2);
        await Utils.delay(this.ANIMATION.DEAL / 2);
    },
    
    /**
     * Animate hitting (drawing a new card)
     */
    async animateHit() {
        const hand = Game.getActiveHand();
        const newCard = hand[hand.length - 1];
        
        const cardElement = this.createCardElement(newCard);
        cardElement.classList.add('dealing');
        
        document.querySelector(`#player-cards-${Game.activeHandIndex}`).appendChild(cardElement);
        await Utils.delay(this.ANIMATION.DEAL);
    },
    
    /**
     * Show game results
     * @param {Array} outcomes - Array of outcomes for each hand
     */
    showGameResults(outcomes) {
        let title = '';
        let details = '';
        
        // Determine overall message
        if (outcomes.length === 1) {
            // Single hand
            switch (outcomes[0]) {
                case Game.OUTCOMES.WIN:
                    title = 'You Win!';
                    details = `You won ${Utils.formatCurrency(Game.currentBet)} chips.`;
                    this.highlightWinningHand(0);
                    break;
                case Game.OUTCOMES.LOSE:
                    title = 'You Lose';
                    details = `You lost ${Utils.formatCurrency(Game.currentBet)} chips.`;
                    break;
                case Game.OUTCOMES.PUSH:
                    title = 'Push';
                    details = 'Your bet has been returned.';
                    break;
                case Game.OUTCOMES.BLACKJACK:
                    title = 'Blackjack!';
                    details = `You won ${Utils.formatCurrency(Game.currentBet * 1.5)} chips.`;
                    this.highlightWinningHand(0);
                    break;
            }
        } else {
            // Multiple hands (split)
            const winCount = outcomes.filter(o => o === Game.OUTCOMES.WIN).length;
            const loseCount = outcomes.filter(o => o === Game.OUTCOMES.LOSE).length;
            const pushCount = outcomes.filter(o => o === Game.OUTCOMES.PUSH).length;
            
            if (winCount > loseCount) {
                title = 'You Win!';
            } else if (winCount < loseCount) {
                title = 'You Lose';
            } else {
                title = 'Push';
            }
            
            details = `Won ${winCount}, Lost ${loseCount}, Push ${pushCount}`;
            
            // Highlight winning hands
            outcomes.forEach((outcome, index) => {
                if (outcome === Game.OUTCOMES.WIN) {
                    this.highlightWinningHand(index);
                }
            });
        }
        
        this.showMessage(title, details, true);
    },
    
    /**
     * Highlight a winning hand
     * @param {number} handIndex - Index of the winning hand
     */
    highlightWinningHand(handIndex) {
        const handElement = document.querySelector(`#player-hand-${handIndex}`);
        if (handElement) {
            handElement.classList.add('winning-hand');
        }
    },
    
    /**
     * Show message overlay
     * @param {string} title - Message title
     * @param {string} details - Message details
     * @param {boolean} showNextButton - Whether to show the next hand button
     */
    showMessage(title, details, showNextButton = true) {
        this.elements.resultMessage.textContent = title;
        this.elements.resultDetails.textContent = details;
        this.elements.nextHandBtn.style.display = showNextButton ? 'block' : 'none';
        this.elements.messageOverlay.style.display = 'flex';
    },
    
    /**
     * Hide message overlay
     */
    hideMessage() {
        this.elements.messageOverlay.style.display = 'none';
        
        // Remove winning hand highlights
        document.querySelectorAll('.winning-hand').forEach(el => {
            el.classList.remove('winning-hand');
        });
    }
};