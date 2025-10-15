# PWM Visualization Fix for 0% Throttle

## Problem

When ESC motors were set to 0% throttle using `motor.writeMicroseconds(1000)`, they appeared completely "off" in the visual interface, even though they were actually armed and active.

**Root Cause**:
- 1000µs = 0% throttle in the 1000-2000µs range
- Calculation: `percentage = ((1000 - 1000) / (2000 - 1000)) * 100 = 0%`
- PWM value: `(0 / 100) * 255 = 0`
- `pwmValues[pin] = 0` made the motor appear completely inactive

## Solution

Set a **minimum PWM value of 1** for attached motors, even at 0% throttle. This differentiates between:

1. **Motor not attached** → `pwmValues[pin] = 0` (truly off)
2. **Motor at 0% throttle** → `pwmValues[pin] = 1` (active/armed, but at minimum speed)

## Code Changes

### `js/core/arduinoParser.js`

#### `servoWriteMicroseconds()` - Line 167-180
```javascript
// OLD (caused issue):
const percentage = ((us - servo.min) / (servo.max - servo.min)) * 100;
this.pwmValues[servo.pin] = Math.round((percentage / 100) * 255);

// NEW (fixed):
const percentage = ((us - servo.min) / (servo.max - servo.min)) * 100;
const rawPwmValue = Math.round((percentage / 100) * 255);

// IMPORTANT: For ESC visualization, we need to show the motor as "active" even at 0% throttle
// Set minimum PWM value to 1 so motors show as connected/armed (not completely off)
// This differentiates between "motor not attached" (0) and "motor at 0% throttle" (1+)
this.pwmValues[servo.pin] = rawPwmValue === 0 ? 1 : rawPwmValue;
```

#### `servoWrite()` - Line 135-148
Same fix applied for angle-based control:
```javascript
const rawPwmValue = Math.round((percentage / 100) * 255);
// IMPORTANT: Set minimum PWM value to 1 so motors show as active even at 0°/0% throttle
this.pwmValues[servo.pin] = rawPwmValue === 0 ? 1 : rawPwmValue;
```

## Visual Result

### Before Fix:
```
motor.writeMicroseconds(1000);  // 0% throttle
→ pwmValues[9] = 0
→ Motor appears OFF (no visual indication)
```

### After Fix:
```
motor.writeMicroseconds(1000);  // 0% throttle
→ pwmValues[9] = 1
→ Motor appears ACTIVE at minimum brightness (shows it's armed)
```

## Testing

To verify the fix works:

1. **Test Level 11** ("First ESC - ARM"):
   ```cpp
   #include <ESP32Servo.h>

   Servo motor;

   void setup() {
     motor.attach(9, 1000, 2000);
     motor.writeMicroseconds(1000);  // Should show as active now!
     delay(3000);
   }

   void loop() {
     motor.writeMicroseconds(1000);  // Motor visible at 0%
     delay(2000);
   }
   ```
   - ✅ Motor component should show as **dimly lit** (PWM value = 1)
   - ✅ Different from a completely dark/unattached motor (PWM value = 0)

2. **Test Level 12** ("Two Speeds"):
   ```cpp
   void loop() {
     motor.writeMicroseconds(1250);  // 25% - brighter
     delay(2000);
     motor.writeMicroseconds(1500);  // 50% - even brighter
     delay(2000);
   }
   ```
   - ✅ Motor should visibly change brightness at different throttle levels

## PWM Value Mapping

| Pulse Width | Throttle % | Raw PWM | **Final PWM** | Visual Result |
|-------------|-----------|---------|---------------|---------------|
| 1000µs      | 0%        | 0       | **1** ✨      | Dimly visible (armed) |
| 1250µs      | 25%       | 64      | 64            | Quarter brightness |
| 1500µs      | 50%       | 128     | 128           | Half brightness |
| 1750µs      | 75%       | 191     | 191           | Three-quarter brightness |
| 2000µs      | 100%      | 255     | 255           | Full brightness |

## Educational Benefit

This fix helps students understand the **ARM sequence** concept:
- When code runs `writeMicroseconds(1000)` in setup, the motor now **visibly responds**
- Students can see that 0% throttle is NOT the same as "motor off"
- It's clearer that the motor is "armed and ready" at minimum throttle

## Files Modified

- `js/core/arduinoParser.js` (2 functions updated: `servoWriteMicroseconds`, `servoWrite`)

## Status

✅ **Fixed** - Motors now show as active even at 0% throttle (PWM value = 1 minimum)
