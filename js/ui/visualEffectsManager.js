/**
 * Visual Effects Manager
 * Manages background effects, particles, and execution visual effects
 */

class VisualEffectsManager {
    constructor() {
        this.particleInterval = null;
        this.activeEffects = new Set();
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
     * Add screen shake effect
     * @param {string} intensity - 'light', 'medium', or 'strong'
     */
    addScreenShake(intensity = 'medium') {
        const body = document.body;
        const shakeClass = `screen-shake-${intensity}`;
        
        // Remove any existing shake
        body.classList.remove('screen-shake-light', 'screen-shake-medium', 'screen-shake-strong');
        
        // Add new shake
        body.classList.add(shakeClass);
        
        // Remove after animation completes
        setTimeout(() => {
            body.classList.remove(shakeClass);
        }, intensity === 'light' ? 300 : intensity === 'medium' ? 400 : 500);
    }

    /**
     * Create particle burst at specific coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} color - Particle color
     * @param {number} count - Number of particles
     */
    createParticleBurst(x, y, color = '#00D4FF', count = 8) {
        const burst = document.createElement('div');
        burst.className = 'particle-burst';
        burst.style.left = x + 'px';
        burst.style.top = y + 'px';
        burst.style.position = 'absolute';
        burst.style.pointerEvents = 'none';
        burst.style.zIndex = '1000';
        
        document.body.appendChild(burst);
        
        // Create particles
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.background = color;
            particle.style.position = 'absolute';
            particle.style.width = '6px';
            particle.style.height = '6px';
            particle.style.borderRadius = '50%';
            
            // Random direction and distance
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const distance = 30 + Math.random() * 40;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            
            particle.style.setProperty('--dx', dx + 'px');
            particle.style.setProperty('--dy', dy + 'px');
            particle.style.animation = 'particleFly 0.8s ease-out forwards';
            
            burst.appendChild(particle);
        }
        
        // Remove after animation
        setTimeout(() => {
            if (burst.parentNode) {
                burst.parentNode.removeChild(burst);
            }
        }, 800);
    }

    /**
     * Create confetti celebration
     */
    createConfetti() {
        const colors = ['#00D4FF', '#FF6B35', '#FFD700', '#8B5CF6', '#00FF88'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.width = (Math.random() * 8 + 4) + 'px';
                confetti.style.height = (Math.random() * 8 + 4) + 'px';
                
                document.body.appendChild(confetti);
                
                // Remove after animation
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 3000);
            }, i * 50);
        }
    }

    /**
     * Add pin click effects
     * @param {number} pin - Pin number
     * @param {HTMLElement} pinElement - Pin element
     */
    addPinClickEffects(pin, pinElement) {
        // Screen shake
        this.addScreenShake('light');
        
        // Pin bounce
        pinElement.classList.add('pin-bounce');
        setTimeout(() => {
            pinElement.classList.remove('pin-bounce');
        }, 300);
        
        // Ripple effect
        this.createPinRipple(pinElement);
        
        // Particle burst at pin location
        const rect = pinElement.getBoundingClientRect();
        this.createParticleBurst(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            '#00D4FF',
            6
        );
    }

    /**
     * Create pin ripple effect
     * @param {HTMLElement} pinElement - Pin element
     */
    createPinRipple(pinElement) {
        const ripple = document.createElement('div');
        ripple.className = 'pin-ripple';
        
        const rect = pinElement.getBoundingClientRect();
        ripple.style.left = (rect.left + rect.width / 2) + 'px';
        ripple.style.top = (rect.top + rect.height / 2) + 'px';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.marginLeft = '-10px';
        ripple.style.marginTop = '-10px';
        
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    /**
     * Play win celebration effects
     */
    playWinCelebration() {
        // Strong screen shake
        this.addScreenShake('strong');
        
        // Confetti
        this.createConfetti();
        
        // Pin celebration animation
        const pins = document.querySelectorAll('.pin-circle');
        pins.forEach((pin, index) => {
            setTimeout(() => {
                pin.classList.add('pin-win-celebration');
                setTimeout(() => {
                    pin.classList.remove('pin-win-celebration');
                }, 2000);
            }, index * 100);
        });
    }

    /**
     * Play cascade effect across pins
     */
    playCascadeEffect() {
        const pins = document.querySelectorAll('.pin-circle');
        pins.forEach((pin, index) => {
            setTimeout(() => {
                pin.classList.add('pin-cascade');
                setTimeout(() => {
                    pin.classList.remove('pin-cascade');
                }, 400);
            }, index * 150);
        });
    }

    /**
     * Play suspense effect during validation delay
     */
    playSuspenseEffect() {
        const pins = document.querySelectorAll('.pin-circle');
        pins.forEach(pin => {
            pin.classList.add('pin-suspense');
        });
    }

    /**
     * Stop suspense effect
     */
    stopSuspenseEffect() {
        const pins = document.querySelectorAll('.pin-circle');
        pins.forEach(pin => {
            pin.classList.remove('pin-suspense');
        });
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
            pin.classList.remove('target-animation', 'pin-bounce', 'pin-cascade', 'pin-win-celebration', 'pin-suspense');
        });
        
        // Remove screen shake
        document.body.classList.remove('screen-shake-light', 'screen-shake-medium', 'screen-shake-strong');
        
        // Clear active effects
        this.activeEffects.clear();
    }
}

// Create global instance
window.visualEffectsManager = new VisualEffectsManager();

