/**
 * Sequence Validation System
 * Compares player's extracted sequence to target sequence with tolerance
 */

class SequenceValidator {
    constructor() {
        this.defaultTolerance = 50; // 50ms tolerance by default
    }

    /**
     * Validate if player sequence matches target sequence
     * @param {Object} targetSequence - Target sequence from level
     * @param {Object} playerSequence - Player's extracted sequence
     * @param {number} tolerance - Timing tolerance in ms (default 50)
     * @returns {Object} - { matches: boolean, score: number, differences: Array }
     */
    validateSequence(targetSequence, playerSequence, tolerance = null) {
        const tol = tolerance || this.defaultTolerance;
        
        console.log('🔍 Validating sequences...');
        console.log('Target events:', targetSequence.events.length);
        console.log('Player events:', playerSequence.events.length);
        
        const result = {
            matches: false,
            score: 0,
            differences: [],
            details: {
                timingMatches: 0,
                pinMatches: 0,
                stateMatches: 0,
                totalComparisons: 0
            }
        };

        try {
            // Handle case where one sequence is empty
            if (targetSequence.events.length === 0 && playerSequence.events.length === 0) {
                result.matches = true;
                result.score = 100;
                console.log('✅ Both sequences are empty - match!');
                return result;
            }

            if (targetSequence.events.length === 0 || playerSequence.events.length === 0) {
                result.differences.push({
                    type: 'length_mismatch',
                    message: `Target has ${targetSequence.events.length} events, player has ${playerSequence.events.length} events`
                });
                console.log('❌ One sequence is empty');
                return result;
            }

            // Compare sequences
            const comparison = this.compareSequences(targetSequence.events, playerSequence.events, tol);
            
            result.matches = comparison.matches;
            result.score = comparison.score;
            result.differences = comparison.differences;
            result.details = comparison.details;

            console.log(`🎯 Validation result: ${result.matches ? 'MATCH' : 'NO MATCH'} (Score: ${result.score}%)`);
            
            return result;

        } catch (error) {
            console.error('❌ Error validating sequences:', error);
            result.differences.push({
                type: 'validation_error',
                message: error.message
            });
            return result;
        }
    }

    /**
     * Compare two event sequences
     * @param {Array} targetEvents - Target events
     * @param {Array} playerEvents - Player events
     * @param {number} tolerance - Timing tolerance
     * @returns {Object} - Comparison result
     */
    compareSequences(targetEvents, playerEvents, tolerance) {
        const result = {
            matches: false,
            score: 0,
            differences: [],
            details: {
                timingMatches: 0,
                pinMatches: 0,
                stateMatches: 0,
                totalComparisons: 0
            }
        };

        // If sequences have different lengths, it's likely not a match
        if (targetEvents.length !== playerEvents.length) {
            result.differences.push({
                type: 'length_mismatch',
                message: `Different number of events: target=${targetEvents.length}, player=${playerEvents.length}`
            });
            
            // Still try to compare what we can
            const minLength = Math.min(targetEvents.length, playerEvents.length);
            for (let i = 0; i < minLength; i++) {
                this.compareEvent(targetEvents[i], playerEvents[i], tolerance, result);
            }
        } else {
            // Same length - compare each event
            for (let i = 0; i < targetEvents.length; i++) {
                this.compareEvent(targetEvents[i], playerEvents[i], tolerance, result);
            }
        }

        // Calculate score
        const totalComparisons = result.details.totalComparisons;
        if (totalComparisons > 0) {
            const timingScore = (result.details.timingMatches / totalComparisons) * 40;
            const pinScore = (result.details.pinMatches / totalComparisons) * 30;
            const stateScore = (result.details.stateMatches / totalComparisons) * 30;
            
            result.score = Math.round(timingScore + pinScore + stateScore);
        }

        // Consider it a match if score is high enough (80% or more)
        result.matches = result.score >= 80;

        return result;
    }

    /**
     * Compare two individual events
     * @param {Object} targetEvent - Target event
     * @param {Object} playerEvent - Player event
     * @param {number} tolerance - Timing tolerance
     * @param {Object} result - Result object to update
     */
    compareEvent(targetEvent, playerEvent, tolerance, result) {
        result.details.totalComparisons++;

        // Compare timing
        const timeDiff = Math.abs(targetEvent.time - playerEvent.time);
        if (timeDiff <= tolerance) {
            result.details.timingMatches++;
        } else {
            result.differences.push({
                type: 'timing_mismatch',
                message: `Time mismatch: target=${targetEvent.time}ms, player=${playerEvent.time}ms (diff: ${timeDiff}ms)`,
                targetTime: targetEvent.time,
                playerTime: playerEvent.time,
                difference: timeDiff
            });
        }

        // Compare pin number
        if (targetEvent.pin === playerEvent.pin) {
            result.details.pinMatches++;
        } else {
            result.differences.push({
                type: 'pin_mismatch',
                message: `Pin mismatch: target=pin${targetEvent.pin}, player=pin${playerEvent.pin}`,
                targetPin: targetEvent.pin,
                playerPin: playerEvent.pin
            });
        }

        // Compare state
        if (this.compareStates(targetEvent, playerEvent)) {
            result.details.stateMatches++;
        } else {
            result.differences.push({
                type: 'state_mismatch',
                message: `State mismatch: target=${targetEvent.state} (${targetEvent.type}), player=${playerEvent.state} (${playerEvent.type})`,
                targetState: targetEvent.state,
                playerState: playerEvent.state,
                targetType: targetEvent.type,
                playerType: playerEvent.type
            });
        }
    }

