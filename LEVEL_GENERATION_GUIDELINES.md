# Level Generation Guidelines

## Overview

This document provides guidelines for creating new levels for the Arduino Learning Game. The goal is to ensure levels are educational, achievable, and provide clear timing patterns that students can easily observe and replicate.

## Core Timing Principle

### ⚠️ CRITICAL: Use Full-Second Delays Only

**All delays must be full seconds (1000ms minimum) to make timing easy to observe on the elapsed timer display.**

### Why Full Seconds?

1. **Easy Observation**: Players see "00:01.0s → 00:02.0s" and know it's exactly 1000ms
2. **Clear Patterns**: Timing patterns are obvious and measurable
3. **Educational Value**: Reinforces that `delay(1000)` = 1 second
4. **Reduces Frustration**: No guessing fractional seconds
5. **Better Learning**: Students can count and measure timing easily

## Timing Standards

### ✅ Allowed Delay Values

- `delay(1000)` - 1 second
- `delay(2000)` - 2 seconds  
- `delay(3000)` - 3 seconds
- `delay(4000)` - 4 seconds
- `delay(5000)` - 5 seconds

### ❌ Avoid These Values

- `delay(100)` - Too fast, hard to observe
- `delay(500)` - Half second, confusing
- `delay(1500)` - 1.5 seconds, not full second
- `delay(750)` - Fractional timing

## Level Design Guidelines

### 1. Timing Pattern Examples

**Good Pattern - Sequential LEDs:**
```arduino
void loop() {
  digitalWrite(13, HIGH);  // At 00:01.0s
  delay(1000);
  digitalWrite(12, HIGH);  // At 00:02.0s  
  delay(1000);
  digitalWrite(11, HIGH);  // At 00:03.0s
  delay(1000);
  digitalWrite(13, LOW);   // At 00:04.0s
  delay(1000);
  digitalWrite(12, LOW);   // At 00:05.0s
  delay(1000);
  digitalWrite(11, LOW);   // At 00:06.0s
  delay(1000);
}
```

**Good Pattern - Alternating LEDs:**
```arduino
void loop() {
  digitalWrite(13, HIGH);  // At 00:01.0s
  digitalWrite(12, LOW);
  delay(1000);
  digitalWrite(13, LOW);    // At 00:02.0s
  digitalWrite(12, HIGH);
  delay(1000);
}
```

### 2. Level Progression

**Beginner Levels (1-3):**
- Use `delay(1000)` only
- Simple patterns (1-2 pins)
- Clear, obvious timing

**Intermediate Levels (4-6):**
- Mix `delay(1000)` and `delay(2000)`
- More complex patterns (3+ pins)
- PWM control introduction

**Advanced Levels (7-8):**
- Use `delay(2000)` for longer sequences
- Timer library integration
- Complex multi-pin patterns

### 3. Time Limit Guidelines

- **Beginner**: 60-90 seconds
- **Intermediate**: 90-180 seconds  
- **Advanced**: 120-300 seconds

## Level Structure Template

```javascript
{
    id: X,
    name: "Level Name",
    description: "Clear description of what the player must achieve",
    timeLimit: 120000, // Time in milliseconds
    targetCode: `void setup() {
  pinMode(13, OUTPUT);
  // Add more pinMode calls as needed
}

void loop() {
  // Use only full-second delays: 1000, 2000, 3000, etc.
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`,
    hint: "Helpful hint about the timing or pattern",
    difficulty: "beginner|intermediate|advanced",
    requiredPins: [13, 12, 11], // Pins used in the level
    maxEvents: 8, // Approximate number of pin state changes
    requiresPWM: false, // Set to true if PWM is required
    requiresTimer1: false // Set to true if TimerOne library is required
}
```

## Testing Your Level

### Before Adding a Level:

1. **Test the Target Code**: Ensure it works as expected
2. **Verify Timing**: Check that all delays are full seconds
3. **Observe the Pattern**: Watch the elapsed timer during playback
4. **Time the Sequence**: Ensure it fits within the time limit
5. **Check Difficulty**: Make sure it's appropriate for the level

### Elapsed Timer Observation:

When you play the target animation, you should see:
- Pin changes at full-second marks (00:01.0s, 00:02.0s, etc.)
- Clear, measurable intervals between state changes
- Obvious patterns that students can replicate

## Common Mistakes to Avoid

### ❌ Bad Timing Examples

```arduino
// DON'T: Fractional seconds
delay(500);   // 0.5 seconds - hard to observe
delay(1500);  // 1.5 seconds - confusing
delay(750);   // 0.75 seconds - impossible to measure

// DON'T: Too fast
delay(100);   // 0.1 seconds - too quick to see
delay(50);    // 0.05 seconds - impossible to observe
```

### ✅ Good Timing Examples

```arduino
// DO: Full seconds only
delay(1000);  // 1 second - perfect
delay(2000);  // 2 seconds - clear
delay(3000);  // 3 seconds - obvious
```

## Level Categories

### Digital Control Levels
- Basic `digitalWrite()` and `delay()`
- LED blinking patterns
- Multi-pin sequences

### PWM Control Levels  
- `setDutyCycle()` for motor control
- Variable speed patterns
- PWM timing sequences

### Timer Library Levels
- `TimerOne.h` for servo control
- `Timer0.h` for motor PWM
- Library-specific timing

## Quality Checklist

Before submitting a level, verify:

- [ ] All delays are full seconds (1000ms, 2000ms, etc.)
- [ ] Timing pattern is clear and observable
- [ ] Level fits within time limit
- [ ] Difficulty matches the level number
- [ ] Hint is helpful but not too revealing
- [ ] Required pins are correctly listed
- [ ] Code follows Arduino best practices
- [ ] Pattern is educational and engaging

## Example Level Creation

### Step 1: Design the Pattern
"I want a level where LEDs turn on sequentially, then turn off in reverse order"

### Step 2: Write the Code
```arduino
void setup() {
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(11, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);  // 00:01.0s
  delay(1000);
  digitalWrite(12, HIGH);  // 00:02.0s
  delay(1000);
  digitalWrite(11, HIGH);  // 00:03.0s
  delay(1000);
  digitalWrite(11, LOW);   // 00:04.0s
  delay(1000);
  digitalWrite(12, LOW);   // 00:05.0s
  delay(1000);
  digitalWrite(13, LOW);   // 00:06.0s
  delay(1000);
}
```

### Step 3: Test and Verify
- Play the target animation
- Observe elapsed timer shows: 01.0s, 02.0s, 03.0s, 04.0s, 05.0s, 06.0s
- Verify pattern is clear and educational

### Step 4: Add to Level Data
```javascript
{
    id: 9,
    name: "Sequential Wave",
    description: "Make LEDs turn on in sequence, then off in reverse",
    timeLimit: 120000,
    targetCode: `[code above]`,
    hint: "Use multiple pins with 1 second delays",
    difficulty: "intermediate",
    requiredPins: [11, 12, 13],
    maxEvents: 6
}
```

## Conclusion

Remember: **Full-second delays make timing easy to observe and learn from**. This is the most important principle for creating effective educational levels.

When in doubt, use `delay(1000)` - it's the most educational and easiest to observe timing for students learning Arduino programming.
