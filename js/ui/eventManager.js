/**
 * Event Manager
 * Handles all user input events (pin clicks, keyboard controls, button clicks)
 */

class EventManager {
    constructor(gameState, pinManager) {
        this.gameState = gameState;
        this.pinManager = pinManager;
        
        // Event callbacks
        this.onPlayTarget = null;
        this.onStopAnimation = null;
        this.onReplay = null;
        this.onRunCode = null;
        this.onReset = null;
        this.onHint = null;
    }

    /**
     * Initialize all event listeners
     */
    init() {
        this.setupPinEventListeners();
        this.setupKeyboardControls();
        this.setupButtonEventListeners();
    }

    /**
     * Setup pin click event listeners
     */
    setupPinEventListeners() {
        const pinElements = document.querySelectorAll('.pin-circle[data-pin]');
        pinElements.forEach(pin => {
            pin.addEventListener('click', (e) => {
                const pinNumber = parseInt(e.target.getAttribute('data-pin'));
                this.pinManager.togglePin(pinNumber);
                
                // Add visual juice effects
                if (window.visualEffectsManager) {
                    window.visualEffectsManager.addPinClickEffects(pinNumber, e.target);
                }
            });
        });
    }

    /**
     * Setup keyboard controls for PWM and other functions
     */
    setupKeyboardControls() {
        // P Key Detection for PWM Mode
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'p') {
                this.gameState.pKeyPressed = true;
                console.log('P key pressed - ready for PWM mode');
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key.toLowerCase() === 'p') {
                this.gameState.pKeyPressed = false;
            }
        });

        // Keyboard PWM Controls
        document.addEventListener('keydown', (e) => {
            if (this.gameState.selectedPwmPin) {
                const pin = this.gameState.selectedPwmPin;
                
                switch(e.key) {
                    case '0':
                        this.pinManager.setDutyCycle(pin, 0);
                        console.log(`Pin D${pin} duty cycle set to 0% (OFF)`);
                        break;
                    case '1':
                        this.pinManager.setDutyCycle(pin, 10);
                        console.log(`Pin D${pin} duty cycle set to 10%`);
                        break;
                    case '2':
                        this.pinManager.setDutyCycle(pin, 20);
                        console.log(`Pin D${pin} duty cycle set to 20%`);
                        break;
                    case '3':
                        this.pinManager.setDutyCycle(pin, 30);
                        console.log(`Pin D${pin} duty cycle set to 30%`);
                        break;
                    case '4':
                        this.pinManager.setDutyCycle(pin, 40);
                        console.log(`Pin D${pin} duty cycle set to 40%`);
                        break;
                    case '5':
                        this.pinManager.setDutyCycle(pin, 50);
                        console.log(`Pin D${pin} duty cycle set to 50%`);
                        break;
                    case '6':
                        this.pinManager.setDutyCycle(pin, 60);
                        console.log(`Pin D${pin} duty cycle set to 60%`);
                        break;
                    case '7':
                        this.pinManager.setDutyCycle(pin, 70);
                        console.log(`Pin D${pin} duty cycle set to 70%`);
                        break;
                    case '8':
                        this.pinManager.setDutyCycle(pin, 80);
                        console.log(`Pin D${pin} duty cycle set to 80%`);
                        break;
                    case '9':
                        this.pinManager.setDutyCycle(pin, 90);
                        console.log(`Pin D${pin} duty cycle set to 90%`);
                        break;
                    case '+':
                    case '=':
                        const currentDuty = this.gameState.dutyCycles[pin];
                        this.pinManager.setDutyCycle(pin, Math.min(100, currentDuty + 5));
                        console.log(`Pin D${pin} duty cycle increased to ${this.gameState.dutyCycles[pin]}%`);
                        break;
                    case '-':
                        const currentDuty2 = this.gameState.dutyCycles[pin];
                        this.pinManager.setDutyCycle(pin, Math.max(0, currentDuty2 - 5));
                        console.log(`Pin D${pin} duty cycle decreased to ${this.gameState.dutyCycles[pin]}%`);
                        break;
                    case ' ':
                        e.preventDefault(); // Prevent page scroll
                        const currentDuty3 = this.gameState.dutyCycles[pin];
                        this.pinManager.setDutyCycle(pin, currentDuty3 > 0 ? 0 : 100);
                        console.log(`Pin D${pin} duty cycle toggled to ${this.gameState.dutyCycles[pin]}%`);
                        break;
                    case 'Escape':
                        this.pinManager.setPinMode(pin, 'DIGITAL');
                        this.gameState.selectedPwmPin = null;
                        this.pinManager.updatePinSelection();
                        console.log(`Pin D${pin} exited PWM mode`);
                        break;
                }
            }
        });
    }

    /**
     * Setup button event listeners
     */
    setupButtonEventListeners() {
        const playTargetBtn = document.querySelector('.btn-play');
        const stopAnimationBtn = document.querySelector('.btn-stop-animation');
        const replayBtn = document.querySelector('.btn-replay');
        const runCodeBtn = document.querySelector('.btn-run');
        const resetBtn = document.querySelector('.btn-reset');
        const hintBtn = document.querySelector('.btn-hint');
        
        // Play Target button
        if (playTargetBtn) {
            playTargetBtn.addEventListener('click', () => {
                console.log('🎬 Play Target button clicked');
                if (this.onPlayTarget) {
                    this.onPlayTarget();
                }
            });
        }
        
        // Stop Animation button
        if (stopAnimationBtn) {
            stopAnimationBtn.addEventListener('click', () => {
                console.log('⏹️ Stop Animation button clicked');
                if (this.onStopAnimation) {
                    this.onStopAnimation();
                }
            });
        }
        
        // Replay button
        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                console.log('🔄 Replay button clicked');
                if (this.onReplay) {
                    this.onReplay();
                }
            });
        }
        
        // Run Code button
        if (runCodeBtn) {
            runCodeBtn.addEventListener('click', () => {
                console.log('🚀 RUN CODE button clicked!');
                if (this.onRunCode) {
                    this.onRunCode();
                }
            });
        } else {
            console.error('❌ RUN CODE button not found!');
        }
        
        // Reset button
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                console.log('🔄 Reset button clicked');
                if (this.onReset) {
                    this.onReset();
                }
            });
        }
        
        // Hint button
        if (hintBtn) {
            hintBtn.addEventListener('click', () => {
                console.log('💡 Hint button clicked');
                if (this.onHint) {
                    this.onHint();
                }
            });
        }
    }

    /**
     * Set callback for Play Target button
     * @param {Function} callback
     */
    setPlayTargetCallback(callback) {
        this.onPlayTarget = callback;
    }

    /**
     * Set callback for Stop Animation button
     * @param {Function} callback
     */
    setStopAnimationCallback(callback) {
        this.onStopAnimation = callback;
    }

    /**
     * Set callback for Replay button
     * @param {Function} callback
     */
    setReplayCallback(callback) {
        this.onReplay = callback;
    }

    /**
     * Set callback for Run Code button
     * @param {Function} callback
     */
    setRunCodeCallback(callback) {
        this.onRunCode = callback;
    }

    /**
     * Set callback for Reset button
     * @param {Function} callback
     */
    setResetCallback(callback) {
        this.onReset = callback;
    }

    /**
     * Set callback for Hint button
     * @param {Function} callback
     */
    setHintCallback(callback) {
        this.onHint = callback;
    }
}

// EventManager will be instantiated in app.js

