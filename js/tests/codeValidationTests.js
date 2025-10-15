/**
 * Code Validation Feedback Tests
 * Tests the text glow feedback system for valid Arduino code
 */

class CodeValidationTests {
    constructor() {
        this.testResults = [];
        this.validationFeedback = null;
    }

    /**
     * Initialize test suite
     */
    init() {
        if (window.codeValidationFeedback) {
            this.validationFeedback = window.codeValidationFeedback;
            console.log('✅ Code validation tests initialized');
        } else {
            console.error('❌ CodeValidationFeedback not found');
        }
    }

    /**
     * Run all validation tests
     */
    async runAllTests() {
        console.log('🧪 Starting Code Validation Tests...');
        this.testResults = [];
        
        const tests = [
            { name: 'Valid Pin Operations', test: () => this.testValidPinOperations() },
            { name: 'Valid Timer Operations', test: () => this.testValidTimerOperations() },
            { name: 'Valid Function Declarations', test: () => this.testValidFunctionDeclarations() },
            { name: 'Valid Include Statements', test: () => this.testValidIncludeStatements() },
            { name: 'Invalid Code Rejection', test: () => this.testInvalidCodeRejection() },
            { name: 'Edge Cases', test: () => this.testEdgeCases() },
            { name: 'Visual Feedback Triggering', test: () => this.testVisualFeedbackTriggering() },
            { name: 'Sound Feedback Triggering', test: () => this.testSoundFeedbackTriggering() },
            { name: 'No Double Triggering', test: () => this.testNoDoubleTriggering() }
        ];

        for (const test of tests) {
            console.log(`\n🔍 Running: ${test.name}`);
            try {
                await test.test();
                this.testResults.push({ name: test.name, status: 'PASS', details: 'All assertions passed' });
                console.log(`✅ ${test.name}: PASSED`);
            } catch (error) {
                this.testResults.push({ name: test.name, status: 'FAIL', details: error.message });
                console.log(`❌ ${test.name}: FAILED - ${error.message}`);
            }
        }

        this.printTestSummary();
        return this.testResults;
    }

    /**
     * Test valid pin operations
     */
    testValidPinOperations() {
        const validPinOperations = [
            'pinMode(13, OUTPUT);',
            'pinMode(9, INPUT);',
            'pinMode(10, INPUT_PULLUP);',
            'digitalWrite(13, HIGH);',
            'digitalWrite(9, LOW);',
            'analogWrite(9, 128);',
            'analogWrite(10, 255);'
        ];

        validPinOperations.forEach(operation => {
            if (!this.validationFeedback.isValidCodeLine(operation)) {
                throw new Error(`Valid pin operation rejected: "${operation}"`);
            }
        });
    }

    /**
     * Test valid timer operations
     */
    testValidTimerOperations() {
        const validTimerOperations = [
            'Timer1.initialize(20000);',
            'Timer1.pwm(9, 512);',
            'Timer0.initialize();',
            'Timer0.pwm(9, 128);',
            'setDutyCycle(9, 50);'
        ];

        validTimerOperations.forEach(operation => {
            if (!this.validationFeedback.isValidCodeLine(operation)) {
                throw new Error(`Valid timer operation rejected: "${operation}"`);
            }
        });
    }

    /**
     * Test valid function declarations
     */
    testValidFunctionDeclarations() {
        const validFunctions = [
            'void setup() {',
            'void loop() {'
        ];

        validFunctions.forEach(func => {
            if (!this.validationFeedback.isValidCodeLine(func)) {
                throw new Error(`Valid function declaration rejected: "${func}"`);
            }
        });
    }

    /**
     * Test valid include statements
     */
    testValidIncludeStatements() {
        const validIncludes = [
            '#include <TimerOne.h>',
            '#include <TimerZero.h>',
            '#include <Servo.h>'
        ];

        validIncludes.forEach(include => {
            if (!this.validationFeedback.isValidCodeLine(include)) {
                throw new Error(`Valid include statement rejected: "${include}"`);
            }
        });
    }

    /**
     * Test invalid code rejection
     */
    testInvalidCodeRejection() {
        const invalidCode = [
            'pinMode(13, INVALID);',
            'digitalWrite(13, MEDIUM);',
            'invalidFunction();',
            'pinMode(13, OUTPUT', // Missing semicolon
            'digitalWrite(13, HIGH', // Missing semicolon
            '// This is a comment',
            '', // Empty line
            '{', // Just brace
            '}' // Just brace
        ];

        invalidCode.forEach(code => {
            if (this.validationFeedback.isValidCodeLine(code)) {
                throw new Error(`Invalid code accepted: "${code}"`);
            }
        });
    }

