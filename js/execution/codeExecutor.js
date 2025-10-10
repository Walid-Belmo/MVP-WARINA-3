/**
 * Code Executor
 * Handles Arduino code execution with timing and animation
 */

class CodeExecutor {
    constructor(arduinoParser, codeEditor, gameState, pinManager, componentManager) {
        this.arduinoParser = arduinoParser;
        this.codeEditor = codeEditor;
        this.gameState = gameState;
        this.pinManager = pinManager;
        this.componentManager = componentManager;
        
        this.isExecuting = false;
        this.executionTimeouts = [];
        this.playerExecutionElapsedTime = 0;
        this.playerExecutionTimerInterval = null;
    }

    /**
     * Execute Arduino code with animation
     * @param {string} code - Arduino code to execute
     * @param {Function} onPinChange - Callback when pin state changes (pin, state, type, pwm, dutyCycle)
     * @param {number} validationLoops - Number of loops before validation
     * @param {Function} onValidationTrigger - Callback when validation should occur
     */
    executeCode(code, onPinChange, validationLoops = 1, onValidationTrigger = null) {
        try {
            // Stop any existing execution
            this.stopExecution();
            
            // Add visual effects for code execution start
            if (window.visualEffectsManager) {
                window.visualEffectsManager.playCascadeEffect();
            }
            
            // Reset parser state
            this.arduinoParser.reset();
            console.log('✅ Parser reset');
            
            // Parse the code
            const parsedCode = this.arduinoParser.parseCode(code);
            console.log('✅ Code parsed:', parsedCode);
            
            // Calculate line numbers for setup and loop
            const codeLines = code.split('\n');
            let setupStartLine = 1;
            let loopStartLine = 1;
            
            // Find the actual line numbers of setup and loop functions
            for (let i = 0; i < codeLines.length; i++) {
                if (codeLines[i].includes('void setup()')) {
                    setupStartLine = i + 2;
                }
                if (codeLines[i].includes('void loop()')) {
                    loopStartLine = i + 2;
                }
            }
            
            // Mark as executing
            this.isExecuting = true;
            console.log('✅ Execution marked as active');
            
            // Start elapsed timer
            this.startPlayerExecutionTimer();
            
            // Execute setup first
            this.executeSetupWithAnimation(parsedCode.setup, setupStartLine, onPinChange, () => {
                console.log('✅ Setup execution completed');
                
                if (!this.isExecuting) return;
                
                // Only execute loop if there's code in it
                if (parsedCode.loop && parsedCode.loop.trim().length > 0) {
                    this.executeLoopWithAnimation(
                        parsedCode.loop, 
                        loopStartLine, 
                        onPinChange,
                        validationLoops,
                        onValidationTrigger
                    );
                    console.log('✅ Loop execution started with animation');
                } else {
                    console.log('✅ No loop code, finishing execution');
                    this.isExecuting = false;
                    this.stopPlayerExecutionTimer();
                }
            });
            
        } catch (error) {
            console.error('❌ Code execution error:', error);
            this.isExecuting = false;
            this.stopPlayerExecutionTimer();
            throw error;
        }
    }

    /**
     * Execute setup code with animation
     */
    executeSetupWithAnimation(setupCode, setupStartLine, onPinChange, onComplete) {
        const lines = setupCode.split('\n');
        let currentLineIndex = 0;
        
        const executeNextLine = () => {
            if (!this.isExecuting) {
                return;
            }
            
            if (currentLineIndex >= lines.length) {
                onComplete();
                return;
            }
            
            const line = lines[currentLineIndex].trim();
            const actualLineNumber = setupStartLine + currentLineIndex;
            currentLineIndex++;
            
            // Skip empty lines and comments
            if (!line || line.startsWith('//')) {
                executeNextLine();
                return;
            }
            
            // Handle delay calls
            const delayMatch = line.match(/delay\s*\(\s*(\d+)\s*\)/i);
            if (delayMatch) {
                const ms = parseInt(delayMatch[1]);
                console.log(`Found delay: ${ms}ms`);
                
                if (this.codeEditor) {
                    this.codeEditor.highlightLine(actualLineNumber);
                }
                
                const timeout = setTimeout(() => {
                    if (this.isExecuting) {
                        executeNextLine();
                    }
                }, ms);
                this.executionTimeouts.push(timeout);
                return;
            }
            
            // Execute non-delay commands
            try {
                console.log(`⚡ Executing setup line ${actualLineNumber}: "${line}"`);
                
                if (this.codeEditor) {
                    this.codeEditor.highlightLine(actualLineNumber);
                }
                
                this.arduinoParser.executeLine(line, actualLineNumber);
                this.updateVisualPinsFromParser(onPinChange);
                
                const timeout = setTimeout(() => {
                    if (this.isExecuting) {
                        executeNextLine();
                    }
                }, 50);
                this.executionTimeouts.push(timeout);
            } catch (error) {
                console.error(`Error executing setup line: ${line}`, error);
                throw error;
            }
        };
        
        executeNextLine();
    }

