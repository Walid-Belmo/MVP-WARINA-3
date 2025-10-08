/**
 * Test Runner for Arduino Code Execution Timing
 * Provides easy access to run timing tests
 */

class TestRunner {
    constructor() {
        this.testSuite = null;
        this.isRunning = false;
    }

    /**
     * Initialize the test runner
     */
    init() {
        if (typeof TimingTestSuite !== 'undefined') {
            this.testSuite = new TimingTestSuite();
            console.log('🧪 Test Runner initialized');
        } else {
            console.error('❌ TimingTestSuite not found. Make sure timingTests.js is loaded.');
        }
    }

    /**
     * Run all timing tests
     */
    async runAllTests() {
        if (!this.testSuite) {
            this.init();
        }

        if (this.isRunning) {
            console.log('⚠️ Tests are already running...');
            return;
        }

        this.isRunning = true;
        console.log('🚀 Starting all timing tests...');
        
        try {
            const results = await this.testSuite.runAllTests();
            this.isRunning = false;
            return results;
        } catch (error) {
            this.isRunning = false;
            console.error('❌ Test execution failed:', error);
            throw error;
        }
    }

    /**
     * Run a specific test
     */
    async runTest(testName) {
        if (!this.testSuite) {
            this.init();
        }

        const testMap = {
            'pinMode': () => this.testSuite.testPinModeTiming(),
            'digitalWrite': () => this.testSuite.testDigitalWriteTiming(),
            'analogWrite': () => this.testSuite.testAnalogWriteTiming(),
            'delay': () => this.testSuite.testDelayTiming(),
            'mixed': () => this.testSuite.testMixedInstructions(),
            'empty': () => this.testSuite.testEmptyLinesHandling(),
            'comments': () => this.testSuite.testCommentsHandling()
        };

        if (!testMap[testName]) {
            console.error(`❌ Unknown test: ${testName}`);
            console.log('Available tests:', Object.keys(testMap).join(', '));
            return;
        }

        console.log(`🧪 Running test: ${testName}`);
        try {
            await testMap[testName]();
            console.log(`✅ Test ${testName} passed!`);
        } catch (error) {
            console.log(`❌ Test ${testName} failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Quick test for motor control code
     */
    async testMotorControl() {
        const motorCode = `void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  // Slow speed
  analogWrite(9, 85);
  delay(2000);
  // Medium speed
  analogWrite(9, 170);
  delay(2000);
  // Fast speed
  analogWrite(9, 255);
  delay(2000);
  // Stop
  analogWrite(9, 0);
  delay(2000);
}`;

        console.log('🧪 Testing motor control code timing...');
        
        if (window.codeEditor) {
            window.codeEditor.setValue(motorCode);
        }

        // Measure the execution
        const timings = await this.measureMotorControlTiming();
        
        console.log('📊 Motor Control Timing Results:');
        timings.forEach((timing, index) => {
            const lineType = this.getLineType(timing.line);
            const expected = this.getExpectedTiming(timing.line);
            const status = this.evaluateTiming(timing.duration, expected) ? '✅' : '❌';
            
            console.log(`${status} Line ${index + 1}: ${timing.line} - ${timing.duration}ms (expected: ${expected}ms)`);
        });

        return timings;
    }

    /**
     * Measure motor control timing
     */
    async measureMotorControlTiming() {
        return new Promise((resolve) => {
            const timings = [];
            let currentLineIndex = 0;
            
            const originalExecuteLoopWithDelays = window.uiManager.executeLoopWithDelays.bind(window.uiManager);
            
            window.uiManager.executeLoopWithDelays = (loopCode, loopStartLine, onComplete) => {
                const lines = loopCode.split('\n');
                
                const executeNextLine = () => {
                    if (currentLineIndex >= lines.length) {
                        window.uiManager.executeLoopWithDelays = originalExecuteLoopWithDelays;
                        resolve(timings);
                        onComplete();
                        return;
                    }
                    
                    const line = lines[currentLineIndex].trim();
                    const startTime = Date.now();
                    
                    currentLineIndex++;
                    
                    // Skip empty lines and comments instantly
                    if (!line || line.startsWith('//')) {
                        const endTime = Date.now();
                        timings.push({
                            line: line,
                            duration: endTime - startTime
                        });
                        executeNextLine();
                        return;
                    }
                    
                    // Handle delay calls
                    const delayMatch = line.match(/delay\s*\(\s*(\d+)\s*\)/i);
                    if (delayMatch) {
                        const ms = parseInt(delayMatch[1]);
                        
                        setTimeout(() => {
                            const endTime = Date.now();
                            timings.push({
                                line: line,
                                duration: endTime - startTime
                            });
                            executeNextLine();
                        }, ms);
                        return;
                    }
                    
                    // Execute other commands
                    try {
                        if (window.codeEditor) {
                            window.codeEditor.highlightLine(loopStartLine + currentLineIndex - 1);
                        }
                        
                        if (window.arduinoParser) {
                            window.arduinoParser.executeLine(line, loopStartLine + currentLineIndex - 1);
                        }
                        
                        if (window.uiManager) {
                            window.uiManager.updateVisualPinsFromParser();
                        }
                        
                        setTimeout(() => {
                            const endTime = Date.now();
                            timings.push({
                                line: line,
                                duration: endTime - startTime
                            });
                            executeNextLine();
                        }, 50);
                    } catch (error) {
                        console.error('Motor control test error:', error);
                        resolve(timings);
                    }
                };
                
                executeNextLine();
            };
            
            // Start the test
            const loopMatch = window.codeEditor.getValue().match(/void\s+loop\s*\(\s*\)\s*\{([\s\S]*?)\}/);
            if (loopMatch) {
                const loopCode = loopMatch[1].trim();
                window.uiManager.executeLoopWithDelays(loopCode, 2, () => {});
            }
        });
    }

    /**
     * Get the type of line for analysis
     */
    getLineType(line) {
        if (line.includes('pinMode')) return 'pinMode';
        if (line.includes('digitalWrite')) return 'digitalWrite';
        if (line.includes('analogWrite')) return 'analogWrite';
        if (line.includes('delay')) return 'delay';
        if (line.trim() === '') return 'empty';
        if (line.startsWith('//')) return 'comment';
        return 'other';
    }

    /**
     * Get expected timing for a line
     */
    getExpectedTiming(line) {
        if (line.includes('delay')) {
            const match = line.match(/delay\s*\(\s*(\d+)\s*\)/i);
            return match ? parseInt(match[1]) : 0;
        }
        if (line.includes('pinMode') || line.includes('digitalWrite') || line.includes('analogWrite')) {
            return 50; // Fast execution
        }
        if (line.trim() === '' || line.startsWith('//')) {
            return 0; // Instant skip
        }
        return 50; // Default fast execution
    }

    /**
     * Evaluate if timing is acceptable
     */
    evaluateTiming(actual, expected) {
        if (expected === 0) {
            return actual < 10; // Empty lines/comments should be very fast
        }
        if (expected >= 1000) {
            // For delays, allow 10% tolerance
            const tolerance = expected * 0.1;
            return Math.abs(actual - expected) <= tolerance;
        }
        // For fast commands, should be under 100ms
        return actual < 100;
    }
}

// Create global test runner instance
window.testRunner = new TestRunner();

// Add convenience functions to global scope
window.runAllTimingTests = () => window.testRunner.runAllTests();
window.runTimingTest = (testName) => window.testRunner.runTest(testName);
window.testMotorControl = () => window.testRunner.testMotorControl();

