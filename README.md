# ESP32 Learning Game - Code Architecture

## Overview

This is an interactive educational game designed to teach kids how to program ESP32 microcontrollers. The game simulates an ESP32 environment where players can connect components (LEDs, ESC motors), write code, and see the results in real-time.

## Project Structure

```
MVP WAKRINA 3/
├── index.html              # Original monolithic file (archived)
├── index_new.html          # Main HTML file (modular structure)
├── styles.css              # Original styles (kept for compatibility)
├── fx.js                   # Background particle effects
├── README.md               # This documentation
├── css/                    # Organized CSS files
│   ├── main.css           # Main CSS import file
│   ├── base.css           # Base styles and reset
│   ├── background.css     # Animated background effects
│   ├── layout.css         # Layout and container styles
│   ├── microcontroller.css # Microcontroller and pin styles
│   ├── components.css     # Component management styles
│   ├── editor.css         # Code editor styles
│   ├── ui.css             # UI components and buttons
│   └── timer.css          # Timer and status panel styles
└── js/                     # JavaScript modules
    ├── app.js             # Main application entry point
    ├── core/              # Core game logic
    │   ├── gameState.js   # Game state management
    │   ├── pinManager.js  # Pin operations and PWM control
    │   ├── arduinoParser.js # ESP32 code parser and executor
    │   ├── sequenceExtractor.js # Extract sequences from code
    │   └── sequenceValidator.js # Validate execution sequences
    ├── execution/         # Code execution systems
    │   ├── codeExecutor.js      # Execute ESP32 code with timing
    │   └── executionRecorder.js # Record execution events
    ├── game/              # Game flow management
    │   ├── gameFlowManager.js   # Level progression and game state
    │   └── validationManager.js # Validate player execution
    ├── levels/            # Level system
    │   ├── levelData.js   # Level definitions
    │   └── levelManager.js # Level loading and management
    ├── components/        # Component management
    │   └── componentManager.js # LED and Motor component handling
    └── ui/                # User interface systems
        ├── uiManager.js          # UI coordinator (slim)
        ├── eventManager.js       # Event handling
        ├── modalManager.js       # Modal dialogs and messages
        ├── visualEffectsManager.js # Visual effects and particles
        ├── codeEditor.js         # Code editor with syntax highlighting
        ├── timerManager.js       # Timer display and countdown
        └── targetAnimationPlayer.js # Target sequence animation
```

## Architecture Overview

The application follows a modular architecture with clear separation of concerns. Each module has a single, well-defined responsibility.

### 1. Core Systems (`js/core/`)

#### GameState (`gameState.js`)
- **Purpose**: Central state management for the entire game
- **Key Data**: Pin states, PWM values, duty cycles, pin modes, component connections

#### PinManager (`pinManager.js`)
- **Purpose**: Handles all pin-related operations and visual updates
- **Key Methods**: `togglePin()`, `setPinMode()`, `setDutyCycle()`, `updatePinVisual()`

#### ArduinoParser (`arduinoParser.js`) - **Now ESP32Parser!**
- **Purpose**: Parses and executes ESP32-style code with Servo library support
- **Key Methods**: `parseCode()`, `executeLine()`, `getPinState()`
- **Supported Commands**:
  - `pinMode()`, `digitalWrite()`, `delay()`
  - `Servo.attach()`, `Servo.writeMicroseconds()`, `Servo.write()`, `Servo.detach()`

#### SequenceExtractor & SequenceValidator (`sequenceExtractor.js`, `sequenceValidator.js`)
- **Purpose**: Extract sequences from code and validate player execution

### 2. Execution Systems (`js/execution/`)

#### CodeExecutor (`codeExecutor.js`)
- **Purpose**: Execute ESP32 code with proper timing and animation
- **Key Methods**: `executeCode()`, `stopExecution()`, timing control
- **Size**: ~400 lines (focused responsibility)

#### ExecutionRecorder (`executionRecorder.js`)
- **Purpose**: Record pin events during execution for validation
- **Key Methods**: `recordPinEvent()`, `buildSequenceFromExecution()`
- **Size**: ~100 lines (single responsibility)

### 3. Game Flow Systems (`js/game/`)

#### GameFlowManager (`gameFlowManager.js`)
- **Purpose**: Manage game state, level progression, win/lose conditions
- **Key Methods**: `loadLevel()`, `playTargetAnimation()`, `handleWin()`, `handleLose()`
- **Size**: ~250 lines (focused on game flow)

#### ValidationManager (`validationManager.js`)
- **Purpose**: Validate player execution against target sequence
- **Key Methods**: `validateExecution()` with callbacks
- **Size**: ~50 lines (single responsibility)

### 4. Level System (`js/levels/`)

