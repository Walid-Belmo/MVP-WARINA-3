/**
 * SerialControlManager
 * Manages serial control input/output interface for serial control levels
 */

class SerialControlManager {
    constructor(gameState) {
        this.gameState = gameState;

        // DOM elements
        this.serialSection = null;
        this.serialInput = null;
        this.serialSendBtn = null;
        this.serialVariableValue = null;

        // Serial state
        this.currentValue = null;
        this.isSerialLevel = false;
    }

    /**
     * Initialize the serial control manager
     */
    init() {
        console.log('🔌 Initializing Serial Control Manager...');

        // Get DOM elements
        this.serialSection = document.getElementById('serialControlSection');
        this.serialInput = document.getElementById('serialInput');
        this.serialSendBtn = document.getElementById('serialSendBtn');
        this.serialVariableValue = document.getElementById('serialVariableValue');

        if (!this.serialSection || !this.serialInput || !this.serialSendBtn || !this.serialVariableValue) {
            console.error('❌ Serial control DOM elements not found');
            return;
        }

        // Setup event listeners
        this.setupEventListeners();

        // Initialize as hidden
        this.hide();

        console.log('✅ Serial Control Manager initialized');
    }

    /**
     * Setup event listeners for serial input
     */
    setupEventListeners() {
        // Send button click
        this.serialSendBtn.addEventListener('click', () => {
            this.sendValue();
        });

        // Enter key press in input
        this.serialInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendValue();
            }
        });
    }

    /**
     * Send the value from serial input
     */
    sendValue() {
        const value = parseInt(this.serialInput.value, 10);

        if (isNaN(value)) {
            this.showError('Please enter a valid integer value');
            return;
        }

        // Update the current value
        this.currentValue = value;

        // Update the display
        this.updateValueDisplay();

        // Store in gameState
        if (!this.gameState.serialVariables) {
            this.gameState.serialVariables = {};
        }
        this.gameState.serialVariables.value = value;

        // Visual feedback
        this.showSuccessFeedback();

        console.log(`📨 Serial value sent: ${value}`);

        // Clear input
        this.serialInput.value = '';
    }

    /**
     * Update the variable value display
     */
    updateValueDisplay() {
        if (this.currentValue !== null) {
            this.serialVariableValue.innerHTML = `<span style="color: #00FF00; font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold;">${this.currentValue}</span>`;
        } else {
            this.serialVariableValue.innerHTML = '<span class="serial-variable-empty">No value yet</span>';
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        this.serialInput.style.borderColor = '#FF0000';
        this.serialInput.style.boxShadow = '0 0 8px rgba(255, 0, 0, 0.5)';

        setTimeout(() => {
            this.serialInput.style.borderColor = '#FFD700';
            this.serialInput.style.boxShadow = '';
        }, 1000);

        console.warn(message);
    }

    /**
     * Show success feedback
     */
    showSuccessFeedback() {
        this.serialSendBtn.style.background = 'linear-gradient(135deg, #00FF00, #00DD00)';
        this.serialSendBtn.textContent = '✓ SENT';

        setTimeout(() => {
            this.serialSendBtn.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
            this.serialSendBtn.textContent = 'SEND';
        }, 500);
    }

    /**
     * Show the serial control section
     */
    show() {
        if (this.serialSection) {
            this.serialSection.style.display = 'block';
            this.isSerialLevel = true;
        }
    }

    /**
     * Hide the serial control section
     */
    hide() {
        if (this.serialSection) {
            this.serialSection.style.display = 'none';
            this.isSerialLevel = false;
        }
    }

    /**
     * Reset serial control state
     */
    reset() {
        this.currentValue = null;
        this.serialInput.value = '';
        this.updateValueDisplay();

        if (this.gameState.serialVariables) {
            this.gameState.serialVariables = {};
        }

        console.log('🔄 Serial control reset');
    }

    /**
     * Get the current serial value
     */
    getValue() {
        return this.currentValue;
    }

    /**
     * Check if a serial value has been set
     */
    hasValue() {
        return this.currentValue !== null;
    }

    /**
     * Set value programmatically (for testing or initialization)
     */
    setValue(value) {
        if (typeof value === 'number' && !isNaN(value)) {
            this.currentValue = value;
            if (!this.gameState.serialVariables) {
                this.gameState.serialVariables = {};
            }
            this.gameState.serialVariables.value = value;
            this.updateValueDisplay();
        }
    }
}

// Create and expose global instance
window.serialControlManager = null;
