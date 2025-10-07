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
    }

    /**
     * Initialize UI event listeners
     */
    init() {
        this.setupPinEventListeners();
        this.setupKeyboardControls();
        this.setupButtonEventListeners();
        this.setupBackgroundEffects();
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
        const replayBtn = document.querySelector('.btn-replay');
        const runCodeBtn = document.querySelector('.btn-run');
        const resetBtn = document.querySelector('.btn-reset');
        const hintBtn = document.querySelector('.btn-hint');
        
        // Play Target button
        if (playTargetBtn) {
            playTargetBtn.addEventListener('click', () => {
                console.log('Playing target animation');
                // TODO: Implement target animation
            });
        }
        
        // Replay button
        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                console.log('Replaying animation');
                // TODO: Implement replay functionality
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
            
            // Show setup execution status
            this.showCodeStatus('⚡ Executing Setup...');
            console.log('✅ Status shown: Executing Setup');
            
            // Execute setup once
            this.arduinoParser.executeSetup(parsedCode.setup);
            console.log('✅ Setup executed');
            
            // Update visual pins based on setup
            this.updateVisualPinsFromParser();
            console.log('✅ Visual pins updated from setup');
            
            // Show loop execution status
            this.showCodeStatus('⚡ Running Loop...');
            console.log('✅ Status shown: Running Loop');
            
            // Mark as executing
            this.isExecuting = true;
            console.log('✅ Execution marked as active');
            
            // Execute loop continuously with proper timing
            this.executeLoopWithTiming(parsedCode.loop);
            console.log('✅ Loop execution started');
            
        } catch (error) {
            console.error('❌ Code execution error:', error);
            this.hideCodeStatus();
            this.isExecuting = false;
            alert('Code execution error: ' + error.message);
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
        
        this.hideCodeStatus();
        console.log('Code execution stopped');
    }

    /**
     * Execute loop with proper Arduino-style timing
     */
    executeLoopWithTiming(loopCode) {
        let loopCount = 0;
        const maxLoops = 1000; // Increased limit for longer execution
        
        const executeLoopIteration = () => {
            if (!this.isExecuting || loopCount >= maxLoops) {
                this.hideCodeStatus();
                this.isExecuting = false;
                console.log('Loop execution stopped (max iterations reached or stopped)');
                return;
            }
            
            try {
                // Execute the loop code with proper timing
                this.executeLoopWithDelays(loopCode, () => {
                    // This callback is called when the loop iteration is complete
                    if (!this.isExecuting) return; // Check if execution was stopped
                    
                    // Update visual pins after each loop iteration
                    this.updateVisualPinsFromParser();
                    
                    loopCount++;
                    
                    // Update status with loop count
                    this.showCodeStatus(`⚡ Loop ${loopCount}/${maxLoops}`);
                    
                    // Schedule next loop iteration
                    const timeout = setTimeout(executeLoopIteration, 0);
                    this.executionTimeouts.push(timeout);
                });
                
            } catch (error) {
                console.error('Loop execution error:', error);
                this.hideCodeStatus();
                this.isExecuting = false;
            }
        };
        
        // Start the loop execution
        executeLoopIteration();
    }

    /**
     * Execute loop code with proper delay handling
     */
    executeLoopWithDelays(loopCode, onComplete) {
        const lines = loopCode.split('\n').filter(line => line.trim());
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
            currentLineIndex++;
            
            if (!line) {
                // Empty line, continue to next
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
                
                // Use setTimeout for delays to keep UI responsive
                const timeout = setTimeout(() => {
                    if (this.isExecuting) {
                        executeNextLine();
                    }
                }, ms);
                this.executionTimeouts.push(timeout);
                return;
            }
            
            // Execute non-delay commands immediately
            try {
                this.arduinoParser.executeLine(line);
                
                // Update visual pins immediately after each command
                this.updateVisualPinsFromParser();
                
                // Continue to next line immediately
                executeNextLine();
            } catch (error) {
                console.error(`Error executing line: ${line}`, error);
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
            if (pinState.pwm > 0 && pinState.pwm < 255) {
                // PWM mode (analogWrite with value between 0-255)
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
}

// UIManager will be initialized in app.js after all dependencies are loaded
