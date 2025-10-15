# Debugging Line Highlighting Issues

## Potential Issues to Investigate

### 1. Line Mapping Logic Issues
**File**: `js/execution/codeExecutor.js` (Lines 45-95)

**Potential Problems**:
- Brace counting might be wrong
- Comments detection might skip executable lines
- The map might not include all executable lines
- Empty `loop()` function creates empty `loopLineMap`

**Test**: Add console.log to see what's in the maps:
```javascript
console.log('📍 setupLineMap:', setupLineMap);
console.log('📍 loopLineMap:', loopLineMap);
```

### 2. Parsed Code vs Original Code Mismatch
**File**: `js/core/arduinoParser.js`

**Potential Problem**:
- The parser extracts content inside `setup() {}` and `loop() {}`
- It removes comments and processes the code
- The parsed lines might not match 1:1 with the line map

**Expected Flow**:
```
Original: motor1.attach(9, 1000, 2000);  // Line 8
Parsed:   motor1.attach(9, 1000, 2000);  // Index 0 in parsed array
Map:      setupLineMap[0] = 8           // Lookup
```

### 3. executableLineIndex Not Incrementing Correctly
**File**: `js/execution/codeExecutor.js`

**Potential Problem**:
```javascript
// Skip empty lines and comments
if (!line || line.startsWith('//')) {
    executeNextLine();
    return;  // ❌ Returns BEFORE incrementing executableLineIndex!
}

// Get actual line number from the map
const actualLineNumber = setupLineMap[executableLineIndex];
executableLineIndex++;  // Only increments if line is NOT skipped
```

**Issue**: If parsed code has empty lines, we skip them but DON'T increment `executableLineIndex`, causing mismatch!

### 4. Parser Already Removes Comments
**File**: `js/core/arduinoParser.js` (Line 353-354)

```javascript
let cleanCode = code.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove block comments
cleanCode = cleanCode.replace(/\/\/.*$/gm, ''); // Remove line comments
```

**Issue**: The parser ALREADY removes comments, so the parsed code shouldn't have `//` lines at all. But we're checking for them in the executor!

### 5. Empty Lines in Parsed Code
**File**: `js/execution/codeExecutor.js`

```javascript
const lines = setupCode.split('\n');
// If setupCode is "motor1.attach();\nmotor2.attach();\n\ndelay(3000);"
// lines = ["motor1.attach();", "motor2.attach();", "", "delay(3000);"]
```

**Issue**: Split creates empty strings for blank lines. We skip them, but this causes index mismatch!

### 6. Line Map Building - Brace Counting
**File**: `js/execution/codeExecutor.js` (Lines 74-87)

```javascript
// Track braces
if (inSetup || inLoop) {
    for (let char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
    }

    // Add executable lines to the map
    if (line && !line.startsWith('//') && line !== '{' && line !== '}' && braceCount > 0) {
```

**Potential Issues**:
- If `void setup() {` is on one line, braceCount becomes 1 immediately
- Next line check: `if (braceCount > 0)` - should be checking AFTER brace counting
- Might include the `{` line or miss first executable line

### 7. Comment Detection in Original Code
```javascript
if (line && !line.startsWith('//') && ...)
```

**Issue**: This only checks if line STARTS with `//`. What about inline comments?
```cpp
motor1.attach(9, 1000, 2000);  // Attach motor  ← Would be included!
```

### 8. Multiple Issues with Line Mapping Logic

Let me trace through an example:

**Original Code**:
```cpp
Line 6:  void setup() {
Line 7:    // Attach motors
Line 8:    motor1.attach(9, 1000, 2000);
Line 9:  }
```

**Line Map Building**:
```
i=5 (Line 6): "void setup() {"
  - Sets inSetup = true, braceCount = 0
  - continue (skips to next)

i=6 (Line 7): "  // Attach motors"
  - inSetup = true
  - Brace loop: no braces, braceCount stays 0  ❌
  - Check: braceCount > 0? NO!
  - Line NOT added to map!

WAIT! The brace counting is WRONG!
We count braces on Line 6 ("void setup() {")
But we continue before counting!
```

**BUG FOUND**: Line 6 has `{`, but we `continue` before counting it!

### 9. Fixed Brace Counting Logic

The brace should be counted BEFORE the continue:

```javascript
// Detect entering setup
if (line.includes('void setup()')) {
    inSetup = true;
    // Count opening brace if on same line
    if (line.includes('{')) {
        braceCount = 1;  // ✅ Start at 1!
    } else {
        braceCount = 0;
    }
    continue;
}
```

## Summary of Issues Found

1. **Brace counting starts at 0** when `void setup() {` has opening brace on same line
2. **Parser removes comments** from parsed code, but executor checks for them (redundant)
3. **Empty lines in parsed code** cause index mismatch
4. **executableLineIndex increments after skipping**, causing off-by-one errors
5. **Line map might be empty** if brace counting is wrong

## Recommended Fixes

### Fix 1: Correct Brace Counting
```javascript
// Detect entering setup
if (line.includes('void setup()')) {
    inSetup = true;
    braceCount = 0;
    // Count braces on this line
    for (let char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
    }
    continue;
}
```

### Fix 2: Remove Redundant Comment Checks
The parser already removes comments, so no need to check for `//` in parsed code.

### Fix 3: Handle Empty Lines Properly
```javascript
// Skip empty lines
if (!line) {
    executeNextLine();  // Don't increment executableLineIndex
    return;
}
```

### Fix 4: Debug Logging
Add logging to see what's happening:
```javascript
console.log('📍 setupLineMap:', setupLineMap);
console.log('📍 Parsed setup code:', parsedCode.setup);
console.log('📍 executableLineIndex:', executableLineIndex, 'actualLineNumber:', actualLineNumber);
```
