/**
 * Deck management for the Blackjack game
 * Handles card creation, shuffling, and dealing
 */

const Deck = {
    /**
     * Card suits
     */
    SUITS: ['♥', '♦', '♠', '♣'],
    
    /**
     * Card values
     */
    VALUES: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
    
    /**
     * Current deck of cards
     */
    cards: [],
    
    /**
     * Initialize a new deck
     */
    init() {
        this.createDeck();
        this.shuffle();
    },
    
    /**
     * Create a standard 52-card deck
     */
    createDeck() {
        this.cards = [];
        
        for (const suit of this.SUITS) {
            for (const value of this.VALUES) {
                this.cards.push({
                    suit,
                    value,
                    isFaceUp: true,
                    // Determine if the card is red or black
                    isRed: suit === '♥' || suit === '♦',
                    // Calculate the numeric value for scoring
                    numericValue: this.getCardValue(value)
                });
            }
        }
    },
    
    /**
     * Get the numeric value of a card
     * @param {string} value - Card value
     * @returns {number} Numeric value
     */
    getCardValue(value) {
        if (value === 'A') return 11; // Ace is initially 11, can be 1 later
        if (['J', 'Q', 'K'].includes(value)) return 10;
        return parseInt(value);
    },
    
    /**
     * Shuffle the deck
     */
    shuffle() {
        this.cards = Utils.shuffleArray(this.cards);
    },
    
    /**
     * Deal a card from the deck
     * @param {boolean} isFaceUp - Whether the card is dealt face up
     * @returns {Object} Card object
     */
    dealCard(isFaceUp = true) {
        if (this.cards.length === 0) {
            // Reshuffle if deck is empty
            this.createDeck();
            this.shuffle();
        }
        
        const card = this.cards.pop();
        card.isFaceUp = isFaceUp;
        return card;
    },
    
    /**
     * Get the number of cards left in the deck
     * @returns {number} Number of cards
     */
    getCardsLeft() {
        return this.cards.length;
    },
    
    /**
     * Check if the deck needs to be reshuffled (less than 20% left)
     * @returns {boolean} True if deck should be reshuffled
     */
    shouldReshuffle() {
        return this.cards.length < 11; // Less than 20% of 52 cards
    }
};