/**
 * Timing Verification Tests
 * Measures actual execution timing and verifies it meets requirements
 */

class TimingVerification {
    constructor() {
        this.measurements = [];
        this.isMeasuring = false;
    }

    /**
     * Measure timing for motor control code
     */
    async measureMotorControlTiming() {
        console.log('🧪 Measuring Motor Control Timing...');
        
        const motorCode = `void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  // Slow speed
  analogWrite(9, 85);
  delay(1000);
  // Medium speed
  analogWrite(9, 170);
  delay(1000);
  // Fast speed
  analogWrite(9, 255);
  delay(1000);
  // Stop
  analogWrite(9, 0);
  delay(1000);
}`;

        return new Promise((resolve) => {
            this.measurements = [];
            this.isMeasuring = true;
            
            // Set up the test code
            if (window.codeEditor) {
                window.codeEditor.setValue(motorCode);
            }

            // Override execution to capture timing
            const originalExecuteLoopWithDelays = window.uiManager.executeLoopWithDelays.bind(window.uiManager);
            
            window.uiManager.executeLoopWithDelays = (loopCode, loopStartLine, onComplete) => {
                const lines = loopCode.split('\n');
                let currentLineIndex = 0;
                
                const executeNextLine = () => {
                    if (!this.isMeasuring || currentLineIndex >= lines.length) {
                        window.uiManager.executeLoopWithDelays = originalExecuteLoopWithDelays;
                        this.isMeasuring = false;
                        this.analyzeMeasurements();
                        resolve(this.measurements);
                        onComplete();
                        return;
                    }
                    
                    const line = lines[currentLineIndex].trim();
                    const actualLineNumber = loopStartLine + currentLineIndex;
                    const startTime = Date.now();
                    
                    console.log(`📏 Measuring line ${currentLineIndex + 1}: "${line}"`);
                    
                    currentLineIndex++;
                    
                    // Skip empty lines and comments instantly
                    if (!line || line.startsWith('//')) {
                        const endTime = Date.now();
                        this.measurements.push({
                            line: line,
                            duration: endTime - startTime,
                            lineNumber: actualLineNumber,
                            type: 'empty/comment'
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
                            this.measurements.push({
                                line: line,
                                duration: endTime - startTime,
                                lineNumber: actualLineNumber,
                                type: 'delay',
                                expected: ms
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
                            this.measurements.push({
                                line: line,
                                duration: endTime - startTime,
                                lineNumber: actualLineNumber,
                                type: this.getCommandType(line)
                            });
                            executeNextLine();
                        }, 50);
                    } catch (error) {
                        console.error('Measurement error:', error);
                        resolve(this.measurements);
                    }
                };
                
                executeNextLine();
            };
            
            // Start the test
            const loopMatch = motorCode.match(/void\s+loop\s*\(\s*\)\s*\{([\s\S]*?)\}/);
            if (loopMatch) {
                const loopCode = loopMatch[1].trim();
                window.uiManager.executeLoopWithDelays(loopCode, 2, () => {});
            }
        });
    }

    /**
     * Get command type from line
     */
    getCommandType(line) {
        if (line.includes('pinMode')) return 'pinMode';
        if (line.includes('digitalWrite')) return 'digitalWrite';
        if (line.includes('analogWrite')) return 'analogWrite';
        if (line.includes('delay')) return 'delay';
        return 'other';
    }

    /**
     * Analyze measurements and report results
     */
    analyzeMeasurements() {
        console.log('\n📊 TIMING ANALYSIS RESULTS');
        console.log('==========================');
        
        const results = {
            analogWrite: [],
            delay: [],
            empty: [],
            pinMode: [],
            digitalWrite: []
        };
        
        // Categorize measurements
        this.measurements.forEach(measurement => {
            if (results[measurement.type]) {
                results[measurement.type].push(measurement);
            }
        });
        
        // Analyze each type
        Object.keys(results).forEach(type => {
            const measurements = results[type];
            if (measurements.length > 0) {
                const durations = measurements.map(m => m.duration);
                const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
                const min = Math.min(...durations);
                const max = Math.max(...durations);
                
                console.log(`\n${type.toUpperCase()}:`);
                console.log(`  Count: ${measurements.length}`);
                console.log(`  Average: ${avg.toFixed(1)}ms`);
                console.log(`  Min: ${min}ms`);
                console.log(`  Max: ${max}ms`);
                
                // Check if timing meets requirements
                const requirements = this.getTimingRequirements(type);
                const passes = this.checkTimingRequirements(measurements, requirements);
                
                console.log(`  Requirements: ${requirements.description}`);
                console.log(`  Status: ${passes ? '✅ PASS' : '❌ FAIL'}`);
                
                if (!passes) {
                    console.log(`  Issues:`);
                    measurements.forEach((m, i) => {
                        if (!this.meetsRequirement(m.duration, requirements)) {
                            console.log(`    Line ${i + 1}: ${m.duration}ms (${m.line})`);
                        }
                    });
                }
            }
        });
        
        console.log('\n==========================');
    }

    /**
     * Get timing requirements for each command type
     */
    getTimingRequirements(type) {
        switch (type) {
            case 'analogWrite':
                return { max: 100, description: 'Should be fast (< 100ms)' };
            case 'pinMode':
                return { max: 100, description: 'Should be fast (< 100ms)' };
            case 'digitalWrite':
                return { max: 100, description: 'Should be fast (< 100ms)' };
            case 'delay':
                return { tolerance: 0.1, description: 'Should match delay value ± 10%' };
            case 'empty':
                return { max: 10, description: 'Should be instant (< 10ms)' };
            default:
                return { max: 100, description: 'Should be fast (< 100ms)' };
        }
    }

    /**
     * Check if measurements meet requirements
     */
    checkTimingRequirements(measurements, requirements) {
        return measurements.every(m => this.meetsRequirement(m.duration, requirements, m.expected));
    }

    /**
     * Check if a single measurement meets requirements
     */
    meetsRequirement(duration, requirements, expected = null) {
        if (requirements.max !== undefined) {
            return duration <= requirements.max;
        }
        if (requirements.tolerance !== undefined && expected !== null) {
            const tolerance = expected * requirements.tolerance;
            return Math.abs(duration - expected) <= tolerance;
        }
        return true;
    }

    /**
     * Run comprehensive timing verification
     */
    async runVerification() {
        console.log('🚀 Starting Comprehensive Timing Verification...');
        
        try {
            const measurements = await this.measureMotorControlTiming();
            return measurements;
        } catch (error) {
            console.error('❌ Timing verification failed:', error);
            throw error;
        }
    }
}

// Make it globally available
window.TimingVerification = TimingVerification;

// Convenience function
window.verifyTiming = () => {
    const verifier = new TimingVerification();
    return verifier.runVerification();
};

