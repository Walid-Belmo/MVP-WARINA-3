/**
 * Modal Manager
 * Manages all modal dialogs, messages, and status displays
 */

class ModalManager {
    constructor() {
        this.autoHideTimeout = null;
    }

    /**
     * Show win modal
     */
    showWinModal() {
        const modal = document.getElementById('winModal');
        if (modal) {
            modal.style.display = 'flex';
        }
        
        // Auto-hide after 3 seconds
        this.autoHideTimeout = setTimeout(() => {
            this.hideWinModal();
        }, 3000);
    }

    /**
     * Hide win modal
     */
    hideWinModal() {
        const modal = document.getElementById('winModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        if (this.autoHideTimeout) {
            clearTimeout(this.autoHideTimeout);
            this.autoHideTimeout = null;
        }
    }

    /**
     * Show lose modal
     */
    showLoseModal() {
        const modal = document.getElementById('loseModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    /**
     * Hide lose modal
     */
    hideLoseModal() {
        const modal = document.getElementById('loseModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Show code execution status
     * @param {string} message - Status message
     */
    showCodeStatus(message = '⚡ Code Running...') {
        const status = document.getElementById('codeStatus');
        if (status) {
            status.innerHTML = `<div>${message}</div>`;
            status.classList.add('show', 'running');
        }
    }

    /**
     * Hide code execution status
     */
    hideCodeStatus() {
        const status = document.getElementById('codeStatus');
        if (status) {
            status.classList.remove('show', 'running');
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const errorDisplay = document.getElementById('errorDisplay');
        const errorMessage = document.querySelector('.error-message');
        
        if (errorDisplay && errorMessage) {
            errorMessage.textContent = message;
            errorDisplay.classList.add('show');
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                this.hideError();
            }, 10000);
        }
    }

    /**
     * Hide error message
     */
    hideError() {
        const errorDisplay = document.getElementById('errorDisplay');
        if (errorDisplay) {
            errorDisplay.classList.remove('show');
        }
    }

    /**
     * Show general message to user
     * @param {string} message - Message to show
     * @param {string} type - Message type (info, warning, error, success)
     */
    showMessage(message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        
        // Create or update message element
        let messageEl = document.getElementById('gameMessage');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'gameMessage';
            messageEl.className = 'game-message';
            document.body.appendChild(messageEl);
        }
        
        messageEl.textContent = message;
        messageEl.className = `game-message game-message-${type}`;
        messageEl.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }
}

// Create global instance
window.modalManager = new ModalManager();

