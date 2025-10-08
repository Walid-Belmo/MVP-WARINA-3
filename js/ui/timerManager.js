/**
 * Timer Management System
 * Handles countdown timer for level completion
 */

class TimerManager {
    constructor() {
        this.isRunning = false;
        this.timeRemaining = 0;
        this.totalTime = 0;
        this.timerInterval = null;
        this.onTimeUp = null;
        this.onTick = null;
        this.startTime = 0;
    }

    /**
     * Start the countdown timer
     * @param {number} duration - Duration in milliseconds
     * @param {Function} onTimeUp - Callback when time runs out
     * @param {Function} onTick - Callback on each tick (optional)
     */
    startTimer(duration, onTimeUp = null, onTick = null) {
        if (this.isRunning) {
            console.log('⚠️ Timer already running, stopping current timer');
            this.stopTimer();
        }

        if (duration <= 0) {
            console.error('❌ Invalid timer duration:', duration);
            return false;
        }

        console.log(`⏰ Starting timer: ${duration}ms (${Math.round(duration / 1000)}s)`);

        this.isRunning = true;
        this.timeRemaining = duration;
        this.totalTime = duration;
        this.startTime = Date.now();
        this.onTimeUp = onTimeUp;
        this.onTick = onTick;

        // Update UI immediately
        this.updateTimerDisplay();

        // Start the countdown interval
        this.timerInterval = setInterval(() => {
            this.tick();
        }, 100); // Update every 100ms for smooth display

        return true;
    }

    /**
     * Stop the timer
     */
    stopTimer() {
        if (!this.isRunning) {
            console.log('⚠️ Timer not running');
            return;
        }

        console.log('⏹️ Stopping timer');

        this.isRunning = false;

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Update display to show stopped state
        this.updateTimerDisplay();
    }

    /**
     * Pause the timer
     */
    pauseTimer() {
        if (!this.isRunning) {
            console.log('⚠️ Timer not running');
            return;
        }

        console.log('⏸️ Pausing timer');

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        this.isRunning = false;
    }

    /**
     * Resume the timer
     */
    resumeTimer() {
        if (this.isRunning) {
            console.log('⚠️ Timer already running');
            return;
        }

        if (this.timeRemaining <= 0) {
            console.log('⚠️ No time remaining');
            return;
        }

        console.log('▶️ Resuming timer');

        this.isRunning = true;
        this.startTime = Date.now() - (this.totalTime - this.timeRemaining);

        this.timerInterval = setInterval(() => {
            this.tick();
        }, 100);
    }

    /**
     * Timer tick - called every 100ms
     */
    tick() {
        if (!this.isRunning) return;

        const elapsed = Date.now() - this.startTime;
        this.timeRemaining = Math.max(0, this.totalTime - elapsed);

        // Update display
        this.updateTimerDisplay();

        // Call tick callback
        if (this.onTick) {
            this.onTick(this.timeRemaining, this.totalTime);
        }

        // Check if time is up
        if (this.timeRemaining <= 0) {
            this.handleTimeUp();
        }
    }

    /**
     * Handle time up event
     */
    handleTimeUp() {
        console.log('⏰ TIME UP!');
        
        this.stopTimer();
        
        if (this.onTimeUp) {
            this.onTimeUp();
        }
    }

    /**
     * Update timer display in UI
     */
    updateTimerDisplay() {
        const timerElement = document.querySelector('.timer');
        if (!timerElement) {
            console.warn('⚠️ Timer element not found');
            return;
        }

        const minutes = Math.floor(this.timeRemaining / 60000);
        const seconds = Math.floor((this.timeRemaining % 60000) / 1000);
        const milliseconds = Math.floor((this.timeRemaining % 1000) / 100);

        // Format time display
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds}`;
        timerElement.textContent = timeString;

        // Add visual indicators based on time remaining
        this.updateTimerVisuals();
    }

    /**
     * Update timer visual indicators
     */
    updateTimerVisuals() {
        const timerPanel = document.querySelector('.timer-panel');
        if (!timerPanel) return;

        // Remove existing time classes
        timerPanel.classList.remove('timer-warning', 'timer-critical', 'timer-stopped');

        if (!this.isRunning) {
            timerPanel.classList.add('timer-stopped');
        } else if (this.timeRemaining <= 10000) { // Last 10 seconds
            timerPanel.classList.add('timer-critical');
        } else if (this.timeRemaining <= 30000) { // Last 30 seconds
            timerPanel.classList.add('timer-warning');
        }
    }

    /**
     * Get current time remaining
     * @returns {number} - Time remaining in milliseconds
     */
    getTimeRemaining() {
        return this.timeRemaining;
    }

    /**
     * Get total time
     * @returns {number} - Total time in milliseconds
     */
    getTotalTime() {
        return this.totalTime;
    }

    /**
     * Get elapsed time
     * @returns {number} - Elapsed time in milliseconds
     */
    getElapsedTime() {
        return this.totalTime - this.timeRemaining;
    }

    /**
     * Get time remaining as percentage
     * @returns {number} - Percentage of time remaining (0-100)
     */
    getTimeRemainingPercentage() {
        if (this.totalTime <= 0) return 0;
        return Math.round((this.timeRemaining / this.totalTime) * 100);
    }

    /**
     * Check if timer is running
     * @returns {boolean} - Whether timer is running
     */
    isTimerRunning() {
        return this.isRunning;
    }

    /**
     * Add time to the timer
     * @param {number} additionalTime - Time to add in milliseconds
     */
    addTime(additionalTime) {
        if (additionalTime <= 0) return;

        this.timeRemaining += additionalTime;
        this.totalTime += additionalTime;

        console.log(`⏰ Added ${additionalTime}ms to timer (new total: ${this.timeRemaining}ms)`);
        this.updateTimerDisplay();
    }

    /**
     * Set time remaining
     * @param {number} newTime - New time remaining in milliseconds
     */
    setTimeRemaining(newTime) {
        if (newTime < 0) newTime = 0;

        this.timeRemaining = newTime;
        this.totalTime = Math.max(this.totalTime, newTime);

        console.log(`⏰ Set time remaining to ${newTime}ms`);
        this.updateTimerDisplay();
    }

    /**
     * Get formatted time string
     * @param {number} time - Time in milliseconds
     * @returns {string} - Formatted time string
     */
    formatTime(time) {
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        const milliseconds = Math.floor((time % 1000) / 100);

        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds}`;
    }

    /**
     * Get timer status information
     * @returns {Object} - Timer status
     */
    getTimerStatus() {
        return {
            isRunning: this.isRunning,
            timeRemaining: this.timeRemaining,
            totalTime: this.totalTime,
            elapsedTime: this.getElapsedTime(),
            percentageRemaining: this.getTimeRemainingPercentage(),
            formattedTime: this.formatTime(this.timeRemaining),
            formattedTotal: this.formatTime(this.totalTime)
        };
    }

    /**
     * Reset timer to initial state
     */
    reset() {
        this.stopTimer();
        this.timeRemaining = 0;
        this.totalTime = 0;
        this.startTime = 0;
        this.onTimeUp = null;
        this.onTick = null;
        this.updateTimerDisplay();
        console.log('🔄 Timer reset');
    }

    /**
     * Get time remaining in different units
     * @returns {Object} - Time in different units
     */
    getTimeBreakdown() {
        const total = this.timeRemaining;
        
        return {
            milliseconds: total,
            seconds: Math.floor(total / 1000),
            minutes: Math.floor(total / 60000),
            hours: Math.floor(total / 3600000),
            formatted: this.formatTime(total)
        };
    }
}

// Create global timer manager instance
window.timerManager = new TimerManager();
