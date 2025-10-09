/**
 * Main Application Entry Point
 * Initializes the Arduino Learning Game with modular architecture
 */

class ArduinoLearningGame {
    constructor() {
        // Core systems
        this.gameState = window.gameState;
        this.pinManager = window.pinManager;
        this.componentManager = window.componentManager;
        this.arduinoParser = window.arduinoParser;
        this.codeEditor = window.codeEditor;
        
        // UI Manager (coordinator)
        this.uiManager = null;
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
        
        // Verify all dependencies are loaded
        if (!this.verifyDependencies()) {
            console.error('❌ Missing required dependencies');
            return;
        }
        
        // Initialize UIManager (which will initialize all sub-managers)
        this.uiManager = new UIManager(
            this.gameState,
            this.pinManager,
            this.componentManager,
            this.arduinoParser,
            this.codeEditor
        );
        
        // Make UIManager globally available for HTML onclick handlers
        window.uiManager = this.uiManager;
        
        // Initialize UI and all sub-systems
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
        this.logModuleStatus();
    }

    /**
     * Verify all required dependencies are loaded
     */
    verifyDependencies() {
        const required = [
            'gameState',
            'pinManager',
            'arduinoParser',
            'componentManager',
            'codeEditor',
            'levelManager',
            'sequenceExtractor',
            'sequenceValidator',
            'timerManager',
            'targetAnimationPlayer',
            'executionRecorder',
            'modalManager',
            'visualEffectsManager'
        ];
        
        const missing = [];
        
        for (const dep of required) {
            if (!window[dep]) {
                missing.push(dep);
            }
        }
        
        if (missing.length > 0) {
            console.error('❌ Missing dependencies:', missing);
            return false;
        }
        
        return true;
    }

    /**
     * Log status of all modules
     */
    logModuleStatus() {
        console.log('📦 Module Status:');
        console.log('  ✅ Core Systems:');
        console.log('    - GameState');
        console.log('    - PinManager');
        console.log('    - ArduinoParser');
        console.log('    - ComponentManager');
        console.log('  ✅ Execution Systems:');
        console.log('    - CodeExecutor');
        console.log('    - ExecutionRecorder');
        console.log('  ✅ Game Flow:');
        console.log('    - GameFlowManager');
        console.log('    - ValidationManager');
        console.log('    - LevelManager');
        console.log('  ✅ UI Systems:');
        console.log('    - UIManager (Coordinator)');
        console.log('    - EventManager');
        console.log('    - ModalManager');
        console.log('    - VisualEffectsManager');
        console.log('    - CodeEditor');
        console.log('    - TimerManager');
        console.log('    - TargetAnimationPlayer');
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
