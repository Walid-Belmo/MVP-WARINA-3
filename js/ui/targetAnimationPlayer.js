/**
 * Target Animation Player
 * Plays target sequences visually on the microcontroller without affecting game state
 */

class TargetAnimationPlayer {
    constructor() {
        this.isPlaying = false;
        this.currentAnimation = null;
        this.animationTimeouts = [];
        this.originalPinStates = {}; // Store original pin states
        this.animationStartTime = 0;
        this.elapsedTimerInterval = null;
        this.animationElapsedTime = 0;
    }

    /**
     * Play a target sequence animation
     * @param {Object} sequence - Target sequence to play
     * @param {Function} onComplete - Callback when animation completes
     * @param {Function} onEvent - Callback for each event (optional)
     */
    playTargetAnimation(sequence, onComplete = null, onEvent = null) {
        if (this.isPlaying) {
            console.log('⚠️ Animation already playing, stopping current animation');
            this.stopAnimation();
        }

        if (!sequence || !sequence.events || sequence.events.length === 0) {
            console.warn('⚠️ No sequence to play');
            if (onComplete) onComplete();
            return;
        }

        console.log('🎬 Starting target animation...');
        console.log(`📋 Playing ${sequence.events.length} events over ${sequence.totalDuration}ms`);

        this.isPlaying = true;
        this.currentAnimation = sequence;
        this.animationStartTime = Date.now();
        this.originalPinStates = {};

        // Store original pin states
        this.storeOriginalPinStates();

        // Start elapsed timer
        this.startElapsedTimer();

        // Play each event with proper timing
        this.playEvents(sequence.events, onComplete, onEvent);
    }

    /**
     * Play sequence events with timing
     * @param {Array} events - Events to play
     * @param {Function} onComplete - Completion callback
     * @param {Function} onEvent - Event callback
     */
    playEvents(events, onComplete, onEvent) {
        events.forEach((event, index) => {
            const timeout = setTimeout(() => {
                if (!this.isPlaying) return; // Animation was stopped

                this.playEvent(event);
                
                if (onEvent) {
                    onEvent(event, index);
                }

                // Check if this is the last event
                if (index === events.length - 1) {
                    this.finishAnimation(onComplete);
                }
            }, event.time);

            this.animationTimeouts.push(timeout);
        });

        // If sequence is looping, set up loop
        if (this.currentAnimation.isLooping) {
            const loopTimeout = setTimeout(() => {
                if (this.isPlaying) {
                    console.log('🔄 Repeating target animation...');
                    this.playEvents(events, onComplete, onEvent);
                }
            }, this.currentAnimation.totalDuration);

            this.animationTimeouts.push(loopTimeout);
        }
    }

    /**
     * Play a single event
     * @param {Object} event - Event to play
     */
    playEvent(event) {
        console.log(`🎯 Playing event: Pin ${event.pin} → ${event.state} (${event.type}) at ${event.time}ms`);

        // Create event flash
        this.createEventFlash(event);
        
        // Create timing marker
        this.createTimingMarker(event);
        
        // Update pin visual without affecting game state
        this.updatePinVisual(event);

        // Update component states if they exist
        this.updateComponentVisuals(event);
        
        // Highlight elapsed timer
        this.highlightElapsedTimer();
    }

    /**
     * Update pin visual for animation
     * @param {Object} event - Event to visualize
     */
    updatePinVisual(event) {
        const pinElement = document.querySelector(`.pin-circle[data-pin="${event.pin}"]`);
        if (!pinElement) {
            console.warn(`⚠️ Pin element not found for pin ${event.pin}`);
            return;
        }

        // Add animation class
        pinElement.classList.add('target-animation');

        if (event.type === 'digital') {
            if (event.state) {
                pinElement.classList.add('active');
                pinElement.classList.add('target-animation', 'active');
                pinElement.classList.remove('pwm-mode');
            } else {
                pinElement.classList.remove('active');
                pinElement.classList.remove('target-animation', 'active');
            }
        } else if (event.type === 'pwm') {
            pinElement.classList.add('pwm-mode');
            if (event.state) {
                pinElement.classList.add('active');
            } else {
                pinElement.classList.remove('active');
            }

            // Update PWM info
            this.updatePWMInfo(pinElement, event);
        }
    }

    /**
     * Update PWM information display
     * @param {HTMLElement} pinElement - Pin element
     * @param {Object} event - PWM event
     */
    updatePWMInfo(pinElement, event) {
        // Remove existing PWM info
        const existingInfo = pinElement.querySelector('.pwm-info');
        if (existingInfo) {
            existingInfo.remove();
        }

        if (event.dutyCycle !== null) {
            const pwmInfo = document.createElement('div');
            pwmInfo.className = 'pwm-info target-animation-pwm';
            pwmInfo.textContent = `${event.dutyCycle}%`;
            pinElement.appendChild(pwmInfo);
        }
    }

