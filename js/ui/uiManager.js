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
                this.runCode();
            });
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
    async runCode() {
        const code = this.codeEditor.getValue();
        console.log('Running code:', code);
        
        try {
            // Show status
            this.showCodeStatus('⚡ Parsing Code...');
            
            // Reset parser state
            this.arduinoParser.reset();
            
            // Parse the code
            const parsedCode = this.arduinoParser.parseCode(code);
            console.log('Parsed code:', parsedCode);
            
            // Show setup execution status
            this.showCodeStatus('⚡ Executing Setup...');
            
            // Execute setup once
            await this.arduinoParser.executeSetup(parsedCode.setup);
            
            // Update visual pins based on setup
            this.updateVisualPinsFromParser();
            
            // Show loop execution status
            this.showCodeStatus('⚡ Running Loop...');
            
            // Execute loop continuously (with a reasonable limit)
            let loopCount = 0;
            const maxLoops = 100; // Prevent infinite loops
            
            this.currentLoopInterval = setInterval(async () => {
                if (loopCount >= maxLoops) {
                    clearInterval(this.currentLoopInterval);
                    this.hideCodeStatus();
                    console.log('Loop execution stopped (max iterations reached)');
                    return;
                }
                
                try {
                    await this.arduinoParser.executeLoop(parsedCode.loop);
                    this.updateVisualPinsFromParser();
                    loopCount++;
                    
                    // Update status with loop count
                    this.showCodeStatus(`⚡ Loop ${loopCount}/${maxLoops}`);
                } catch (error) {
                    console.error('Loop execution error:', error);
                    clearInterval(this.currentLoopInterval);
                    this.hideCodeStatus();
                }
            }, 100); // Run loop every 100ms
            
        } catch (error) {
            console.error('Code execution error:', error);
            this.hideCodeStatus();
            alert('Code execution error: ' + error.message);
        }
    }

    /**
     * Reset the entire game
     */
    resetGame() {
        // Stop any running loops
        if (this.currentLoopInterval) {
            clearInterval(this.currentLoopInterval);
            this.currentLoopInterval = null;
            console.log('Stopped running loop');
        }
        
        // Hide code status
        this.hideCodeStatus();
        
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
        
        for (let pin = 8; pin <= 13; pin++) {
            const pinState = this.arduinoParser.getPinState(pin);
            
            console.log(`Pin ${pin} state:`, pinState);
            
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
            
            console.log(`Updated game state for pin ${pin}:`, {
                state: this.gameState.pins[pin],
                mode: this.gameState.pinModes[pin],
                pwm: this.gameState.pwmValues[pin],
                dutyCycle: this.gameState.dutyCycles[pin]
            });
            
            // Update visual representation with code-controlled flag
            this.pinManager.updatePinVisual(pin, true);
        }
        
        // Update component states
        this.componentManager.updateComponentStates();
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

// Create global UI manager instance
window.uiManager = new UIManager(
    window.gameState,
    window.pinManager,
    window.componentManager,
    window.arduinoParser,
    window.codeEditor
);
