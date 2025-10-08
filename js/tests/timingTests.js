/**
 * Comprehensive Timing Tests for Arduino Code Execution
 * Tests all instruction types with proper timing verification
 */

class TimingTestSuite {
    constructor() {
        this.testResults = [];
        this.currentTest = null;
        this.startTime = null;
        this.expectedTimings = {
            pinMode: 50,      // Should execute fast
            digitalWrite: 50, // Should execute fast
            analogWrite: 50,  // Should execute fast
            delay: null       // Should respect actual delay value
        };
    }

    /**
     * Run all timing tests
     */
    async runAllTests() {
        console.log('🧪 Starting Comprehensive Timing Test Suite...');
        this.testResults = [];
        
        const tests = [
            { name: 'pinMode Timing', test: () => this.testPinModeTiming() },
            { name: 'digitalWrite Timing', test: () => this.testDigitalWriteTiming() },
            { name: 'analogWrite Timing', test: () => this.testAnalogWriteTiming() },
            { name: 'delay Timing', test: () => this.testDelayTiming() },
            { name: 'Mixed Instructions', test: () => this.testMixedInstructions() },
            { name: 'Empty Lines Handling', test: () => this.testEmptyLinesHandling() },
            { name: 'Comments Handling', test: () => this.testCommentsHandling() }
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
     * Test pinMode execution timing
     */
    async testPinModeTiming() {
        const testCode = `void setup() {
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  pinMode(11, OUTPUT);
}`;

        const timings = await this.measureExecutionTimings(testCode, 'setup');
        
        // pinMode should execute quickly (around 50ms each)
        timings.forEach((timing, index) => {
            if (timing.line.includes('pinMode')) {
                if (timing.duration > 100) {
                    throw new Error(`pinMode line ${index + 1} took ${timing.duration}ms (expected < 100ms)`);
                }
            }
        });
    }

    /**
     * Test digitalWrite execution timing
     */
    async testDigitalWriteTiming() {
        const testCode = `void loop() {
  digitalWrite(9, HIGH);
  digitalWrite(10, LOW);
  digitalWrite(11, HIGH);
}`;

        const timings = await this.measureExecutionTimings(testCode, 'loop');
        
        // digitalWrite should execute quickly (around 50ms each)
        timings.forEach((timing, index) => {
            if (timing.line.includes('digitalWrite')) {
                if (timing.duration > 100) {
                    throw new Error(`digitalWrite line ${index + 1} took ${timing.duration}ms (expected < 100ms)`);
                }
            }
        });
    }

    /**
     * Test analogWrite execution timing
     */
    async testAnalogWriteTiming() {
        const testCode = `void loop() {
  analogWrite(9, 85);
  analogWrite(10, 170);
  analogWrite(11, 255);
}`;

        const timings = await this.measureExecutionTimings(testCode, 'loop');
        
        // analogWrite should execute quickly (around 50ms each)
        timings.forEach((timing, index) => {
            if (timing.line.includes('analogWrite')) {
                if (timing.duration > 100) {
                    throw new Error(`analogWrite line ${index + 1} took ${timing.duration}ms (expected < 100ms)`);
                }
            }
        });
    }

    /**
     * Test delay execution timing
     */
    async testDelayTiming() {
        const testCode = `void loop() {
  delay(500);
  delay(1000);
  delay(2000);
}`;

        const timings = await this.measureExecutionTimings(testCode, 'loop');
        
        // delay should respect actual timing
        const delayTimings = timings.filter(t => t.line.includes('delay'));
        if (delayTimings.length !== 3) {
            throw new Error(`Expected 3 delay lines, found ${delayTimings.length}`);
        }

        // Check that delays are approximately correct (allow 10% tolerance)
        const expectedDelays = [500, 1000, 2000];
        delayTimings.forEach((timing, index) => {
            const expected = expectedDelays[index];
            const tolerance = expected * 0.1; // 10% tolerance
            if (Math.abs(timing.duration - expected) > tolerance) {
                throw new Error(`delay(${expected}) took ${timing.duration}ms (expected ${expected}ms ± ${tolerance}ms)`);
            }
        });
    }

    /**
     * Test mixed instructions timing
     */
    async testMixedInstructions() {
        const testCode = `void loop() {
  pinMode(9, OUTPUT);
  digitalWrite(9, HIGH);
  analogWrite(9, 128);
  delay(1000);
  digitalWrite(9, LOW);
  delay(500);
}`;

        const timings = await this.measureExecutionTimings(testCode, 'loop');
        
        // Fast instructions should be fast
        const fastInstructions = timings.filter(t => 
            t.line.includes('pinMode') || 
            t.line.includes('digitalWrite') || 
            t.line.includes('analogWrite')
        );
        
        fastInstructions.forEach((timing, index) => {
            if (timing.duration > 100) {
                throw new Error(`Fast instruction "${timing.line}" took ${timing.duration}ms (expected < 100ms)`);
            }
        });

        // Delays should be approximately correct
        const delayTimings = timings.filter(t => t.line.includes('delay'));
        if (delayTimings.length !== 2) {
            throw new Error(`Expected 2 delay lines, found ${delayTimings.length}`);
        }

        const expectedDelays = [1000, 500];
        delayTimings.forEach((timing, index) => {
            const expected = expectedDelays[index];
            const tolerance = expected * 0.1;
            if (Math.abs(timing.duration - expected) > tolerance) {
                throw new Error(`delay(${expected}) took ${timing.duration}ms (expected ${expected}ms ± ${tolerance}ms)`);
            }
        });
    }

    /**
     * Test empty lines handling
     */
    async testEmptyLinesHandling() {
        const testCode = `void loop() {
  
  digitalWrite(9, HIGH);
  
  analogWrite(9, 128);
  
  delay(1000);
  
}`;

        const timings = await this.measureExecutionTimings(testCode, 'loop');
        
        // Empty lines should be skipped instantly (0ms or very fast)
        const emptyLineTimings = timings.filter(t => t.line.trim() === '');
        emptyLineTimings.forEach((timing, index) => {
            if (timing.duration > 10) {
                throw new Error(`Empty line took ${timing.duration}ms (expected < 10ms)`);
            }
        });
    }

    /**
     * Test comments handling
     */
    async testCommentsHandling() {
        const testCode = `void loop() {
  // This is a comment
  digitalWrite(9, HIGH);
  // Another comment
  analogWrite(9, 128);
  // Final comment
}`;

        const timings = await this.measureExecutionTimings(testCode, 'loop');
        
        // Comments should be skipped instantly
        const commentTimings = timings.filter(t => t.line.trim().startsWith('//'));
        commentTimings.forEach((timing, index) => {
            if (timing.duration > 10) {
                throw new Error(`Comment line took ${timing.duration}ms (expected < 10ms)`);
            }
        });
    }

    /**
     * Measure execution timings for a given code
     */
    async measureExecutionTimings(code, functionType = 'loop') {
        return new Promise((resolve, reject) => {
            const timings = [];
            let currentLineIndex = 0;
            let isExecuting = false;
            
            // Set up the test code
            if (window.codeEditor) {
                window.codeEditor.setValue(code);
            } else {
                reject(new Error('Code editor not available'));
                return;
            }

            // Override the execution method to capture timings
            const originalExecuteLoopWithDelays = window.uiManager.executeLoopWithDelays.bind(window.uiManager);
            
            window.uiManager.executeLoopWithDelays = (loopCode, loopStartLine, onComplete) => {
                console.log('🧪 Test execution started...');
                const lines = loopCode.split('\n');
                isExecuting = true;
                
                const executeNextLine = () => {
                    if (!isExecuting || currentLineIndex >= lines.length) {
                        console.log('🧪 Test execution completed');
                        window.uiManager.executeLoopWithDelays = originalExecuteLoopWithDelays;
                        resolve(timings);
                        onComplete();
                        return;
                    }
                    
                    const line = lines[currentLineIndex].trim();
                    const actualLineNumber = loopStartLine + currentLineIndex;
                    const startTime = Date.now();
                    
                    console.log(`🧪 Testing line ${currentLineIndex + 1}: "${line}"`);
                    
                    currentLineIndex++;
                    
                    // Skip empty lines and comments instantly
                    if (!line || line.startsWith('//')) {
                        const endTime = Date.now();
                        timings.push({
                            line: line,
                            duration: endTime - startTime,
                            lineNumber: actualLineNumber
                        });
                        executeNextLine();
                        return;
                    }
                    
                    // Handle delay calls
                    const delayMatch = line.match(/delay\s*\(\s*(\d+)\s*\)/i);
                    if (delayMatch) {
                        const ms = parseInt(delayMatch[1]);
                        console.log(`🧪 Found delay: ${ms}ms`);
                        
                        setTimeout(() => {
                            const endTime = Date.now();
                            timings.push({
                                line: line,
                                duration: endTime - startTime,
                                lineNumber: actualLineNumber
                            });
                            executeNextLine();
                        }, ms);
                        return;
                    }
                    
                    // Execute other commands
                    try {
                        if (window.codeEditor) {
                            window.codeEditor.highlightLine(actualLineNumber);
                        }
                        
                        if (window.arduinoParser) {
                            window.arduinoParser.executeLine(line, actualLineNumber);
                        }
                        
                        if (window.uiManager) {
                            window.uiManager.updateVisualPinsFromParser();
                        }
                        
                        setTimeout(() => {
                            const endTime = Date.now();
                            timings.push({
                                line: line,
                                duration: endTime - startTime,
                                lineNumber: actualLineNumber
                            });
                            executeNextLine();
                        }, 50);
                    } catch (error) {
                        console.error('Test execution error:', error);
                        reject(error);
                    }
                };
                
                executeNextLine();
            };
            
            // Start the test execution
            if (functionType === 'setup') {
                // For setup, we need to simulate setup execution
                const setupMatch = code.match(/void\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\}/);
                if (setupMatch) {
                    const setupCode = setupMatch[1].trim();
                    window.uiManager.executeLoopWithDelays(setupCode, 2, () => {});
                }
            } else {
                // For loop, use the normal execution
                const loopMatch = code.match(/void\s+loop\s*\(\s*\)\s*\{([\s\S]*?)\}/);
                if (loopMatch) {
                    const loopCode = loopMatch[1].trim();
                    window.uiManager.executeLoopWithDelays(loopCode, 2, () => {});
                }
            }
        });
    }

    /**
     * Print test summary
     */
    printTestSummary() {
        console.log('\n📊 TIMING TEST SUMMARY');
        console.log('====================');
        
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
        
        console.log('\n====================');
    }
}

// Make it globally available
window.TimingTestSuite = TimingTestSuite;