    /**
     * Update component visuals for animation
     * @param {Object} event - Event to visualize
     */
    updateComponentVisuals(event) {
        // Find components connected to this pin
        const components = window.gameState.components.filter(comp => 
            comp.connected && comp.pin === event.pin
        );

        components.forEach(component => {
            this.updateComponentVisual(component, event);
        });
    }

    /**
     * Update individual component visual
     * @param {Object} component - Component to update
     * @param {Object} event - Event data
     */
    updateComponentVisual(component, event) {
        const componentBox = document.querySelector(`[data-component-id="${component.id}"]`);
        if (!componentBox) return;

        if (component.type === 'LED') {
            this.updateLEDVisual(componentBox, event);
        } else if (component.type === 'MOTOR') {
            this.updateMotorVisual(componentBox, event);
        }
    }

    /**
     * Update LED component visual
     * @param {HTMLElement} componentBox - Component container
     * @param {Object} event - Event data
     */
    updateLEDVisual(componentBox, event) {
        const ledIcon = componentBox.querySelector('.led-icon');
        if (!ledIcon) return;

        // Remove existing classes
        ledIcon.classList.remove('on', 'pwm-brightness');

        if (event.state) {
            if (event.type === 'pwm' && event.dutyCycle !== null) {
                // PWM mode - brightness based on duty cycle
                const brightness = Math.max(0.3, event.dutyCycle / 100);
                ledIcon.classList.add('pwm-brightness');
                ledIcon.style.filter = `brightness(${brightness})`;
                ledIcon.style.opacity = brightness;
                ledIcon.style.transform = 'scale(1)';
            } else {
                // Digital mode - full brightness
                ledIcon.classList.add('on');
                ledIcon.style.transform = 'scale(1.2)';
                ledIcon.style.filter = 'brightness(1.5)';
                ledIcon.style.opacity = '1';
            }
        } else {
            // LED is off
            ledIcon.style.transform = 'scale(1)';
            ledIcon.style.filter = 'brightness(0.3)';
            ledIcon.style.opacity = '0.3';
        }
    }

    /**
     * Update Motor component visual
     * @param {HTMLElement} componentBox - Component container
     * @param {Object} event - Event data
     */
    updateMotorVisual(componentBox, event) {
        const motorIcon = componentBox.querySelector('.motor-icon');
        if (!motorIcon) return;

        // Remove existing speed classes
        motorIcon.classList.remove('slow', 'medium', 'fast');

        if (event.state && event.type === 'pwm' && event.dutyCycle !== null) {
            // Add speed class based on duty cycle
            if (event.dutyCycle > 70) {
                motorIcon.classList.add('fast');
            } else if (event.dutyCycle > 40) {
                motorIcon.classList.add('medium');
            } else if (event.dutyCycle > 0) {
                motorIcon.classList.add('slow');
            }
        }
    }

    /**
     * Store original pin states
     */
    storeOriginalPinStates() {
        // Store current game state pin states
        Object.keys(window.gameState.pins).forEach(pin => {
            this.originalPinStates[pin] = {
                state: window.gameState.pins[pin],
                mode: window.gameState.pinModes[pin],
                pwm: window.gameState.pwmValues[pin],
                dutyCycle: window.gameState.dutyCycles[pin]
            };
        });
    }

    /**
     * Restore original pin states
     */
    restoreOriginalPinStates() {
        Object.keys(this.originalPinStates).forEach(pin => {
            const original = this.originalPinStates[pin];
            
            // Restore game state
            window.gameState.pins[pin] = original.state;
            window.gameState.pinModes[pin] = original.mode;
            window.gameState.pwmValues[pin] = original.pwm;
            window.gameState.dutyCycles[pin] = original.dutyCycle;

            // Restore visual state
            window.pinManager.updatePinVisual(pin);
        });

        // Restore component states
        window.componentManager.updateComponentStates();
    }

    /**
     * Finish animation
     * @param {Function} onComplete - Completion callback
     */
    finishAnimation(onComplete) {
        if (!this.currentAnimation.isLooping) {
            console.log('✅ Target animation completed');
            this.stopAnimation();
            if (onComplete) onComplete();
        }
    }

