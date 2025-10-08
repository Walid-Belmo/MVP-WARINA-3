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
        
        // TimerOne library state
        this.timer1 = {
            initialized: false,
            period: 0,
            pwmPins: {} // pin -> duty cycle
        };
        
        // TimerZero library state  
        this.timer0 = {
            initialized: false,
            pwmPins: {} // pin -> duty cycle
        };
        
        this.functions = {
            pinMode: this.pinMode.bind(this),
            digitalWrite: this.digitalWrite.bind(this),
            setDutyCycle: this.setDutyCycle.bind(this),
            analogRead: this.analogRead.bind(this),
            delay: this.delay.bind(this),
            // TimerOne functions
            'Timer1.initialize': this.timer1Initialize.bind(this),
            'Timer1.pwm': this.timer1Pwm.bind(this),
            'Timer1.stop': this.timer1Stop.bind(this),
            // TimerZero functions
            'Timer0.initialize': this.timer0Initialize.bind(this),
            'Timer0.pwm': this.timer0Pwm.bind(this),
            'Timer0.stop': this.timer0Stop.bind(this)
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
     * Set PWM duty cycle (0-100%) - This is the correct PWM method for this game
     */
    setDutyCycle(pin, dutyCycle) {
        const pinNum = parseInt(pin);
        if (pinNum >= 8 && pinNum <= 13) {
            // Check if pin has been set to OUTPUT mode
            if (this.pinModes[pinNum] !== 'OUTPUT') {
                throw new Error(`Pin ${pinNum} must be set to OUTPUT mode before using setDutyCycle(). Add: pinMode(${pinNum}, OUTPUT);`);
            }
            
            const dutyCycleValue = Math.max(0, Math.min(100, parseInt(dutyCycle)));
            const pwmValue = Math.round((dutyCycleValue / 100) * 255);
            this.pwmValues[pinNum] = pwmValue;
            
            console.log(`Pin ${pinNum} duty cycle set to ${dutyCycleValue}% (PWM: ${pwmValue})`);
            return true;
        }
        return false;
    }

    /**
     * analogWrite is deprecated - use setDutyCycle instead
     */
    analogWrite(pin, value) {
        throw new Error('analogWrite() is not supported in this game. Use setDutyCycle(pin, dutyCycle) instead, where dutyCycle is 0-100%. Example: setDutyCycle(9, 50); // 50% duty cycle');
    }

    /**
     * TimerOne Library Functions - Simplified for learning
     */
    timer1Initialize(period) {
        // Just check if period is reasonable for 50Hz (20000 microseconds)
        const periodValue = parseInt(period);
        if (periodValue < 10000 || periodValue > 50000) {
            console.warn(`Timer1 period ${periodValue}μs is not optimal for 50Hz. Recommended: 20000μs`);
        }
        
        this.timer1.initialized = true;
        this.timer1.period = periodValue;
        console.log(`✅ Timer1 initialized for 50Hz PWM`);
        return true;
    }

    timer1Pwm(pin, dutyCycle) {
        if (!this.timer1.initialized) {
            throw new Error('Timer1 must be initialized first. Add: Timer1.initialize(20000);');
        }
        
        const pinNum = parseInt(pin);
        const duty = parseInt(dutyCycle);
        
        if (pinNum < 8 || pinNum > 13) {
            throw new Error(`Pin ${pinNum} not available. Use pins 8-13.`);
        }
        
        if (duty < 0 || duty > 1023) {
            throw new Error(`Duty cycle ${duty} invalid. Use 0-1023.`);
        }
        
        // Convert TimerOne duty cycle (0-1023) to percentage (0-100%)
        const percentage = Math.round((duty / 1023) * 100);
        this.pwmValues[pinNum] = Math.round((duty / 1023) * 255);
        
        console.log(`✅ Pin ${pinNum}: ${percentage}% duty cycle (50Hz PWM)`);
        return true;
    }

    timer1Stop() {
        this.timer1.initialized = false;
        this.timer1.pwmPins = {};
        console.log('✅ Timer1 stopped');
        return true;
    }

    /**
     * TimerZero Library Functions - Simplified for learning
     */
    timer0Initialize() {
        this.timer0.initialized = true;
        console.log('✅ Timer0 initialized for PWM');
        return true;
    }

    timer0Pwm(pin, dutyCycle) {
        if (!this.timer0.initialized) {
            throw new Error('Timer0 must be initialized first. Add: Timer0.initialize();');
        }
        
        const pinNum = parseInt(pin);
        const duty = parseInt(dutyCycle);
        
        if (pinNum < 8 || pinNum > 13) {
            throw new Error(`Pin ${pinNum} not available. Use pins 8-13.`);
        }
        
        if (duty < 0 || duty > 255) {
            throw new Error(`Duty cycle ${duty} invalid. Use 0-255.`);
        }
        
        // Convert TimerZero duty cycle (0-255) to percentage (0-100%)
        const percentage = Math.round((duty / 255) * 100);
        this.pwmValues[pinNum] = duty;
        
        console.log(`✅ Pin ${pinNum}: ${percentage}% duty cycle (PWM)`);
        return true;
    }

    timer0Stop() {
        this.timer0.initialized = false;
        this.timer0.pwmPins = {};
        console.log('✅ Timer0 stopped');
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
     * Validate that required libraries are included when using timer methods
     */
    validateLibraryIncludes(code) {
        const lines = code.split('\n');
        const includes = [];
        const timer1Methods = [];
        const timer0Methods = [];
        
        // Check for includes and timer method usage
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            
            // Check for include statements
            if (trimmedLine.includes('#include')) {
                if (trimmedLine.includes('TimerOne.h')) {
                    includes.push('TimerOne');
                }
                if (trimmedLine.includes('TimerZero.h')) {
                    includes.push('TimerZero');
                }
            }
            
            // Check for Timer1 method usage
            if (trimmedLine.includes('Timer1.')) {
                timer1Methods.push({ line: index + 1, content: trimmedLine });
            }
            
            // Check for Timer0 method usage
            if (trimmedLine.includes('Timer0.')) {
                timer0Methods.push({ line: index + 1, content: trimmedLine });
            }
        });
        
        // Validate Timer1 usage
        if (timer1Methods.length > 0 && !includes.includes('TimerOne')) {
            const firstUsage = timer1Methods[0];
            throw new Error(`Line ${firstUsage.line}: Timer1 methods are used but #include <TimerOne.h> is missing. Add it at the top of your code.`);
        }
        
        // Validate Timer0 usage
        if (timer0Methods.length > 0 && !includes.includes('TimerZero')) {
            const firstUsage = timer0Methods[0];
            throw new Error(`Line ${firstUsage.line}: Timer0 methods are used but #include <TimerZero.h> is missing. Add it at the top of your code.`);
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
            
            // Check for setDutyCycle usage
            const setDutyCycleMatch = line.match(/setDutyCycle\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i);
            if (setDutyCycleMatch) {
                const pin = parseInt(setDutyCycleMatch[1]);
                usedPins.add(`${pin}:OUTPUT`);
                
                if (!declaredPins.has(`${pin}:OUTPUT`)) {
                    throw new Error(`Line ${lineNumber}: Pin ${pin} is used in setDutyCycle() but not declared as OUTPUT. Add: pinMode(${pin}, OUTPUT);`);
                }
            }
            
            // Check for deprecated analogWrite usage and throw error
            const analogWriteMatch = line.match(/analogWrite\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i);
            if (analogWriteMatch) {
                throw new Error(`Line ${lineNumber}: analogWrite() is not supported. Use setDutyCycle(pin, dutyCycle) instead, where dutyCycle is 0-100%. Example: setDutyCycle(${analogWriteMatch[1]}, 50);`);
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

            // Handle setDutyCycle calls with better validation
            const setDutyCycleMatch = line.match(/setDutyCycle\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i);
            if (setDutyCycleMatch) {
                const pin = parseInt(setDutyCycleMatch[1]);
                const dutyCycle = parseInt(setDutyCycleMatch[2]);
                
                console.log(`Found setDutyCycle: pin=${pin}, dutyCycle=${dutyCycle}%`);
                
                // Validate pin number
                if (pin < 8 || pin > 13) {
                    throw new Error(`Line ${lineNumber}: Pin ${pin} is not available. Use pins 8-13.`);
                }
                
                // Validate duty cycle value
                if (isNaN(dutyCycle) || dutyCycle < 0 || dutyCycle > 100) {
                    throw new Error(`Line ${lineNumber}: Invalid duty cycle "${setDutyCycleMatch[2]}". Use values 0-100.`);
                }
                
                this.setDutyCycle(pin, dutyCycle);
                return;
            }
            
            // Handle Timer1.initialize calls
            const timer1InitMatch = line.match(/Timer1\.initialize\s*\(\s*(\d+)\s*\)/i);
            if (timer1InitMatch) {
                const period = parseInt(timer1InitMatch[1]);
                console.log(`Found Timer1.initialize: period=${period}`);
                this.timer1Initialize(period);
                return;
            }

            // Handle Timer1.pwm calls
            const timer1PwmMatch = line.match(/Timer1\.pwm\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i);
            if (timer1PwmMatch) {
                const pin = parseInt(timer1PwmMatch[1]);
                const duty = parseInt(timer1PwmMatch[2]);
                console.log(`Found Timer1.pwm: pin=${pin}, duty=${duty}`);
                this.timer1Pwm(pin, duty);
                return;
            }

            // Handle Timer1.stop calls
            const timer1StopMatch = line.match(/Timer1\.stop\s*\(\s*\)/i);
            if (timer1StopMatch) {
                console.log('Found Timer1.stop');
                this.timer1Stop();
                return;
            }

            // Handle Timer0.initialize calls
            const timer0InitMatch = line.match(/Timer0\.initialize\s*\(\s*\)/i);
            if (timer0InitMatch) {
                console.log('Found Timer0.initialize');
                this.timer0Initialize();
                return;
            }

            // Handle Timer0.pwm calls
            const timer0PwmMatch = line.match(/Timer0\.pwm\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i);
            if (timer0PwmMatch) {
                const pin = parseInt(timer0PwmMatch[1]);
                const duty = parseInt(timer0PwmMatch[2]);
                console.log(`Found Timer0.pwm: pin=${pin}, duty=${duty}`);
                this.timer0Pwm(pin, duty);
                return;
            }

            // Handle Timer0.stop calls
            const timer0StopMatch = line.match(/Timer0\.stop\s*\(\s*\)/i);
            if (timer0StopMatch) {
                console.log('Found Timer0.stop');
                this.timer0Stop();
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

            // Handle deprecated analogWrite calls and throw error
            const analogWriteMatch = line.match(/analogWrite\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i);
            if (analogWriteMatch) {
                throw new Error(`Line ${lineNumber}: analogWrite() is not supported. Use setDutyCycle(pin, dutyCycle) instead, where dutyCycle is 0-100%. Example: setDutyCycle(${analogWriteMatch[1]}, 50);`);
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
            throw new Error(`Line ${lineNumber}: Unrecognized command "${line}". Supported: pinMode, digitalWrite, delay, Timer1.initialize, Timer1.pwm, Timer0.initialize, Timer0.pwm, if/else statements`);
            
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