    /**
     * Execute loop code with animation
     */
    executeLoopWithAnimation(loopCode, loopStartLine, onPinChange, validationLoops, onValidationTrigger) {
        let loopCount = 0;
        const maxLoops = 1000;
        let shouldValidate = false;
        
        const executeLoopIteration = () => {
            if (!this.isExecuting || loopCount >= maxLoops) {
                this.isExecuting = false;
                this.stopPlayerExecutionTimer();
                console.log('Loop execution stopped');
                return;
            }
            
            try {
                this.executeLoopIterationWithAnimation(loopCode, loopStartLine, onPinChange, () => {
                    if (!this.isExecuting) return;
                    
                    loopCount++;
                    
                    // Check if we should validate after this loop iteration
                    if (loopCount === validationLoops && !shouldValidate && onValidationTrigger) {
                        console.log(`🎯 Validation trigger: ${loopCount} loops completed`);
                        shouldValidate = true;
                        onValidationTrigger();
                    }
                    
                    // Continue to next loop iteration
                    const timeout = setTimeout(executeLoopIteration, 0);
                    this.executionTimeouts.push(timeout);
                });
                
            } catch (error) {
                console.error('Loop execution error:', error);
                this.isExecuting = false;
                this.stopPlayerExecutionTimer();
                throw error;
            }
        };
        
        executeLoopIteration();
    }

    /**
     * Execute one loop iteration with animation
     */
    executeLoopIterationWithAnimation(loopCode, loopStartLine, onPinChange, onComplete) {
        const lines = loopCode.split('\n');
        let currentLineIndex = 0;
        
        const executeNextLine = () => {
            if (!this.isExecuting) {
                return;
            }
            
            if (currentLineIndex >= lines.length) {
                onComplete();
                return;
            }
            
            const line = lines[currentLineIndex].trim();
            const actualLineNumber = loopStartLine + currentLineIndex;
            currentLineIndex++;
            
            // Skip empty lines and comments
            if (!line || line.startsWith('//')) {
                executeNextLine();
                return;
            }
            
            // Handle delay calls
            const delayMatch = line.match(/delay\s*\(\s*(\d+)\s*\)/i);
            if (delayMatch) {
                const ms = parseInt(delayMatch[1]);
                
                if (this.codeEditor) {
                    this.codeEditor.highlightLine(actualLineNumber);
                }
                
                const timeout = setTimeout(() => {
                    if (this.isExecuting) {
                        executeNextLine();
                    }
                }, ms);
                this.executionTimeouts.push(timeout);
                return;
            }
            
            // Execute non-delay commands
            try {
                if (this.codeEditor) {
                    this.codeEditor.highlightLine(actualLineNumber);
                }
                
                this.arduinoParser.executeLine(line, actualLineNumber);
                this.updateVisualPinsFromParser(onPinChange);
                
                const timeout = setTimeout(() => {
                    if (this.isExecuting) {
                        executeNextLine();
                    }
                }, 50);
                this.executionTimeouts.push(timeout);
            } catch (error) {
                console.error(`Error executing loop line: ${line}`, error);
                throw error;
            }
        };
        
        executeNextLine();
    }

