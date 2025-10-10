/**
 * Sound Effects Manager
 * Handles all button clicks and game sound effects
 */

class SoundEffectsManager {
    constructor() {
        // Sound effect settings
        this.enabled = true;
        this.volume = 0.3; // 30% volume for sound effects
        
        // Create audio context for generating sounds
        this.audioContext = null;
        this.initAudioContext();
        
        // Load settings from browser storage
        this.loadSettings();
    }

    /**
     * Initialize Web Audio API context
     */
    initAudioContext() {
        // Audio context will be created on first user interaction
        this.audioContext = null;
    }

    /**
     * Ensure audio context is initialized (call on first user interaction)
     */
    ensureAudioContext() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('🔊 Audio context initialized');
            } catch (error) {
                console.warn('⚠️ Web Audio API not supported:', error);
            }
        }
        return this.audioContext;
    }

    /**
     * Play a button click sound
     */
    playButtonClick() {
        if (!this.enabled) return;
        
        const audioContext = this.ensureAudioContext();
        if (!audioContext) return;
        
        this.playTone(800, 0.1, 'sine'); // High pitch click
    }

    /**
     * Play a success sound
     */
    playSuccess() {
        if (!this.enabled) return;
        
        const audioContext = this.ensureAudioContext();
        if (!audioContext) return;
        
        // Play ascending chord
        this.playTone(523, 0.2, 'sine'); // C5
        setTimeout(() => this.playTone(659, 0.2, 'sine'), 100); // E5
        setTimeout(() => this.playTone(784, 0.3, 'sine'), 200); // G5
    }

    /**
     * Play an error sound
     */
    playError() {
        if (!this.enabled) return;
        
        const audioContext = this.ensureAudioContext();
        if (!audioContext) return;
        
        // Play descending tone
        this.playTone(400, 0.3, 'sawtooth'); // Low buzz
    }

    /**
     * Play a game start sound
     */
    playGameStart() {
        if (!this.enabled) return;
        
        const audioContext = this.ensureAudioContext();
        if (!audioContext) return;
        
        // Play game start fanfare
        this.playTone(440, 0.2, 'sine'); // A4
        setTimeout(() => this.playTone(554, 0.2, 'sine'), 150); // C#5
        setTimeout(() => this.playTone(659, 0.4, 'sine'), 300); // E5
    }

    /**
     * Play a timer tick sound
     */
    playTimerTick() {
        if (!this.enabled) return;
        
        const audioContext = this.ensureAudioContext();
        if (!audioContext) return;
        
        this.playTone(1000, 0.05, 'sine'); // Quick tick
    }

    /**
     * Play a component add sound
     */
    playComponentAdd() {
        if (!this.enabled) return;
        
        const audioContext = this.ensureAudioContext();
        if (!audioContext) return;
        
        this.playTone(600, 0.15, 'triangle'); // Pleasant beep
    }

    /**
     * Play a code execution sound
     */
    playCodeExecution() {
        if (!this.enabled) return;
        
        const audioContext = this.ensureAudioContext();
        if (!audioContext) return;
        
        this.playTone(500, 0.1, 'square'); // Digital sound
    }

    /**
     * Play a modal open sound
     */
    playModalOpen() {
        if (!this.enabled) return;
        
        const audioContext = this.ensureAudioContext();
        if (!audioContext) return;
        
        this.playTone(300, 0.2, 'sine'); // Low whoosh
    }

    /**
     * Play a modal close sound
     */
    playModalClose() {
        if (!this.enabled) return;
        
        const audioContext = this.ensureAudioContext();
        if (!audioContext) return;
        
        this.playTone(200, 0.15, 'sine'); // Lower whoosh
    }

    /**
     * Play a tone using Web Audio API
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {string} waveType - Type of waveform
     */
    playTone(frequency, duration, waveType = 'sine') {
        const audioContext = this.ensureAudioContext();
        if (!audioContext) return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = waveType;

        // Set volume envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }

    /**
     * Toggle sound effects on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        this.saveSettings();
        console.log(`🔊 Sound effects ${this.enabled ? 'enabled' : 'disabled'}`);
        return this.enabled;
    }

    /**
     * Set volume for sound effects
     * @param {number} volume - Volume from 0.0 to 1.0
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
        console.log(`🔊 Sound effects volume: ${Math.round(this.volume * 100)}%`);
    }

    /**
     * Save settings to browser storage
     */
    saveSettings() {
        try {
            localStorage.setItem('soundEffectsEnabled', this.enabled);
            localStorage.setItem('soundEffectsVolume', this.volume);
        } catch (error) {
            console.warn('⚠️ Failed to save sound settings:', error);
        }
    }

    /**
     * Load settings from browser storage
     */
    loadSettings() {
        try {
            const enabled = localStorage.getItem('soundEffectsEnabled');
            const volume = localStorage.getItem('soundEffectsVolume');
            
            if (enabled !== null) {
                this.enabled = enabled === 'true';
            }
            
            if (volume !== null) {
                this.setVolume(parseFloat(volume));
            }
        } catch (error) {
            console.warn('⚠️ Failed to load sound settings:', error);
        }
    }

    /**
     * Get current sound effects status
     */
    getStatus() {
        return {
            enabled: this.enabled,
            volume: this.volume,
            audioContextSupported: !!this.audioContext
        };
    }
}

// Create global sound effects manager instance
window.soundEffectsManager = new SoundEffectsManager();
