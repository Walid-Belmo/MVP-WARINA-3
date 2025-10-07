/**
 * Component Management System
 * Handles LED and Motor components, connections, and visual updates
 */

class ComponentManager {
    constructor(gameState) {
        this.gameState = gameState;
    }

    /**
     * Add a new LED component
     */
    addLEDComponent() {
        const componentId = 'led_' + Date.now();
        const availablePins = this.gameState.getAvailablePins();
        
        if (availablePins.length === 0) {
            alert('No available pins! Disconnect a component first.');
            return;
        }

        const component = {
            id: componentId,
            type: 'LED',
            pin: null,
            connected: false
        };

        this.gameState.components.push(component);
        this.renderComponents();
    }

    /**
     * Add a new Motor component
     */
    addMotorComponent() {
        const componentId = 'motor_' + Date.now();
        const availablePins = this.gameState.getAvailablePins();
        
        if (availablePins.length === 0) {
            alert('No available pins! Disconnect a component first.');
            return;
        }

        const component = {
            id: componentId,
            type: 'MOTOR',
            pin: null,
            connected: false
        };

        this.gameState.components.push(component);
        this.renderComponents();
    }

    /**
     * Render all components in the grid
     */
    renderComponents() {
        const grid = document.getElementById('componentsGrid');
        if (!grid) return;
        
        grid.innerHTML = '';

        this.gameState.components.forEach(component => {
            const componentBox = document.createElement('div');
            componentBox.className = `component-box ${component.connected ? 'connected' : ''}`;
            componentBox.setAttribute('data-component-id', component.id);
            componentBox.onclick = () => this.toggleComponentConnection(component.id);

            let componentHTML = '';
            
            if (component.type === 'LED') {
                componentHTML = this.renderLEDComponent(component);
            } else if (component.type === 'MOTOR') {
                componentHTML = this.renderMotorComponent(component);
            }

            componentBox.innerHTML = componentHTML;
            grid.appendChild(componentBox);
        });

        this.updateConnectionLines();
    }

    /**
     * Render LED component HTML
     */
    renderLEDComponent(component) {
        const isLedOn = component.connected && this.gameState.pins[component.pin];
        const pwmValue = component.connected ? this.gameState.pwmValues[component.pin] : 0;
        const dutyCycle = component.connected ? this.gameState.dutyCycles[component.pin] : 0;
        
        // Calculate brightness based on PWM duty cycle
        let brightnessStyle = '';
        let brightnessClass = '';
        
        if (isLedOn && this.gameState.pinModes[component.pin] === 'PWM') {
            // PWM mode - brightness based on duty cycle
            const brightness = Math.max(0.3, dutyCycle / 100); // Minimum 30% brightness
            brightnessStyle = `filter: brightness(${brightness}); opacity: ${brightness};`;
            brightnessClass = 'pwm-brightness';
        } else if (isLedOn) {
            // Digital mode - full brightness
            brightnessStyle = 'transform: scale(1.2); filter: brightness(1.5);';
            brightnessClass = 'on';
        }
        
        return `
            <div class="component-icon led-icon ${brightnessClass}" style="${brightnessStyle}">
                💡
            </div>
            <div class="component-name">LED</div>
            <div class="component-pin ${component.connected ? 'connected' : ''}">
                ${component.connected ? `D${component.pin}` : 'Click to connect'}
            </div>
            ${component.connected && this.gameState.pinModes[component.pin] === 'PWM' ? `<div class="pwm-value">PWM: ${dutyCycle}%</div>` : ''}
        `;
    }

    /**
     * Render Motor component HTML
     */
    renderMotorComponent(component) {
        const pwmValue = component.connected ? this.gameState.pwmValues[component.pin] : 0;
        const speedClass = pwmValue > 170 ? 'fast' : pwmValue > 85 ? 'medium' : pwmValue > 0 ? 'slow' : '';
        
        return `
            <div class="component-icon motor-icon ${speedClass}">
                ⚙️
            </div>
            <div class="component-name">MOTOR</div>
            <div class="component-pin ${component.connected ? 'connected' : ''}">
                ${component.connected ? `D${component.pin}` : 'Click to connect'}
            </div>
            ${component.connected ? `<div class="pwm-value">PWM: ${pwmValue}</div>` : ''}
        `;
    }

    /**
     * Toggle component connection
     */
    toggleComponentConnection(componentId) {
        console.log(`Toggling connection for component ${componentId}`);
        const component = this.gameState.components.find(c => c.id === componentId);
        if (!component) {
            console.log(`Component ${componentId} not found`);
            return;
        }

        if (component.connected) {
            // Disconnect
            console.log(`Disconnecting component ${componentId} from pin ${component.pin}`);
            this.gameState.disconnectComponent(componentId);
        } else {
            // Connect to first available pin
            const availablePins = this.gameState.getAvailablePins();
            if (availablePins.length > 0) {
                const pin = availablePins[0];
                console.log(`Connecting component ${componentId} to pin ${pin}`);
                this.gameState.connectComponent(componentId, pin);
            } else {
                alert('No available pins!');
                return;
            }
        }

        this.renderComponents();
    }

