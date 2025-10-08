/**
 * Main Application Entry Point
 * Initializes the Arduino Learning Game
 */

class ArduinoLearningGame {
    constructor() {
        this.gameState = window.gameState;
        this.pinManager = window.pinManager;
        this.componentManager = window.componentManager;
        this.arduinoParser = window.arduinoParser;
        this.codeEditor = window.codeEditor;
        this.uiManager = null; // Will be initialized after all dependencies are ready
    }

    /**
     * Initialize the application
     */
    init() {
        console.log('🚀 Initializing Arduino Learning Game...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.start();
            });
        } else {
            this.start();
        }
    }

    /**
     * Start the application
     */
    start() {
        console.log('🎮 Starting Arduino Learning Game...');
        
        // Initialize UIManager now that all dependencies are ready
        this.uiManager = new UIManager(
            this.gameState,
            this.pinManager,
            this.componentManager,
            this.arduinoParser,
            this.codeEditor
        );
        
        // Make UIManager globally available
        window.uiManager = this.uiManager;
        
        // Initialize UI
        this.uiManager.init();
        
        // Initialize pins
        this.pinManager.initializePins();
        
        // Initialize game systems
        this.initializeGameSystems();
        
        // Test pins after a short delay
        setTimeout(() => {
            this.uiManager.testPins();
        }, 1000);
        
        // Make global functions available for HTML onclick handlers
        this.setupGlobalFunctions();
        
        console.log('✅ Arduino Learning Game initialized successfully!');
    }

    /**
     * Initialize game systems
     */
    initializeGameSystems() {
        console.log('🎯 Initializing game systems...');
        
        // Initialize level manager
        if (window.levelManager) {
            console.log('✅ Level manager ready');
        } else {
            console.error('❌ Level manager not available');
        }
        
        // Initialize sequence extractor
        if (window.sequenceExtractor) {
            console.log('✅ Sequence extractor ready');
        } else {
            console.error('❌ Sequence extractor not available');
        }
        
        // Initialize sequence validator
        if (window.sequenceValidator) {
            console.log('✅ Sequence validator ready');
        } else {
            console.error('❌ Sequence validator not available');
        }
        
        // Initialize timer manager
        if (window.timerManager) {
            console.log('✅ Timer manager ready');
        } else {
            console.error('❌ Timer manager not available');
        }
        
        // Initialize target animation player
        if (window.targetAnimationPlayer) {
            console.log('✅ Target animation player ready');
        } else {
            console.error('❌ Target animation player not available');
        }
        
        console.log('🎯 Game systems initialized');
    }

    /**
     * Setup global functions for HTML onclick handlers
     */
    setupGlobalFunctions() {
        // Make component functions globally available
        window.addLEDComponent = () => {
            this.componentManager.addLEDComponent();
        };
        
        window.addMotorComponent = () => {
            this.componentManager.addMotorComponent();
        };
    }
}

// Initialize the application when the script loads
const app = new ArduinoLearningGame();
app.init();
