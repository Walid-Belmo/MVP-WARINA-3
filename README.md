# Arduino Learning Game - Code Architecture

## Overview

This is an interactive educational game designed to teach kids how to program microcontrollers. The game simulates an Arduino environment where players can connect components, write code, and see the results in real-time.

## Project Structure

```
MVP WAKRINA 3/
├── index.html              # Original monolithic file (for reference)
├── index_new.html          # New modular HTML structure
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
    │   └── arduinoParser.js # Arduino code parser and executor
    ├── components/        # Component management
    │   └── componentManager.js # LED and Motor component handling
    └── ui/                # User interface management
        ├── codeEditor.js  # Code editor with syntax highlighting
        └── uiManager.js   # UI interactions and event handling
```

## Architecture Overview

The application follows a modular architecture with clear separation of concerns:

### 1. Core Systems (`js/core/`)

#### GameState (`gameState.js`)
- **Purpose**: Central state management for the entire game
- **Responsibilities**:
  - Pin states (ON/OFF, PWM values, duty cycles)
  - Pin modes (DIGITAL/PWM)
  - Component connections and states
  - Variable management
- **Key Methods**:
  - `resetPins()`: Reset all pins to default state
  - `getAvailablePins()`: Get pins not connected to components
  - `connectComponent()`: Connect a component to a pin
  - `disconnectComponent()`: Disconnect a component from its pin

#### PinManager (`pinManager.js`)
- **Purpose**: Handles all pin-related operations and visual updates
- **Responsibilities**:
  - Pin toggling and mode switching
  - PWM control and duty cycle management
  - Visual pin state updates
  - Pin selection for PWM control
- **Key Methods**:
  - `togglePin(pin)`: Toggle pin state or cycle through modes
  - `setPinMode(pin, mode)`: Set pin to DIGITAL or PWM mode
  - `setDutyCycle(pin, dutyCycle)`: Set PWM duty cycle (0-100%)
  - `updatePinVisual(pin, isCodeControlled)`: Update pin visual state

#### ArduinoParser (`arduinoParser.js`)
- **Purpose**: Parses and executes Arduino-style code
- **Responsibilities**:
  - Code parsing (setup/loop functions)
  - Function execution (pinMode, digitalWrite, analogWrite, delay)
  - Pin state synchronization with game state
  - Error handling and validation
- **Key Methods**:
  - `parseCode(code)`: Parse Arduino code into setup/loop functions
  - `executeSetup(setupCode)`: Execute setup code once
  - `executeLoop(loopCode)`: Execute loop code repeatedly
  - `syncWithGameState(gameState)`: Sync parser state with game state

### 2. Component Management (`js/components/`)

#### ComponentManager (`componentManager.js`)
- **Purpose**: Manages LED and Motor components
- **Responsibilities**:
  - Component creation and connection
  - Visual component rendering
  - Component state updates based on pin states
  - Connection line rendering
- **Key Methods**:
  - `addLEDComponent()`: Create a new LED component
  - `addMotorComponent()`: Create a new Motor component
  - `renderComponents()`: Render all components in the grid
  - `updateComponentStates()`: Update component visuals based on pin states
  - `updateConnectionLines()`: Draw connection lines between components and pins

### 3. User Interface (`js/ui/`)

#### CodeEditor (`codeEditor.js`)
- **Purpose**: Enhanced code editor with Arduino-specific features
- **Responsibilities**:
  - Code editing with line numbers
  - Auto-completion for Arduino functions
  - Syntax highlighting
  - Auto-indentation
- **Key Methods**:
  - `getValue()`: Get current code content
  - `setValue(value)`: Set code content
  - `showCompletion()`: Show function auto-completion
  - `handleEnterKey()`: Handle auto-indentation on Enter

#### UIManager (`uiManager.js`)
- **Purpose**: Manages all user interactions and UI updates
- **Responsibilities**:
  - Event listener setup
  - Keyboard controls (PWM mode, number keys)
  - Button event handling
  - Code execution coordination
  - Background effects
- **Key Methods**:
  - `init()`: Initialize all UI event listeners
  - `runCode()`: Execute Arduino code
  - `resetGame()`: Reset entire game state
  - `updateVisualPinsFromParser()`: Sync visual pins with parser state

### 4. Main Application (`js/app.js`)

#### ArduinoLearningGame
- **Purpose**: Main application entry point
- **Responsibilities**:
  - Initialize all systems
  - Coordinate between modules
  - Setup global functions for HTML onclick handlers