#### LevelData & LevelManager (`levelData.js`, `levelManager.js`)
- **Purpose**: Store and manage level definitions
- **Key Data**: 20 levels teaching ESP32 programming
- **Categories**:
  - **Beginner (Levels 1-10)**: Basic digital control with digitalWrite()
  - **Advanced (Levels 11-20)**: ESC motor control with ESP32 Servo library

### 5. Component System (`js/components/`)

#### ComponentManager (`componentManager.js`)
- **Purpose**: Manage LED and ESC Motor components
- **Key Methods**: `addLEDComponent()`, `addMotorComponent()`, `updateComponentStates()`
- **Auto-Spawn**: Levels can automatically create and connect components

### 6. UI Systems (`js/ui/`)

#### UIManager (`uiManager.js`) - **COORDINATOR**
- **Purpose**: Coordinate between all sub-managers (slim coordinator)
- **Size**: ~300 lines (down from 1698 lines!)
- **Key Methods**: Initialize sub-managers, delegate actions, update displays

#### EventManager (`eventManager.js`)
- **Purpose**: Handle all user input events
- **Key Methods**: `setupPinEventListeners()`, `setupKeyboardControls()`, `setupButtonEventListeners()`
- **Size**: ~200 lines (pure event handling)

#### ModalManager (`modalManager.js`)
- **Purpose**: Manage all modal dialogs and messages
- **Key Methods**: `showWinModal()`, `showError()`, `showMessage()`
- **Size**: ~150 lines (modal management)

#### VisualEffectsManager (`visualEffectsManager.js`)
- **Purpose**: Manage visual effects and particles
- **Key Methods**: `createDynamicParticle()`, `addPlayerExecutionVisualEffects()`
- **Size**: ~200 lines (visual effects)

#### CodeEditor, TimerManager, TargetAnimationPlayer
- **Purpose**: Specialized UI components
- **Maintained**: Existing modular structure

### 7. Main Application (`js/app.js`)

#### ArduinoLearningGame (Name kept for compatibility)
- **Purpose**: Application entry point
- **Key Methods**: `init()`, `start()`, `verifyDependencies()`, `setupGlobalFunctions()`

## Key Features

### 1. Interactive ESP32 Microcontroller
- 6 digital pins (D8-D13) with visual feedback
- PWM/Servo control for ESC motors
- Pin mode switching (Digital ↔ PWM)
- Visual indicators for pin states

### 2. Component System
- LED components with ON/OFF control
- ESC Motor components with speed control (via Servo library)
- Visual connection lines
- Auto-spawn components for tutorial levels

### 3. Code Editor
- ESP32-style syntax with Servo library support
- Auto-completion for ESP32 functions
- Line numbers and cursor position
- Auto-indentation

### 4. Code Execution
- Real-time ESP32 code parsing
- Setup and loop function execution
- Pin state synchronization
- Error handling and validation

### 5. ESP32 Servo Library Support
- `#include <ESP32Servo.h>` validation
- `Servo` object creation and management
- `attach(pin, min, max)` - Attach servo/ESC to pin
- `writeMicroseconds(us)` - Direct pulse width control (1000-2000µs)
- `write(angle)` - Angle-based control (0-180°)
- `detach()` - Detach servo from pin

### 6. Interactive Controls
- Click pins to toggle states
- Press 'P' + click for PWM mode
- Number keys (0-9) for PWM duty cycles
- +/- keys for fine PWM adjustment

## ESP32 Programming Concepts Taught

### Beginner Levels (1-10): Digital Control
- `pinMode(pin, OUTPUT)` - Configure pin as output
- `digitalWrite(pin, HIGH/LOW)` - Turn LEDs on/off
- `delay(ms)` - Timing control
- Multi-pin coordination
- Sequential patterns

### Advanced Levels (11-20): ESC/Motor Control
- `#include <ESP32Servo.h>` - Import Servo library
- `Servo objectName;` - Create Servo object
- `objectName.attach(pin, 1000, 2000);` - Attach ESC to pin
- **ARM Sequence**: `writeMicroseconds(1000)` + `delay(3000)` - Safety protocol
- `objectName.writeMicroseconds(us);` - Control ESC speed:
  - 1000µs = 0% throttle (stopped/armed)
  - 1250µs = 25% throttle
  - 1500µs = 50% throttle
  - 1750µs = 75% throttle
  - 2000µs = 100% throttle
- Combining digital LED control with ESC motor control

## How to Use

### For Developers

1. **Adding New ESP32 Functions**:
   - Extend `ArduinoParser` class in `arduinoParser.js`
   - Add function to `executeLine()` method
   - Update auto-completion in `CodeEditor`

2. **Adding New Components**:
   - Extend `ComponentManager` class
   - Add component type to `renderComponents()`
   - Create corresponding CSS styles

3. **Creating New Levels**:
   - Add level definition to `LEVELS` array in `levelData.js`
   - Use `autoComponents` for tutorial-style levels
   - Choose appropriate difficulty: "beginner" or "advanced"

