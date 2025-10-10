/**
 * Simple Sound Effects Manager
 * Uses HTML5 Audio for more reliable sound effects
 */

class SimpleSoundEffectsManager {
    constructor() {
        // Sound effect settings
        this.enabled = true;
        this.volume = 0.3; // 30% volume for sound effects
        
        // Create audio elements for different sounds
        this.sounds = {
            click: this.createAudioElement(800, 0.1), // High pitch click
            success: this.createAudioElement(523, 0.3), // Success tone
            error: this.createAudioElement(300, 0.4), // Error tone
            gameStart: this.createAudioElement(440, 0.5), // Game start
            componentAdd: this.createAudioElement(600, 0.2), // Component add
            codeExecution: this.createAudioElement(500, 0.15), // Code execution
            modalOpen: this.createAudioElement(350, 0.2), // Modal open
            modalClose: this.createAudioElement(250, 0.15) // Modal close
        };
        
        // Load settings from browser storage
        this.loadSettings();
    }

    /**
     * Create an audio element with a specific frequency
     */
    createAudioElement(frequency, duration) {
        // Create a data URL for a simple tone
        const sampleRate = 44100;
        const samples = Math.floor(sampleRate * duration);
        const buffer = new ArrayBuffer(44 + samples * 2);
        const view = new DataView(buffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + samples * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, samples * 2, true);
        
        // Generate sine wave
        for (let i = 0; i < samples; i++) {
            const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.1;
            view.setInt16(44 + i * 2, sample * 32767, true);
        }
        
        const blob = new Blob([buffer], { type: 'audio/wav' });
        const audio = new Audio();
        audio.src = URL.createObjectURL(blob);
        audio.volume = this.volume;
        audio.preload = 'auto';
        
        return audio;
    }

    /**
     * Play a button click sound
     */
    playButtonClick() {
        if (!this.enabled) return;
        this.playSound('click');
    }

    /**
     * Play a success sound
     */
    playSuccess() {
        if (!this.enabled) return;
        this.playSound('success');
    }

    /**
     * Play an error sound
     */
    playError() {
        if (!this.enabled) return;
        this.playSound('error');
    }

    /**
     * Play a game start sound
     */
    playGameStart() {
        if (!this.enabled) return;
        this.playSound('gameStart');
    }

    /**
     * Play a component add sound
     */
    playComponentAdd() {
        if (!this.enabled) return;
        this.playSound('componentAdd');
    }

    /**
     * Play a code execution sound
     */
    playCodeExecution() {
        if (!this.enabled) return;
        this.playSound('codeExecution');
    }

    /**
     * Play a modal open sound
     */
    playModalOpen() {
        if (!this.enabled) return;
        this.playSound('modalOpen');
    }

    /**
     * Play a modal close sound
     */
    playModalClose() {
        if (!this.enabled) return;
        this.playSound('modalClose');
    }

    /**
     * Play a specific sound
     */
    playSound(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;
        
        try {
            const audio = this.sounds[soundName].cloneNode();
            audio.volume = this.volume;
            audio.play().catch(error => {
                console.warn('⚠️ Sound play failed:', error);
            });
        } catch (error) {
            console.warn('⚠️ Sound error:', error);
        }
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
            audioSupported: true
        };
    }
}

// Create global sound effects manager instance
window.soundEffectsManager = new SimpleSoundEffectsManager();