    /**
     * Compare event states (handles both digital and PWM)
     * @param {Object} targetEvent - Target event
     * @param {Object} playerEvent - Player event
     * @returns {boolean} - Whether states match
     */
    compareStates(targetEvent, playerEvent) {
        // If both are digital, compare boolean states
        if (targetEvent.type === 'digital' && playerEvent.type === 'digital') {
            return targetEvent.state === playerEvent.state;
        }

        // If both are PWM, compare with tolerance
        if (targetEvent.type === 'pwm' && playerEvent.type === 'pwm') {
            const targetValue = typeof targetEvent.state === 'number' ? targetEvent.state : (targetEvent.state ? 255 : 0);
            const playerValue = typeof playerEvent.state === 'number' ? playerEvent.state : (playerEvent.state ? 255 : 0);
            
            // Allow 10% tolerance for PWM values
            const tolerance = Math.max(25, targetValue * 0.1);
            return Math.abs(targetValue - playerValue) <= tolerance;
        }

        // Mixed types - convert to boolean and compare
        const targetBool = Boolean(targetEvent.state);
        const playerBool = Boolean(playerEvent.state);
        return targetBool === playerBool;
    }

    /**
     * Get detailed analysis of sequence differences
     * @param {Object} targetSequence - Target sequence
     * @param {Object} playerSequence - Player sequence
     * @returns {Object} - Detailed analysis
     */
    getDetailedAnalysis(targetSequence, playerSequence) {
        const analysis = {
            targetSummary: this.getSequenceSummary(targetSequence),
            playerSummary: this.getSequenceSummary(playerSequence),
            timingAnalysis: this.analyzeTiming(targetSequence, playerSequence),
            pinUsageAnalysis: this.analyzePinUsage(targetSequence, playerSequence),
            suggestions: []
        };

        // Generate suggestions based on differences
        if (targetSequence.events.length !== playerSequence.events.length) {
            analysis.suggestions.push('Check the number of pin state changes in your code');
        }

        const timingIssues = analysis.timingAnalysis.issues;
        if (timingIssues.length > 0) {
            analysis.suggestions.push('Review the timing of your pin state changes');
        }

        return analysis;
    }

    /**
     * Get summary of a sequence
     * @param {Object} sequence - Sequence to analyze
     * @returns {Object} - Summary information
     */
    getSequenceSummary(sequence) {
        const pins = new Set();
        const eventTypes = { digital: 0, pwm: 0 };
        
        sequence.events.forEach(event => {
            pins.add(event.pin);
            eventTypes[event.type]++;
        });

        return {
            totalEvents: sequence.events.length,
            totalDuration: sequence.totalDuration,
            pinsUsed: Array.from(pins),
            eventTypes: eventTypes,
            isLooping: sequence.isLooping
        };
    }

    /**
     * Analyze timing differences
     * @param {Object} targetSequence - Target sequence
     * @param {Object} playerSequence - Player sequence
     * @returns {Object} - Timing analysis
     */
    analyzeTiming(targetSequence, playerSequence) {
        const issues = [];
        const minLength = Math.min(targetSequence.events.length, playerSequence.events.length);
        
        for (let i = 0; i < minLength; i++) {
            const timeDiff = Math.abs(targetSequence.events[i].time - playerSequence.events[i].time);
            if (timeDiff > this.defaultTolerance) {
                issues.push({
                    eventIndex: i,
                    targetTime: targetSequence.events[i].time,
                    playerTime: playerSequence.events[i].time,
                    difference: timeDiff
                });
            }
        }

        return {
            issues: issues,
            averageDifference: issues.length > 0 ? 
                issues.reduce((sum, issue) => sum + issue.difference, 0) / issues.length : 0
        };
    }

    /**
     * Analyze pin usage differences
     * @param {Object} targetSequence - Target sequence
     * @param {Object} playerSequence - Player sequence
     * @returns {Object} - Pin usage analysis
     */
    analyzePinUsage(targetSequence, playerSequence) {
        const targetPins = new Set(targetSequence.events.map(e => e.pin));
        const playerPins = new Set(playerSequence.events.map(e => e.pin));
        
        const missingPins = Array.from(targetPins).filter(pin => !playerPins.has(pin));
        const extraPins = Array.from(playerPins).filter(pin => !targetPins.has(pin));

        return {
            targetPins: Array.from(targetPins),
            playerPins: Array.from(playerPins),
            missingPins: missingPins,
            extraPins: extraPins,
            pinMatch: missingPins.length === 0 && extraPins.length === 0
        };
    }
}

// Create global sequence validator instance
window.sequenceValidator = new SequenceValidator();
