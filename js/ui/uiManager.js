/**
 * UI Manager (Coordinator)
 * Coordinates between all UI modules, game flow, and execution systems
 * This is now a slim coordinator that delegates to specialized managers
 */

class UIManager {
    constructor(gameState, pinManager, componentManager, arduinoParser, codeEditor) {
        // Core dependencies
        this.gameState = gameState;
        this.pinManager = pinManager;
        this.componentManager = componentManager;
        this.arduinoParser = arduinoParser;
        this.codeEditor = codeEditor;
        
        // Sub-managers (initialized in init())
        this.eventManager = null;
        this.codeExecutor = null;
        this.gameFlowManager = null;
        this.validationManager = null;
    }

    /**
     * Initialize UI and all sub-managers
     */
    init() {
        console.log('🎮 Initializing UI Manager...');
        
        // Initialize Event Manager
        this.eventManager = new EventManager(this.gameState, this.pinManager);
        this.eventManager.init();
        
        // Set up event callbacks
        this.setupEventCallbacks();
        
        // Initialize Code Executor
        this.codeExecutor = new CodeExecutor(
            this.arduinoParser,
            this.codeEditor,
            this.gameState,
            this.pinManager,
            this.componentManager
        );
        
        // Initialize Game Flow Manager
        this.gameFlowManager = new GameFlowManager(
            window.timerManager,
            window.levelManager,
            window.targetAnimationPlayer
        );
        
        // Set up game flow callbacks
        this.gameFlowManager.setLevelLoadCallback((level) => this.onLevelLoaded(level));
        this.gameFlowManager.setGameStateChangeCallback(() => this.updateGameButtons());
        this.gameFlowManager.setLoseCallback(() => {
            window.modalManager.showLoseModal();
        });
        
        // Initialize Validation Manager
        this.validationManager = new ValidationManager(window.executionRecorder);
        
        // Initialize Visual Effects
        window.visualEffectsManager.init();
        
        // Initialize Level Selector Manager
        this.levelSelectorManager = new LevelSelectorManager(this.gameFlowManager);
        this.levelSelectorManager.init();
        
        // Make it globally available
        window.levelSelectorManager = this.levelSelectorManager;
        
        
        // Initialize the game
        this.gameFlowManager.initializeGame();
        
        console.log('✅ UI Manager initialized');
    }

    /**
     * Setup event callbacks
     */
    setupEventCallbacks() {
        this.eventManager.setPlayTargetCallback(() => this.handlePlayTarget());
        this.eventManager.setStopAnimationCallback(() => this.handleStopAnimation());
        this.eventManager.setReplayCallback(() => this.handleReplay());
        this.eventManager.setRunCodeCallback(() => this.handleRunCode());
        this.eventManager.setResetCallback(() => this.handleReset());
        this.eventManager.setHintCallback(() => this.handleHint());
    }

    /**
     * Handle Play Target button
     */
    handlePlayTarget() {
        this.codeExecutor.stopExecution();
        this.resetPinVisuals();
        
        // Start background music when game begins
        if (window.audioManager && !window.audioManager.isPlaying()) {
            console.log('🎵 Starting background music for game session');
            window.audioManager.play();
        }
        
        this.gameFlowManager.playTargetAnimation(() => {
            this.updateGameButtons();
        });
    }

    /**
     * Handle Stop Animation button
     */
    handleStopAnimation() {
        this.gameFlowManager.stopTargetAnimation();
    }

    /**
     * Handle Replay button
     */
    handleReplay() {
        this.codeExecutor.stopExecution();
        this.handlePlayTarget();
    }

    /**
     * Handle Run Code button
     */
    handleRunCode() {
        console.log('🎯 Run Code requested');
        
        // Check if game is active
        if (!this.gameFlowManager.isActive()) {
            console.log('⚠️ Game not active - cannot run code yet');
            window.modalManager.showMessage('Play the target animation first!', 'warning');
            return;
        }

        // Stop any existing execution
        this.codeExecutor.stopExecution();
        
        // Stop target animation if playing
        if (window.targetAnimationPlayer.isAnimationPlaying()) {
            console.log('⏹️ Stopping target animation for player code execution');
            window.targetAnimationPlayer.stopAnimation();
            this.updateGameButtons();
        }
        
        // Reset pin visuals to clean state
        this.resetPinVisuals();
        
        // Get code from editor
        const code = this.codeEditor.getValue();
        console.log('📝 Code to execute:', code);
        
        if (!code || code.trim().length === 0) {
            console.error('❌ No code to execute!');
            window.modalManager.showMessage('Please write some code first!', 'error');
            return;
        }
        
        try {
            // Start recording execution
            window.executionRecorder.startRecording();
            
            // Get validation loops from current level
            const currentLevel = this.gameFlowManager.getCurrentLevel();
            const validationLoops = currentLevel?.validationLoops || 1;
            
            // Execute code with callbacks
            this.codeExecutor.executeCode(
                code,
                // onPinChange callback
                (pin, state, type, pwm, dutyCycle) => {
                    window.executionRecorder.recordPinEvent(pin, state, type, pwm, dutyCycle);
                    window.visualEffectsManager.addPlayerExecutionVisualEffects(pin, state, type, dutyCycle);
                },
                // validationLoops
                validationLoops,
                // onValidationTrigger callback
                () => this.handleValidation()
            );
            
        } catch (error) {
            console.error('❌ Code execution error:', error);
            window.modalManager.showMessage(error.message, 'error');
            window.executionRecorder.stopRecording();
        }
    }

