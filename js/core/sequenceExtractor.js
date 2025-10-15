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
        this.servoObjects = {}; // Track ESP32 Servo objects: objectName -> { pin, min, max }
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
        this.pinStates = {
            8: false, 9: false, 10: false,
            11: false, 12: false, 13: false
        }; // All pins start LOW/0
        this.pinModes = {};
        this.servoObjects = {};
        
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

        // Handle ESP32 Servo.attach() calls
        const servoAttachMatch = line.match(/(\w+)\.attach\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
        if (servoAttachMatch) {
            const objectName = servoAttachMatch[1];
            const pin = parseInt(servoAttachMatch[2]);
            const minPulse = parseInt(servoAttachMatch[3]);
            const maxPulse = parseInt(servoAttachMatch[4]);

            // Track this servo object
            this.servoObjects[objectName] = { pin, min: minPulse, max: maxPulse };

            // Set pin mode to OUTPUT automatically for servo
            this.pinModes[pin] = 'OUTPUT';

            console.log(`🎛️ Servo '${objectName}' attached to pin ${pin} (${minPulse}-${maxPulse}µs)`);
            return;
        }

        // Handle ESP32 Servo.writeMicroseconds() calls
        const servoWriteMicrosecondsMatch = line.match(/(\w+)\.writeMicroseconds\s*\(\s*(\d+)\s*\)/i);
        if (servoWriteMicrosecondsMatch) {
            const objectName = servoWriteMicrosecondsMatch[1];
            const microseconds = parseInt(servoWriteMicrosecondsMatch[2]);

            if (!this.servoObjects[objectName]) {
                console.warn(`⚠️ Servo '${objectName}' not attached`);
                return;
            }

            const servo = this.servoObjects[objectName];
            const pin = servo.pin;

            // Convert microseconds to duty cycle percentage
            const percentage = ((microseconds - servo.min) / (servo.max - servo.min)) * 100;
            const dutyCycle = Math.round(percentage);

            // Treat as PWM event
            this.addPinEvent(pin, dutyCycle > 0, 'pwm', context, dutyCycle);
            console.log(`🎛️ Servo '${objectName}': ${microseconds}µs = ${dutyCycle}% duty cycle`);
            return;
        }

        // Handle ESP32 Servo.write() calls (angle-based)
        const servoWriteMatch = line.match(/(\w+)\.write\s*\(\s*(\d+)\s*\)/i);
        if (servoWriteMatch) {
            const objectName = servoWriteMatch[1];
            const angle = parseInt(servoWriteMatch[2]);

            if (!this.servoObjects[objectName]) {
                console.warn(`⚠️ Servo '${objectName}' not attached`);
                return;
            }

            const servo = this.servoObjects[objectName];
            const pin = servo.pin;

            // Convert angle (0-180) to duty cycle percentage
            const dutyCycle = Math.round((angle / 180) * 100);

            // Treat as PWM event
            this.addPinEvent(pin, dutyCycle > 0, 'pwm', context, dutyCycle);
            console.log(`🎛️ Servo '${objectName}': ${angle}° = ${dutyCycle}% duty cycle`);
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

        // DEDUPLICATION: Only record if state actually changes
        const currentState = this.pinStates[pin];
        
        if (type === 'digital') {
            // For digital pins, skip if state hasn't changed
            if (currentState === state) {
                console.log(`⏭️ Skipping redundant digital event: Pin ${pin} already ${state}`);
                return;
            }
        } else if (type === 'pwm') {
            // For PWM pins, skip if duty cycle is within tolerance (~10%)
            const currentDutyCycle = this.pinStates[pin] || 0;
            const pwmTolerance = 10; // 10% tolerance for duty cycle
            
            if (Math.abs((dutyCycle || 0) - currentDutyCycle) <= pwmTolerance) {
                console.log(`⏭️ Skipping redundant PWM event: Pin ${pin} already at ~${dutyCycle}%`);
                return;
            }
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
        
        // Update tracked state (use dutyCycle for PWM, state for digital)
        this.pinStates[pin] = type === 'pwm' ? (dutyCycle || 0) : state;
        
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
