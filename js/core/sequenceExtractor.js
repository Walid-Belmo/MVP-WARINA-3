/**
 * Sequence Extraction System
 * Extracts pin state sequences and timing from Arduino code logic
 * without executing the code - purely analytical approach
 */

class SequenceExtractor {
    constructor() {
        this.currentTime = 0;
        this.events = [];
        this.pinStates = {}; // Track current state of each pin
        this.pinModes = {}; // Track pin modes (OUTPUT/INPUT)
    }

    /**
     * Extract sequence from parsed Arduino code
     * @param {Object} parsedCode - { setup: string, loop: string }
     * @returns {Object} - { events: Array, totalDuration: number, isLooping: boolean }
     */
    extractSequence(parsedCode) {
        console.log('🔍 Extracting sequence from code...');
        
        // Reset state
        this.currentTime = 0;
        this.events = [];
        this.pinStates = {};
        this.pinModes = {};
        
        try {
            // Process setup function first
            if (parsedCode.setup && parsedCode.setup.trim()) {
                console.log('📋 Processing setup function...');
                this.processCodeBlock(parsedCode.setup, 'setup');
            }
            
            // Process loop function
            if (parsedCode.loop && parsedCode.loop.trim()) {
                console.log('🔄 Processing loop function...');
                this.processCodeBlock(parsedCode.loop, 'loop');
            }
            
            const result = {
                events: [...this.events],
                totalDuration: this.currentTime,
                isLooping: parsedCode.loop && parsedCode.loop.trim().length > 0,
                pinStates: { ...this.pinStates },
                pinModes: { ...this.pinModes }
            };
            
            console.log('✅ Sequence extracted:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error extracting sequence:', error);
            throw new Error(`Sequence extraction failed: ${error.message}`);
        }
    }

    /**
     * Process a code block (setup or loop)
     * @param {string} code - The code to process
     * @param {string} context - 'setup' or 'loop'
     */
    processCodeBlock(code, context) {
        const lines = code.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('//')) continue;
            
