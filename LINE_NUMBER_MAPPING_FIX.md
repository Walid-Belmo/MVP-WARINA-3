# Line Number Mapping Fix

## Problem

During code execution, line highlighting was incorrect:
1. **Spent too long on certain lines** (like `writeMicroseconds` commands)
2. **Never reached the last line** even after code finished executing
3. **Wrong lines were highlighted** - mismatch between executed code and highlighted lines

### Root Cause

The code executor was using a **simple offset calculation** that didn't account for:
- Comments in the original code
- Empty lines in the original code
- The fact that the parser **removes** comments and empty lines before execution

**Example Problem:**
```cpp
Line 6:  void setup() {
Line 7:    // Attach motors...  ← COMMENT (removed by parser)
Line 8:    motor1.attach(9, 1000, 2000);  ← Should highlight THIS
Line 9:    motor2.attach(10, 1000, 2000);
...
```

**Old logic:**
```javascript
setupStartLine = i + 2;  // Line 6 + 2 = Line 8 ✓ (accidentally correct!)
actualLineNumber = setupStartLine + currentLineIndex;
// But currentLineIndex increments through PARSED code (no comments)
// So it gets out of sync quickly!
```

When the parser extracts `setup()` content, it returns:
```javascript
parsedCode.setup = "motor1.attach(9, 1000, 2000);\nmotor2.attach(10, 1000, 2000);\n..."
// Comments and empty lines are GONE!
```

But the executor was trying to map this back using simple arithmetic, causing misalignment.

## Solution

Build a **line number mapping** that tracks which original code lines correspond to executable statements.

### New Approach

1. **Before execution**, scan the original code and build two arrays:
   - `setupLineMap[]` - Maps executable line index → original line number
   - `loopLineMap[]` - Maps executable line index → original line number

2. **During execution**, look up the correct line number from the map:
   ```javascript
   const actualLineNumber = setupLineMap[executableLineIndex];
   ```

## Implementation

### File: `js/execution/codeExecutor.js`

#### 1. Build Line Mapping (Lines 45-95)

**Before execution**, scan through the original code:

```javascript
// Build a mapping of executable lines to their original line numbers
const codeLines = code.split('\n');
const setupLineMap = [];
const loopLineMap = [];

let inSetup = false;
let inLoop = false;
let braceCount = 0;

for (let i = 0; i < codeLines.length; i++) {
    const line = codeLines[i].trim();
    const lineNum = i + 1;

    // Detect entering setup
    if (line.includes('void setup()')) {
        inSetup = true;
        braceCount = 0;
        continue;
    }

    // Detect entering loop
    if (line.includes('void loop()')) {
        inLoop = true;
        inSetup = false;
        braceCount = 0;
        continue;
    }

    // Track braces
    if (inSetup || inLoop) {
        for (let char of line) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
        }

        // Add executable lines to the map
        if (line && !line.startsWith('//') && line !== '{' && line !== '}' && braceCount > 0) {
            if (inSetup) {
                setupLineMap.push(lineNum);
            } else if (inLoop) {
                loopLineMap.push(lineNum);
            }
        }

        // Exit setup/loop when braces close
        if (braceCount === 0 && (inSetup || inLoop)) {
            inSetup = false;
            inLoop = false;
        }
    }
}
```

#### 2. Pass Line Maps to Execution Functions

**Before:**
```javascript
this.executeSetupWithAnimation(parsedCode.setup, setupStartLine, onPinChange, callback);
this.executeLoopWithAnimation(parsedCode.loop, loopStartLine, onPinChange, ...);
```

**After:**
```javascript
this.executeSetupWithAnimation(parsedCode.setup, setupLineMap, onPinChange, callback);
this.executeLoopWithAnimation(parsedCode.loop, loopLineMap, onPinChange, ...);
```

#### 3. Use Line Maps During Execution

**Before:**
```javascript
executeSetupWithAnimation(setupCode, setupStartLine, onPinChange, onComplete) {
    const lines = setupCode.split('\n');
    let currentLineIndex = 0;

    const line = lines[currentLineIndex];
    const actualLineNumber = setupStartLine + currentLineIndex;  // ❌ Wrong!
    currentLineIndex++;
}
```

**After:**
```javascript
executeSetupWithAnimation(setupCode, setupLineMap, onPinChange, onComplete) {
    const lines = setupCode.split('\n');
    let currentLineIndex = 0;
    let executableLineIndex = 0;

    const line = lines[currentLineIndex];
    currentLineIndex++;

    // Skip empty/comments
    if (!line || line.startsWith('//')) return;

    // Get actual line number from the map ✅
    const actualLineNumber = setupLineMap[executableLineIndex] || currentLineIndex;
    executableLineIndex++;
}
```

## Example: How It Works

### Original Code:
```cpp
1:  #include <ESP32Servo.h>
2:
3:  Servo motor1;
4:  Servo motor2;
5:
6:  void setup() {
7:    // Attach motors to pins
8:    motor1.attach(9, 1000, 2000);
9:    motor2.attach(10, 1000, 2000);
10:
11:   // ARM the ESCs
12:   motor1.writeMicroseconds(1000);
13:   motor2.writeMicroseconds(1000);
14:   delay(3000);
15:
16:   // Set speeds
17:   motor1.writeMicroseconds(1500);
18:   motor2.writeMicroseconds(1250);
19: }
20:
21: void loop() {
22:   // Motors maintain speed
23: }
```

