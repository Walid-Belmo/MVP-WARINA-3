# Comprehensive Line Highlighting Fixes

## Problems Identified

### 1. **Brace Counting Was Wrong** ❌ CRITICAL BUG
**Location**: `js/execution/codeExecutor.js` (Lines 59-68 OLD)

**The Bug**:
```javascript
// OLD CODE (WRONG):
if (line.includes('void setup()')) {
    inSetup = true;
    braceCount = 0;  // ❌ Set to 0
    continue;         // ❌ Skip before counting braces on this line!
}

// Next iteration:
// braceCount is 0, so first line check fails: braceCount > 0? NO!
```

**What Happened**:
- Line `void setup() {` has an opening brace `{`
- We set `inSetup = true` and `braceCount = 0`
- We `continue` WITHOUT counting the `{` on this line
- Next line (first executable line) gets checked with `braceCount = 0`
- Check: `if (braceCount > 0)` → FALSE!
- **First executable line is SKIPPED from the map!**

**The Fix**:
```javascript
// NEW CODE (CORRECT):
if (line.includes('void setup()')) {
    inSetup = true;
    braceCount = 0;
    // Count opening brace if on same line ✅
    for (let char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
    }
    continue;  // Now braceCount = 1 ✅
}
```

### 2. **Brace Counting Happened AFTER Line Check** ❌
**Location**: `js/execution/codeExecutor.js` (Lines 74-87 OLD)

**The Bug**:
```javascript
// OLD ORDER:
// 1. Count braces FIRST
for (let char of line) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
}

// 2. Check if executable (uses UPDATED braceCount)
if (braceCount > 0) {
    // Add to map
}
```

**What Happened**:
- If line has `}`, braceCount decrements
- THEN we check `if (braceCount > 0)`
- Closing brace line affects whether THAT line is added
- **Off-by-one errors in the map!**

**The Fix**:
```javascript
// NEW ORDER:
// 1. Check if executable FIRST (using CURRENT braceCount)
const isExecutable = braceCount > 0 && line && ...;
if (isExecutable) {
    setupLineMap.push(lineNum);
}

// 2. THEN update braceCount for NEXT iteration
for (let char of line) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
}
```

### 3. **Missing Comment Detection** ⚠️
**Location**: `js/execution/codeExecutor.js` (Line 87 OLD)

**Added**: Detection for block comments `/*`
```javascript
const isExecutable = line &&
                    !line.startsWith('//') &&   // Line comments
                    !line.startsWith('/*') &&   // Block comments ✅ NEW
                    line !== '{' &&
                    line !== '}' &&
                    braceCount > 0;
```

### 4. **No Debug Visibility** 🔍
**Added**: Comprehensive debug logging

```javascript
// Log the maps after building
console.log('📍 Line mapping complete:');
console.log('   setupLineMap:', setupLineMap);
console.log('   loopLineMap:', loopLineMap);
console.log('   Parsed setup code lines:', parsedCode.setup.split('\n').filter(l => l.trim()));
console.log('   Parsed loop code lines:', parsedCode.loop.split('\n').filter(l => l.trim()));

// Log during execution
console.log(`📍 Setup execution: executableLineIndex=${executableLineIndex}, actualLineNumber=${actualLineNumber}, line="${line}"`);
console.log(`📍 Loop execution: executableLineIndex=${executableLineIndex}, actualLineNumber=${actualLineNumber}, line="${line}"`);
```

## Complete Fixed Code

### File: `js/execution/codeExecutor.js` (Lines 54-120)

```javascript
for (let i = 0; i < codeLines.length; i++) {
    const line = codeLines[i].trim();
    const lineNum = i + 1;

    // Detect entering setup
    if (line.includes('void setup()')) {
        inSetup = true;
        braceCount = 0;
        // Count opening brace if on same line ✅ FIX 1
        for (let char of line) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
        }
        continue;
    }

    // Detect entering loop
    if (line.includes('void loop()')) {
        inLoop = true;
        inSetup = false;
        braceCount = 0;
        // Count opening brace if on same line ✅ FIX 1
        for (let char of line) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
        }
        continue;
    }

    // Track braces and add executable lines
    if (inSetup || inLoop) {
        // First, check if this is an executable line ✅ FIX 2
        // (before brace counting changes state)
        const isExecutable = line &&
                            !line.startsWith('//') &&
                            !line.startsWith('/*') &&  // ✅ FIX 3
                            line !== '{' &&
                            line !== '}' &&
                            braceCount > 0;

        if (isExecutable) {
            if (inSetup) {
                setupLineMap.push(lineNum);
            } else if (inLoop) {
                loopLineMap.push(lineNum);
            }
        }

        // Then update brace count for next iteration ✅ FIX 2
        for (let char of line) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
        }

        // Exit setup/loop when braces close
        if (braceCount === 0) {
            inSetup = false;
            inLoop = false;
        }
    }
}

// Debug logging ✅ FIX 4
console.log('📍 Line mapping complete:');
console.log('   setupLineMap:', setupLineMap);
console.log('   loopLineMap:', loopLineMap);
console.log('   Parsed setup code lines:', parsedCode.setup.split('\n').filter(l => l.trim()));
console.log('   Parsed loop code lines:', parsedCode.loop.split('\n').filter(l => l.trim()));
```

## Example: How It Works Now