    /**
     * Update visual pins based on parser state
     */
    updateVisualPinsFromParser(onPinChange) {
        console.log('🔄 Updating visual pins from parser...');
        
        for (let pin = 8; pin <= 13; pin++) {
            const pinState = this.arduinoParser.getPinState(pin);
            
            // Check if pin state has actually changed
            const oldState = this.gameState.pins[pin];
            const oldPwm = this.gameState.pwmValues[pin];
            
            // Update game state
            this.gameState.pins[pin] = pinState.state;
            
            // Determine pin mode
            if (pinState.pwm > 0) {
                this.gameState.pinModes[pin] = 'PWM';
            } else {
                this.gameState.pinModes[pin] = pinState.mode === 'OUTPUT' ? 'DIGITAL' : 'DIGITAL';
            }
            
            this.gameState.pwmValues[pin] = pinState.pwm;
            this.gameState.dutyCycles[pin] = Math.round((pinState.pwm / 255) * 100);
            
            console.log(`🎨 Updating pin ${pin} visual:`, {
                old: { state: oldState, pwm: oldPwm },
                new: { 
                    state: this.gameState.pins[pin], 
                    mode: this.gameState.pinModes[pin], 
                    pwm: this.gameState.pwmValues[pin] 
                }
            });
            
            // Update visual representation
            this.pinManager.updatePinVisual(pin, true);
            
            // Notify callback if state changed
            if (this.isExecuting && onPinChange) {
                if (oldState !== this.gameState.pins[pin] || oldPwm !== this.gameState.pwmValues[pin]) {
                    const eventType = this.gameState.pinModes[pin] === 'PWM' ? 'pwm' : 'digital';
                    onPinChange(
                        pin, 
                        this.gameState.pins[pin], 
                        eventType, 
                        this.gameState.pwmValues[pin], 
                        this.gameState.dutyCycles[pin]
                    );
                }
            }
        }
        
        // Update component states
        this.componentManager.updateComponentStates();
    }

    /**
     * Stop code execution
     */
    stopExecution() {
        this.isExecuting = false;
        
        // Clear all timeouts
        this.executionTimeouts.forEach(timeout => clearTimeout(timeout));
        this.executionTimeouts = [];
        
        // Stop elapsed timer
        this.stopPlayerExecutionTimer();
        
        // Hide elapsed timer
        const elapsedTimer = document.getElementById('elapsedTimer');
        if (elapsedTimer) {
            elapsedTimer.style.display = 'none';
        }
        
        // Remove animation classes from pins
        document.querySelectorAll('.pin-circle').forEach(pin => {
            pin.classList.remove('target-animation');
        });
        
        // Remove PWM info
        document.querySelectorAll('.target-animation-pwm').forEach(info => {
            info.remove();
        });
        
        // Clear line highlighting
        if (this.codeEditor) {
            this.codeEditor.clearLineHighlight();
        }
        
        console.log('Code execution stopped');
    }

    /**
     * Start elapsed timer for player code execution
     */
    startPlayerExecutionTimer() {
        this.playerExecutionElapsedTime = 0;
        this.updatePlayerExecutionTimerDisplay();
        
        // Show elapsed timer
        const elapsedTimer = document.getElementById('elapsedTimer');
        if (elapsedTimer) {
            elapsedTimer.style.display = 'block';
        }
        
        // Update every 100ms
        this.playerExecutionTimerInterval = setInterval(() => {
            this.playerExecutionElapsedTime += 100;
            this.updatePlayerExecutionTimerDisplay();
        }, 100);
    }

    /**
     * Stop elapsed timer
     */
    stopPlayerExecutionTimer() {
        if (this.playerExecutionTimerInterval) {
            clearInterval(this.playerExecutionTimerInterval);
            this.playerExecutionTimerInterval = null;
        }
    }

    /**
     * Update the player execution timer display
     */
    updatePlayerExecutionTimerDisplay() {
        const elapsedTimerValue = document.querySelector('.elapsed-timer-value');
        if (elapsedTimerValue) {
            const seconds = Math.floor(this.playerExecutionElapsedTime / 1000);
            const deciseconds = Math.floor((this.playerExecutionElapsedTime % 1000) / 100);
            elapsedTimerValue.textContent = `${seconds.toString().padStart(2, '0')}:${deciseconds}s`;
        }
    }

    /**
     * Check if code is currently executing
     * @returns {boolean}
     */
    isCodeExecuting() {
        return this.isExecuting;
    }
}

// CodeExecutor will be instantiated in app.js

