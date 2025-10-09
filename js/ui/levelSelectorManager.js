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
                    <p>Press L to toggle • Click level to load</p>
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
        
        // Add a test button for debugging (temporary)
        const testButton = document.createElement('button');
        testButton.textContent = '🔧 DEBUG: Toggle Level Menu';
        testButton.style.position = 'fixed';
        testButton.style.top = '10px';
        testButton.style.right = '10px';
        testButton.style.zIndex = '3000';
        testButton.style.padding = '10px';
        testButton.style.background = '#FF6B35';
        testButton.style.color = 'white';
        testButton.style.border = 'none';
        testButton.style.borderRadius = '5px';
        testButton.style.cursor = 'pointer';
        testButton.addEventListener('click', () => {
            console.log('🔧 Test button clicked');
            this.toggle();
        });
        document.body.appendChild(testButton);
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
            const success = this.gameFlowManager.loadLevel(levelId);
            if (success) {
                this.currentLevelId = levelId;
                this.updateCurrentLevelHighlight();
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
}

// Make globally available
window.LevelSelectorManager = LevelSelectorManager;
