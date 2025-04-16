/**
 * Balance management for the casino games
 * Handles player's balance with localStorage persistence
 */

const Balance = {
    /**
     * Default starting balance
     */
    DEFAULT_BALANCE: 1000,
    
    /**
     * Storage key for balance in localStorage
     */
    STORAGE_KEY: 'casino_balance',
    
    /**
     * Current balance
     */
    currentBalance: 0,
    
    /**
     * Initialize the balance system
     */
    init() {
        this.loadBalance();
        this.updateDisplay();
    },
    
    /**
     * Load balance from localStorage or use default
     */
    loadBalance() {
        const savedBalance = localStorage.getItem(this.STORAGE_KEY);
        this.currentBalance = savedBalance ? parseInt(savedBalance) : this.DEFAULT_BALANCE;
    },
    
    /**
     * Save current balance to localStorage
     */
    saveBalance() {
        localStorage.setItem(this.STORAGE_KEY, this.currentBalance.toString());
    },
    
    /**
     * Update the balance display in the UI
     */
    updateDisplay() {
        const balanceElement = document.getElementById('balance');
        if (balanceElement) {
            balanceElement.textContent = Utils.formatCurrency(this.currentBalance);
        }
    },
    
    /**
     * Add amount to balance
     * @param {number} amount - Amount to add
     */
    add(amount) {
        this.currentBalance += amount;
        this.saveBalance();
        this.updateDisplay();
    },
    
    /**
     * Subtract amount from balance
     * @param {number} amount - Amount to subtract
     * @returns {boolean} True if successful, false if insufficient funds
     */
    subtract(amount) {
        if (amount > this.currentBalance) {
            return false;
        }
        
        this.currentBalance -= amount;
        this.saveBalance();
        this.updateDisplay();
        return true;
    },
    
    /**
     * Get current balance
     * @returns {number} Current balance
     */
    getBalance() {
        return this.currentBalance;
    },
    
    /**
     * Reset balance to default
     */
    reset() {
        this.currentBalance = this.DEFAULT_BALANCE;
        this.saveBalance();
        this.updateDisplay();
    },
    
    /**
     * Check if player has enough balance for a bet
     * @param {number} amount - Amount to check
     * @returns {boolean} True if player has enough balance
     */
    hasEnough(amount) {
        return this.currentBalance >= amount;
    }
};