/**
 * Level Data Storage
 * Contains all level definitions with target code and requirements
 */

const LEVELS = [
    {
        id: 1,
        name: "First Light",
        description: "Make the LED on pin 13 blink once per second",
        timeLimit: 60000, // 1 minute
        targetCode: `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`,
        hint: "Use digitalWrite(13, HIGH) and digitalWrite(13, LOW) with delay(1000) between them",
        difficulty: "beginner",
        requiredPins: [13],
        maxEvents: 4,
        validationLoops: 1,
        autoComponents: [
            { type: 'LED', pin: 13 }
        ]
    },
    {
        id: 2,
        name: "Slow Pulse",
        description: "Make the LED on pin 13 blink with 2 second intervals",
        timeLimit: 60000, // 1 minute
        targetCode: `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(2000);
  digitalWrite(13, LOW);
  delay(2000);
}`,
        hint: "Similar to First Light, but use delay(2000) for 2 seconds",
        difficulty: "beginner",
        requiredPins: [13],
        maxEvents: 4,
        validationLoops: 1,
        autoComponents: [
            { type: 'LED', pin: 13 }
        ]
    },
    {
        id: 3,
        name: "Double Light",
        description: "Make both LEDs on pins 13 and 12 blink together at the same time",
        timeLimit: 75000, // 1.25 minutes
        targetCode: `void setup() {
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  digitalWrite(12, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  digitalWrite(12, LOW);
  delay(1000);
}`,
        hint: "Both LEDs should turn on together, then off together",
        difficulty: "beginner",
        requiredPins: [12, 13],
        maxEvents: 4,
        validationLoops: 1,
        autoComponents: [
            { type: 'LED', pin: 13 },
            { type: 'LED', pin: 12 }
        ]
    },
    {
        id: 4,
        name: "See-Saw",
        description: "Make LEDs on pins 13 and 12 alternate - when one is on, the other is off",
        timeLimit: 75000, // 1.25 minutes
        targetCode: `void setup() {
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  digitalWrite(12, LOW);
  delay(1000);
  digitalWrite(13, LOW);
  digitalWrite(12, HIGH);
  delay(1000);
}`,
        hint: "Set one HIGH and the other LOW, then swap them",
        difficulty: "beginner",
        requiredPins: [12, 13],
        maxEvents: 4,
        validationLoops: 1,
        autoComponents: [
            { type: 'LED', pin: 13 },
            { type: 'LED', pin: 12 }
        ]
    },
    {
        id: 5,
        name: "One After Another",
        description: "Turn on pin 13, wait, then turn on pin 12, then turn both off",
        timeLimit: 90000, // 1.5 minutes
        targetCode: `void setup() {
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(12, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  digitalWrite(12, LOW);
  delay(1000);
}`,
        hint: "Turn on first LED, delay, turn on second LED, delay, turn both off",
        difficulty: "beginner",
        requiredPins: [12, 13],
        maxEvents: 6,
        validationLoops: 1,
        autoComponents: [
            { type: 'LED', pin: 13 },
            { type: 'LED', pin: 12 }
        ]
    },
    {
        id: 6,
        name: "Sequential Wave",
        description: "Turn pins on one by one, then off one by one",
        timeLimit: 90000, // 1.5 minutes
        targetCode: `void setup() {
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(12, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
  digitalWrite(12, LOW);
  delay(1000);
}`,
        hint: "Each pin state changes one at a time with 1 second delays",
        difficulty: "beginner",
        requiredPins: [12, 13],
        maxEvents: 8,
        validationLoops: 1,
        autoComponents: [
            { type: 'LED', pin: 13 },
            { type: 'LED', pin: 12 }
        ]
    },
    {
        id: 7,
        name: "Quick Flash",
        description: "Make pin 13 blink quickly - on for 1 second, off for 1 second",
        timeLimit: 60000, // 1 minute
        targetCode: `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`,
        hint: "Back to basics - just one LED blinking",
        difficulty: "beginner",
        requiredPins: [13],
        maxEvents: 4,
        validationLoops: 1,
        autoComponents: [
            { type: 'LED', pin: 13 }
        ]
    },
    {
        id: 8,
        name: "Triple Lights",
        description: "Make three LEDs blink together",
        timeLimit: 90000, // 1.5 minutes
        targetCode: `void setup() {
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(11, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  digitalWrite(12, HIGH);
  digitalWrite(11, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  digitalWrite(12, LOW);
  digitalWrite(11, LOW);
  delay(1000);
}`,
        hint: "All three LEDs turn on together, then off together",
        difficulty: "intermediate",
        requiredPins: [11, 12, 13],
        maxEvents: 8,
        validationLoops: 1,
        autoComponents: [
            { type: 'LED', pin: 13 },
            { type: 'LED', pin: 12 },
            { type: 'LED', pin: 11 }
        ]
    },
    {
        id: 9,
        name: "Running Lights",
        description: "Create a sequential pattern across three LEDs",
        timeLimit: 120000, // 2 minutes
        targetCode: `void setup() {
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(11, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(12, HIGH);
  delay(1000);
  digitalWrite(11, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
  digitalWrite(12, LOW);
  delay(1000);
  digitalWrite(11, LOW);
  delay(1000);
}`,
        hint: "Turn LEDs on one by one, then off one by one",
        difficulty: "intermediate",
        requiredPins: [11, 12, 13],
        maxEvents: 12,
        validationLoops: 1,
        autoComponents: [
            { type: 'LED', pin: 13 },
            { type: 'LED', pin: 12 },
            { type: 'LED', pin: 11 }
        ]
    },
    {
        id: 10,
        name: "Back and Forth",
        description: "Make two LEDs alternate with 2 second timing",
        timeLimit: 75000, // 1.25 minutes
        targetCode: `void setup() {
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  digitalWrite(12, LOW);
  delay(2000);
  digitalWrite(13, LOW);
  digitalWrite(12, HIGH);
  delay(2000);
}`,
        hint: "Like See-Saw but slower - use delay(2000)",
        difficulty: "beginner",
        requiredPins: [12, 13],
        maxEvents: 6,
        validationLoops: 1,
        autoComponents: [
            { type: 'LED', pin: 13 },
            { type: 'LED', pin: 12 }
        ]
    },
    {
        id: 11,
        name: "First PWM",
        description: "Control brightness using PWM - turn pin 9 on at 50% power, then off",
        timeLimit: 90000, // 1.5 minutes
        targetCode: `void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  setDutyCycle(9, 50);
  delay(2000);
  setDutyCycle(9, 0);
  delay(2000);
}`,
        hint: "Use setDutyCycle(9, 50) for 50% brightness, setDutyCycle(9, 0) for off",
        difficulty: "intermediate",
        requiredPins: [9],
        maxEvents: 4,
        requiresPWM: true,
        validationLoops: 1,
        autoComponents: [
            { type: 'MOTOR', pin: 9 }
        ]
    },
    {
        id: 12,
        name: "Dim and Bright",
        description: "Alternate between 25% and 75% brightness",
        timeLimit: 90000, // 1.5 minutes
        targetCode: `void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  setDutyCycle(9, 25);
  delay(2000);
  setDutyCycle(9, 75);
  delay(2000);
}`,
        hint: "Use different percentage values with setDutyCycle",
        difficulty: "intermediate",
        requiredPins: [9],
        maxEvents: 4,
        requiresPWM: true,
        validationLoops: 1,
        autoComponents: [
            { type: 'MOTOR', pin: 9 }
        ]
    },
    {
        id: 13,
        name: "Three Speeds",
        description: "Cycle through three different brightness levels",
        timeLimit: 120000, // 2 minutes
        targetCode: `void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  setDutyCycle(9, 25);
  delay(1000);
  setDutyCycle(9, 50);
  delay(1000);
  setDutyCycle(9, 75);
  delay(1000);
  setDutyCycle(9, 0);
  delay(1000);
}`,
        hint: "Use four different duty cycle values: 25, 50, 75, and 0",
        difficulty: "intermediate",
        requiredPins: [9],
        maxEvents: 8,
        requiresPWM: true,
        validationLoops: 1,
        autoComponents: [
            { type: 'MOTOR', pin: 9 }
        ]
    },
    {
        id: 14,
        name: "Mixed Control",
        description: "Control a digital LED and PWM motor together",
        timeLimit: 120000, // 2 minutes
        targetCode: `void setup() {
  pinMode(13, OUTPUT);
  pinMode(9, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  setDutyCycle(9, 50);
  delay(2000);
  digitalWrite(13, LOW);
  setDutyCycle(9, 0);
  delay(2000);
}`,
        hint: "Combine digitalWrite for pin 13 and setDutyCycle for pin 9",
        difficulty: "intermediate",
        requiredPins: [9, 13],
        maxEvents: 6,
        requiresPWM: true,
        validationLoops: 1,
        autoComponents: [
            { type: 'LED', pin: 13 },
            { type: 'MOTOR', pin: 9 }
        ]
    },
    {
        id: 15,
        name: "Pattern Master",
        description: "Create a complex pattern with digital LEDs and PWM motor",
        timeLimit: 150000, // 2.5 minutes
        targetCode: `void setup() {
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(9, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  setDutyCycle(9, 25);
  delay(1000);
  digitalWrite(12, HIGH);
  setDutyCycle(9, 50);
  delay(1000);
  digitalWrite(13, LOW);
  setDutyCycle(9, 75);
  delay(1000);
  digitalWrite(12, LOW);
  setDutyCycle(9, 0);
  delay(1000);
}`,
        hint: "Coordinate multiple digital pins with changing PWM values",
        difficulty: "intermediate",
        requiredPins: [9, 12, 13],
        maxEvents: 12,
        requiresPWM: true,
        validationLoops: 1,
        autoComponents: [
            { type: 'LED', pin: 13 },
            { type: 'LED', pin: 12 },
            { type: 'MOTOR', pin: 9 }
        ]
    }
];

