/**
 * Code Validation Feedback Module
 * Handles real-time validation of Arduino code and provides visual/sound feedback
 */

class CodeValidationFeedback {
    constructor() {
        this.validCodePatterns = [
            // Pin operations
            /pinMode\s*\(\s*\d+\s*,\s*(OUTPUT|INPUT|INPUT_PULLUP)\s*\)/,
            /digitalWrite\s*\(\s*\d+\s*,\s*(HIGH|LOW)\s*\)/,
            /analogWrite\s*\(\s*\d+\s*,\s*\d+\s*\)/,
            
            // Timing functions
            /delay\s*\(\s*\d+\s*\)/,
            
            // Timer functions
            /Timer1\.initialize\s*\(\s*\d+\s*\)/,
            /Timer1\.pwm\s*\(\s*\d+\s*,\s*\d+\s*\)/,
            /Timer0\.initialize\s*\(\s*\)/,
            /Timer0\.pwm\s*\(\s*\d+\s*,\s*\d+\s*\)/,
            /setDutyCycle\s*\(\s*\d+\s*,\s*\d+\s*\)/,
            
            // Function declarations
            /void\s+setup\s*\(\s*\)\s*\{/,
            /void\s+loop\s*\(\s*\)\s*\{/,
            
            // Include statements
            /#include\s*<\w+\.h>/
        ];
        
        this.lastValidatedLine = null;
        this.validationTimeout = null;
        this.isEnabled = true;
        
        console.log('✅ CodeValidationFeedback initialized');
    }
    
    /**
     * Enable or disable validation feedback
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`Code validation feedback ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Check if a line contains a valid Arduino statement
     */
    isValidCodeLine(line) {
        if (!this.isEnabled) return false;
        
        const trimmedLine = line.trim();
        
        // Skip empty lines, comments, and braces
        if (!trimmedLine || 
            trimmedLine.startsWith('//') || 
            trimmedLine.startsWith('/*') || 
            trimmedLine === '{' || 
            trimmedLine === '}' || 
            trimmedLine.startsWith('*')) {
            return false;
        }
        
        // Check if line ends with semicolon or opening brace (complete statement)
        if (!trimmedLine.endsWith(';') && !trimmedLine.endsWith('{')) {
            return false;
        }
        
        // Check against valid patterns
        return this.validCodePatterns.some(pattern => pattern.test(trimmedLine));
    }
    
    /**
     * Provide feedback for valid code line
     */
    provideFeedback(lineNumber, lineContent) {
        if (!this.isEnabled) return;
        
        console.log(`✅ Valid code detected on line ${lineNumber}: "${lineContent.trim()}"`);
        
        // Visual feedback
        this.triggerVisualFeedback(lineNumber);
        
        // Sound feedback
        this.triggerSoundFeedback(lineContent);
    }
    
    /**
     * Trigger visual feedback (text glow)
     */
    triggerVisualFeedback(lineNumber) {
        if (window.visualEffectsManager) {
            window.visualEffectsManager.createTextGlowEffect(lineNumber);
        }
    }
    
    /**
     * Trigger sound feedback
     */
    triggerSoundFeedback(lineContent) {
        if (window.simpleSoundEffectsManager) {
            // Different sounds for different types of code
            if (lineContent.includes('pinMode') || lineContent.includes('digitalWrite')) {
                window.simpleSoundEffectsManager.playValidCode();
            } else if (lineContent.includes('Timer1') || lineContent.includes('Timer0')) {
                window.simpleSoundEffectsManager.playTimerAction();
            } else if (lineContent.includes('void setup') || lineContent.includes('void loop')) {
                window.simpleSoundEffectsManager.playFunctionComplete();
            } else {
                window.simpleSoundEffectsManager.playValidCode();
            }
        }
    }
    
    /**
     * Validate current line and provide feedback if valid
     */
    validateCurrentLine(editor, lineNumber, lineContent) {
        // Clear previous timeout
        if (this.validationTimeout) {
            clearTimeout(this.validationTimeout);
        }
        
        // Debounce validation to avoid too many triggers
        this.validationTimeout = setTimeout(() => {
            if (this.isValidCodeLine(lineContent)) {
                // Only provide feedback if this is a new valid line
                if (this.lastValidatedLine !== lineNumber) {
                    this.provideFeedback(lineNumber, lineContent);
                    this.lastValidatedLine = lineNumber;
                }
            } else {
                // Reset if line becomes invalid
                this.lastValidatedLine = null;
            }
        }, 300); // 300ms debounce
    }
    
    /**
     * Get validation statistics
     */
    getStats() {
        return {
            enabled: this.isEnabled,
            lastValidatedLine: this.lastValidatedLine,
            patternCount: this.validCodePatterns.length
        };
    }
}

// Create global instance
window.codeValidationFeedback = new CodeValidationFeedback();
