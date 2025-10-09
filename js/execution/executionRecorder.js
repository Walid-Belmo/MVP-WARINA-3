/**
 * Execution Recorder
 * Tracks and records pin events during code execution
 */

class ExecutionRecorder {
    constructor() {
        this.executionSequence = [];
        this.executionStartTime = 0;
        this.isRecording = false;
    }

    /**
     * Start recording execution events
     */
    startRecording() {
        this.executionSequence = [];
        this.executionStartTime = Date.now();
        this.isRecording = true;
        console.log('📝 Started recording execution events');
    }

    /**
     * Stop recording execution events
     */
    stopRecording() {
        this.isRecording = false;
        console.log('⏹️ Stopped recording execution events');
    }

    /**
     * Record a pin event during execution
     * @param {number} pin - Pin number
     * @param {boolean} state - Pin state (true/false)
     * @param {string} type - Event type ('digital' or 'pwm')
     * @param {number} pwm - PWM value (0-255)
     * @param {number} dutyCycle - Duty cycle percentage (0-100)
     */
    recordPinEvent(pin, state, type, pwm = 0, dutyCycle = 0) {
        if (!this.isRecording) return;
        
        const timestamp = Date.now() - this.executionStartTime;
        
        const event = {
            pin: pin,
            state: state,
            type: type,
            pwm: pwm,
            dutyCycle: dutyCycle,
            time: timestamp
        };
        
        this.executionSequence.push(event);
        console.log(`📝 Recorded event: Pin ${pin} → ${state} (${type}) at ${timestamp}ms`);
    }

    /**
     * Build sequence from recorded execution events
     * @returns {Object} Sequence object with events, totalDuration, and isLooping
     */
    buildSequenceFromExecution() {
        if (this.executionSequence.length === 0) {
            return { events: [], totalDuration: 0, isLooping: false };
        }
        
        // Sort events by time
        const sortedEvents = [...this.executionSequence].sort((a, b) => a.time - b.time);
        
        // Calculate total duration
        const totalDuration = sortedEvents.length > 0 ? 
            sortedEvents[sortedEvents.length - 1].time : 0;
        
        return {
            events: sortedEvents,
            totalDuration: totalDuration,
            isLooping: false
        };
    }

    /**
     * Get recorded execution sequence
     * @returns {Array} Array of recorded events
     */
    getExecutionSequence() {
        return this.executionSequence;
    }

    /**
     * Clear recorded execution sequence
     */
    clearSequence() {
        this.executionSequence = [];
        this.executionStartTime = 0;
        console.log('🗑️ Cleared execution sequence');
    }
}

// Create global instance
window.executionRecorder = new ExecutionRecorder();

