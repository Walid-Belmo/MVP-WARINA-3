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
            if (onWin) {
                onWin();
            }
        } else {
            console.log('❌ Sequence does not match');
            if (onFail) {
                onFail(validation.score, validation.differences);
            }
        }
    }
}

// ValidationManager will be instantiated in app.js

