/**
 * Validation Manager
 * Handles validation of player code execution against target sequence
 */

class ValidationManager {
    constructor(executionRecorder) {
        this.executionRecorder = executionRecorder;
    }

    /**
     * Validate player execution against target sequence
     * @param {Function} onWin - Callback when validation succeeds
     * @param {Function} onFail - Callback when validation fails (with score and differences)
     */
    validateExecution(onWin, onFail) {
        console.log('🎯 Validating execution...');
        
        // Build sequence from recorded execution events
        const playerSequence = this.executionRecorder.buildSequenceFromExecution();
        console.log('📝 Player execution sequence:', playerSequence);
        
        // Get target sequence
        const targetSequence = window.levelManager.getTargetSequence();
        if (!targetSequence) {
            console.error('❌ No target sequence available');
            if (onFail) {
                onFail(0, [{ message: 'Target sequence not available' }]);
            }
            return;
        }
        
        // Validate sequences
        const validation = window.sequenceValidator.validateSequence(targetSequence, playerSequence);
        console.log('✅ Validation result:', validation);
        
        if (validation.matches) {
            console.log('🎉 SEQUENCE MATCH! Player wins!');
            
            // Start suspense effect
            if (window.visualEffectsManager) {
                window.visualEffectsManager.playSuspenseEffect();
            }
            
            // Add suspenseful delay (1.5 seconds) before showing success
            setTimeout(() => {
                // Stop suspense effect
                if (window.visualEffectsManager) {
                    window.visualEffectsManager.stopSuspenseEffect();
                    window.visualEffectsManager.playCascadeEffect();
                }
                
                if (onWin) {
                    onWin();
                }
            }, 1500);
        } else {
            console.log('❌ Sequence does not match');
            
            // Start suspense effect
            if (window.visualEffectsManager) {
                window.visualEffectsManager.playSuspenseEffect();
            }
            
            // Add suspenseful delay (1.5 seconds) before showing failure
            setTimeout(() => {
                // Stop suspense effect and add FAILURE screen shake
                if (window.visualEffectsManager) {
                    window.visualEffectsManager.stopSuspenseEffect();
                    window.visualEffectsManager.addScreenShake('medium');
                }
                
                if (onFail) {
                    onFail(validation.score, validation.differences);
                }
            }, 1500);
        }
    }
}

// ValidationManager will be instantiated in app.js

