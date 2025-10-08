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
        maxEvents: 4
    },
    {
        id: 2,
        name: "Double Blink",
        description: "Make LEDs on pins 13 and 12 blink alternately",
        timeLimit: 90000, // 1.5 minutes
        targetCode: `void setup() {
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  digitalWrite(12, LOW);
  delay(500);
  digitalWrite(13, LOW);
  digitalWrite(12, HIGH);
  delay(500);
}`,
        hint: "Use two pins with opposite states and shorter delays",
        difficulty: "beginner",
        requiredPins: [12, 13],
        maxEvents: 6
    },
    {
        id: 3,
        name: "Fast Blink",
        description: "Make LED blink very fast (100ms intervals)",
        timeLimit: 75000, // 1.25 minutes
        targetCode: `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(100);
  digitalWrite(13, LOW);
  delay(100);
}`,
        hint: "Use delay(100) for fast blinking",
        difficulty: "beginner",
        requiredPins: [13],
        maxEvents: 4
    },
    {
        id: 4,
        name: "Motor Control",
        description: "Control a motor with PWM on pin 9",
        timeLimit: 120000, // 2 minutes
        targetCode: `void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  setDutyCycle(9, 50);
  delay(2000);
  setDutyCycle(9, 0);
  delay(2000);
}`,
        hint: "Use setDutyCycle(pin, percentage) for PWM control",
        difficulty: "intermediate",
        requiredPins: [9],
        maxEvents: 4,
        requiresPWM: true
    },
    {
        id: 5,
        name: "Servo Control",
        description: "Control a servo motor using TimerOne library",
        timeLimit: 150000, // 2.5 minutes
        targetCode: `#include <TimerOne.h>

void setup() {
  Timer1.initialize(20000);
  Timer1.pwm(9, 512);
}

void loop() {
  Timer1.pwm(9, 256);
  delay(1000);
  Timer1.pwm(9, 768);
  delay(1000);
}`,
        hint: "Include TimerOne.h and use Timer1.initialize(20000) for 50Hz PWM",
        difficulty: "advanced",
        requiredPins: [9],
        maxEvents: 4,
        requiresTimer1: true
    },
    {
        id: 6,
        name: "Complex Pattern",
        description: "Create a complex LED pattern with multiple pins",
        timeLimit: 180000, // 3 minutes
        targetCode: `void setup() {
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(11, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(200);
  digitalWrite(12, HIGH);
  delay(200);
  digitalWrite(11, HIGH);
  delay(200);
  digitalWrite(13, LOW);
  delay(200);
  digitalWrite(12, LOW);
  delay(200);
  digitalWrite(11, LOW);
  delay(200);
}`,
        hint: "Use multiple pins in sequence to create a wave effect",
        difficulty: "intermediate",
        requiredPins: [11, 12, 13],
        maxEvents: 12
    },
    {
        id: 7,
        name: "Motor Speed Control",
        description: "Control motor speed with different PWM values",
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
        hint: "Use different duty cycle percentages to control motor speed",
        difficulty: "intermediate",
        requiredPins: [9],
        maxEvents: 8,
        requiresPWM: true
    },
    {
        id: 8,
        name: "Dual Servo Control",
        description: "Control two servos with different positions",
        timeLimit: 180000, // 3 minutes
        targetCode: `#include <TimerOne.h>

void setup() {
  Timer1.initialize(20000);
  Timer1.pwm(9, 512);
  Timer1.pwm(10, 256);
}

void loop() {
  Timer1.pwm(9, 768);
  Timer1.pwm(10, 512);
  delay(2000);
  Timer1.pwm(9, 256);
  Timer1.pwm(10, 768);
  delay(2000);
}`,
        hint: "Control multiple servos with different Timer1.pwm values",
        difficulty: "advanced",
        requiredPins: [9, 10],
        maxEvents: 6,
        requiresTimer1: true
    }
];

// Level categories for organization
const LEVEL_CATEGORIES = {
    beginner: {
        name: "Beginner",
        description: "Basic digital control and simple patterns",
        levels: [1, 2, 3]
    },
    intermediate: {
        name: "Intermediate", 
        description: "PWM control and more complex patterns",
        levels: [4, 6, 7]
    },
    advanced: {
        name: "Advanced",
        description: "Timer libraries and servo control",
        levels: [5, 8]
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