4. **Modifying UI**:
   - Update CSS files in `css/` directory
   - Modify `UIManager` for new interactions
   - Add new event listeners as needed

### For Users

1. **Connecting Components**:
   - Most levels auto-spawn components (no manual setup needed!)
   - For manual mode: Click "Add LED" or "Add Motor" buttons
   - Click on component boxes to connect to available pins

2. **Writing ESP32 Code**:
   - Use the code editor to write ESP32-style code
   - Start with `#include <ESP32Servo.h>` for motor levels
   - Use auto-completion (type function names)
   - Click "RUN CODE" to execute

3. **Controlling Pins** (Manual Mode):
   - Click pins to toggle digital states
   - Press 'P' + click pin to enter PWM mode
   - Use number keys (0-9) to set PWM duty cycles

## File Dependencies

### JavaScript Loading Order
1. `js/core/gameState.js` - Core state management
2. `js/core/pinManager.js` - Pin operations (depends on gameState)
3. `js/core/arduinoParser.js` - ESP32 code parsing
4. `js/components/componentManager.js` - Component management (depends on gameState)
5. `js/ui/codeEditor.js` - Code editor
6. `js/ui/uiManager.js` - UI management (depends on all above)
7. `fx.js` - Background effects
8. `js/app.js` - Main application (depends on all above)

### CSS Loading Order
- `css/main.css` imports all other CSS files in the correct order

## Architecture Evolution

### Phase 1: Original Monolith
- `index.html`: 2651 lines with embedded CSS and JavaScript
- Everything in one file - difficult to maintain and modify

### Phase 2: Initial Modularization
- Split CSS into separate files (`css/` folder)
- Split JavaScript into modules (`js/` folder)
- Created `index_new.html` with proper imports
- **Result**: Better but `uiManager.js` grew to 1698 lines

### Phase 3: Optimized Architecture
- **UIManager split into 7 focused modules**:
  - `codeExecutor.js` - Code execution (~400 lines)
  - `executionRecorder.js` - Event recording (~100 lines)
  - `gameFlowManager.js` - Game state (~250 lines)
  - `validationManager.js` - Validation (~50 lines)
  - `eventManager.js` - Event handling (~200 lines)
  - `modalManager.js` - UI dialogs (~150 lines)
  - `visualEffectsManager.js` - Visual effects (~200 lines)
  - `uiManager.js` - Slim coordinator (~300 lines)

### Phase 4: ESP32 Transformation (Current)
- **Removed Arduino-specific code** (Timer1, Timer0, setDutyCycle)
- **Added ESP32 Servo library support** for real ESC control
- **Updated all 20 levels** to teach ESP32 programming
- **Reorganized categories**: Beginner (Digital) → Advanced (ESC/Motor)

### Benefits of Current Architecture

1. **Single Responsibility Principle**: Each module has one clear purpose
2. **Better Maintainability**: Easy to find and modify specific functionality
3. **Improved Testability**: Smaller, focused units are easier to test
4. **No Code Duplication**: Consolidated duplicate methods
5. **Clear Dependencies**: Explicit relationships between modules
6. **Easier Feature Addition**: Know exactly where to add new code
7. **Better Documentation**: Smaller files are easier to understand
8. **Reduced Cognitive Load**: Work on one concern at a time
9. **Real-World Skills**: Students learn actual ESP32 programming used in robotics/drones

### Code Reduction Summary
- **Before**: `index.html` (2651 lines) + `uiManager.js` (1698 lines) = **4349 lines in 2 files**
- **After**: Distributed across **17 focused modules**, largest is ~400 lines
- **UIManager**: Reduced from 1698 to ~300 lines (**82% reduction!**)

## Troubleshooting

### Common Issues

1. **Components not connecting**: Check if pins are available in `gameState.connections`
2. **Code not executing**: Verify ESP32 syntax in `arduinoParser.js`
3. **Visual updates not working**: Check `updatePinVisual()` and `updateComponentStates()`
4. **Servo not working**: Ensure `#include <ESP32Servo.h>` is at the top of your code
5. **ESC not responding**: Check ARM sequence (1000µs + 3000ms delay in setup)

### Debug Mode

Enable console logging by checking browser developer tools. All major operations are logged with emoji prefixes for easy identification.

## Contributing

When making changes:

1. **Follow the modular structure** - don't put everything in one file
2. **Update this README** if you add new features or change architecture
3. **Test thoroughly** - especially pin interactions and code execution
4. **Maintain ESP32 compatibility** - this is an ESP32 learning tool
5. **Use consistent naming** conventions across all files

---

This architecture provides a solid foundation for the ESP32 Learning Game while maintaining clean, maintainable code that teaches students real-world ESP32 programming skills used in robotics, drones, and IoT projects.
