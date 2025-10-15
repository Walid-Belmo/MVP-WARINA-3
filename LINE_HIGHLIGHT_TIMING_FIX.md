# Line Highlighting Timing Fix

## Problem

During code execution, line highlights were flashing too quickly and were barely visible. Users couldn't see which line was being executed.

### Root Cause

In `js/execution/codeExecutor.js`, non-delay commands were executing with only a **50ms timeout** before moving to the next line:

```javascript
// OLD CODE (too fast):
const timeout = setTimeout(() => {
    if (this.isExecuting) {
        executeNextLine();
    }
}, 50);  // Only 50ms!
```

This meant:
1. Line X highlights
2. After 50ms, line X+1 highlights (which clears line X's highlight)
3. User can barely see the highlight flash

## Solution

Increased the timeout to **300ms** for non-delay commands, giving users enough time to visually track which line is executing.

```javascript
// NEW CODE (better visibility):
const timeout = setTimeout(() => {
    if (this.isExecuting) {
        executeNextLine();
    }
}, 300);  // 300ms - much more visible!
```

## Changes Made

### File: `js/execution/codeExecutor.js`

#### 1. Setup Execution (Line 155-160)
**Before:**
```javascript
const timeout = setTimeout(() => {
    if (this.isExecuting) {
        executeNextLine();
    }
}, 50);
```

**After:**
```javascript
// Keep highlight visible for 300ms so user can see what's executing
const timeout = setTimeout(() => {
    if (this.isExecuting) {
        executeNextLine();
    }
}, 300);
```

#### 2. Loop Execution (Line 270-275)
**Before:**
```javascript
const timeout = setTimeout(() => {
    if (this.isExecuting) {
        executeNextLine();
    }
}, 50);
```

**After:**
```javascript
// Keep highlight visible for 300ms so user can see what's executing
const timeout = setTimeout(() => {
    if (this.isExecuting) {
        executeNextLine();
    }
}, 300);
```

## Execution Timing Breakdown

### Before Fix:
```
pinMode(13, OUTPUT);     ← Highlight for 50ms
digitalWrite(13, HIGH);  ← Highlight for 50ms (previous line cleared)
delay(1000);            ← Highlight for 1000ms (delay duration)
digitalWrite(13, LOW);   ← Highlight for 50ms
delay(1000);            ← Highlight for 1000ms
```

Total visible time per non-delay line: **50ms** ❌ (too fast!)

### After Fix:
```
pinMode(13, OUTPUT);     ← Highlight for 300ms ✅
digitalWrite(13, HIGH);  ← Highlight for 300ms ✅
delay(1000);            ← Highlight for 1000ms ✅
digitalWrite(13, LOW);   ← Highlight for 300ms ✅
delay(1000);            ← Highlight for 1000ms ✅
```

Total visible time per non-delay line: **300ms** ✅ (clearly visible!)

## Visual Impact

### Non-Delay Commands
- **pinMode()**: 300ms highlight
- **digitalWrite()**: 300ms highlight
- **motor.attach()**: 300ms highlight
- **motor.writeMicroseconds()**: 300ms highlight

### Delay Commands
- **delay(1000)**: 1000ms highlight (unchanged - still uses the delay duration)
- **delay(2000)**: 2000ms highlight (unchanged)

## Why 300ms?

- **50ms**: Too fast - users can barely see it
- **300ms**: Sweet spot - clearly visible without feeling slow
- **500ms+**: Too slow - feels sluggish during execution

300ms is long enough to:
- ✅ See which line is highlighted
- ✅ Track execution flow visually
- ✅ Associate the highlight with the pin changes on the left panel
- ✅ Not feel sluggish or overly slow

## Testing

To verify the fix:

1. **Open Level 1** (basic LED blink)
2. **Click "RUN CODE"**
3. **Observe:**
   - Each line should be clearly visible as it highlights
   - `pinMode(13, OUTPUT)` → visible for 300ms
   - `digitalWrite(13, HIGH)` → visible for 300ms
   - `delay(1000)` → visible for 1000ms
   - `digitalWrite(13, LOW)` → visible for 300ms
   - `delay(1000)` → visible for 1000ms

### Expected Behavior:
- ✅ You can **read** the line being highlighted
- ✅ You can **see** the pin change on the left at the same time
- ✅ The execution doesn't feel too slow or sluggish
- ✅ The flow is smooth and educational

## Educational Benefit

This fix helps students:
1. **Understand execution flow** - see exactly what line is running
2. **Connect code to hardware** - associate highlighted line with pin changes
3. **Debug their code** - track where execution is and what's happening
4. **Learn timing concepts** - see how delay() affects execution speed

## Files Modified

- `js/execution/codeExecutor.js` (2 locations updated)

## Status

✅ **Fixed** - Line highlights now visible for 300ms (6x longer than before)