    /**
     * Test edge cases
     */
    testEdgeCases() {
        const edgeCases = [
            '  pinMode(13, OUTPUT);  ', // With whitespace
            '\tpinMode(13, OUTPUT);', // With tab
            'pinMode( 13 , OUTPUT );', // With spaces around parameters
            'delay(1000);', // Simple delay
            'delay(0);', // Zero delay
            'analogWrite(9, 0);', // Zero value
            'analogWrite(9, 255);' // Max value
        ];

        edgeCases.forEach(code => {
            if (!this.validationFeedback.isValidCodeLine(code)) {
                throw new Error(`Valid edge case rejected: "${code}"`);
            }
        });
    }

    /**
     * Test visual feedback triggering
     */
    testVisualFeedbackTriggering() {
        // Mock the visual effects manager
        const originalVisualEffectsManager = window.visualEffectsManager;
        let visualFeedbackTriggered = false;
        
        window.visualEffectsManager = {
            createTextGlowEffect: (lineNumber) => {
                visualFeedbackTriggered = true;
                console.log(`Visual feedback triggered for line ${lineNumber}`);
            }
        };

        // Test visual feedback
        this.validationFeedback.provideFeedback(1, 'pinMode(13, OUTPUT);');
        
        if (!visualFeedbackTriggered) {
            throw new Error('Visual feedback not triggered');
        }

        // Restore original
        window.visualEffectsManager = originalVisualEffectsManager;
    }

    /**
     * Test sound feedback triggering
     */
    testSoundFeedbackTriggering() {
        // Mock the sound effects manager
        const originalSoundManager = window.simpleSoundEffectsManager;
        let soundFeedbackTriggered = false;
        
        window.simpleSoundEffectsManager = {
            playValidCode: () => { soundFeedbackTriggered = true; },
            playTimerAction: () => { soundFeedbackTriggered = true; },
            playFunctionComplete: () => { soundFeedbackTriggered = true; }
        };

        // Test sound feedback
        this.validationFeedback.provideFeedback(1, 'pinMode(13, OUTPUT);');
        
        if (!soundFeedbackTriggered) {
            throw new Error('Sound feedback not triggered');
        }

        // Restore original
        window.simpleSoundEffectsManager = originalSoundManager;
    }

    /**
     * Test no double triggering
     */
    testNoDoubleTriggering() {
        // Reset validation state
        this.validationFeedback.lastValidatedLine = null;
        
        // Mock feedback methods
        let feedbackCount = 0;
        const originalProvideFeedback = this.validationFeedback.provideFeedback;
        this.validationFeedback.provideFeedback = () => { feedbackCount++; };

        // Simulate typing the same line multiple times
        this.validationFeedback.validateCurrentLine(null, 1, 'pinMode(13, OUTPUT);');
        this.validationFeedback.validateCurrentLine(null, 1, 'pinMode(13, OUTPUT);');
        this.validationFeedback.validateCurrentLine(null, 1, 'pinMode(13, OUTPUT);');

        // Should only trigger once
        if (feedbackCount !== 1) {
            throw new Error(`Double triggering detected: ${feedbackCount} triggers for same line`);
        }

        // Restore original method
        this.validationFeedback.provideFeedback = originalProvideFeedback;
    }

    /**
     * Test validation statistics
     */
    testValidationStats() {
        const stats = this.validationFeedback.getStats();
        
        if (typeof stats.enabled !== 'boolean') {
            throw new Error('Stats should include enabled boolean');
        }
        
        if (typeof stats.patternCount !== 'number') {
            throw new Error('Stats should include pattern count');
        }
        
        if (stats.patternCount <= 0) {
            throw new Error('Should have at least one validation pattern');
        }
    }

    /**
     * Test enable/disable functionality
     */
    testEnableDisable() {
        // Test disable
        this.validationFeedback.setEnabled(false);
        if (this.validationFeedback.isValidCodeLine('pinMode(13, OUTPUT);')) {
            throw new Error('Validation should be disabled');
        }

        // Test enable
        this.validationFeedback.setEnabled(true);
        if (!this.validationFeedback.isValidCodeLine('pinMode(13, OUTPUT);')) {
            throw new Error('Validation should be enabled');
        }
    }

    /**
     * Print test summary
     */
    printTestSummary() {
        console.log('\n📊 CODE VALIDATION TEST SUMMARY');
        console.log('================================');
        
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Success Rate: ${Math.round((passed / this.testResults.length) * 100)}%`);
        
        if (failed > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.testResults.filter(r => r.status === 'FAIL').forEach(test => {
                console.log(`  - ${test.name}: ${test.details}`);
            });
        }
        
        console.log('\n================================');
    }
}

// Make it globally available
window.CodeValidationTests = CodeValidationTests;
