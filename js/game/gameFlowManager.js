/**
 * Game Flow Manager
 * Manages game state, level progression, and win/lose conditions
 */

class GameFlowManager {
    constructor(timerManager, levelManager, targetAnimationPlayer) {
        this.timerManager = timerManager;
        this.levelManager = levelManager;
        this.targetAnimationPlayer = targetAnimationPlayer;
        
        this.isGameActive = false;
        this.hasPlayedTarget = false;
        this.currentLevel = null;
        
        // Callbacks
        this.onLevelLoad = null;
        this.onGameStateChange = null;
        this.onLoseCallback = null;
    }

    /**
     * Initialize the game
     */
    initializeGame() {
        console.log('🎮 Initializing game...');
        
        // Load first level
        this.loadLevel(1);
    }

    /**
     * Load a specific level
     * @param {number} levelId - Level ID to load
     */
    loadLevel(levelId) {
        console.log(`🎮 Loading level ${levelId}...`);
        
        if (this.levelManager.loadLevel(levelId)) {
            this.currentLevel = this.levelManager.getCurrentLevel();
            this.isGameActive = false;
            this.hasPlayedTarget = false;
            
            console.log(`✅ Level ${levelId} loaded: "${this.currentLevel.name}"`);
            
            // Notify listeners
            if (this.onLevelLoad) {
                this.onLevelLoad(this.currentLevel);
            }
            
            return true;
        } else {
            console.error(`❌ Failed to load level ${levelId}`);
            return false;
        }
    }

    /**
     * Play target animation and start timer
     * @param {Function} onAnimationComplete - Callback when animation completes
     */
    playTargetAnimation(onAnimationComplete) {
        if (!this.currentLevel) {
            console.error('❌ No level loaded');
            return false;
        }

        console.log('🎬 Playing target animation...');
        
        const targetSequence = this.levelManager.getTargetSequence();
        if (!targetSequence) {
            console.error('❌ No target sequence available');
            return false;
        }

        // Start timer and enable game immediately (first time only)
        if (!this.isGameActive) {
            console.log('🎮 Starting game and timer...');
            this.isGameActive = true;
            this.startGameTimer();
        }

        // Play the target animation
        this.targetAnimationPlayer.playTargetAnimation(targetSequence, () => {
            console.log('✅ Target animation completed');
            if (onAnimationComplete) {
                onAnimationComplete();
            }
        });

        this.hasPlayedTarget = true;
        this.notifyGameStateChange();
        
        return true;
    }

    /**
     * Stop target animation
     */
    stopTargetAnimation() {
        console.log('⏹️ Stopping target animation...');
        this.targetAnimationPlayer.stopAnimation();
        this.notifyGameStateChange();
    }

    /**
     * Start the game timer
     */
    startGameTimer() {
        if (!this.currentLevel) {
            console.error('❌ No level loaded');
            return;
        }

        console.log(`⏰ Starting timer: ${this.currentLevel.timeLimit}ms`);
        
        this.isGameActive = true;
        this.notifyGameStateChange();

        // Start countdown timer
        this.timerManager.startTimer(
            this.currentLevel.timeLimit,
            () => this.handleTimeUp()
        );
    }

    /**
     * Handle time up event
     */
    handleTimeUp() {
        console.log('⏰ TIME UP!');
        this.handleLose();
    }

    /**
     * Handle win condition
     * @param {Function} onWinCallback - Optional callback after win handling
     */
    handleWin(onWinCallback) {
        console.log('🎉 PLAYER WINS!');
        
        // Add win celebration effects
        if (window.visualEffectsManager) {
            window.visualEffectsManager.playWinCelebration();
        }
        
        // Stop timer
        this.timerManager.stopTimer();
        
        // Update game state
        this.isGameActive = false;
        this.notifyGameStateChange();
        
        if (onWinCallback) {
            onWinCallback();
        }
    }

    /**
     * Handle lose condition
     * @param {Function} onLoseCallback - Optional callback after lose handling
     */
    handleLose(onLoseCallback) {
        console.log('💀 PLAYER LOSES!');
        
        // Stop timer
        this.timerManager.stopTimer();
        
        // Update game state
        this.isGameActive = false;
        this.notifyGameStateChange();
        
        // Trigger lose callback (shows modal)
        if (this.onLoseCallback) {
            this.onLoseCallback();
        }
        
        if (onLoseCallback) {
            onLoseCallback();
        }
    }

    /**
     * Go to next level
     * @returns {boolean} True if next level exists, false otherwise
     */
    nextLevel() {
        const nextLevelId = this.levelManager.getNextLevelId();
        if (nextLevelId) {
            this.loadLevel(nextLevelId);
            return true;
        }
        return false;
    }

    /**
     * Restart current level
     * @returns {boolean} True if level was restarted, false otherwise
     */
    restartLevel() {
        if (this.currentLevel) {
            this.loadLevel(this.currentLevel.id);
            return true;
        }
        return false;
    }

    /**
     * Get current game state
     * @returns {Object} Current game state
     */
    getGameState() {
        return {
            isGameActive: this.isGameActive,
            hasPlayedTarget: this.hasPlayedTarget,
            currentLevel: this.currentLevel,
            isAnimationPlaying: this.targetAnimationPlayer.isAnimationPlaying()
        };
    }

    /**
     * Check if game is active
     * @returns {boolean}
     */
    isActive() {
        return this.isGameActive;
    }

    /**
     * Check if target has been played
     * @returns {boolean}
     */
    hasPlayedTargetAnimation() {
        return this.hasPlayedTarget;
    }

    /**
     * Get current level
     * @returns {Object} Current level data
     */
    getCurrentLevel() {
        return this.currentLevel;
    }

    /**
     * Set level load callback
     * @param {Function} callback - Callback function(level)
     */
    setLevelLoadCallback(callback) {
        this.onLevelLoad = callback;
    }

    /**
     * Set game state change callback
     * @param {Function} callback - Callback function()
     */
    setGameStateChangeCallback(callback) {
        this.onGameStateChange = callback;
    }

    /**
     * Set lose callback
     * @param {Function} callback - Callback function()
     */
    setLoseCallback(callback) {
        this.onLoseCallback = callback;
    }

    /**
     * Notify listeners of game state change
     */
    notifyGameStateChange() {
        if (this.onGameStateChange) {
            this.onGameStateChange();
        }
    }
}

// GameFlowManager will be instantiated in app.js

