/**
 * Arduino Code Parser and Executor
 * Handles parsing and execution of Arduino-style code
 */

class ArduinoParser {
    constructor() {
        this.pinModes = {};
        this.pinStates = {};
        this.pwmValues = {};
        this.variables = {};
        this.functions = {
            pinMode: this.pinMode.bind(this),
            digitalWrite: this.digitalWrite.bind(this),
            digitalRead: this.digitalRead.bind(this),
            analogWrite: this.analogWrite.bind(this),
            analogRead: this.analogRead.bind(this),
            delay: this.delay.bind(this)
        };
    }

    /**
     * Set pin mode (INPUT or OUTPUT)
     */
    pinMode(pin, mode) {
        const pinNum = parseInt(pin);
        if (pinNum >= 8 && pinNum <= 13) {
            this.pinModes[pinNum] = mode.toUpperCase();
            console.log(`✅ Pin ${pinNum} set to ${mode} mode`);
            return true;
        }
        console.error(`❌ Pin ${pinNum} is not available (use pins 8-13)`);
        return false;
    }

    /**
     * Write digital value to pin
     */
    digitalWrite(pin, value) {
        const pinNum = parseInt(pin);
        if (pinNum >= 8 && pinNum <= 13) {
            // Check if pin has been set to OUTPUT mode
            if (this.pinModes[pinNum] !== 'OUTPUT') {
                throw new Error(`Pin ${pinNum} must be set to OUTPUT mode before using digitalWrite(). Add: pinMode(${pinNum}, OUTPUT);`);
            }
            
            this.pinStates[pinNum] = value === 'HIGH' || value === 1 || value === true;
            console.log(`✅ Pin ${pinNum} set to ${this.pinStates[pinNum] ? 'HIGH' : 'LOW'}`);
            return true;
        }
        console.error(`❌ Pin ${pinNum} is not available (use pins 8-13)`);
        return false;
    }

    /**
     * Read digital value from pin
     */
    digitalRead(pin) {
        const pinNum = parseInt(pin);
        if (pinNum >= 8 && pinNum <= 13) {
            // Check if pin has been set to INPUT mode
            if (this.pinModes[pinNum] !== 'INPUT') {
                throw new Error(`Pin ${pinNum} must be set to INPUT mode before using digitalRead(). Add: pinMode(${pinNum}, INPUT);`);
            }
            
            return this.pinStates[pinNum] ? 'HIGH' : 'LOW';
        }
        return 'LOW';
    }

    /**
     * Write PWM value to pin
     */
    analogWrite(pin, value) {
        const pinNum = parseInt(pin);
        if (pinNum >= 8 && pinNum <= 13) {
            // Check if pin has been set to OUTPUT mode
            if (this.pinModes[pinNum] !== 'OUTPUT') {
                throw new Error(`Pin ${pinNum} must be set to OUTPUT mode before using analogWrite(). Add: pinMode(${pinNum}, OUTPUT);`);
            }
            
            const pwmValue = Math.max(0, Math.min(255, parseInt(value)));
            this.pwmValues[pinNum] = pwmValue;
            
            // For PWM pins, we should not set pinStates to simple HIGH/LOW
            // Instead, we'll let the visual system determine the state based on PWM value
            // Only set pinStates for digital operations (digitalWrite)
            console.log(`Pin ${pinNum} PWM set to ${pwmValue} (${Math.round((pwmValue / 255) * 100)}%)`);
            return true;
        }
        return false;
    }

    /**
     * Read analog value from pin
     */
    analogRead(pin) {
        const pinNum = parseInt(pin);
        if (pinNum >= 8 && pinNum <= 13) {
            return this.pwmValues[pinNum] || 0;
        }
        return 0;
    }

    /**
     * Delay execution - this is now handled by the UI manager
     */
    delay(ms) {
        // Delay is now handled by the UI manager for better responsiveness
        // This method is kept for compatibility but doesn't actually delay
        console.log(`Delay called for ${ms}ms - handled by UI manager`);
    }