- **Key Methods**:
  - `init()`: Initialize the application
  - `start()`: Start the game
  - `setupGlobalFunctions()`: Make functions available globally

## CSS Architecture

The CSS is organized into logical modules:

- **`base.css`**: Reset styles and base typography
- **`background.css`**: Animated background particles and effects
- **`layout.css`**: Main layout structure and responsive design
- **`microcontroller.css`**: Microcontroller and pin styling
- **`components.css`**: Component (LED/Motor) styling and animations
- **`editor.css`**: Code editor styling and syntax highlighting
- **`ui.css`**: Button and UI component styling
- **`timer.css`**: Timer panel and status indicators
- **`main.css`**: Imports all other CSS files

## Key Features

### 1. Interactive Microcontroller
- 6 digital pins (D8-D13) with visual feedback
- PWM support with duty cycle control
- Pin mode switching (Digital ↔ PWM)
- Visual indicators for pin states

### 2. Component System
- LED components with brightness control
- Motor components with speed control
- Visual connection lines
- Drag-and-drop style connection interface

### 3. Code Editor
- Arduino-style syntax
- Auto-completion for Arduino functions
- Line numbers and cursor position
- Auto-indentation

### 4. Code Execution
- Real-time Arduino code parsing
- Setup and loop function execution
- Pin state synchronization
- Error handling and validation

### 5. Interactive Controls
- Click pins to toggle states
- Press 'P' + click for PWM mode
- Number keys (0-9) for PWM duty cycles
- +/- keys for fine PWM adjustment

## How to Use

### For Developers

1. **Adding New Components**:
   - Extend `ComponentManager` class
   - Add component type to `renderComponents()`
   - Create corresponding CSS styles

2. **Adding New Arduino Functions**:
   - Extend `ArduinoParser` class
   - Add function to `executeLine()` method
   - Update auto-completion in `CodeEditor`

3. **Modifying UI**:
   - Update CSS files in `css/` directory
   - Modify `UIManager` for new interactions
   - Add new event listeners as needed

### For Users

1. **Connecting Components**:
   - Click "Add LED" or "Add Motor" buttons
   - Click on component boxes to connect to available pins

2. **Writing Code**:
   - Use the code editor to write Arduino-style code
   - Use auto-completion (type function names)
   - Click "RUN CODE" to execute

3. **Controlling Pins**:
   - Click pins to toggle digital states
   - Press 'P' + click pin to enter PWM mode
   - Use number keys (0-9) to set PWM duty cycles

## File Dependencies

### JavaScript Loading Order
1. `js/core/gameState.js` - Core state management
2. `js/core/pinManager.js` - Pin operations (depends on gameState)
3. `js/core/arduinoParser.js` - Code parsing
4. `js/components/componentManager.js` - Component management (depends on gameState)
5. `js/ui/codeEditor.js` - Code editor
6. `js/ui/uiManager.js` - UI management (depends on all above)
7. `fx.js` - Background effects
8. `js/app.js` - Main application (depends on all above)

### CSS Loading Order
- `css/main.css` imports all other CSS files in the correct order

## Migration from Original

The original `index.html` contained everything in a single file (~2700 lines). The refactored version:

- **Separates concerns** into logical modules
- **Improves maintainability** with clear file organization
- **Enhances readability** with focused, single-purpose files
- **Enables easier debugging** with isolated functionality
- **Supports future development** with modular architecture

## Future Enhancements

1. **Additional Components**: Servo motors, sensors, displays
2. **More Arduino Functions**: Serial communication, interrupts
3. **Level System**: Progressive difficulty with missions
4. **Code Validation**: Syntax checking and error highlighting
5. **Save/Load**: Project persistence
6. **Multiplayer**: Collaborative coding sessions

## Troubleshooting

### Common Issues

1. **Components not connecting**: Check if pins are available in `gameState.connections`
2. **Code not executing**: Verify Arduino syntax in `arduinoParser.js`
3. **Visual updates not working**: Check `updatePinVisual()` and `updateComponentStates()`
4. **PWM not working**: Ensure pin is in PWM mode and duty cycle is set

### Debug Mode

Enable console logging by checking browser developer tools. All major operations are logged with emoji prefixes for easy identification.

## Contributing

When making changes:

1. **Follow the modular structure** - don't put everything in one file
2. **Update this README** if you add new features or change architecture
3. **Test thoroughly** - especially pin interactions and code execution
4. **Maintain backward compatibility** with existing functionality
5. **Use consistent naming** conventions across all files

---

This architecture provides a solid foundation for the Arduino Learning Game while maintaining clean, maintainable code that can easily be extended with new features.