    /**
     * Update connection lines between components and pins
     */
    updateConnectionLines() {
        const connectionLines = document.getElementById('connectionLines');
        if (!connectionLines) return;
        
        connectionLines.innerHTML = '';

        this.gameState.components.forEach(component => {
            if (component.connected) {
                const line = document.createElement('div');
                line.className = 'connection-line active';
                line.id = `line_${component.id}`;
                
                // Calculate line position
                const componentBox = document.querySelector(`[data-component-id="${component.id}"]`);
                const pinElement = document.querySelector(`.pin-circle[data-pin="${component.pin}"]`);
                
                if (componentBox && pinElement) {
                    const componentRect = componentBox.getBoundingClientRect();
                    const pinRect = pinElement.getBoundingClientRect();
                    const containerRect = document.querySelector('.left-panel').getBoundingClientRect();
                    
                    const startX = componentRect.left + componentRect.width / 2 - containerRect.left;
                    const startY = componentRect.top - containerRect.top;
                    const endX = pinRect.left + pinRect.width / 2 - containerRect.left;
                    const endY = pinRect.top + pinRect.height / 2 - containerRect.top;
                    
                    const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                    const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
                    
                    line.style.left = startX + 'px';
                    line.style.top = startY + 'px';
                    line.style.width = length + 'px';
                    line.style.transform = `rotate(${angle}deg)`;
                    line.style.transformOrigin = '0 0';
                }
                
                connectionLines.appendChild(line);
            }
        });
    }

    /**
     * Update component states based on pin states
     */
    updateComponentStates() {
        console.log('Updating component states...', this.gameState.components);
        this.gameState.components.forEach(component => {
            if (component.connected) {
                console.log(`Updating component ${component.id} on pin ${component.pin}, pin state: ${this.gameState.pins[component.pin]}`);
                
                // Try multiple selectors to find the component
                let componentBox = document.querySelector(`[data-component-id="${component.id}"]`);
                
                if (componentBox) {
                    if (component.type === 'LED') {
                        this.updateLEDState(component, componentBox);
                    } else if (component.type === 'MOTOR') {
                        this.updateMotorState(component, componentBox);
                    }
                } else {
                    console.log(`Component box not found for ${component.id}`);
                }
            }
        });
    }

    /**
     * Update LED component state
     */
    updateLEDState(component, componentBox) {
        const ledIcon = componentBox.querySelector('.led-icon');
        const pwmDisplay = componentBox.querySelector('.pwm-value');
        
        if (ledIcon) {
            console.log(`Found LED icon for component ${component.id}`);
            
            // Remove all brightness classes
            ledIcon.classList.remove('on', 'pwm-brightness');
            
            if (this.gameState.pins[component.pin]) {
                if (this.gameState.pinModes[component.pin] === 'PWM') {
                    // PWM mode - brightness based on duty cycle
                    const dutyCycle = this.gameState.dutyCycles[component.pin];
                    const brightness = Math.max(0.3, dutyCycle / 100);
                    ledIcon.classList.add('pwm-brightness');
                    ledIcon.style.filter = `brightness(${brightness})`;
                    ledIcon.style.opacity = brightness;
                    ledIcon.style.transform = 'scale(1)';
                    
                    // Update PWM display
                    if (pwmDisplay) {
                        pwmDisplay.textContent = `PWM: ${dutyCycle}%`;
                    }
                    
                    console.log(`LED ${component.id} PWM brightness: ${dutyCycle}%`);
                } else {
                    // Digital mode - full brightness
                    ledIcon.classList.add('on');
                    ledIcon.style.transform = 'scale(1.2)';
                    ledIcon.style.filter = 'brightness(1.5)';
                    ledIcon.style.opacity = '1';
                    console.log(`LED ${component.id} turned ON (digital)`);
                }
            } else {
                // LED is off
                ledIcon.style.transform = 'scale(1)';
                ledIcon.style.filter = 'brightness(0.3)';
                ledIcon.style.opacity = '0.3';
                console.log(`LED ${component.id} turned OFF`);
            }
        } else {
            console.log(`LED icon not found for component ${component.id}`);
        }
    }

    /**
     * Update Motor component state
     */
    updateMotorState(component, componentBox) {
        const motorIcon = componentBox.querySelector('.motor-icon');
        const pwmDisplay = componentBox.querySelector('.pwm-value');
        
        if (motorIcon) {
            console.log(`Found Motor icon for component ${component.id}`);
            const pwmValue = this.gameState.pwmValues[component.pin];
            
            // Remove all speed classes
            motorIcon.classList.remove('slow', 'medium', 'fast');
            
            // Add appropriate speed class based on PWM value
            if (pwmValue > 170) {
                motorIcon.classList.add('fast');
            } else if (pwmValue > 85) {
                motorIcon.classList.add('medium');
            } else if (pwmValue > 0) {
                motorIcon.classList.add('slow');
            }
            
            // Update PWM display
            if (pwmDisplay) {
                pwmDisplay.textContent = `PWM: ${pwmValue}`;
            }
            
            console.log(`Motor ${component.id} PWM: ${pwmValue}`);
        } else {
            console.log(`Motor icon not found for component ${component.id}`);
        }
    }
}

// Create global component manager instance
window.componentManager = new ComponentManager(window.gameState);
