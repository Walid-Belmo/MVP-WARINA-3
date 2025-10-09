/**
 * Simple Audio Manager
 * Plays continuous background music throughout the game
 * Easy to modify and maintain
 */

class AudioManager {
    constructor() {
        // Configuration - Easy to modify
        this.MUSIC_FILE = 'music/background.mp3.mp3';  // Change this to your music file name
        this.DEFAULT_VOLUME = 0.3;  // Volume level (0.0 to 1.0) - adjust as needed
        
        // Audio state
        this.backgroundMusic = null;
        this.enabled = true;
        this.volume = this.DEFAULT_VOLUME;
    }

    /**
     * Initialize the audio manager
     * Call this when the game starts
     */
    init() {
        console.log('🎵 Initializing Audio Manager...');
        
        // Create audio element for background music
        this.backgroundMusic = new Audio(this.MUSIC_FILE);
        this.backgroundMusic.loop = true;  // Loop continuously
        this.backgroundMusic.volume = this.volume;
        this.backgroundMusic.preload = 'auto';
        
        // Handle errors gracefully
        this.backgroundMusic.addEventListener('error', (e) => {
            console.warn(`⚠️ Failed to load music file: ${this.MUSIC_FILE}`);
            console.warn('Make sure the music file exists in the music/ folder');
        });
        
        // Load settings from browser storage
        this.loadSettings();
        
        console.log('✅ Audio Manager initialized');
    }

    /**
     * Start playing background music
     * Call this when you want the music to start
     */
    play() {
        if (!this.enabled || !this.backgroundMusic) {
            return;
        }
        
        console.log('🎵 Playing background music');
        
        // Play music (browsers may block autoplay, so we handle it)
        this.backgroundMusic.play()
            .catch(error => {
                console.warn('⚠️ Autoplay blocked. Music will start on user interaction.');
            });
    }

    /**
     * Stop playing background music
     */
    stop() {
        if (!this.backgroundMusic) {
            return;
        }
        
        console.log('🎵 Stopping background music');
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;  // Reset to beginning
    }

    /**
     * Pause background music (can be resumed from same position)
     */
    pause() {
        if (!this.backgroundMusic) {
            return;
        }
        
        console.log('🎵 Pausing background music');
        this.backgroundMusic.pause();
    }

    /**
     * Resume background music from where it was paused
     */
    resume() {
        if (!this.enabled || !this.backgroundMusic) {
            return;
        }
        
        console.log('🎵 Resuming background music');
        this.backgroundMusic.play()
            .catch(error => {
                console.warn('⚠️ Failed to resume music:', error);
            });
    }

    /**
     * Set volume level
     * @param {number} volume - Volume level from 0.0 (silent) to 1.0 (full volume)
     */
    setVolume(volume) {
        // Clamp volume between 0 and 1
        this.volume = Math.max(0, Math.min(1, volume));
        
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.volume;
        }
        
        this.saveSettings();
        console.log(`🔊 Volume set to ${Math.round(this.volume * 100)}%`);
    }

    /**
     * Toggle music on/off
     * @returns {boolean} New enabled state (true = on, false = off)
     */
    toggle() {
        this.enabled = !this.enabled;
        
        if (this.enabled) {
            this.play();
        } else {
            this.pause();
        }
        
        this.saveSettings();
        console.log(`🎵 Music ${this.enabled ? 'enabled' : 'disabled'}`);
        
        return this.enabled;
    }

    /**
     * Check if music is currently playing
     * @returns {boolean}
     */
    isPlaying() {
        return this.backgroundMusic && 
               !this.backgroundMusic.paused && 
               this.backgroundMusic.currentTime > 0;
    }

    /**
     * Save settings to browser local storage
     */
    saveSettings() {
        try {
            localStorage.setItem('audioEnabled', this.enabled);
            localStorage.setItem('audioVolume', this.volume);
        } catch (error) {
            console.warn('⚠️ Failed to save audio settings:', error);
        }
    }

    /**
     * Load settings from browser local storage
     */
    loadSettings() {
        try {
            const enabled = localStorage.getItem('audioEnabled');
            const volume = localStorage.getItem('audioVolume');
            
            if (enabled !== null) {
                this.enabled = enabled === 'true';
            }
            
            if (volume !== null) {
                this.setVolume(parseFloat(volume));
            }
            
            console.log(`🎵 Loaded settings: ${this.enabled ? 'enabled' : 'disabled'}, volume: ${Math.round(this.volume * 100)}%`);
        } catch (error) {
            console.warn('⚠️ Failed to load audio settings:', error);
        }
    }

    /**
     * Get current audio status
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            enabled: this.enabled,
            volume: this.volume,
            isPlaying: this.isPlaying(),
            musicFile: this.MUSIC_FILE
        };
    }
}

// Create global audio manager instance
window.audioManager = new AudioManager();
