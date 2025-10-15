/**
 * Level Selector Manager
 * Debug menu for quick navigation between all levels
 */

class LevelSelectorManager {
    constructor(gameFlowManager) {
        this.gameFlowManager = gameFlowManager;
        this.isVisible = false;
        this.menuElement = null;
        this.currentLevelId = 1;
    }
    
    /**
     * Initialize the level selector
     */
    init() {
        console.log('🔧 Initializing Level Selector Manager...');
        this.createMenuHTML();
        this.setupEventListeners();
        this.hide(); // Start hidden
        console.log('🔧 Level Selector Manager initialized');
        console.log('🔧 Menu element created:', this.menuElement);
    }
    
    /**
     * Create the menu HTML structure
     */
    createMenuHTML() {
        // Create main menu container
        this.menuElement = document.createElement('div');
        this.menuElement.id = 'debug-level-menu';
        this.menuElement.className = 'debug-level-menu';
        
        // Create menu content
        this.menuElement.innerHTML = `
            <div class="debug-menu-content">
                <div class="debug-menu-header">
                    <h3>🔧 DEBUG: LEVEL SELECTOR</h3>
                    <p>Click level to load</p>
                </div>

                <div class="debug-menu-section playground-section">
                    <h4>🎮 Free Play Mode</h4>
                    <div class="playground-button-container">
                        <button class="playground-mode-button" id="playground-mode-button">
                            <div class="playground-icon">🎮</div>
                            <div class="playground-title">Playground Mode</div>
                            <div class="playground-description">Code freely without timers or validation</div>
                        </button>
                    </div>
                </div>

                <div class="debug-menu-section">
                    <h4>Beginner Levels (1-7, 10)</h4>
                    <div class="level-buttons-container" id="beginner-levels">
                        <!-- Beginner level buttons will be added here -->
                    </div>
                </div>

                <div class="debug-menu-section">
                    <h4>Intermediate Levels (8-9, 11-15)</h4>
                    <div class="level-buttons-container" id="intermediate-levels">
                        <!-- Intermediate level buttons will be added here -->
                    </div>
                </div>

                <div class="debug-menu-footer">
                    <button class="close-menu-btn" id="close-level-menu">Close Menu</button>
                </div>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(this.menuElement);
        
        // Create level buttons
        this.createLevelButtons();
        
    }
    
    /**
     * Create level buttons for all 15 levels
     */
    createLevelButtons() {
        const beginnerContainer = document.getElementById('beginner-levels');
        const intermediateContainer = document.getElementById('intermediate-levels');
        
        // Get all levels from level data
        const allLevels = window.LevelDataHelper.getAllLevels();
        
        allLevels.forEach(level => {
            const button = document.createElement('button');
            button.className = `level-button ${level.difficulty}`;
            button.textContent = level.id;
            button.title = `${level.name}: ${level.description}`;
            button.dataset.levelId = level.id;
            
            // Add click handler
            button.addEventListener('click', () => {
                this.loadLevel(level.id);
            });
            
            // Add to appropriate container based on difficulty
            if (level.difficulty === 'beginner') {
                beginnerContainer.appendChild(button);
            } else {
                intermediateContainer.appendChild(button);
            }
        });
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Playground mode button
        const playgroundBtn = document.getElementById('playground-mode-button');
        if (playgroundBtn) {
            playgroundBtn.addEventListener('click', () => {
                this.activatePlaygroundMode();
            });
        }

        // Close button
        const closeBtn = document.getElementById('close-level-menu');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // Click outside to close
        this.menuElement.addEventListener('click', (e) => {
            if (e.target === this.menuElement) {
                this.hide();
            }
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });

        // NOTE: We don't set a callback here to avoid overwriting UIManager's callback
        // Instead, we update the current level whenever the menu is shown
    }
    
    /**
     * Toggle menu visibility
     */
    toggle() {
        this.isVisible ? this.hide() : this.show();
    }
    
    /**
     * Show the menu
     */
    show() {
        console.log('🔧 Showing level selector menu...');
        if (this.menuElement) {
            this.menuElement.style.display = 'flex';
            this.isVisible = true;
            
            // Update current level from gameFlowManager
            if (this.gameFlowManager && this.gameFlowManager.getCurrentLevel()) {
                this.currentLevelId = this.gameFlowManager.getCurrentLevel().id;
            }
            
            this.updateCurrentLevelHighlight();
            console.log('🔧 Level selector menu opened');
        } else {
            console.error('❌ Menu element not found');
        }
    }
    
    /**
     * Hide the menu
     */
    hide() {
        console.log('🔧 Hiding level selector menu...');
        if (this.menuElement) {
            this.menuElement.style.display = 'none';
            this.isVisible = false;
            console.log('🔧 Level selector menu closed');
        } else {
            console.error('❌ Menu element not found');
        }
    }
    
    /**
     * Load a specific level
     * @param {number} levelId - Level ID to load
     */
    loadLevel(levelId) {
        console.log(`🔧 Debug: Loading level ${levelId}`);

        if (this.gameFlowManager) {
            // Disable playground mode if active
            if (this.gameFlowManager.isInPlaygroundMode()) {
                this.gameFlowManager.disablePlaygroundMode();
                if (window.uiManager) {
                    window.uiManager.updatePlaygroundModeUI(false);
                }
            }

            const success = this.gameFlowManager.loadLevel(levelId);
            if (success) {
                this.currentLevelId = levelId;
                this.updateCurrentLevelHighlight();
                this.updatePlaygroundHighlight();
                // Optionally close menu after loading
                // this.hide();
            } else {
                console.error(`❌ Failed to load level ${levelId}`);
            }
        } else {
            console.error('❌ GameFlowManager not available');
        }
    }
    
    /**
     * Update current level highlight
     */
    updateCurrentLevelHighlight() {
        // Remove active class from all buttons
        const allButtons = this.menuElement.querySelectorAll('.level-button');
        allButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        // Add active class to current level
        const currentButton = this.menuElement.querySelector(`[data-level-id="${this.currentLevelId}"]`);
        if (currentButton) {
            currentButton.classList.add('active');
        }
    }
    
    /**
     * Get current level ID
     * @returns {number} Current level ID
     */
    getCurrentLevelId() {
        return this.currentLevelId;
    }
    
    /**
     * Check if menu is visible
     * @returns {boolean} Whether menu is visible
     */
    isMenuVisible() {
        return this.isVisible;
    }
    
    /**
     * Update current level and highlight (called from UIManager)
     * @param {number} levelId - Level ID to set as current
     */
    updateCurrentLevel(levelId) {
        this.currentLevelId = levelId;
        this.updateCurrentLevelHighlight();
    }

    /**
     * Activate playground mode
     */
    activatePlaygroundMode() {
        console.log('🎮 Activating playground mode from level selector...');

        if (this.gameFlowManager) {
            // Enable playground mode
            this.gameFlowManager.enablePlaygroundMode();

            // Update UI via UIManager
            if (window.uiManager) {
                window.uiManager.updatePlaygroundModeUI(true);
                window.uiManager.updateGameButtons();
            }

            // Update playground button highlight
            this.updatePlaygroundHighlight();

            // Close the menu
            this.hide();

            console.log('✅ Playground mode activated');
        } else {
            console.error('❌ GameFlowManager not available');
        }
    }

    /**
     * Update playground button highlight
     */
    updatePlaygroundHighlight() {
        const playgroundBtn = document.getElementById('playground-mode-button');
        const isPlaygroundMode = this.gameFlowManager?.isInPlaygroundMode();

        if (playgroundBtn) {
            if (isPlaygroundMode) {
                playgroundBtn.classList.add('active');
            } else {
                playgroundBtn.classList.remove('active');
            }
        }

        // Remove active from level buttons when playground is active
        if (isPlaygroundMode) {
            const allButtons = this.menuElement.querySelectorAll('.level-button');
            allButtons.forEach(button => {
                button.classList.remove('active');
            });
        }
    }

    /**
     * Override show method to update playground highlight
     */
    show() {
        console.log('🔧 Showing level selector menu...');
        if (this.menuElement) {
            this.menuElement.style.display = 'flex';
            this.isVisible = true;

            // Update current level from gameFlowManager
            if (this.gameFlowManager && this.gameFlowManager.getCurrentLevel()) {
                this.currentLevelId = this.gameFlowManager.getCurrentLevel().id;
            }

            this.updateCurrentLevelHighlight();
            this.updatePlaygroundHighlight();
            console.log('🔧 Level selector menu opened');
        } else {
            console.error('❌ Menu element not found');
        }
    }
}

// Make globally available
window.LevelSelectorManager = LevelSelectorManager;
