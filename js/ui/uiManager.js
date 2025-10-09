/**
 * UI Management System
 * Handles user interactions, keyboard controls, and UI updates
 */

class UIManager {
    constructor(gameState, pinManager, componentManager, arduinoParser, codeEditor) {
        this.gameState = gameState;
        this.pinManager = pinManager;
        this.componentManager = componentManager;
        this.arduinoParser = arduinoParser;
        this.codeEditor = codeEditor;
        this.currentLoopInterval = null;
        this.isExecuting = false;
        this.executionTimeouts = [];
        
        // Game flow state
        this.isGameActive = false;
        this.hasPlayedTarget = false;
        this.currentLevel = null;
        
        // Execution sequence tracking
        this.executionSequence = [];
        this.executionStartTime = 0;
        this.shouldValidate = false;
        
        // Player execution timer
        this.playerExecutionElapsedTime = 0;
        this.playerExecutionTimerInterval = null;
    }

    /**
     * Initialize UI event listeners
     */
    init() {
        this.setupPinEventListeners();
        this.setupKeyboardControls();
        this.setupButtonEventListeners();
        this.setupBackgroundEffects();
        this.initializeGame();
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
                this.playTargetAnimation();
            });
        }
        
        // Stop Animation button
        if (stopAnimationBtn) {
            stopAnimationBtn.addEventListener('click', () => {
                console.log('⏹️ Stop Animation button clicked');
                this.stopTargetAnimation();
            });
        }
        
        // Replay button
        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                console.log('🔄 Replay button clicked - replaying target sequence');
                // Stop any running player code execution
                this.stopExecution();
                // Play the target animation (it will stop any existing animation automatically)
                this.playTargetAnimation();
            });
        }
        
        // Run Code button
        if (runCodeBtn) {
            runCodeBtn.addEventListener('click', () => {
                console.log('🚀 RUN CODE button clicked!');
                this.runCode();
            });
        } else {
            console.error('❌ RUN CODE button not found!');
        }
        
        // Reset button
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetGame();
            });
        }
        
        // Hint button
        if (hintBtn) {
            hintBtn.addEventListener('click', () => {
                console.log('Showing hint');
                // TODO: Implement hint system
            });
        }
    }

    /**
     * Run Arduino code
     */
    runCode() {
        console.log('🎯 runCode() method called');
        
        // Stop any existing execution
        this.stopExecution();
        
        const code = this.codeEditor.getValue();
        console.log('📝 Code to execute:', code);
        
        if (!code || code.trim().length === 0) {
            console.error('❌ No code to execute!');
            alert('Please write some code first!');
            return;
        }
        
        try {
            // Show status
            this.showCodeStatus('⚡ Parsing Code...');
            console.log('✅ Status shown: Parsing Code');
            
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
                    setupStartLine = i + 2; // Skip the function declaration line
                }
                if (codeLines[i].includes('void loop()')) {
                    loopStartLine = i + 2; // Skip the function declaration line
                }
            }
            
            // Show setup execution status
            this.showCodeStatus('⚡ Executing Setup...');
            console.log('✅ Status shown: Executing Setup');
            
            // Mark as executing
            this.isExecuting = true;
            console.log('✅ Execution marked as active');
            
            // Execute setup with delays and highlighting
            this.executeLoopWithDelays(parsedCode.setup, setupStartLine, () => {
                // Setup complete, now execute loop
                console.log('✅ Setup execution completed');
                
                if (!this.isExecuting) return;
                
                // Only execute loop if there's code in it
                if (parsedCode.loop && parsedCode.loop.trim().length > 0) {
                    this.showCodeStatus('⚡ Running Loop...');
                    console.log('✅ Status shown: Running Loop');
                    this.executeLoopWithTiming(parsedCode.loop, loopStartLine);
                    console.log('✅ Loop execution started');
                } else {
                    // No loop code, just finish
                    console.log('✅ No loop code, finishing execution');
                    this.hideCodeStatus();
                    this.isExecuting = false;
                    if (window.codeEditor) {
                        window.codeEditor.clearLineHighlight();
                    }
                }
            });
            
        } catch (error) {
            console.error('❌ Code execution error:', error);
            this.hideCodeStatus();
            this.isExecuting = false;
            this.showError(error.message);
        }
    }

    /**
     * Stop code execution
     */
    stopExecution() {
        this.isExecuting = false;
        
        // Clear all timeouts
        this.executionTimeouts.forEach(timeout => clearTimeout(timeout));
        this.executionTimeouts = [];
        
        // Clear any existing intervals
        if (this.currentLoopInterval) {
            clearInterval(this.currentLoopInterval);
            this.currentLoopInterval = null;
        }
        
        // Clear player execution timer
        if (this.playerExecutionTimerInterval) {
            clearInterval(this.playerExecutionTimerInterval);
            this.playerExecutionTimerInterval = null;
        }
        
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
        if (window.codeEditor) {
            window.codeEditor.clearLineHighlight();
        }
        
        this.hideCodeStatus();
        console.log('Code execution stopped');
    }

    /**
     * Execute loop with proper Arduino-style timing
     */
    executeLoopWithTiming(loopCode, loopStartLine = 1) {
        let loopCount = 0;
        const maxLoops = 1000; // Increased limit for longer execution
        
        // Get validation loops from current level (default to 1)
        const validationLoops = this.currentLevel?.validationLoops || 1;
        console.log(`🎯 Will validate after ${validationLoops} loop iterations`);
        
        const executeLoopIteration = () => {
            if (!this.isExecuting || loopCount >= maxLoops) {
                this.hideCodeStatus();
                this.isExecuting = false;
                // Clear highlighting when execution stops
                if (window.codeEditor) {
                    window.codeEditor.clearLineHighlight();
                }
                console.log('Loop execution stopped (max iterations reached or stopped)');
                return;
            }
            
            try {
                // Execute the loop code with proper timing
                this.executeLoopWithDelays(loopCode, loopStartLine, () => {
                    // This callback is called when the loop iteration is complete
                    if (!this.isExecuting) return; // Check if execution was stopped
                    
                    // Update visual pins after each loop iteration
                    this.updateVisualPinsFromParser();
                    
                    loopCount++;
                    
                    // Update status with loop count
                    this.showCodeStatus(`⚡ Loop ${loopCount}/${maxLoops}`);
                    
                    // Check if we should validate after this loop iteration
                    if (loopCount === validationLoops && !this.shouldValidate) {
                        console.log(`🎯 Validation trigger: ${loopCount} loops completed`);
                        this.shouldValidate = true;
                        this.validateExecution();
                    }
                    
                    // Schedule next loop iteration
                    const timeout = setTimeout(executeLoopIteration, 0);
                    this.executionTimeouts.push(timeout);
                });
                
            } catch (error) {
                console.error('Loop execution error:', error);
                this.hideCodeStatus();
                this.isExecuting = false;
                this.showError(error.message);
                // Clear highlighting on error
                if (window.codeEditor) {
                    window.codeEditor.clearLineHighlight();
                }
            }
        };
        
        // Start the loop execution
        executeLoopIteration();
    }

    /**
     * Execute loop code with proper delay handling
     */
    executeLoopWithDelays(loopCode, loopStartLine, onComplete) {
        const lines = loopCode.split('\n');
        let currentLineIndex = 0;
        
        const executeNextLine = () => {
            if (!this.isExecuting) {
                // Execution was stopped
                return;
            }
            
            if (currentLineIndex >= lines.length) {
                // All lines executed, call completion callback
                onComplete();
                return;
            }
            
            const line = lines[currentLineIndex].trim();
            const actualLineNumber = loopStartLine + currentLineIndex;
            currentLineIndex++;
            
            // Skip empty lines and comments instantly
            if (!line || line.startsWith('//')) {
                console.log(`⏭️ Skipping empty/comment line: "${line}"`);
                executeNextLine();
                return;
            }
            
            // Handle delay calls with setTimeout
            const delayMatch = line.match(/delay\s*\(\s*(\d+)\s*\)/i);
            if (delayMatch) {
                const ms = parseInt(delayMatch[1]);
                console.log(`Found delay: ${ms}ms`);
                
                if (ms < 0 || ms > 10000) {
                    throw new Error(`Delay value ${ms} is invalid. Use values 0-10000ms.`);
                }
                
                // Highlight the delay line immediately
                if (window.codeEditor) {
                    window.codeEditor.highlightLine(actualLineNumber);
                }
                
                // Use setTimeout for delays to keep UI responsive
                const timeout = setTimeout(() => {
                    if (this.isExecuting) {
                        executeNextLine();
                    }
                }, ms);
                this.executionTimeouts.push(timeout);
                return;
            }
            
            // Execute non-delay commands with minimal timing
            try {
                const startTime = Date.now();
                console.log(`⚡ Executing line ${actualLineNumber}: "${line}"`);
                
                // Highlight the line immediately
                if (window.codeEditor) {
                    window.codeEditor.highlightLine(actualLineNumber);
                }
                
                // Execute the line immediately after highlighting
                this.arduinoParser.executeLine(line, actualLineNumber);
                
                // Update visual pins immediately after each command
                this.updateVisualPinsFromParser();
                
                const executionTime = Date.now() - startTime;
                console.log(`✅ Line executed in ${executionTime}ms`);
                
                // Add a very short delay to make the highlighting visible, then continue
                const timeout = setTimeout(() => {
                    if (this.isExecuting) {
                        executeNextLine();
                    }
                }, 50); // Very short delay just to show the highlighting
                this.executionTimeouts.push(timeout);
            } catch (error) {
                console.error(`Error executing line: ${line}`, error);
                this.showError(error.message);
                onComplete(); // Stop execution on error
            }
        };
        
        // Start executing lines
        executeNextLine();
    }

    /**
     * Reset the entire game
     */
    resetGame() {
        // Stop any running execution
        this.stopExecution();
        
        // Reset code editor
        this.codeEditor.setValue(`void setup() {
  
}

void loop() {
  
}`);
        console.log('Code editor reset');
        
        // Reset Arduino parser
        this.arduinoParser.reset();
        
        // Reset game state
        this.gameState.reset();
        
        // Update visuals
        this.pinManager.initializePins();
        this.pinManager.updatePinSelection();
        this.componentManager.renderComponents();
    }

    /**
     * Show code execution status
     */
    showCodeStatus(message = '⚡ Code Running...') {
        const status = document.getElementById('codeStatus');
        if (status) {
            status.innerHTML = `<div>${message}</div>`;
            status.classList.add('show', 'running');
        }
    }

    /**
     * Hide code execution status
     */
    hideCodeStatus() {
        const status = document.getElementById('codeStatus');
        if (status) {
            status.classList.remove('show', 'running');
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorDisplay = document.getElementById('errorDisplay');
        const errorMessage = document.querySelector('.error-message');
        
        if (errorDisplay && errorMessage) {
            errorMessage.textContent = message;
            errorDisplay.classList.add('show');
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                this.hideError();
            }, 10000);
        }
    }

    /**
     * Hide error message
     */
    hideError() {
        const errorDisplay = document.getElementById('errorDisplay');
        if (errorDisplay) {
            errorDisplay.classList.remove('show');
        }
    }

    /**
     * Record a pin event during execution
     * @param {number} pin - Pin number
     * @param {boolean} state - Pin state (true/false)
     * @param {string} type - Event type ('digital' or 'pwm')
     * @param {number} pwm - PWM value (0-255)
     * @param {number} dutyCycle - Duty cycle percentage (0-100)
     */
    recordPinEvent(pin, state, type, pwm = 0, dutyCycle = 0) {
        if (!this.isExecuting) return;
        
        const timestamp = Date.now() - this.executionStartTime;
        
        const event = {
            pin: pin,
            state: state,
            type: type,
            pwm: pwm,
            dutyCycle: dutyCycle,
            time: timestamp
        };
        
        this.executionSequence.push(event);
        console.log(`📝 Recorded event: Pin ${pin} → ${state} (${type}) at ${timestamp}ms`);
    }

    /**
     * Update visual pins based on parser state
     */
    updateVisualPinsFromParser() {
        console.log('🔄 Updating visual pins from parser...');
        
        let hasChanges = false;
        
        for (let pin = 8; pin <= 13; pin++) {
            const pinState = this.arduinoParser.getPinState(pin);
            
            // Check if pin state has actually changed
            const oldState = this.gameState.pins[pin];
            const oldMode = this.gameState.pinModes[pin];
            const oldPwm = this.gameState.pwmValues[pin];
            
            // Update game state
            this.gameState.pins[pin] = pinState.state;
            
            // Determine pin mode based on parser state
            if (pinState.pwm > 0) {
                // PWM mode (analogWrite with any value > 0)
                this.gameState.pinModes[pin] = 'PWM';
            } else {
                // Digital mode (pinMode OUTPUT or digitalWrite HIGH/LOW)
                this.gameState.pinModes[pin] = pinState.mode === 'OUTPUT' ? 'DIGITAL' : 'DIGITAL';
            }
            
            this.gameState.pwmValues[pin] = pinState.pwm;
            this.gameState.dutyCycles[pin] = Math.round((pinState.pwm / 255) * 100);
            
            // Always update visual for debugging (remove this optimization temporarily)
            console.log(`🎨 Updating pin ${pin} visual:`, {
                old: { state: oldState, mode: oldMode, pwm: oldPwm },
                new: { 
                    state: this.gameState.pins[pin], 
                    mode: this.gameState.pinModes[pin], 
                    pwm: this.gameState.pwmValues[pin] 
                }
            });
            
            // Update visual representation with code-controlled flag
            this.pinManager.updatePinVisual(pin, true);
            hasChanges = true;
            
            // Record the pin event during execution - ONLY if state changed
            if (this.isExecuting) {
                // Only record if this pin actually changed state or PWM value
                if (oldState !== this.gameState.pins[pin] || oldPwm !== this.gameState.pwmValues[pin]) {
                    const eventType = this.gameState.pinModes[pin] === 'PWM' ? 'pwm' : 'digital';
                    this.recordPinEvent(
                        pin, 
                        this.gameState.pins[pin], 
                        eventType, 
                        this.gameState.pwmValues[pin], 
                        this.gameState.dutyCycles[pin]
                    );
                    
                    // Add visual effects for player execution
                    this.addPlayerExecutionVisualEffects(pin, this.gameState.pins[pin], eventType, this.gameState.dutyCycles[pin]);
                }
            }
        }
        
        // Always update component states for debugging
        if (hasChanges) {
            this.componentManager.updateComponentStates();
        }
    }

    /**
     * Setup background effects
     */
    setupBackgroundEffects() {
        this.startParticleSystem();
        this.addMouseInteraction();
    }

    /**
     * Start dynamic particle system
     */
    startParticleSystem() {
        // Create dynamic particles periodically
        setInterval(() => {
            this.createDynamicParticle();
        }, 2000);
    }

    /**
     * Create a dynamic particle
     */
    createDynamicParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const colors = ['#00D4FF', '#8B5CF6', '#FF6B35', '#FFD700', '#0099FF'];
        const size = Math.random() * 4 + 2;
        const left = Math.random() * 100;
        const duration = Math.random() * 20 + 20;
        const delay = Math.random() * 5;
        
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.boxShadow = `0 0 ${size * 2}px ${colors[Math.floor(Math.random() * colors.length)]}`;
        particle.style.left = left + '%';
        particle.style.animationDuration = duration + 's';
        particle.style.animationDelay = delay + 's';
        
        const bgAnimation = document.querySelector('.bg-animation');
        if (bgAnimation) {
            bgAnimation.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, (duration + delay) * 1000);
        }
    }

    /**
     * Add mouse interaction to particles
     */
    addMouseInteraction() {
        document.addEventListener('mousemove', (e) => {
            const particles = document.querySelectorAll('.particle');
            particles.forEach(particle => {
                const rect = particle.getBoundingClientRect();
                const distance = Math.sqrt(
                    Math.pow(e.clientX - (rect.left + rect.width/2), 2) + 
                    Math.pow(e.clientY - (rect.top + rect.height/2), 2)
                );
                
                if (distance < 100) {
                    const force = (100 - distance) / 100;
                    particle.style.transform = `translate(${force * 10}px, ${force * 10}px)`;
                    particle.style.transition = 'transform 0.3s ease';
                } else {
                    particle.style.transform = 'translate(0px, 0px)';
                }
            });
        });
    }

    /**
     * Test pin functionality
     */
    testPins() {
        console.log('🧪 Testing pin functionality...');
        
        // Test pin 13
        console.log('Testing pin 13...');
        this.gameState.pins[13] = true;
        this.pinManager.updatePinVisual(13);
        
        setTimeout(() => {
            this.gameState.pins[13] = false;
            this.pinManager.updatePinVisual(13);
            console.log('Pin 13 test completed');
        }, 2000);
    }
    
    /**
     * Test code execution timing with debug output
     * Call this from browser console: window.uiManager.testCodeExecution()
     */
    testCodeExecution() {
        const testCode = `#include <TimerOne.h>

void setup() {
  Timer1.initialize(20000);    // 20 ms = 50 Hz period
  Timer1.pwm(9, 512);          // 50% duty on pin 9
  Timer1.pwm(10, 256);         // 25% duty on pin 10
}

void loop() {}`;
        
        console.log('🧪 Testing code execution timing...');
        this.codeEditor.setValue(testCode);
        
        // Add debug logging to the execution
        const originalExecuteLoopWithDelays = this.executeLoopWithDelays.bind(this);
        this.executeLoopWithDelays = (loopCode, loopStartLine, onComplete) => {
            console.log('🚀 Starting executeLoopWithDelays with debug...');
            const lines = loopCode.split('\n');
            let currentLineIndex = 0;
            
            const executeNextLine = () => {
                if (!this.isExecuting) {
                    console.log('❌ Execution stopped');
                    return;
                }
                
                if (currentLineIndex >= lines.length) {
                    console.log('✅ Loop iteration completed');
                    onComplete();
                    return;
                }
                
                const line = lines[currentLineIndex].trim();
                const actualLineNumber = loopStartLine + currentLineIndex;
                const startTime = Date.now();
                
                console.log(`🎯 Processing line ${actualLineIndex + 1}/${lines.length} (actual line ${actualLineNumber}): "${line}"`);
                
                currentLineIndex++;
                
                // Skip empty lines and comments instantly
                if (!line || line.startsWith('//')) {
                    console.log(`⏭️ Skipping empty/comment line instantly`);
                    executeNextLine();
                    return;
                }
                
                // Handle delay calls
                const delayMatch = line.match(/delay\s*\(\s*(\d+)\s*\)/i);
                if (delayMatch) {
                    const ms = parseInt(delayMatch[1]);
                    console.log(`⏰ Found delay: ${ms}ms`);
                    
                    if (window.codeEditor) {
                        window.codeEditor.highlightLine(actualLineNumber);
                    }
                    
                    const timeout = setTimeout(() => {
                        console.log(`⏰ Delay ${ms}ms completed`);
                        if (this.isExecuting) {
                            executeNextLine();
                        }
                    }, ms);
                    this.executionTimeouts.push(timeout);
                    return;
                }
                
                // Execute non-delay commands
                try {
                    console.log(`⚡ Highlighting line ${actualLineNumber}`);
                    if (window.codeEditor) {
                        window.codeEditor.highlightLine(actualLineNumber);
                    }
                    
                    console.log(`⚡ Executing line: "${line}"`);
                    this.arduinoParser.executeLine(line, actualLineNumber);
                    
                    this.updateVisualPinsFromParser();
                    
                    const timeout = setTimeout(() => {
                        const endTime = Date.now();
                        console.log(`✅ Line execution completed in ${endTime - startTime}ms`);
                        if (this.isExecuting) {
                            executeNextLine();
                        }
                    }, 50);
                    this.executionTimeouts.push(timeout);
                } catch (error) {
                    console.error(`❌ Error executing line: ${line}`, error);
                    this.showError(error.message);
                    onComplete();
                }
            };
            
            executeNextLine();
        };
        
        // Run the test
        this.runCode();
        
        // Restore original method after 10 seconds
        setTimeout(() => {
            this.executeLoopWithDelays = originalExecuteLoopWithDelays;
            console.log('🔄 Restored original executeLoopWithDelays method');
        }, 10000);
    }

    // ========================================
    // GAME FLOW METHODS
    // ========================================

    /**
     * Initialize the game
     */
    initializeGame() {
        console.log('🎮 Initializing game...');
        
        // Load first level
        this.loadLevel(1);
        
        // Update UI with level info
        this.updateLevelDisplay();
    }

    /**
     * Load a specific level
     * @param {number} levelId - Level ID to load
     */
    loadLevel(levelId) {
        console.log(`🎮 Loading level ${levelId}...`);
        
        if (window.levelManager.loadLevel(levelId)) {
            this.currentLevel = window.levelManager.getCurrentLevel();
            this.isGameActive = false;
            this.hasPlayedTarget = false;
            
            // Reset game state
            this.resetGame();
            
            // Update UI
            this.updateLevelDisplay();
            this.updateGameButtons();
            
            console.log(`✅ Level ${levelId} loaded: "${this.currentLevel.name}"`);
        } else {
            console.error(`❌ Failed to load level ${levelId}`);
        }
    }

    /**
     * Play target animation and start timer
     */
    playTargetAnimation() {
        if (!this.currentLevel) {
            console.error('❌ No level loaded');
            return;
        }

        console.log('🎬 Playing target animation...');
        
        // Stop any running player code execution
        this.stopExecution();
        
        // Reset pin visuals to clean state
        this.resetPinVisuals();
        
        const targetSequence = window.levelManager.getTargetSequence();
        if (!targetSequence) {
            console.error('❌ No target sequence available');
            return;
        }

        // Start timer and enable game immediately (first time only)
        if (!this.isGameActive) {
            console.log('🎮 Starting game and timer...');
            this.isGameActive = true;
            this.startGameTimer();
        }

        // Play the target animation
        window.targetAnimationPlayer.playTargetAnimation(targetSequence, () => {
            console.log('✅ Target animation completed');
            // Update button states when animation completes
            this.updateGameButtons();
        });

        this.hasPlayedTarget = true;
        this.updateGameButtons();
    }

    /**
     * Stop target animation
     */
    stopTargetAnimation() {
        console.log('⏹️ Stopping target animation...');
        
        // Stop the animation
        window.targetAnimationPlayer.stopAnimation();
        
        // Update button states
        this.updateGameButtons();
    }

    /**
     * Start the game timer
     */
    startGameTimer() {
        if (!this.currentLevel) {
            console.error('❌ No level loaded');
            return;
        }

        console.log(`⏰ Starting timer: ${this.currentLevel.timeLimit}ms`);
        
        this.isGameActive = true;
        this.updateGameButtons();

        // Start countdown timer
        window.timerManager.startTimer(
            this.currentLevel.timeLimit,
            () => this.handleTimeUp(), // onTimeUp callback
            (timeRemaining, totalTime) => this.onTimerTick(timeRemaining, totalTime) // onTick callback
        );
    }

    /**
     * Handle timer tick
     * @param {number} timeRemaining - Time remaining in ms
     * @param {number} totalTime - Total time in ms
     */
    onTimerTick(timeRemaining, totalTime) {
        // Update any timer-related UI elements
        this.updateTimerDisplay();
    }

    /**
     * Handle time up event
     */
    handleTimeUp() {
        console.log('⏰ TIME UP!');
        this.handleLose();
    }

    /**
     * Modified runCode method with game flow integration
     */
    runCode() {
        console.log('🎯 runCode() method called');
        
        // Check if game is active
        if (!this.isGameActive) {
            console.log('⚠️ Game not active - cannot run code yet');
            this.showMessage('Play the target animation first!', 'warning');
            return;
        }

        // Stop any existing execution
        this.stopExecution();
        
        // Stop target animation if playing
        if (window.targetAnimationPlayer.isAnimationPlaying()) {
            console.log('⏹️ Stopping target animation for player code execution');
            window.targetAnimationPlayer.stopAnimation();
            // Update button states to hide stop animation button
            this.updateGameButtons();
        }
        
        // Reset pin visuals to clean state
        this.resetPinVisuals();
        
        const code = this.codeEditor.getValue();
        console.log('📝 Code to execute:', code);
        
        if (!code || code.trim().length === 0) {
            console.error('❌ No code to execute!');
            this.showMessage('Please write some code first!', 'error');
            return;
        }
        
        // Start player code execution with animation system
        this.executePlayerCodeWithAnimation(code);
    }

    /**
     * Execute player code using the animation system
     * @param {string} code - Player's Arduino code
     */
    executePlayerCodeWithAnimation(code) {
        try {
            // Reset execution tracking
            this.executionSequence = [];
            this.executionStartTime = Date.now();
            this.shouldValidate = false;
            
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
                    setupStartLine = i + 2; // Skip the function declaration line
                }
                if (codeLines[i].includes('void loop()')) {
                    loopStartLine = i + 2; // Skip the function declaration line
                }
            }
            
            // Mark as executing
            this.isExecuting = true;
            console.log('✅ Execution marked as active');
            
            // Start elapsed timer (same as target animation)
            this.startPlayerExecutionTimer();
            
            // Execute setup first
            this.executeSetupWithAnimation(parsedCode.setup, setupStartLine, () => {
                // Setup complete, now execute loop with animation
                console.log('✅ Setup execution completed');
                
                if (!this.isExecuting) return;
                
                // Only execute loop if there's code in it
                if (parsedCode.loop && parsedCode.loop.trim().length > 0) {
                    this.executeLoopWithAnimation(parsedCode.loop, loopStartLine);
                    console.log('✅ Loop execution started with animation');
                } else {
                    // No loop code, just finish
                    console.log('✅ No loop code, finishing execution');
                    this.isExecuting = false;
                }
            });
            
        } catch (error) {
            console.error('❌ Code execution error:', error);
            this.isExecuting = false;
            this.showMessage(error.message, 'error');
        }
    }

    /**
     * Execute setup with animation system
     */
    executeSetupWithAnimation(setupCode, setupStartLine, onComplete) {
        const lines = setupCode.split('\n');
        let currentLineIndex = 0;
        
        const executeNextLine = () => {
            if (!this.isExecuting) {
                return;
            }
            
            if (currentLineIndex >= lines.length) {
                // Setup complete
                onComplete();
                return;
            }
            
            const line = lines[currentLineIndex].trim();
            const actualLineNumber = setupStartLine + currentLineIndex;
            currentLineIndex++;
            
            // Skip empty lines and comments instantly
            if (!line || line.startsWith('//')) {
                executeNextLine();
                return;
            }
            
            // Handle delay calls
            const delayMatch = line.match(/delay\s*\(\s*(\d+)\s*\)/i);
            if (delayMatch) {
                const ms = parseInt(delayMatch[1]);
                console.log(`Found delay: ${ms}ms`);
                
                if (window.codeEditor) {
                    window.codeEditor.highlightLine(actualLineNumber);
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
                
                if (window.codeEditor) {
                    window.codeEditor.highlightLine(actualLineNumber);
                }
                
                this.arduinoParser.executeLine(line, actualLineNumber);
                this.updateVisualPinsFromParser();
                
                const timeout = setTimeout(() => {
                    if (this.isExecuting) {
                        executeNextLine();
                    }
                }, 50);
                this.executionTimeouts.push(timeout);
            } catch (error) {
                console.error(`Error executing setup line: ${line}`, error);
                this.showMessage(error.message, 'error');
                onComplete();
            }
        };
        
        executeNextLine();
    }

    /**
     * Execute loop with animation system (similar to target animation)
     */
    executeLoopWithAnimation(loopCode, loopStartLine) {
        let loopCount = 0;
        const maxLoops = 1000;
        const validationLoops = this.currentLevel?.validationLoops || 1;
        
        const executeLoopIteration = () => {
            if (!this.isExecuting || loopCount >= maxLoops) {
                this.isExecuting = false;
                console.log('Loop execution stopped');
                return;
            }
            
            try {
                // Execute one loop iteration with animation
                this.executeLoopIterationWithAnimation(loopCode, loopStartLine, () => {
                    if (!this.isExecuting) return;
                    
                    loopCount++;
                    
                    // Check if we should validate after this loop iteration
                    if (loopCount === validationLoops && !this.shouldValidate) {
                        console.log(`🎯 Validation trigger: ${loopCount} loops completed`);
                        this.shouldValidate = true;
                        this.validateExecution();
                    }
                    
                    // Continue to next loop iteration
                    const timeout = setTimeout(executeLoopIteration, 0);
                    this.executionTimeouts.push(timeout);
                });
                
            } catch (error) {
                console.error('Loop execution error:', error);
                this.isExecuting = false;
                this.showMessage(error.message, 'error');
            }
        };
        
        executeLoopIteration();
    }

    /**
     * Execute one loop iteration with animation
     */
    executeLoopIterationWithAnimation(loopCode, loopStartLine, onComplete) {
        const lines = loopCode.split('\n');
        let currentLineIndex = 0;
        
        const executeNextLine = () => {
            if (!this.isExecuting) {
                return;
            }
            
            if (currentLineIndex >= lines.length) {
                // Loop iteration complete
                onComplete();
                return;
            }
            
            const line = lines[currentLineIndex].trim();
            const actualLineNumber = loopStartLine + currentLineIndex;
            currentLineIndex++;
            
            // Skip empty lines and comments instantly
            if (!line || line.startsWith('//')) {
                executeNextLine();
                return;
            }
            
            // Handle delay calls
            const delayMatch = line.match(/delay\s*\(\s*(\d+)\s*\)/i);
            if (delayMatch) {
                const ms = parseInt(delayMatch[1]);
                
                if (window.codeEditor) {
                    window.codeEditor.highlightLine(actualLineNumber);
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
                if (window.codeEditor) {
                    window.codeEditor.highlightLine(actualLineNumber);
                }
                
                this.arduinoParser.executeLine(line, actualLineNumber);
                this.updateVisualPinsFromParser();
                
                const timeout = setTimeout(() => {
                    if (this.isExecuting) {
                        executeNextLine();
                    }
                }, 50);
                this.executionTimeouts.push(timeout);
            } catch (error) {
                console.error(`Error executing loop line: ${line}`, error);
                this.showMessage(error.message, 'error');
                onComplete();
            }
        };
        
        executeNextLine();
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
     * Add visual effects for player code execution (same as target animation)
     * @param {number} pin - Pin number
     * @param {boolean} state - Pin state
     * @param {string} type - Event type
     * @param {number} dutyCycle - Duty cycle percentage
     */
    addPlayerExecutionVisualEffects(pin, state, type, dutyCycle) {
        // Add target-animation class to pin
        const pinElement = document.querySelector(`.pin-circle[data-pin="${pin}"]`);
        if (pinElement) {
            pinElement.classList.add('target-animation');
        }

        // Create event flash
        this.createEventFlash({ pin, state, type });
        
        // Create timing marker
        this.createTimingMarker({ pin, state, type, dutyCycle });
        
        // Highlight elapsed timer
        this.highlightElapsedTimer();
    }

    /**
     * Create event flash effect (same as target animation)
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
     * Create timing marker (same as target animation)
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
     * Highlight elapsed timer on event (same as target animation)
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

    /**
     * Validate execution after N loop iterations
     */
    validateExecution() {
        console.log('🎯 Validating execution...');
        
        // Build sequence from recorded execution events
        const playerSequence = this.buildSequenceFromExecution();
        console.log('📝 Player execution sequence:', playerSequence);
        
        // Get target sequence
        const targetSequence = window.levelManager.getTargetSequence();
        if (!targetSequence) {
            console.error('❌ No target sequence available');
            this.showMessage('Target sequence not available', 'error');
            return;
        }
        
        // Validate sequences
        const validation = window.sequenceValidator.validateSequence(targetSequence, playerSequence);
        console.log('✅ Validation result:', validation);
        
        if (validation.matches) {
            console.log('🎉 SEQUENCE MATCH! Player wins!');
            this.showWinModal(); // Don't stop execution!
        } else {
            console.log('❌ Sequence does not match');
            this.showMessage(`Not quite right. Keep trying! Score: ${validation.score}%`, 'warning');
            
            // Show detailed feedback
            if (validation.differences.length > 0) {
                const firstDiff = validation.differences[0];
                this.showMessage(`Issue: ${firstDiff.message}`, 'info');
            }
        }
    }

    /**
     * Build sequence from recorded execution events
     */
    buildSequenceFromExecution() {
        if (this.executionSequence.length === 0) {
            return { events: [], totalDuration: 0, isLooping: false };
        }
        
        // Sort events by time
        const sortedEvents = [...this.executionSequence].sort((a, b) => a.time - b.time);
        
        // Calculate total duration
        const totalDuration = sortedEvents.length > 0 ? 
            sortedEvents[sortedEvents.length - 1].time : 0;
        
        return {
            events: sortedEvents,
            totalDuration: totalDuration,
            isLooping: false
        };
    }

    /**
     * Handle win condition
     */
    handleWin() {
        console.log('🎉 PLAYER WINS!');
        
        // Stop timer
        window.timerManager.stopTimer();
        
        // Show win message (but don't stop execution - let it continue in background)
        this.showWinModal();
        
        // Update game state
        this.isGameActive = false;
        this.updateGameButtons();
    }

    /**
     * Handle lose condition
     */
    handleLose() {
        console.log('💀 PLAYER LOSES!');
        
        // Show lose message (but don't stop execution - let it continue in background)
        this.showLoseModal();
        
        // Update game state
        this.isGameActive = false;
        this.updateGameButtons();
    }

    /**
     * Show win modal
     */
    showWinModal() {
        const modal = document.getElementById('winModal');
        if (modal) {
            modal.style.display = 'flex';
        }
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.hideWinModal();
        }, 3000);
    }

    /**
     * Hide win modal
     */
    hideWinModal() {
        const modal = document.getElementById('winModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Show lose modal
     */
    showLoseModal() {
        const modal = document.getElementById('loseModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    /**
     * Hide lose modal
     */
    hideLoseModal() {
        const modal = document.getElementById('loseModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Update level display
     */
    updateLevelDisplay() {
        if (!this.currentLevel) return;

        const levelInfo = window.levelManager.getLevelInfo();
        
        // Update mission title
        const missionTitle = document.querySelector('.mission-title');
        if (missionTitle) {
            missionTitle.textContent = `🎯 MISSION ${levelInfo.id}: ${levelInfo.name}`;
        }
        
        // Update level description (if element exists)
        const levelDesc = document.querySelector('.level-description');
        if (levelDesc) {
            levelDesc.textContent = levelInfo.description;
        }
        
        // Update hint (if element exists)
        const hintText = document.querySelector('.hint-text');
        if (hintText) {
            hintText.textContent = levelInfo.hint;
        }
    }

    /**
     * Update game buttons state
     */
    updateGameButtons() {
        const playTargetBtn = document.querySelector('.btn-play');
        const stopAnimationBtn = document.querySelector('.btn-stop-animation');
        const runCodeBtn = document.querySelector('.btn-run');
        
        if (playTargetBtn) {
            if (this.hasPlayedTarget) {
                playTargetBtn.textContent = '🔄 REPLAY TARGET';
                playTargetBtn.disabled = false;
            } else {
                playTargetBtn.textContent = '▶️ PLAY TARGET';
                playTargetBtn.disabled = false;
            }
        }
        
        // Show/hide stop animation button based on animation state
        if (stopAnimationBtn) {
            const isAnimationPlaying = window.targetAnimationPlayer.isAnimationPlaying();
            if (isAnimationPlaying) {
                stopAnimationBtn.style.display = 'inline-block';
            } else {
                stopAnimationBtn.style.display = 'none';
            }
        }
        
        if (runCodeBtn) {
            if (this.isGameActive) {
                runCodeBtn.disabled = false;
                runCodeBtn.textContent = '▶️ RUN CODE';
            } else {
                runCodeBtn.disabled = true;
                runCodeBtn.textContent = '⏸️ RUN CODE (Play target first)';
            }
        }
    }

    /**
     * Update timer display
     */
    updateTimerDisplay() {
        // Timer display is handled by TimerManager
        // This method can be used for additional timer-related UI updates
    }

    /**
     * Show message to user
     * @param {string} message - Message to show
     * @param {string} type - Message type (info, warning, error, success)
     */
    showMessage(message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        
        // Create or update message element
        let messageEl = document.getElementById('gameMessage');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'gameMessage';
            messageEl.className = 'game-message';
            document.body.appendChild(messageEl);
        }
        
        messageEl.textContent = message;
        messageEl.className = `game-message game-message-${type}`;
        messageEl.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }

    /**
     * Go to next level
     */
    nextLevel() {
        const nextLevelId = window.levelManager.getNextLevelId();
        if (nextLevelId) {
            this.loadLevel(nextLevelId);
        } else {
            this.showMessage('Congratulations! You completed all levels!', 'success');
        }
    }

    /**
     * Restart current level
     */
    restartLevel() {
        if (this.currentLevel) {
            this.loadLevel(this.currentLevel.id);
        }
    }

    /**
     * Reset all pin visuals to clean state
     */
    resetPinVisuals() {
        // Reset game state pins
        Object.keys(this.gameState.pins).forEach(pin => {
            this.gameState.pins[pin] = false;
            this.gameState.pwmValues[pin] = 0;
            this.gameState.dutyCycles[pin] = 0;
            this.gameState.pinModes[pin] = 'DIGITAL';
        });
        
        // Update all pin visuals
        this.pinManager.initializePins();
        
        // Update component states
        this.componentManager.updateComponentStates();
        
        console.log('🔄 Pin visuals reset to clean state');
    }
}

// UIManager will be initialized in app.js after all dependencies are loaded