// Level categories for organization
const LEVEL_CATEGORIES = {
    beginner: {
        name: "Beginner",
        description: "Basic digital control and simple patterns",
        levels: [1, 2, 3, 4, 5, 6, 7, 10]
    },
    intermediate: {
        name: "Intermediate", 
        description: "Multi-pin patterns and PWM control",
        levels: [8, 9, 11, 12, 13, 14, 15]
    }
};

// Helper functions for level data
const LevelDataHelper = {
    /**
     * Get level by ID
     * @param {number} levelId - Level ID
     * @returns {Object|null} - Level data or null if not found
     */
    getLevel(levelId) {
        return LEVELS.find(level => level.id === levelId) || null;
    },

    /**
     * Get all levels
     * @returns {Array} - All level data
     */
    getAllLevels() {
        return [...LEVELS];
    },

    /**
     * Get levels by difficulty
     * @param {string} difficulty - Difficulty level
     * @returns {Array} - Levels matching difficulty
     */
    getLevelsByDifficulty(difficulty) {
        return LEVELS.filter(level => level.difficulty === difficulty);
    },

    /**
     * Get next level ID
     * @param {number} currentLevelId - Current level ID
     * @returns {number|null} - Next level ID or null if no more levels
     */
    getNextLevelId(currentLevelId) {
        const currentIndex = LEVELS.findIndex(level => level.id === currentLevelId);
        if (currentIndex === -1 || currentIndex >= LEVELS.length - 1) {
            return null;
        }
        return LEVELS[currentIndex + 1].id;
    },

    /**
     * Get previous level ID
     * @param {number} currentLevelId - Current level ID
     * @returns {number|null} - Previous level ID or null if no previous level
     */
    getPreviousLevelId(currentLevelId) {
        const currentIndex = LEVELS.findIndex(level => level.id === currentLevelId);
        if (currentIndex <= 0) {
            return null;
        }
        return LEVELS[currentIndex - 1].id;
    },

    /**
     * Get level categories
     * @returns {Object} - Level categories
     */
    getCategories() {
        return { ...LEVEL_CATEGORIES };
    },

    /**
     * Get total number of levels
     * @returns {number} - Total level count
     */
    getTotalLevels() {
        return LEVELS.length;
    },

    /**
     * Check if level exists
     * @param {number} levelId - Level ID to check
     * @returns {boolean} - Whether level exists
     */
    levelExists(levelId) {
        return LEVELS.some(level => level.id === levelId);
    }
};

// Make helper functions globally available
window.LevelDataHelper = LevelDataHelper;