### ESP32 Servo Code:
```cpp
Line 1:  #include <ESP32Servo.h>
Line 2:
Line 3:  Servo motor1;
Line 4:  Servo motor2;
Line 5:
Line 6:  void setup() {
Line 7:    // Attach motors to pins
Line 8:    motor1.attach(9, 1000, 2000);
Line 9:    motor2.attach(10, 1000, 2000);
Line 10:
Line 11:   // ARM the ESCs
Line 12:   motor1.writeMicroseconds(1000);
Line 13:   motor2.writeMicroseconds(1000);
Line 14:   delay(3000);
Line 15:
Line 16:   // Set speeds
Line 17:   motor1.writeMicroseconds(1500);
Line 18:   motor2.writeMicroseconds(1250);
Line 19: }
Line 20:
Line 21: void loop() {
Line 22:   // Motors maintain speed
Line 23: }
```

### Line Mapping Process:

```
i=5 (Line 6): "void setup() {"
  - inSetup = true
  - braceCount = 0
  - Count braces: '{' found → braceCount = 1 ✅
  - continue

i=6 (Line 7): "// Attach motors to pins"
  - inSetup = true
  - isExecutable? line.startsWith('//')? YES → NOT executable ✅
  - NOT added to map
  - braceCount stays 1

i=7 (Line 8): "motor1.attach(9, 1000, 2000);"
  - inSetup = true
  - isExecutable? braceCount > 0? YES, !startsWith('//')? YES → EXECUTABLE ✅
  - setupLineMap.push(8) ✅
  - braceCount stays 1

i=8 (Line 9): "motor2.attach(10, 1000, 2000);"
  - isExecutable? YES ✅
  - setupLineMap.push(9) ✅

i=9 (Line 10): ""  (empty)
  - line is empty string → NOT executable ✅
  - NOT added to map

i=10 (Line 11): "// ARM the ESCs"
  - Starts with '//' → NOT executable ✅
  - NOT added to map

i=11 (Line 12): "motor1.writeMicroseconds(1000);"
  - isExecutable? YES ✅
  - setupLineMap.push(12) ✅

... and so on ...

FINAL MAP:
setupLineMap = [8, 9, 12, 13, 14, 17, 18]  ✅ CORRECT!
loopLineMap = []  ✅ CORRECT (empty loop body)
```

### Execution with Map:

```
executableLineIndex = 0:
  - parsedLine: "motor1.attach(9, 1000, 2000);"
  - actualLineNumber = setupLineMap[0] = 8  ✅
  - Highlight line 8 ✅

executableLineIndex = 1:
  - parsedLine: "motor2.attach(10, 1000, 2000);"
  - actualLineNumber = setupLineMap[1] = 9  ✅
  - Highlight line 9 ✅

executableLineIndex = 2:
  - parsedLine: "motor1.writeMicroseconds(1000);"
  - actualLineNumber = setupLineMap[2] = 12  ✅
  - Highlight line 12 ✅ (skips comments!)

executableLineIndex = 3:
  - parsedLine: "motor2.writeMicroseconds(1000);"
  - actualLineNumber = setupLineMap[3] = 13  ✅
  - Highlight line 13 ✅

executableLineIndex = 4:
  - parsedLine: "delay(3000);"
  - actualLineNumber = setupLineMap[4] = 14  ✅
  - Highlight line 14 ✅

executableLineIndex = 5:
  - parsedLine: "motor1.writeMicroseconds(1500);"
  - actualLineNumber = setupLineMap[5] = 17  ✅
  - Highlight line 17 ✅ (skips comments!)

executableLineIndex = 6:
  - parsedLine: "motor2.writeMicroseconds(1250);"
  - actualLineNumber = setupLineMap[6] = 18  ✅
  - Highlight line 18 ✅

Setup complete! All lines highlighted correctly! ✅
```

## Debugging Guide

### How to Check if It's Working:

1. **Open browser console** (F12)
2. **Run the ESP32 Servo example code**
3. **Look for these logs**:

```
📍 Line mapping complete:
   setupLineMap: [8, 9, 12, 13, 14, 17, 18]
   loopLineMap: []
   Parsed setup code lines: [
       "motor1.attach(9, 1000, 2000);",
       "motor2.attach(10, 1000, 2000);",
       "motor1.writeMicroseconds(1000);",
       "motor2.writeMicroseconds(1000);",
       "delay(3000);",
       "motor1.writeMicroseconds(1500);",
       "motor2.writeMicroseconds(1250);"
   ]
```

4. **Verify the maps**:
   - Count of `setupLineMap` should match count of parsed lines ✅
   - Line numbers should skip comments and empty lines ✅

5. **During execution, watch**:
```
📍 Setup execution: executableLineIndex=0, actualLineNumber=8, line="motor1.attach(9, 1000, 2000);"
🎯 Highlighting line 8: "  motor1.attach(9, 1000, 2000);"
```

### What to Look For:

✅ **Good Signs**:
- setupLineMap has same number of elements as parsed lines
- Line numbers skip comments (e.g., 8, 9, then 12 instead of 10, 11)
- Each line highlights for 300ms
- delay() lines highlight for their delay duration

❌ **Bad Signs**:
- setupLineMap is empty or too short
- Line numbers are sequential (not skipping comments)
- Lines highlight too fast or stay too long
- Wrong lines are highlighted

## Files Modified

1. **`js/execution/codeExecutor.js`**:
   - Lines 54-120: Fixed line mapping logic
   - Lines 186-188: Added debug logging in setup execution
   - Lines 309-311: Added debug logging in loop execution

## Summary

Fixed **4 critical bugs** in the line highlighting system:

1. ✅ **Brace counting on `void setup() {` line**
2. ✅ **Order of brace counting vs executable check**
3. ✅ **Missing block comment detection**
4. ✅ **Added comprehensive debug logging**

The highlighting should now:
- ✅ Map all executable lines correctly
- ✅ Skip comments and empty lines
- ✅ Highlight the correct original line numbers
- ✅ Show each line for 300ms (plus delay durations)
- ✅ Coordinate with microcontroller simulation

**Test it now with the ESP32 Servo example code!**
