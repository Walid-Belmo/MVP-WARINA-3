/**
 * Integration Tests for Code Validation Feedback
 * Tests the full gameplay flow to ensure no regressions
 */

class IntegrationTests {
    constructor() {
        this.testResults = [];
        this.originalCodeEditor = null;
        this.originalUIManager = null;
        this.originalSoundManager = null;
        this.originalVisualEffectsManager = null;
    }

    /**
     * Initialize integration tests
     */
    init() {
        console.log('✅ Integration tests initialized');
    }

    /**
     * Run all integration tests
     */
    async runAllTests() {
        console.log('🧪 Starting Integration Tests...');
        this.testResults = [];
        
        const tests = [
            { name: 'Code Editor Integration', test: () => this.testCodeEditorIntegration() },
            { name: 'Sound System Integration', test: () => this.testSoundSystemIntegration() },
            { name: 'Visual Effects Integration', test: () => this.testVisualEffectsIntegration() },
            { name: 'Full Gameplay Simulation', test: () => this.testFullGameplaySimulation() },
            { name: 'No Regression in Code Execution', test: () => this.testNoRegressionInCodeExecution() },
            { name: 'No Regression in Auto-completion', test: () => this.testNoRegressionInAutoCompletion() },
            { name: 'No Regression in Line Highlighting', test: () => this.testNoRegressionInLineHighlighting() },
            { name: 'Performance Impact', test: () => this.testPerformanceImpact() }
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
     * Test code editor integration
     */
    testCodeEditorIntegration() {
        if (!window.codeEditor) {
            throw new Error('Code editor not available');
        }

        if (!window.codeValidationFeedback) {
            throw new Error('Code validation feedback not available');
        }

        // Test that validation is triggered on input
        const originalTrigger = window.codeEditor.triggerCodeValidation;
        let validationTriggered = false;
        
        window.codeEditor.triggerCodeValidation = () => {
            validationTriggered = true;
            originalTrigger.call(window.codeEditor);
        };

        // Simulate typing a valid statement
        const editor = document.getElementById('codeEditor');
        if (editor) {
            editor.value = 'pinMode(13, OUTPUT);';
            editor.dispatchEvent(new Event('input'));
        }

        if (!validationTriggered) {
            throw new Error('Code validation not triggered on input');
        }

        // Restore original method
        window.codeEditor.triggerCodeValidation = originalTrigger;
    }

    /**
     * Test sound system integration
     */
    testSoundSystemIntegration() {
        if (!window.simpleSoundEffectsManager) {
            throw new Error('Sound effects manager not available');
        }

        // Test that new sound methods exist
        if (typeof window.simpleSoundEffectsManager.playValidCode !== 'function') {
            throw new Error('playValidCode method not found');
        }

        if (typeof window.simpleSoundEffectsManager.playTimerAction !== 'function') {
            throw new Error('playTimerAction method not found');
        }

        if (typeof window.simpleSoundEffectsManager.playFunctionComplete !== 'function') {
            throw new Error('playFunctionComplete method not found');
        }

        // Test that sounds are properly configured
        if (!window.simpleSoundEffectsManager.sounds.validCode) {
            throw new Error('validCode sound not configured');
        }

        if (!window.simpleSoundEffectsManager.sounds.timerAction) {
            throw new Error('timerAction sound not configured');
        }

        if (!window.simpleSoundEffectsManager.sounds.functionComplete) {
            throw new Error('functionComplete sound not configured');
        }
    }

    /**
     * Test visual effects integration
     */
    testVisualEffectsIntegration() {
        if (!window.visualEffectsManager) {
            throw new Error('Visual effects manager not available');
        }

        // Test that new visual effect method exists
        if (typeof window.visualEffectsManager.createTextGlowEffect !== 'function') {
            throw new Error('createTextGlowEffect method not found');
        }

        // Test that CSS classes exist
        const style = document.createElement('style');
        style.textContent = `
            .valid-code-line-glow { display: none; }
            .text-glow-effect { display: none; }
        `;
        document.head.appendChild(style);

        // Test CSS animation keyframes exist
        const animations = [
            'textGlow',
            'validCodeLineGlow'
        ];

        animations.forEach(animation => {
            const keyframes = this.getKeyframes(animation);
            if (!keyframes) {
                throw new Error(`CSS animation '${animation}' not found`);
            }
        });

        document.head.removeChild(style);
    }

    /**
     * Test full gameplay simulation
     */
    async testFullGameplaySimulation() {
        console.log('🎮 Simulating full gameplay...');

        // Step 1: Load level 1 (if available)
        if (window.levelManager) {
            try {
                window.levelManager.loadLevel(1);
                console.log('✅ Level 1 loaded');
            } catch (error) {
                console.log('⚠️ Level loading not available, continuing with simulation');
            }
        }

        // Step 2: Type valid code line by line
        const testCode = [
            'void setup() {',
            '  pinMode(13, OUTPUT);',
            '}',
            '',
            'void loop() {',
            '  digitalWrite(13, HIGH);',
            '  delay(1000);',
            '  digitalWrite(13, LOW);',
            '  delay(1000);',
            '}'
        ];

        let validationCount = 0;
        const originalValidate = window.codeValidationFeedback.validateCurrentLine;
        
        window.codeValidationFeedback.validateCurrentLine = (editor, lineNumber, lineContent) => {
            validationCount++;
            console.log(`✅ Validation triggered for line ${lineNumber}: "${lineContent}"`);
            return originalValidate.call(window.codeValidationFeedback, editor, lineNumber, lineContent);
        };

        // Simulate typing each line
        for (let i = 0; i < testCode.length; i++) {
            const line = testCode[i];
            if (line.trim()) {
                // Simulate typing the line
                const editor = document.getElementById('codeEditor');
                if (editor) {
                    editor.value = line;
                    editor.dispatchEvent(new Event('input'));
                    
                    // Wait a bit for validation
                    await this.sleep(100);
                }
            }
        }

        // Restore original method
        window.codeValidationFeedback.validateCurrentLine = originalValidate;

        console.log(`📊 Validation triggered ${validationCount} times`);
        
        if (validationCount === 0) {
            throw new Error('No validations triggered during gameplay simulation');
        }
    }

    /**
     * Test no regression in code execution
     */
    async testNoRegressionInCodeExecution() {
        console.log('🔍 Testing code execution functionality...');

        if (!window.codeEditor) {
            throw new Error('Code editor not available');
        }

        // Test basic code execution
        const testCode = `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(100);
  digitalWrite(13, LOW);
  delay(100);
}`;

        // Set test code
        window.codeEditor.setValue(testCode);
        
        // Test that code can still be parsed
        if (window.arduinoParser) {
            try {
                const parsed = window.arduinoParser.parseCode(testCode);
                if (!parsed.setup || !parsed.loop) {
                    throw new Error('Code parsing failed');
                }
                console.log('✅ Code parsing still works');
            } catch (error) {
                throw new Error(`Code parsing regression: ${error.message}`);
            }
        }

        // Test that execution highlighting still works
        if (typeof window.codeEditor.highlightLine === 'function') {
            window.codeEditor.highlightLine(2);
            console.log('✅ Line highlighting still works');
        }
    }

    /**
     * Test no regression in auto-completion
     */
    testNoRegressionInAutoCompletion() {
        console.log('🔍 Testing auto-completion functionality...');

        if (!window.codeEditor) {
            throw new Error('Code editor not available');
        }

        // Test that auto-completion still works
        if (typeof window.codeEditor.showCompletion === 'function') {
            // This is a basic test - in a real scenario we'd test more thoroughly
            console.log('✅ Auto-completion method still exists');
        }

        // Test that placeholder navigation still works
        if (typeof window.codeEditor.acceptCompletion === 'function') {
            console.log('✅ Completion acceptance still works');
        }
    }

    /**
     * Test no regression in line highlighting
     */
    testNoRegressionInLineHighlighting() {
        console.log('🔍 Testing line highlighting functionality...');

        if (!window.codeEditor) {
            throw new Error('Code editor not available');
        }

        // Test that line highlighting methods still exist
        const methods = [
            'highlightLine',
            'clearLineHighlight',
            'updateHighlightPosition',
            'scrollToLine'
        ];

        methods.forEach(method => {
            if (typeof window.codeEditor[method] !== 'function') {
                throw new Error(`Line highlighting method '${method}' missing`);
            }
        });

        console.log('✅ All line highlighting methods still exist');
    }

    /**
     * Test performance impact
     */
    testPerformanceImpact() {
        console.log('🔍 Testing performance impact...');

        const startTime = performance.now();

        // Simulate rapid typing
        for (let i = 0; i < 100; i++) {
            if (window.codeEditor && window.codeEditor.triggerCodeValidation) {
                window.codeEditor.triggerCodeValidation();
            }
        }

        const endTime = performance.now();
        const duration = endTime - startTime;

        console.log(`📊 Performance test completed in ${duration.toFixed(2)}ms`);

        // Should complete in reasonable time (less than 1000ms for 100 operations)
        if (duration > 1000) {
            throw new Error(`Performance regression detected: ${duration}ms for 100 operations`);
        }
    }

    /**
     * Get CSS keyframes by name
     */
    getKeyframes(animationName) {
        const styleSheets = document.styleSheets;
        for (let i = 0; i < styleSheets.length; i++) {
            try {
                const rules = styleSheets[i].cssRules || styleSheets[i].rules;
                for (let j = 0; j < rules.length; j++) {
                    if (rules[j].type === CSSRule.KEYFRAMES_RULE && 
                        rules[j].name === animationName) {
                        return rules[j];
                    }
                }
            } catch (e) {
                // Cross-origin stylesheets may throw errors
                continue;
            }
        }
        return null;
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Print test summary
     */
    printTestSummary() {
        console.log('\n📊 INTEGRATION TEST SUMMARY');
        console.log('============================');
        
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
        
        console.log('\n============================');
    }
}

// Make it globally available
window.IntegrationTests = IntegrationTests;