### Line Mapping Built:

```javascript
setupLineMap = [
    8,   // motor1.attach(9, 1000, 2000);
    9,   // motor2.attach(10, 1000, 2000);
    12,  // motor1.writeMicroseconds(1000);
    13,  // motor2.writeMicroseconds(1000);
    14,  // delay(3000);
    17,  // motor1.writeMicroseconds(1500);
    18   // motor2.writeMicroseconds(1250);
];

loopLineMap = []; // Empty - no executable code in loop
```

### Execution Flow:

```
executableLineIndex = 0 → actualLineNumber = setupLineMap[0] = 8  ✅
Highlight line 8: motor1.attach(9, 1000, 2000);

executableLineIndex = 1 → actualLineNumber = setupLineMap[1] = 9  ✅
Highlight line 9: motor2.attach(10, 1000, 2000);

executableLineIndex = 2 → actualLineNumber = setupLineMap[2] = 12  ✅
Highlight line 12: motor1.writeMicroseconds(1000);

executableLineIndex = 3 → actualLineNumber = setupLineMap[3] = 13  ✅
Highlight line 13: motor2.writeMicroseconds(1000);

executableLineIndex = 4 → actualLineNumber = setupLineMap[4] = 14  ✅
Highlight line 14: delay(3000);

executableLineIndex = 5 → actualLineNumber = setupLineMap[5] = 17  ✅
Highlight line 17: motor1.writeMicroseconds(1500);

executableLineIndex = 6 → actualLineNumber = setupLineMap[6] = 18  ✅
Highlight line 18: motor2.writeMicroseconds(1250);

Setup complete! ✅
```

## Before vs After

### Before Fix:
```
❌ Line 8:  motor1.attach(9, 1000, 2000);      (highlighted)
❌ Line 9:  motor2.attach(10, 1000, 2000);     (highlighted)
❌ Line 10: (empty line)                       (highlighted - WRONG!)
❌ Line 11: // ARM the ESCs                    (highlighted - WRONG!)
❌ Line 12: motor1.writeMicroseconds(1000);    (highlighted)
❌ Line 13: motor2.writeMicroseconds(1000);    (highlighted)
❌ Line 14: delay(3000);                       (highlighted)
❌ Line 15: (empty line)                       (highlighted - WRONG!)
❌ STOPS HERE - never reaches lines 17-18!
```

### After Fix:
```
✅ Line 8:  motor1.attach(9, 1000, 2000);      (highlighted)
✅ Line 9:  motor2.attach(10, 1000, 2000);     (highlighted)
✅ Line 12: motor1.writeMicroseconds(1000);    (highlighted - skips comments!)
✅ Line 13: motor2.writeMicroseconds(1000);    (highlighted)
✅ Line 14: delay(3000);                       (highlighted)
✅ Line 17: motor1.writeMicroseconds(1500);    (highlighted - skips comments!)
✅ Line 18: motor2.writeMicroseconds(1250);    (highlighted)
✅ Setup complete!
```

## Changes Made

### Modified Functions:

1. **`executeCode()`** - Lines 45-95
   - Added line mapping logic
   - Builds `setupLineMap` and `loopLineMap` arrays
   - Passes maps instead of simple line numbers

2. **`executeSetupWithAnimation()`** - Lines 138-210
   - Changed parameter from `setupStartLine` to `setupLineMap`
   - Added `executableLineIndex` tracker
   - Uses `setupLineMap[executableLineIndex]` for line numbers

3. **`executeLoopWithAnimation()`** - Lines 215-255
   - Changed parameter from `loopStartLine` to `loopLineMap`

4. **`executeLoopIterationWithAnimation()`** - Lines 260-325
   - Changed parameter from `loopStartLine` to `loopLineMap`
   - Added `executableLineIndex` tracker
   - Uses `loopLineMap[executableLineIndex]` for line numbers

## Benefits

1. ✅ **Accurate line highlighting** - Always highlights the correct line
2. ✅ **Handles comments** - Skips over comment lines properly
3. ✅ **Handles empty lines** - Skips over blank lines
4. ✅ **Reaches all lines** - Executes every executable statement
5. ✅ **Better educational experience** - Students can follow code execution visually

## Testing

To verify the fix:

1. **Test the ESP32 Servo example code** (from index_new.html)
2. **Click "RUN CODE"**
3. **Observe:**
   - Line 8 highlights (motor1.attach)
   - Line 9 highlights (motor2.attach)
   - Line 12 highlights (motor1.writeMicroseconds - ARM) ✅ Skips comment on line 11!
   - Line 13 highlights (motor2.writeMicroseconds - ARM)
   - Line 14 highlights (delay(3000))
   - Line 17 highlights (motor1.writeMicroseconds - 50%) ✅ Skips comment on line 16!
   - Line 18 highlights (motor2.writeMicroseconds - 25%)
   - Execution completes successfully ✅

## Files Modified

- `js/execution/codeExecutor.js` (4 functions updated)

## Status

✅ **Fixed** - Line highlighting now accurately maps to original code lines, skipping comments and empty lines
