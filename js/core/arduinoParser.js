/**
 * ESP32 Code Parser and Executor
 * Handles parsing and execution of ESP32 code for educational microcontroller simulation
 */

class ArduinoParser {
    constructor() {
        this.pinModes = {};
        this.pinStates = {};
        this.pwmValues = {};
        this.variables = {};

        // ESP32Servo library state - for ESC/Motor control
        this.servoObjects = {}; // objectName -> { pin, min, max, attached }
        this.servoObjectsByPin = {}; // pin -> objectName

        this.functions = {
            pinMode: this.pinMode.bind(this),
            digitalWrite: this.digitalWrite.bind(this),
            analogRead: this.analogRead.bind(this),
            delay: this.delay.bind(this),
            // ESP32Servo functions (dynamically handled in executeLine)
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
     * ESP32Servo Library Functions - For ESC/Motor Control on ESP32
     */

    /**
     * Create a Servo object
     */
    servoCreate(objectName) {
        this.servoObjects[objectName] = {
            pin: null,
            min: 1000,
            max: 2000,
            attached: false,
            currentMicroseconds: 1000
        };
        console.log(`✅ Servo object '${objectName}' created`);
        return true;
    }

    /**
     * Attach servo to a pin with min/max pulse widths
     */
    servoAttach(objectName, pin, minPulse, maxPulse) {
        if (!this.servoObjects[objectName]) {
            throw new Error(`Servo object '${objectName}' does not exist. Declare it first: Servo ${objectName};`);
        }

        const pinNum = parseInt(pin);
        if (pinNum < 8 || pinNum > 13) {
            throw new Error(`Pin ${pinNum} not available. Use pins 8-13.`);
        }

        const min = parseInt(minPulse);
        const max = parseInt(maxPulse);

        if (min < 500 || min > 2500) {
            throw new Error(`Minimum pulse width ${min}µs is out of range. Use 500-2500µs.`);
        }

        if (max < 500 || max > 2500 || max <= min) {
            throw new Error(`Maximum pulse width ${max}µs is invalid. Must be between 500-2500µs and greater than min.`);
        }

        // Check if pin is already attached to another servo
        if (this.servoObjectsByPin[pinNum] && this.servoObjectsByPin[pinNum] !== objectName) {
            throw new Error(`Pin ${pinNum} is already attached to servo '${this.servoObjectsByPin[pinNum]}'.`);
        }

        this.servoObjects[objectName].pin = pinNum;
        this.servoObjects[objectName].min = min;
        this.servoObjects[objectName].max = max;
        this.servoObjects[objectName].attached = true;
        this.servoObjectsByPin[pinNum] = objectName;

        console.log(`✅ Servo '${objectName}' attached to pin ${pinNum} (${min}-${max}µs)`);
        return true;
    }

    /**
     * Write angle to servo (0-180 degrees) - converts to microseconds
     */
    servoWrite(objectName, angle) {
        if (!this.servoObjects[objectName]) {
            throw new Error(`Servo object '${objectName}' does not exist.`);
        }

        if (!this.servoObjects[objectName].attached) {
            throw new Error(`Servo '${objectName}' must be attached to a pin first. Use ${objectName}.attach(pin, min, max);`);
        }

        const angleValue = parseInt(angle);
        if (angleValue < 0 || angleValue > 180) {
            throw new Error(`Angle ${angleValue}° is out of range. Use 0-180 degrees.`);
        }

        const servo = this.servoObjects[objectName];
        // Map 0-180° to min-max microseconds
        const microseconds = servo.min + ((angleValue / 180) * (servo.max - servo.min));
        servo.currentMicroseconds = Math.round(microseconds);

        // Convert to PWM value (0-255) for visualization
        const percentage = ((microseconds - servo.min) / (servo.max - servo.min)) * 100;
        const rawPwmValue = Math.round((percentage / 100) * 255);

        // IMPORTANT: Set minimum PWM value to 1 so motors show as active even at 0°/0% throttle
        this.pwmValues[servo.pin] = rawPwmValue === 0 ? 1 : rawPwmValue;

        console.log(`✅ Servo '${objectName}': ${angleValue}° = ${Math.round(microseconds)}µs (${Math.round(percentage)}%)`);
        return true;
    }

    /**
     * Write microseconds directly to servo (1000-2000µs for ESC)
     */
    servoWriteMicroseconds(objectName, microseconds) {
        if (!this.servoObjects[objectName]) {
            throw new Error(`Servo object '${objectName}' does not exist.`);
        }

        if (!this.servoObjects[objectName].attached) {
            throw new Error(`Servo '${objectName}' must be attached to a pin first. Use ${objectName}.attach(pin, min, max);`);
        }

        const us = parseInt(microseconds);
        const servo = this.servoObjects[objectName];

        if (us < servo.min || us > servo.max) {
            throw new Error(`Pulse width ${us}µs is out of range. Use ${servo.min}-${servo.max}µs.`);
        }

        servo.currentMicroseconds = us;

        // Convert to PWM value (0-255) for visualization
        // For ESC: 1000µs = 0%, 1500µs = 50%, 2000µs = 100%
        const percentage = ((us - servo.min) / (servo.max - servo.min)) * 100;
        const rawPwmValue = Math.round((percentage / 100) * 255);

        // IMPORTANT: For ESC visualization, we need to show the motor as "active" even at 0% throttle
        // Set minimum PWM value to 1 so motors show as connected/armed (not completely off)
        // This differentiates between "motor not attached" (0) and "motor at 0% throttle" (1+)
        this.pwmValues[servo.pin] = rawPwmValue === 0 ? 1 : rawPwmValue;

        console.log(`✅ Servo '${objectName}': ${us}µs (${Math.round(percentage)}% throttle)`);
        return true;
    }

    /**
     * Detach servo from pin
     */
    servoDetach(objectName) {
        if (!this.servoObjects[objectName]) {
            throw new Error(`Servo object '${objectName}' does not exist.`);
        }

        const servo = this.servoObjects[objectName];
        if (servo.attached && servo.pin !== null) {
            delete this.servoObjectsByPin[servo.pin];
            this.pwmValues[servo.pin] = 0;
        }

        servo.attached = false;
        servo.pin = null;

        console.log(`✅ Servo '${objectName}' detached`);
        return true;
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
     * Validate that required libraries are included when using ESP32 library methods
     */
    validateLibraryIncludes(code) {
        const lines = code.split('\n');
        const includes = [];
        const servoMethods = [];

        // Check for includes and library method usage
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            // Check for include statements
            if (trimmedLine.includes('#include')) {
                // Validate #include syntax - must have angle brackets
                const includeMatch = trimmedLine.match(/^#include\s+<(.+?)>$/);
                if (!includeMatch) {
                    throw new Error(`Line ${index + 1}: Invalid #include syntax. Use: #include <LibraryName.h>`);
                }

                const libraryName = includeMatch[1];
                if (libraryName === 'ESP32Servo.h') {
                    includes.push('ESP32Servo');
                }
            }

            // Check for Servo object/method usage
            if (trimmedLine.match(/Servo\s+\w+/) || trimmedLine.match(/\w+\.(attach|write|writeMicroseconds|detach)\s*\(/)) {
                servoMethods.push({ line: index + 1, content: trimmedLine });
            }
        });

        // Validate ESP32Servo usage
        if (servoMethods.length > 0 && !includes.includes('ESP32Servo')) {
            const firstUsage = servoMethods[0];
            throw new Error(`Line ${firstUsage.line}: Servo methods are used but #include <ESP32Servo.h> is missing. Add it at the top of your code.`);
        }
    }

    /**
     * Validate bracket/brace syntax for proper matching
     */
    validateBracketSyntax(code) {
        const lines = code.split('\n');
        const stack = [];
        const bracketPairs = { '{': '}', '(': ')', '[': ']' };
        const closingBrackets = { '}': '{', ')': '(', ']': '[' };
        
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const lineNumber = lineIndex + 1;
            
            for (let charIndex = 0; charIndex < line.length; charIndex++) {
                const char = line[charIndex];
                
                // Skip characters inside strings and comments
                if (this.isInsideStringOrComment(line, charIndex)) {
                    continue;
                }
                
                // Check for opening brackets
                if (bracketPairs[char]) {
                    stack.push({ char, line: lineNumber, column: charIndex + 1 });
                }
                // Check for closing brackets
                else if (closingBrackets[char]) {
                    if (stack.length === 0) {
                        throw new Error(`Syntax error: Unmatched closing bracket '${char}' at line ${lineNumber}, column ${charIndex + 1}`);
                    }
                    
                    const lastOpen = stack.pop();
                    if (lastOpen.char !== closingBrackets[char]) {
                        throw new Error(`Syntax error: Mismatched brackets. Expected '${bracketPairs[lastOpen.char]}' but found '${char}' at line ${lineNumber}, column ${charIndex + 1}`);
                    }
                }
            }
        }
        
        // Check for unmatched opening brackets
        if (stack.length > 0) {
            const unmatched = stack[stack.length - 1];
            throw new Error(`Syntax error: Unmatched opening bracket '${unmatched.char}' at line ${unmatched.line}, column ${unmatched.column}`);
        }
    }

    /**
     * Check if a character position is inside a string or comment
     */
    isInsideStringOrComment(line, charIndex) {
        let inString = false;
        let inComment = false;
        let stringChar = null;
        
        for (let i = 0; i < charIndex; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            // Handle string detection
            if (!inComment && (char === '"' || char === "'")) {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                } else if (char === stringChar && line[i - 1] !== '\\') {
                    inString = false;
                    stringChar = null;
                }
            }
            
            // Handle comment detection
            if (!inString && char === '/' && nextChar === '/') {
                inComment = true;
            }
        }
        
        return inString || inComment;
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

            // NEW: Validate bracket syntax first
            this.validateBracketSyntax(code);

            // NEW: Validate library includes
            this.validateLibraryIncludes(code);

            // Clean up the code
            let cleanCode = code.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove block comments
            cleanCode = cleanCode.replace(/\/\/.*$/gm, ''); // Remove line comments

            // Extract global Servo object declarations (before setup/loop)
            const servoDeclarations = cleanCode.match(/Servo\s+(\w+)\s*;/g);
            if (servoDeclarations) {
                servoDeclarations.forEach(declaration => {
                    const objectName = declaration.match(/Servo\s+(\w+)\s*;/)[1];
                    this.servoCreate(objectName);
                });
            }

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

            // Handle Servo.attach() calls
            const servoAttachMatch = line.match(/(\w+)\.attach\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
            if (servoAttachMatch) {
                const objectName = servoAttachMatch[1];
                const pin = parseInt(servoAttachMatch[2]);
                const minPulse = parseInt(servoAttachMatch[3]);
                const maxPulse = parseInt(servoAttachMatch[4]);
                console.log(`Found ${objectName}.attach: pin=${pin}, min=${minPulse}µs, max=${maxPulse}µs`);
                this.servoAttach(objectName, pin, minPulse, maxPulse);
                return;
            }

            // Handle Servo.writeMicroseconds() calls
            const servoWriteMicrosecondsMatch = line.match(/(\w+)\.writeMicroseconds\s*\(\s*(\d+)\s*\)/i);
            if (servoWriteMicrosecondsMatch) {
                const objectName = servoWriteMicrosecondsMatch[1];
                const microseconds = parseInt(servoWriteMicrosecondsMatch[2]);
                console.log(`Found ${objectName}.writeMicroseconds: ${microseconds}µs`);
                this.servoWriteMicroseconds(objectName, microseconds);
                return;
            }

            // Handle Servo.write() calls (angle-based)
            const servoWriteMatch = line.match(/(\w+)\.write\s*\(\s*(\d+)\s*\)/i);
            if (servoWriteMatch) {
                const objectName = servoWriteMatch[1];
                const angle = parseInt(servoWriteMatch[2]);
                console.log(`Found ${objectName}.write: ${angle}°`);
                this.servoWrite(objectName, angle);
                return;
            }

            // Handle Servo.detach() calls
            const servoDetachMatch = line.match(/(\w+)\.detach\s*\(\s*\)/i);
            if (servoDetachMatch) {
                const objectName = servoDetachMatch[1];
                console.log(`Found ${objectName}.detach`);
                this.servoDetach(objectName);
                return;
            }

            // Handle if statements (basic syntax recognition)
            const ifMatch = line.match(/if\s*\(\s*(.+?)\s*\)\s*\{/i);
            if (ifMatch) {
                const condition = ifMatch[1].trim();
                console.log(`Found if statement: ${condition}`);
                // For now, just recognize the syntax - actual evaluation would be more complex
                return;
            }

            // Handle else statements
            const elseMatch = line.match(/else\s*\{/i);
            if (elseMatch) {
                console.log('Found else statement');
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
            throw new Error(`Line ${lineNumber}: Unrecognized command "${line}". Supported commands: pinMode, digitalWrite, delay, Servo.attach, Servo.writeMicroseconds, Servo.write, Servo.detach, if/else statements`);
            
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
        this.servoObjects = {};
        this.servoObjectsByPin = {};
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
