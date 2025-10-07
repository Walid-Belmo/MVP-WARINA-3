/**
 * Game State Management
 * Handles the core state of the Arduino learning game
 */

class GameState {
    constructor() {
        this.pins = {
            13: false,  // LED state (false = OFF, true = ON)
            12: false,
            11: false,
            10: false,
            9: false,
            8: false
        };
        
        this.pinModes = {
            13: 'DIGITAL',  // 'DIGITAL' or 'PWM'
            12: 'DIGITAL',
            11: 'DIGITAL',
            10: 'DIGITAL',
            9: 'DIGITAL',
            8: 'DIGITAL'
        };
        
        this.pwmValues = {
            13: 0,  // PWM values (0-255)
            12: 0,
            11: 0,
            10: 0,
            9: 0,
            8: 0
        };
        
        this.dutyCycles = {
            13: 0,  // Duty cycle (0-100%)
            12: 0,
            11: 0,
            10: 0,
            9: 0,
            8: 0
        };
        
        this.selectedPwmPin = null;  // Currently selected pin for PWM control
        this.variables = [];
        this.components = [];
        this.connections = {};
        
        // P Key Detection for PWM Mode
        this.pKeyPressed = false;
    }

    /**
     * Reset all pins to default state
     */
    resetPins() {
        Object.keys(this.pins).forEach(pin => {
            this.pins[pin] = false;
            this.pwmValues[pin] = 0;
            this.pinModes[pin] = 'DIGITAL';
            this.dutyCycles[pin] = 0;
        });
        this.selectedPwmPin = null;
    }

    /**
     * Reset all components and connections
     */
    resetComponents() {
        this.components = [];
        this.connections = {};
    }

    /**
     * Reset the entire game state
     */
    reset() {
        this.resetPins();
        this.resetComponents();
        this.variables = [];
    }

    /**
     * Get available pins (not connected to components)
     */
    getAvailablePins() {
        return Object.keys(this.pins).filter(pin => !this.connections[pin]);
    }

    /**
     * Check if a pin is available for connection
     */
    isPinAvailable(pin) {
        return !this.connections[pin];
    }

    /**
     * Connect a component to a pin
     */
    connectComponent(componentId, pin) {
        if (this.isPinAvailable(pin)) {
            this.connections[pin] = componentId;
            const component = this.components.find(c => c.id === componentId);
            if (component) {
                component.pin = pin;
                component.connected = true;
            }
            return true;
        }
        return false;
    }

    /**
     * Disconnect a component from its pin
     */
    disconnectComponent(componentId) {
        const component = this.components.find(c => c.id === componentId);
        if (component && component.connected) {
            delete this.connections[component.pin];
            component.pin = null;
            component.connected = false;
            return true;
        }
        return false;
    }
}

// Create global game state instance
window.gameState = new GameState();