            this.processLine(line, context);
        }
    }

    /**
     * Process a single line of code
     * @param {string} line - The line to process
     * @param {string} context - 'setup' or 'loop'
     */
    processLine(line, context) {
        console.log(`🔍 Processing line: "${line}"`);
        
        // Handle pinMode calls
        const pinModeMatch = line.match(/pinMode\s*\(\s*(\d+)\s*,\s*(\w+)\s*\)/i);
        if (pinModeMatch) {
            const pin = parseInt(pinModeMatch[1]);
            const mode = pinModeMatch[2].toUpperCase();
            this.pinModes[pin] = mode;
            console.log(`📌 Pin ${pin} set to ${mode} mode`);
            return;
        }

        // Handle digitalWrite calls
        const digitalWriteMatch = line.match(/digitalWrite\s*\(\s*(\d+)\s*,\s*(\w+)\s*\)/i);
        if (digitalWriteMatch) {
            const pin = parseInt(digitalWriteMatch[1]);
            const value = digitalWriteMatch[2].toUpperCase();
            const state = value === 'HIGH';
            
            this.addPinEvent(pin, state, 'digital', context);
            return;
        }

        // Handle setDutyCycle calls (PWM)
        const setDutyCycleMatch = line.match(/setDutyCycle\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i);
        if (setDutyCycleMatch) {
            const pin = parseInt(setDutyCycleMatch[1]);
            const dutyCycle = parseInt(setDutyCycleMatch[2]);
            const pwmValue = Math.round((dutyCycle / 100) * 255);
            
            this.addPinEvent(pin, pwmValue > 0, 'pwm', context, dutyCycle);
            return;
        }

        // Handle Timer1.pwm calls
        const timer1PwmMatch = line.match(/Timer1\.pwm\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i);
        if (timer1PwmMatch) {
            const pin = parseInt(timer1PwmMatch[1]);
            const duty = parseInt(timer1PwmMatch[2]);
            const dutyCycle = Math.round((duty / 1023) * 100);
            const pwmValue = Math.round((duty / 1023) * 255);
            
            this.addPinEvent(pin, pwmValue > 0, 'pwm', context, dutyCycle);
            return;
        }

        // Handle Timer0.pwm calls
        const timer0PwmMatch = line.match(/Timer0\.pwm\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i);
        if (timer0PwmMatch) {
            const pin = parseInt(timer0PwmMatch[1]);
            const duty = parseInt(timer0PwmMatch[2]);
            const dutyCycle = Math.round((duty / 255) * 100);
            const pwmValue = duty;
            
            this.addPinEvent(pin, pwmValue > 0, 'pwm', context, dutyCycle);
            return;
        }

        // Handle delay calls
        const delayMatch = line.match(/delay\s*\(\s*(\d+)\s*\)/i);
        if (delayMatch) {
            const ms = parseInt(delayMatch[1]);
            this.addDelay(ms);
            return;
        }

        // Handle if statements (basic recognition)
        const ifMatch = line.match(/if\s*\(\s*(.+?)\s*\)\s*\{/i);
        if (ifMatch) {
            console.log(`🔍 Found if statement: ${ifMatch[1]}`);
            // For now, just recognize - actual condition evaluation would be complex
            return;
        }

        // Handle else statements
        const elseMatch = line.match(/else\s*\{/i);
        if (elseMatch) {
            console.log('🔍 Found else statement');
            return;
        }

        // Skip unknown commands
        console.log(`⚠️ Unknown command: "${line}"`);
    }

    /**
     * Add a pin state change event
     * @param {number} pin - Pin number
     * @param {boolean|number} state - Pin state (true/false for digital, PWM value for analog)
     * @param {string} type - 'digital' or 'pwm'
     * @param {string} context - 'setup' or 'loop'
     * @param {number} dutyCycle - Duty cycle percentage (for PWM)
     */
    addPinEvent(pin, state, type, context, dutyCycle = null) {
        // Validate pin number
        if (pin < 8 || pin > 13) {
            console.warn(`⚠️ Pin ${pin} is not available (use pins 8-13)`);
            return;
        }

        // Check if pin is in OUTPUT mode
        if (this.pinModes[pin] !== 'OUTPUT') {
            console.warn(`⚠️ Pin ${pin} must be set to OUTPUT mode before use`);
            return;
        }

        const event = {
            time: this.currentTime,
            pin: pin,
            state: state,
            type: type,
            context: context,
            dutyCycle: dutyCycle
        };

        this.events.push(event);
        this.pinStates[pin] = state;
        
        console.log(`📌 Event added: Pin ${pin} → ${state} (${type}) at ${this.currentTime}ms`);
    }

    /**
     * Add a delay to the timeline
     * @param {number} ms - Delay in milliseconds
     */
    addDelay(ms) {
        if (ms < 0 || ms > 10000) {
            console.warn(`⚠️ Invalid delay value: ${ms}ms (use 0-10000ms)`);
            return;
        }
        
        this.currentTime += ms;
        console.log(`⏰ Delay added: +${ms}ms (total: ${this.currentTime}ms)`);
    }

    /**
     * Get a summary of the extracted sequence
     * @returns {Object} - Summary information
     */
    getSequenceSummary() {
        const pinEvents = {};
        const eventTypes = { digital: 0, pwm: 0 };
        
        this.events.forEach(event => {
            if (!pinEvents[event.pin]) {
                pinEvents[event.pin] = [];
            }
            pinEvents[event.pin].push(event);
            eventTypes[event.type]++;
        });

        return {
            totalEvents: this.events.length,
            totalDuration: this.currentTime,
            pinsUsed: Object.keys(pinEvents),
            eventTypes: eventTypes,
            pinEvents: pinEvents
        };
    }
}

// Create global sequence extractor instance
window.sequenceExtractor = new SequenceExtractor();
