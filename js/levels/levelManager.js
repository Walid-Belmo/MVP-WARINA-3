/**
 * Level Management System
 * Handles level loading, progression, and target sequence extraction
 */

class LevelManager {
    constructor() {
        this.currentLevel = null;
        this.currentLevelId = 1;
        this.targetSequence = null;
        this.isLevelLoaded = false;
    }

    /**
     * Load a specific level
     * @param {number} levelId - Level ID to load
     * @returns {boolean} - Whether level was loaded successfully
     */
    loadLevel(levelId) {
        console.log(`🎮 Loading level ${levelId}...`);
        
        const levelData = window.LevelDataHelper.getLevel(levelId);
        if (!levelData) {
            console.error(`❌ Level ${levelId} not found`);
            return false;
        }

        this.currentLevel = levelData;
        this.currentLevelId = levelId;
        this.isLevelLoaded = true;
        
        // Extract target sequence from level code
        this.extractTargetSequence();
        
        console.log(`✅ Level ${levelId} loaded: "${levelData.name}"`);
        console.log(`⏰ Time limit: ${levelData.timeLimit / 1000}s`);
        console.log(`📋 Target sequence: ${this.targetSequence.events.length} events`);
        
        return true;
    }

    /**
     * Extract target sequence from current level's code
     */
    extractTargetSequence() {
        if (!this.currentLevel) {
            console.error('❌ No level loaded');
            return;
        }

        try {
            // Parse the target code
            const parsedCode = window.arduinoParser.parseCode(this.currentLevel.targetCode);
            
            // Extract sequence using sequence extractor
            this.targetSequence = window.sequenceExtractor.extractSequence(parsedCode);
            
            console.log('🎯 Target sequence extracted:', {
                events: this.targetSequence.events.length,
                duration: this.targetSequence.totalDuration,
                isLooping: this.targetSequence.isLooping
            });
            
        } catch (error) {
            console.error('❌ Error extracting target sequence:', error);
            this.targetSequence = null;
        }
    }

    /**
     * Get the current level data
     * @returns {Object|null} - Current level data
     */
    getCurrentLevel() {
        return this.currentLevel;
    }

    /**
     * Get the target sequence for the current level
     * @returns {Object|null} - Target sequence
     */
    getTargetSequence() {
        return this.targetSequence;
    }

    /**
     * Get the next level ID
     * @returns {number|null} - Next level ID or null if no more levels
     */
    getNextLevelId() {
        return window.LevelDataHelper.getNextLevelId(this.currentLevelId);
    }

    /**
     * Get the previous level ID
     * @returns {number|null} - Previous level ID or null if no previous level
     */
    getPreviousLevelId() {
        return window.LevelDataHelper.getPreviousLevelId(this.currentLevelId);
    }

    /**
     * Advance to the next level
     * @returns {boolean} - Whether advancement was successful
     */
    advanceToNextLevel() {
        const nextLevelId = this.getNextLevelId();
        if (nextLevelId) {
            return this.loadLevel(nextLevelId);
        }
        return false;
    }

    /**
     * Go back to the previous level
     * @returns {boolean} - Whether going back was successful
     */
    goToPreviousLevel() {
        const previousLevelId = this.getPreviousLevelId();
        if (previousLevelId) {
            return this.loadLevel(previousLevelId);
        }
        return false;
    }

    /**
     * Get level information for display
     * @returns {Object} - Level info for UI
     */
    getLevelInfo() {
        if (!this.currentLevel) {
            return null;
        }

        return {
            id: this.currentLevel.id,
            name: this.currentLevel.name,
            description: this.currentLevel.description,
            timeLimit: this.currentLevel.timeLimit,
            timeLimitSeconds: Math.round(this.currentLevel.timeLimit / 1000),
            hint: this.currentLevel.hint,
            difficulty: this.currentLevel.difficulty,
            requiredPins: this.currentLevel.requiredPins,
            maxEvents: this.currentLevel.maxEvents,
            hasTargetSequence: this.targetSequence !== null,
            targetEventCount: this.targetSequence ? this.targetSequence.events.length : 0,
            targetDuration: this.targetSequence ? this.targetSequence.totalDuration : 0,
            isLooping: this.targetSequence ? this.targetSequence.isLooping : false
        };
    }

    /**
     * Get level statistics
     * @returns {Object} - Level statistics
     */
    getLevelStats() {
        if (!this.targetSequence) {
            return null;
        }

        const pinUsage = {};
        const eventTypes = { digital: 0, pwm: 0 };
        
        this.targetSequence.events.forEach(event => {
            pinUsage[event.pin] = (pinUsage[event.pin] || 0) + 1;
            eventTypes[event.type]++;
        });

        return {
            totalEvents: this.targetSequence.events.length,
            totalDuration: this.targetSequence.totalDuration,
            pinsUsed: Object.keys(pinUsage),
            pinUsage: pinUsage,
            eventTypes: eventTypes,
            isLooping: this.targetSequence.isLooping,
            averageEventInterval: this.targetSequence.events.length > 0 ? 
                this.targetSequence.totalDuration / this.targetSequence.events.length : 0
        };
    }

    /**
     * Check if current level is the last level
     * @returns {boolean} - Whether this is the last level
     */
    isLastLevel() {
        return this.getNextLevelId() === null;
    }

    /**
     * Check if current level is the first level
     * @returns {boolean} - Whether this is the first level
     */
    isFirstLevel() {
        return this.getPreviousLevelId() === null;
    }

    /**
     * Get level progression info
     * @returns {Object} - Progression information
     */
    getProgressionInfo() {
        const totalLevels = window.LevelDataHelper.getTotalLevels();
        const currentIndex = LEVELS.findIndex(level => level.id === this.currentLevelId);
        
        return {
            currentLevel: this.currentLevelId,
            totalLevels: totalLevels,
            progress: currentIndex + 1,
            progressPercentage: Math.round(((currentIndex + 1) / totalLevels) * 100),
            isFirst: this.isFirstLevel(),
            isLast: this.isLastLevel(),
            hasNext: this.getNextLevelId() !== null,
            hasPrevious: this.getPreviousLevelId() !== null
        };
    }

    /**
     * Reset level manager state
     */
    reset() {
        this.currentLevel = null;
        this.currentLevelId = 1;
        this.targetSequence = null;
        this.isLevelLoaded = false;
        console.log('🔄 Level manager reset');
    }

    /**
     * Get all available levels
     * @returns {Array} - All available levels
     */
    getAllLevels() {
        return window.LevelDataHelper.getAllLevels();
    }

    /**
     * Get levels by difficulty
     * @param {string} difficulty - Difficulty level
     * @returns {Array} - Levels matching difficulty
     */
    getLevelsByDifficulty(difficulty) {
        return window.LevelDataHelper.getLevelsByDifficulty(difficulty);
    }

    /**
     * Get level categories
     * @returns {Object} - Level categories
     */
    getCategories() {
        return window.LevelDataHelper.getCategories();
    }
}

// Create global level manager instance
window.levelManager = new LevelManager();
