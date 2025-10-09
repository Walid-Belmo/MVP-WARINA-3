/**
 * Visual Effects Manager
 * Manages background effects, particles, and execution visual effects
 */

class VisualEffectsManager {
    constructor() {
        this.particleInterval = null;
    }

    /**
     * Initialize all visual effects
     */
    init() {
        this.startParticleSystem();
        this.addMouseInteraction();
    }

    /**
     * Start dynamic particle system
     */
    startParticleSystem() {
        // Create dynamic particles periodically
        this.particleInterval = setInterval(() => {
            this.createDynamicParticle();
        }, 2000);
    }

    /**
     * Stop particle system
     */
    stopParticleSystem() {
        if (this.particleInterval) {
            clearInterval(this.particleInterval);
            this.particleInterval = null;
        }
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
     * Add visual effects for player code execution
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
     * Create event flash effect
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
     * Create timing marker
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
     * Highlight elapsed timer on event
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
     * Clear all visual effects
     */
    clearEffects() {
        // Remove all event flashes
        document.querySelectorAll('.event-flash').forEach(el => el.remove());
        
        // Remove all timing markers
        document.querySelectorAll('.timing-marker').forEach(el => el.remove());
        
        // Remove animation classes from pins
        document.querySelectorAll('.pin-circle').forEach(pin => {
            pin.classList.remove('target-animation');
        });
    }
}

// Create global instance
window.visualEffectsManager = new VisualEffectsManager();

