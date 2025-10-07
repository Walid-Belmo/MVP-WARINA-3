/**
 * Pin Management System
 * Handles pin operations, PWM control, and visual updates
 */

class PinManager {
    constructor(gameState) {
        this.gameState = gameState;
    }

    /**
     * Toggle pin state or mode
     */
    togglePin(pin) {
        console.log(`Toggling pin ${pin}...`);
        
        if (this.gameState.pKeyPressed) {
            // Cycle through modes: Digital → PWM → OFF → Digital
            if (this.gameState.pinModes[pin] === 'DIGITAL') {
                // Digital → PWM
                this.setPinMode(pin, 'PWM');
                this.setDutyCycle(pin, 50); // Start at 50% duty cycle
                this.gameState.selectedPwmPin = pin;
                console.log(`Pin D${pin} entered PWM mode at 50%`);
                this.updatePinSelection();
            } else if (this.gameState.pinModes[pin] === 'PWM') {
                // PWM → OFF
                this.setPinMode(pin, 'DIGITAL');
                this.gameState.pins[pin] = false;
                this.gameState.pwmValues[pin] = 0;
                this.gameState.dutyCycles[pin] = 0;
                this.gameState.selectedPwmPin = null;
                console.log(`Pin D${pin} turned OFF`);
                this.updatePinSelection();
                this.updatePinVisual(pin);
                this.updateComponentStates();
            }
        } else {
            // Normal pin toggle
            if (this.gameState.pinModes[pin] === 'PWM') {
                // If in PWM mode, just select the pin for keyboard control
                this.gameState.selectedPwmPin = pin;
                console.log(`Pin D${pin} selected for PWM control (current: ${this.gameState.dutyCycles[pin]}%)`);
                this.updatePinSelection();
            } else {
                // Normal digital toggle
                if (this.gameState.pins.hasOwnProperty(pin)) {
                    this.gameState.pins[pin] = !this.gameState.pins[pin];
                    // Only update PWM values if pin is in PWM mode
                    if (this.gameState.pinModes[pin] === 'PWM') {
                        this.gameState.pwmValues[pin] = this.gameState.pins[pin] ? 255 : 0;
                        this.gameState.dutyCycles[pin] = this.gameState.pins[pin] ? 100 : 0;
                    }
                    console.log(`Pin D${pin} is now: ${this.gameState.pins[pin] ? 'ON' : 'OFF'} (${this.gameState.pinModes[pin]} mode)`);
                    this.updatePinVisual(pin);
                    this.updateComponentStates();
                }
            }
        }
    }

    /**
     * Set pin mode (DIGITAL or PWM)
     */
    setPinMode(pin, mode) {
        if (this.gameState.pinModes.hasOwnProperty(pin)) {
            this.gameState.pinModes[pin] = mode;
            console.log(`Pin D${pin} mode set to: ${mode}`);
            this.updatePinVisual(pin);
        }
    }

    /**
     * Set duty cycle for PWM pins
     */
    setDutyCycle(pin, dutyCycle) {
        if (this.gameState.dutyCycles.hasOwnProperty(pin)) {
            this.gameState.dutyCycles[pin] = Math.max(0, Math.min(100, dutyCycle));
            // Convert duty cycle to PWM value (0-255)
            this.gameState.pwmValues[pin] = Math.round((dutyCycle / 100) * 255);
            // Update pin state based on duty cycle
            this.gameState.pins[pin] = dutyCycle > 0;
            console.log(`Pin D${pin} duty cycle: ${dutyCycle}% (PWM: ${this.gameState.pwmValues[pin]})`);
            this.updatePinVisual(pin);
            this.updateComponentStates();
        }
    }

    /**
     * Set PWM value for analog control (legacy)
     */
    setPWMValue(pin, value) {
        if (this.gameState.pwmValues.hasOwnProperty(pin)) {
            // Only allow PWM values if pin is in PWM mode
            if (this.gameState.pinModes[pin] === 'PWM') {
                this.gameState.pwmValues[pin] = Math.max(0, Math.min(255, value));
                this.gameState.pins[pin] = value > 0;
                // Update duty cycle based on PWM value
                this.gameState.dutyCycles[pin] = Math.round((value / 255) * 100);
                this.updatePinVisual(pin);
                this.updateComponentStates();
                console.log(`Pin D${pin} PWM: ${this.gameState.pwmValues[pin]} (${this.gameState.dutyCycles[pin]}%)`);
            } else {
                console.log(`Pin D${pin} is in ${this.gameState.pinModes[pin]} mode - PWM values not allowed`);
            }
        }
    }

    /**
     * Update pin selection visual indicators
     */
    updatePinSelection() {
        // Remove selection from all pins
        document.querySelectorAll('.pin-circle').forEach(pin => {
            pin.classList.remove('pwm-selected');
        });
        
        // Add selection to current PWM pin
        if (this.gameState.selectedPwmPin) {
            const selectedPin = document.querySelector(`.pin-circle[data-pin="${this.gameState.selectedPwmPin}"]`);
            if (selectedPin) {
                selectedPin.classList.add('pwm-selected');
            }
        }
    }

    /**
     * Update pin visual state
     */
    updatePinVisual(pin, isCodeControlled = false) {
        const pinElement = document.querySelector(`.pin-circle[data-pin="${pin}"]`);
        if (pinElement) {
            console.log(`🎨 Updating visual for pin ${pin}:`, {
                state: this.gameState.pins[pin],
                mode: this.gameState.pinModes[pin],
                isCodeControlled: isCodeControlled,
                elementFound: true
            });
            
            // Remove all state classes and info
            pinElement.classList.remove('active', 'pwm-mode', 'code-controlled');
            
            // Remove existing PWM info
            const existingInfo = pinElement.querySelector('.pwm-info');
            if (existingInfo) {
                existingInfo.remove();
            }
            
            if (this.gameState.pins[pin]) {
                pinElement.classList.add('active');
                console.log(`✅ Pin ${pin} is now ACTIVE - class added`);
            } else {
                console.log(`❌ Pin ${pin} is now INACTIVE - class removed`);
            }
            
            if (this.gameState.pinModes[pin] === 'PWM') {
                pinElement.classList.add('pwm-mode');
                
                // Add PWM info display
                const pwmInfo = document.createElement('div');
                pwmInfo.className = 'pwm-info';
                pwmInfo.textContent = `${this.gameState.dutyCycles[pin]}%`;
                pinElement.appendChild(pwmInfo);
                
                console.log(`🔧 Pin ${pin} is in PWM mode: ${this.gameState.dutyCycles[pin]}%`);
            }
            
            // Add code-controlled class if pin is being controlled by code
            if (isCodeControlled && this.gameState.pins[pin]) {
                pinElement.classList.add('code-controlled');
                console.log(`⚡ Pin ${pin} is code-controlled`);
            }
            
            // Log final classes for debugging
            console.log(`📋 Pin ${pin} final classes:`, pinElement.className);
        } else {
            console.error(`❌ Pin element not found for pin ${pin}`);
        }
    }

    /**
     * Initialize all pins to OFF state
     */
    initializePins() {
        Object.keys(this.gameState.pins).forEach(pin => {
            this.updatePinVisual(pin);
        });
    }

    /**
     * Update component states (delegated to ComponentManager)
     */
    updateComponentStates() {
        if (window.componentManager) {
            window.componentManager.updateComponentStates();
        }
    }
}

// Create global pin manager instance
window.pinManager = new PinManager(window.gameState);