    /**
     * Handle validation trigger
     */
    handleValidation() {
        this.validationManager.validateExecution(
            // onWin callback
            () => {
                window.modalManager.showWinModal();
                this.gameFlowManager.handleWin();
            },
            // onFail callback
            (score, differences) => {
                window.modalManager.showMessage(`Not quite right. Keep trying! Score: ${score}%`, 'warning');
                
                if (differences.length > 0) {
                    const firstDiff = differences[0];
                    window.modalManager.showMessage(`Issue: ${firstDiff.message}`, 'info');
                }
            }
        );
    }

    /**
     * Handle Reset button
     */
    handleReset() {
        // Stop any running execution
        this.codeExecutor.stopExecution();
        
        // Stop background music when game resets
        if (window.audioManager && window.audioManager.isPlaying()) {
            console.log('🎵 Stopping background music - game reset');
            window.audioManager.pause();
        }
        
        // Reset code editor
        this.codeEditor.setValue(`void setup() {
  
}

void loop() {
  
}`);
        console.log('Code editor reset');
        
        // Reset Arduino parser
        this.arduinoParser.reset();
        
        // Reset game state
        this.gameState.reset();
        
        // Update visuals
        this.pinManager.initializePins();
        this.pinManager.updatePinSelection();
        this.componentManager.renderComponents();
    }

    /**
     * Handle Hint button
     */
    handleHint() {
        // TODO: Implement hint system
        window.modalManager.showMessage('Hint system coming soon!', 'info');
    }

    /**
     * Callback when level is loaded
     * @param {Object} level - Loaded level data
     */
    onLevelLoaded(level) {
        // Reset game state
        this.handleReset();
        
        // Update UI
        this.updateLevelDisplay();
        this.updateGameButtons();
        
        // Update level selector if it exists
        if (this.levelSelectorManager) {
            this.levelSelectorManager.updateCurrentLevel(level.id);
        }
    }

    /**
     * Update level display
     */
    updateLevelDisplay() {
        const levelInfo = window.levelManager.getLevelInfo();
        if (!levelInfo) return;
        
        // Update mission title
        const missionTitle = document.querySelector('.mission-title');
        if (missionTitle) {
            missionTitle.textContent = `🎯 MISSION ${levelInfo.id}: ${levelInfo.name}`;
        }
        
        // Update level description (if element exists)
        const levelDesc = document.querySelector('.level-description');
        if (levelDesc) {
            levelDesc.textContent = levelInfo.description;
        }
        
        // Update hint (if element exists)
        const hintText = document.querySelector('.hint-text');
        if (hintText) {
            hintText.textContent = levelInfo.hint;
        }
    }

    /**
     * Update game buttons state
     */
    updateGameButtons() {
        const gameState = this.gameFlowManager.getGameState();
        
        const playTargetBtn = document.querySelector('.btn-play');
        const stopAnimationBtn = document.querySelector('.btn-stop-animation');
        const runCodeBtn = document.querySelector('.btn-run');
        
        if (playTargetBtn) {
            if (gameState.hasPlayedTarget) {
                playTargetBtn.textContent = '🔄 REPLAY TARGET';
                playTargetBtn.disabled = false;
            } else {
                playTargetBtn.textContent = '▶️ PLAY TARGET';
                playTargetBtn.disabled = false;
            }
        }
        
        // Show/hide stop animation button based on animation state
        if (stopAnimationBtn) {
            if (gameState.isAnimationPlaying) {
                stopAnimationBtn.style.display = 'inline-block';
            } else {
                stopAnimationBtn.style.display = 'none';
            }
        }
        
        if (runCodeBtn) {
            if (gameState.isGameActive) {
                runCodeBtn.disabled = false;
                runCodeBtn.textContent = '▶️ RUN CODE';
            } else {
                runCodeBtn.disabled = true;
                runCodeBtn.textContent = '⏸️ RUN CODE (Play target first)';
            }
        }
    }

    /**
     * Reset all pin visuals to clean state
     */
    resetPinVisuals() {
        // Reset game state pins
        Object.keys(this.gameState.pins).forEach(pin => {
            this.gameState.pins[pin] = false;
            this.gameState.pwmValues[pin] = 0;
            this.gameState.dutyCycles[pin] = 0;
            this.gameState.pinModes[pin] = 'DIGITAL';
        });
        
        // Update all pin visuals
        this.pinManager.initializePins();
        
        // Update component states
        this.componentManager.updateComponentStates();
        
        console.log('🔄 Pin visuals reset to clean state');
    }

    /**
     * Go to next level (called from modal buttons)
     */
    nextLevel() {
        window.modalManager.hideWinModal();
        
        if (this.gameFlowManager.nextLevel()) {
            window.modalManager.showMessage('Level Complete! Starting next level...', 'success');
        } else {
            window.modalManager.showMessage('Congratulations! You completed all levels!', 'success');
        }
    }

    /**
     * Restart current level (called from modal buttons)
     */
    restartLevel() {
        window.modalManager.hideWinModal();
        window.modalManager.hideLoseModal();
        
        this.gameFlowManager.restartLevel();
    }

    /**
     * Hide error (called from error display close button)
     */
    hideError() {
        window.modalManager.hideError();
    }

    /**
     * Hide lose modal (called from lose modal close button)
     */
    hideLoseModal() {
        window.modalManager.hideLoseModal();
    }

    /**
     * Test pin functionality (for debugging)
     */
    testPins() {
        console.log('🧪 Testing pin functionality...');
        
        // Test pin 13
        console.log('Testing pin 13...');
        this.gameState.pins[13] = true;
        this.pinManager.updatePinVisual(13);
        
        setTimeout(() => {
            this.gameState.pins[13] = false;
            this.pinManager.updatePinVisual(13);
            console.log('Pin 13 test completed');
        }, 2000);
    }
}

// UIManager will be initialized in app.js after all dependencies are loaded
