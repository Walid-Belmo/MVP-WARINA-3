/**
 * Sequence Validation System
 * Compares player's extracted sequence to target sequence with tolerance
 */

class SequenceValidator {
    constructor() {
        this.defaultTolerance = 50; // 50ms tolerance by default
    }

    /**
     * Normalize event times by subtracting the first event's time
     * This eliminates execution start delay from validation
     * @param {Array} events - Array of events with time property
     * @returns {Array} - Events with normalized times starting from 0
     */
    normalizeEventTimes(events) {
        if (events.length === 0) return events;
        const firstTime = events[0].time;
        return events.map(e => ({...e, time: e.time - firstTime}));
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
     * Compare two event sequences using RELATIVE timing (intervals between events)
     * @param {Array} targetEvents - Target events
     * @param {Array} playerEvents - Player events
     * @param {number} tolerance - Timing tolerance for intervals
     * @returns {Object} - Comparison result
     */
    compareSequences(targetEvents, playerEvents, tolerance) {
        const result = {
            matches: false,
            score: 0,
            differences: [],
            details: {
                intervalMatches: 0,
                pinMatches: 0,
                stateMatches: 0,
                pwmMatches: 0,
                totalComparisons: 0
            }
        };

        // Normalize times to start from 0 (eliminates execution start delay)
        const normalizedTarget = this.normalizeEventTimes(targetEvents);
        const normalizedPlayer = this.normalizeEventTimes(playerEvents);

        // Check if event counts match
        if (normalizedTarget.length !== normalizedPlayer.length) {
            result.differences.push({
                type: 'length_mismatch',
                message: `Different number of events: target=${normalizedTarget.length}, player=${normalizedPlayer.length}`
            });
            
            // Calculate partial score for mismatched lengths
            const minLength = Math.min(normalizedTarget.length, normalizedPlayer.length);
            if (minLength > 0) {
                for (let i = 0; i < minLength; i++) {
                    this.compareEvent(normalizedTarget[i], normalizedPlayer[i], tolerance, result, i, normalizedTarget, normalizedPlayer);
                }
            }
            
            // Calculate score but won't match due to length difference
            this.calculateScore(result);
            return result;
        }

        // Same length - compare each event with interval-based timing
        for (let i = 0; i < normalizedTarget.length; i++) {
            this.compareEvent(normalizedTarget[i], normalizedPlayer[i], tolerance, result, i, normalizedTarget, normalizedPlayer);
        }

        // Calculate final score
        this.calculateScore(result);
        
        // Consider it a match if score is 80% or higher
        result.matches = result.score >= 80;

        return result;
    }

    /**
     * Calculate score from comparison details
     * @param {Object} result - Result object to update
     */
    calculateScore(result) {
        const totalComparisons = result.details.totalComparisons;
        if (totalComparisons > 0) {
            // Weighting: Intervals 40%, Pin 25%, State 25%, PWM 10%
            const intervalScore = (result.details.intervalMatches / totalComparisons) * 40;
            const pinScore = (result.details.pinMatches / totalComparisons) * 25;
            const stateScore = (result.details.stateMatches / totalComparisons) * 25;
            const pwmScore = (result.details.pwmMatches / totalComparisons) * 10;
            
            result.score = Math.round(intervalScore + pinScore + stateScore + pwmScore);
        }
    }

    /**
     * Compare two individual events using relative timing
     * @param {Object} targetEvent - Target event
     * @param {Object} playerEvent - Player event
     * @param {number} tolerance - Timing tolerance for intervals
     * @param {Object} result - Result object to update
     * @param {number} index - Current event index
     * @param {Array} targetEvents - All target events (for interval calculation)
     * @param {Array} playerEvents - All player events (for interval calculation)
     */
    compareEvent(targetEvent, playerEvent, tolerance, result, index, targetEvents, playerEvents) {
        result.details.totalComparisons++;

        // Compare PIN number (must match exactly)
        if (targetEvent.pin === playerEvent.pin) {
            result.details.pinMatches++;
        } else {
            result.differences.push({
                type: 'pin_mismatch',
                message: `Event ${index}: Expected pin ${targetEvent.pin}, got pin ${playerEvent.pin}`,
                eventIndex: index,
                expectedPin: targetEvent.pin,
                actualPin: playerEvent.pin
            });
        }

        // Compare STATE (must match exactly)
        if (targetEvent.state === playerEvent.state) {
            result.details.stateMatches++;
        } else {
            result.differences.push({
                type: 'state_mismatch',
                message: `Event ${index}: Pin ${targetEvent.pin} expected state=${targetEvent.state}, got state=${playerEvent.state}`,
                eventIndex: index,
                pin: targetEvent.pin,
                expectedState: targetEvent.state,
                actualState: playerEvent.state
            });
        }

        // Compare PWM values if applicable (for PWM events)
        if (targetEvent.type === 'pwm' && playerEvent.type === 'pwm') {
            // Allow 10% tolerance for PWM values
            const pwmDiff = Math.abs(targetEvent.pwm - playerEvent.pwm);
            const pwmTolerance = 25; // ~10% of 255
            
            if (pwmDiff <= pwmTolerance) {
                result.details.pwmMatches++;
            } else {
                result.differences.push({
                    type: 'pwm_mismatch',
                    message: `Event ${index}: Pin ${targetEvent.pin} expected PWM=${targetEvent.pwm}, got PWM=${playerEvent.pwm}`,
                    eventIndex: index,
                    pin: targetEvent.pin,
                    expectedPwm: targetEvent.pwm,
                    actualPwm: playerEvent.pwm
                });
            }
        } else {
            // Not PWM comparison, count as match
            result.details.pwmMatches++;
        }

        // Compare INTERVAL to next event (relative timing - KEY FIX)
        if (index < targetEvents.length - 1 && index < playerEvents.length - 1) {
            // Calculate interval between this event and next event
            const targetInterval = targetEvents[index + 1].time - targetEvents[index].time;
            const playerInterval = playerEvents[index + 1].time - playerEvents[index].time;
            const intervalDiff = Math.abs(targetInterval - playerInterval);
            
            // For simultaneous events (interval ≈ 0), allow more tolerance due to execution overhead
            const intervalTolerance = targetInterval < 10 ? 100 : tolerance;
            
            if (intervalDiff <= intervalTolerance) {
                result.details.intervalMatches++;
            } else {
                result.differences.push({
                    type: 'timing_mismatch',
                    message: `Event ${index}: Interval mismatch - expected ${targetInterval}ms between events, got ${playerInterval}ms (diff: ${intervalDiff}ms)`,
                    eventIndex: index,
                    targetTime: targetEvent.time,
                    playerTime: playerEvent.time,
                    targetInterval: targetInterval,
                    playerInterval: playerInterval,
                    intervalDiff: intervalDiff
                });
            }
        } else {
            // Last event - no next interval to check, count as match
            result.details.intervalMatches++;
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