    /**
     * Parse Arduino code into setup and loop functions
     */
    parseCode(code) {
        try {
            // Validate basic syntax
            if (!code || code.trim().length === 0) {
                throw new Error('Code is empty');
            }
            
            // Clean up the code
            let cleanCode = code.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove block comments
            cleanCode = cleanCode.replace(/\/\/.*$/gm, ''); // Remove line comments
            
            // Extract setup and loop functions
            const setupMatch = cleanCode.match(/void\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\}/);
            const loopMatch = cleanCode.match(/void\s+loop\s*\(\s*\)\s*\{([\s\S]*?)\}/);
            
            if (!setupMatch && !loopMatch) {
                throw new Error('Missing both setup() and loop() functions. At least one is required.');
            }
            
            if (!setupMatch) {
                console.warn('No setup() function found, using empty setup');
            }
            
            if (!loopMatch) {
                console.warn('No loop() function found, using empty loop');
            }

            const parsedCode = {
                setup: setupMatch ? setupMatch[1].trim() : '',
                loop: loopMatch ? loopMatch[1].trim() : ''
            };

            // Validate pin usage
            this.validatePinUsage(parsedCode);

            return parsedCode;
        } catch (error) {
            console.error('Code parsing error:', error);
            throw error;
        }
    }

    /**
     * Validate that pins are properly declared before use
     */
    validatePinUsage(parsedCode) {
        const declaredPins = new Set();
        const usedPins = new Set();
        
        // Check setup function for pinMode declarations
        if (parsedCode.setup) {
            const setupLines = parsedCode.setup.split('\n');
            setupLines.forEach(line => {
                const pinModeMatch = line.match(/pinMode\s*\(\s*(\d+)\s*,\s*(INPUT|OUTPUT)\s*\)/i);
                if (pinModeMatch) {
                    const pin = parseInt(pinModeMatch[1]);
                    const mode = pinModeMatch[2].toUpperCase();
                    declaredPins.add(`${pin}:${mode}`);
                }
            });
        }
        
        // Check both setup and loop for pin usage
        const allCode = parsedCode.setup + '\n' + parsedCode.loop;
        const lines = allCode.split('\n');
        
        lines.forEach((line, index) => {
            const lineNumber = index + 1;
            
            // Check for digitalWrite usage
            const digitalWriteMatch = line.match(/digitalWrite\s*\(\s*(\d+)\s*,\s*(HIGH|LOW)\s*\)/i);
            if (digitalWriteMatch) {
                const pin = parseInt(digitalWriteMatch[1]);
                usedPins.add(`${pin}:OUTPUT`);
                
                if (!declaredPins.has(`${pin}:OUTPUT`)) {
                    throw new Error(`Line ${lineNumber}: Pin ${pin} is used in digitalWrite() but not declared as OUTPUT. Add: pinMode(${pin}, OUTPUT);`);
                }
            }
            
            // Check for analogWrite usage
            const analogWriteMatch = line.match(/analogWrite\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i);
            if (analogWriteMatch) {
                const pin = parseInt(analogWriteMatch[1]);
                usedPins.add(`${pin}:OUTPUT`);
                
                if (!declaredPins.has(`${pin}:OUTPUT`)) {
                    throw new Error(`Line ${lineNumber}: Pin ${pin} is used in analogWrite() but not declared as OUTPUT. Add: pinMode(${pin}, OUTPUT);`);
                }
            }
            
            // Check for digitalRead usage
            const digitalReadMatch = line.match(/digitalRead\s*\(\s*(\d+)\s*\)/i);
            if (digitalReadMatch) {
                const pin = parseInt(digitalReadMatch[1]);
                usedPins.add(`${pin}:INPUT`);
                
                if (!declaredPins.has(`${pin}:INPUT`)) {
                    throw new Error(`Line ${lineNumber}: Pin ${pin} is used in digitalRead() but not declared as INPUT. Add: pinMode(${pin}, INPUT);`);
                }
            }
        });
    }

    /**
     * Execute setup code
     */
    executeSetup(setupCode, setupStartLine = 1) {
        console.log('Executing setup...');
        this.executeCodeBlock(setupCode, setupStartLine);
    }

    /**
     * Execute loop code
     */
    executeLoop(loopCode, loopStartLine = 1) {
        console.log('Executing loop...');
        this.executeCodeBlock(loopCode, loopStartLine);
    }

    /**
     * Execute a block of code
     */
    executeCodeBlock(code, startLineNumber = 1) {
        const allLines = code.split('\n');
        const nonEmptyLines = [];
        const lineNumberMap = [];
        
        // Find non-empty lines and map them to their original line numbers
        for (let i = 0; i < allLines.length; i++) {
            if (allLines[i].trim()) {
                nonEmptyLines.push(allLines[i].trim());
                lineNumberMap.push(startLineNumber + i);
            }
        }
        
        for (let i = 0; i < nonEmptyLines.length; i++) {
            this.executeLine(nonEmptyLines[i], lineNumberMap[i]);
        }
    }

    /**
     * Execute a single line of code
     */
    executeLine(line, lineNumber = 0) {
        if (!line) return;

        console.log(`Executing line ${lineNumber}: "${line}"`);

        try {
            // Handle pinMode calls with better validation
            const pinModeMatch = line.match(/pinMode\s*\(\s*(\d+)\s*,\s*(\w+)\s*\)/i);
            if (pinModeMatch) {
                const pin = parseInt(pinModeMatch[1]);
                const mode = pinModeMatch[2].toUpperCase();
                
                console.log(`Found pinMode: pin=${pin}, mode=${mode}`);
                
                // Validate pin number
                if (pin < 8 || pin > 13) {
                    throw new Error(`Line ${lineNumber}: Pin ${pin} is not available. Use pins 8-13.`);
                }
                
                // Validate mode
                if (mode !== 'INPUT' && mode !== 'OUTPUT') {
                    throw new Error(`Line ${lineNumber}: Invalid mode "${pinModeMatch[2]}". Use INPUT or OUTPUT.`);
                }
                
                this.pinMode(pin, mode);
                return;
            }

            // Handle digitalWrite calls with better validation
            const digitalWriteMatch = line.match(/digitalWrite\s*\(\s*(\d+)\s*,\s*(\w+)\s*\)/i);
            if (digitalWriteMatch) {
                const pin = parseInt(digitalWriteMatch[1]);
                const value = digitalWriteMatch[2].toUpperCase();
                
                console.log(`Found digitalWrite: pin=${pin}, value=${value}`);
                
                // Validate pin number
                if (pin < 8 || pin > 13) {
                    throw new Error(`Line ${lineNumber}: Pin ${pin} is not available. Use pins 8-13.`);
                }
                
                // Validate value
                if (value !== 'HIGH' && value !== 'LOW') {
                    throw new Error(`Line ${lineNumber}: Invalid value "${digitalWriteMatch[2]}". Use HIGH or LOW.`);
                }
                
                this.digitalWrite(pin, value);
                return;
            }

            // Handle analogWrite calls with better validation
            const analogWriteMatch = line.match(/analogWrite\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i);
            if (analogWriteMatch) {
                const pin = parseInt(analogWriteMatch[1]);
                const value = parseInt(analogWriteMatch[2]);
                
                console.log(`Found analogWrite: pin=${pin}, value=${value}`);
                
                // Validate pin number
                if (pin < 8 || pin > 13) {
                    throw new Error(`Line ${lineNumber}: Pin ${pin} is not available. Use pins 8-13.`);
                }
                
                // Validate PWM value
                if (isNaN(value) || value < 0 || value > 255) {
                    throw new Error(`Line ${lineNumber}: Invalid PWM value "${analogWriteMatch[2]}". Use values 0-255.`);
                }
                
                this.analogWrite(pin, value);
                return;
            }

            // Handle delay calls with better validation
            const delayMatch = line.match(/delay\s*\(\s*(\d+)\s*\)/i);
            if (delayMatch) {
                const ms = parseInt(delayMatch[1]);
                
                console.log(`Found delay: ${ms}ms`);
                
                // Validate delay value
                if (isNaN(ms) || ms < 0 || ms > 10000) {
                    throw new Error(`Line ${lineNumber}: Invalid delay value "${delayMatch[1]}". Use values 0-10000ms.`);
                }
                
                this.delay(ms);
                return;
            }

            // Handle empty lines or comments (already filtered out)
            if (line.trim() === '' || line.trim().startsWith('//')) {
                console.log(`Skipping empty/comment line: "${line}"`);
                return;
            }

            // If we get here, it's an unrecognized command
            throw new Error(`Line ${lineNumber}: Unrecognized command "${line}". Supported commands: pinMode, digitalWrite, analogWrite, delay`);
            
        } catch (error) {
            console.error(`Error executing line "${line}":`, error.message);
            throw error;
        }
    }

    /**
     * Get current pin state
     */
    getPinState(pin) {
        const pwmValue = this.pwmValues[pin] || 0;
        const digitalState = this.pinStates[pin] || false;
        
        // For PWM pins, determine state based on PWM value
        // For digital pins, use the digital state
        let effectiveState;
        if (pwmValue > 0) {
            // If there's a PWM value, the pin is effectively "on" regardless of digital state
            effectiveState = true;
        } else {
            // If no PWM value, use the digital state
            effectiveState = digitalState;
        }
        
        return {
            mode: this.pinModes[pin] || 'INPUT',
            state: effectiveState,
            pwm: pwmValue
        };
    }

    /**
     * Reset parser state
     */
    reset() {
        this.pinModes = {};
        this.pinStates = {};
        this.pwmValues = {};
        this.variables = {};
    }

    /**
     * Sync parser state with game state
     */
    syncWithGameState(gameState) {
        // Update game state with parser results for all pins (8-13)
        for (let pinNum = 8; pinNum <= 13; pinNum++) {
            if (gameState.pins.hasOwnProperty(pinNum)) {
                const pinState = this.getPinState(pinNum);
                
                gameState.pins[pinNum] = pinState.state;
                gameState.pinModes[pinNum] = pinState.mode === 'OUTPUT' ? 'DIGITAL' : 'DIGITAL';
                gameState.pwmValues[pinNum] = pinState.pwm;
                gameState.dutyCycles[pinNum] = Math.round((pinState.pwm / 255) * 100);
                
                // If there's a PWM value, mark the pin as PWM mode
                if (pinState.pwm > 0) {
                    gameState.pinModes[pinNum] = 'PWM';
                }
            }
        }
    }
}

// Create global Arduino parser instance
window.arduinoParser = new ArduinoParser();
