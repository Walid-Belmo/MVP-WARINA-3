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
        this.uiManager = window.uiManager;
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
        
        // Initialize UI
        this.uiManager.init();
        
        // Initialize pins
        this.pinManager.initializePins();
        
        // Test pins after a short delay
        setTimeout(() => {
            this.uiManager.testPins();
        }, 1000);
        
        // Make global functions available for HTML onclick handlers
        this.setupGlobalFunctions();
        
        console.log('✅ Arduino Learning Game initialized successfully!');
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