    /**
     * Stop current animation
     */
    stopAnimation() {
        if (!this.isPlaying) return;

        console.log('⏹️ Stopping target animation...');

        this.isPlaying = false;

        // Clear all timeouts
        this.animationTimeouts.forEach(timeout => clearTimeout(timeout));
        this.animationTimeouts = [];

        // Stop elapsed timer
        if (this.elapsedTimerInterval) {
            clearInterval(this.elapsedTimerInterval);
            this.elapsedTimerInterval = null;
        }

        // Hide elapsed timer
        const elapsedTimer = document.getElementById('elapsedTimer');
        if (elapsedTimer) {
            elapsedTimer.style.display = 'none';
        }

        // Restore original pin states
        this.restoreOriginalPinStates();

        // Remove animation classes
        document.querySelectorAll('.pin-circle').forEach(pin => {
            pin.classList.remove('target-animation');
        });

        // Remove PWM info
        document.querySelectorAll('.target-animation-pwm').forEach(info => {
            info.remove();
        });

        this.currentAnimation = null;
        this.originalPinStates = {};
    }

    /**
     * Check if animation is currently playing
     * @returns {boolean} - Whether animation is playing
     */
    isAnimationPlaying() {
        return this.isPlaying;
    }

    /**
     * Get current animation progress
     * @returns {Object} - Animation progress info
     */
    getAnimationProgress() {
        if (!this.isPlaying || !this.currentAnimation) {
            return null;
        }

        const elapsed = Date.now() - this.animationStartTime;
        const progress = Math.min(elapsed / this.currentAnimation.totalDuration, 1);

        return {
            isPlaying: this.isPlaying,
            elapsed: elapsed,
            total: this.currentAnimation.totalDuration,
            progress: progress,
            isLooping: this.currentAnimation.isLooping
        };
    }

    /**
     * Play a quick preview of the target sequence
     * @param {Object} sequence - Sequence to preview
     * @param {number} duration - Preview duration in ms (default 3000)
     */
    playPreview(sequence, duration = 3000) {
        if (!sequence || !sequence.events.length) return;

        console.log('👁️ Playing sequence preview...');

        // Play the animation
        this.playTargetAnimation(sequence, () => {
            console.log('✅ Preview completed');
        });

        // Stop after duration
        setTimeout(() => {
            this.stopAnimation();
        }, duration);
    }

    /**
     * Start the elapsed timer display
     */
    startElapsedTimer() {
        this.animationElapsedTime = 0;
        this.updateElapsedTimerDisplay();
        
        // Show elapsed timer
        const elapsedTimer = document.getElementById('elapsedTimer');
        if (elapsedTimer) {
            elapsedTimer.style.display = 'block';
        }
        
        // Update every 100ms
        this.elapsedTimerInterval = setInterval(() => {
            this.animationElapsedTime += 100;
            this.updateElapsedTimerDisplay();
        }, 100);
    }

    /**
     * Update the elapsed timer display
     */
    updateElapsedTimerDisplay() {
        const elapsedTimerValue = document.querySelector('.elapsed-timer-value');
        if (elapsedTimerValue) {
            const seconds = Math.floor(this.animationElapsedTime / 1000);
            const deciseconds = Math.floor((this.animationElapsedTime % 1000) / 100);
            elapsedTimerValue.textContent = `${seconds.toString().padStart(2, '0')}:${deciseconds}s`;
        }
    }

    /**
     * Create event flash effect
     * @param {Object} event - Event that triggered the flash
     */
    createEventFlash(event) {
        const flash = document.createElement('div');
        flash.className = 'event-flash';
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.remove();
        }, 600);
    }

    /**
     * Create timing marker
     * @param {Object} event - Event to mark
     */
    createTimingMarker(event) {
        const marker = document.createElement('div');
        marker.className = 'timing-marker';
        marker.textContent = `Pin ${event.pin}: ${event.state ? 'ON' : 'OFF'}`;
        document.body.appendChild(marker);
        
        setTimeout(() => {
            marker.style.opacity = '0';
            setTimeout(() => marker.remove(), 300);
        }, 1500);
    }

    /**
     * Highlight elapsed timer on event
     */
    highlightElapsedTimer() {
        const timer = document.getElementById('elapsedTimer');
        const timerValue = document.querySelector('.elapsed-timer-value');
        
        if (timer && timerValue) {
            timer.classList.add('event-highlight');
            timerValue.classList.add('event-highlight');
            
            setTimeout(() => {
                timer.classList.remove('event-highlight');
                timerValue.classList.remove('event-highlight');
            }, 300);
        }
    }
}

// Create global target animation player instance
window.targetAnimationPlayer = new TargetAnimationPlayer();
