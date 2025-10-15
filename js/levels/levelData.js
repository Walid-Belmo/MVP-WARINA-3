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
        difficulty: "beginner",
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
        difficulty: "beginner",
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
        name: "First ESC - ARM",
        description: "Learn to ARM an ESC - attach it and keep it stopped",
        timeLimit: 120000, // 2 minutes
        targetCode: `#include <ESP32Servo.h>

Servo motor;

void setup() {
  motor.attach(9, 1000, 2000);
  motor.writeMicroseconds(1000);
  delay(3000);
}

void loop() {
  motor.writeMicroseconds(1000);
  delay(2000);
}`,
        hint: "Use motor.attach(9, 1000, 2000) then motor.writeMicroseconds(1000) to ARM (stop) the ESC",
        difficulty: "advanced",
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
        name: "Two Speeds",
        description: "Control ESC at two different speeds - 25% and 50%",
        timeLimit: 120000, // 2 minutes
        targetCode: `#include <ESP32Servo.h>

Servo motor;

void setup() {
  motor.attach(9, 1000, 2000);
  motor.writeMicroseconds(1000);
  delay(3000);
}

void loop() {
  motor.writeMicroseconds(1250);
  delay(2000);
  motor.writeMicroseconds(1500);
  delay(2000);
}`,
        hint: "1250µs = 25% speed, 1500µs = 50% speed. Use motor.writeMicroseconds()",
        difficulty: "advanced",
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
        name: "Four Speed Levels",
        description: "Cycle through four ESC speed levels including stop",
        timeLimit: 120000, // 2 minutes
        targetCode: `#include <ESP32Servo.h>

Servo motor;

void setup() {
  motor.attach(9, 1000, 2000);
  motor.writeMicroseconds(1000);
  delay(3000);
}

void loop() {
  motor.writeMicroseconds(1000);
  delay(1000);
  motor.writeMicroseconds(1250);
  delay(1000);
  motor.writeMicroseconds(1500);
  delay(1000);
  motor.writeMicroseconds(1750);
  delay(1000);
}`,
        hint: "Use 1000, 1250, 1500, 1750 microseconds for 0%, 25%, 50%, 75%",
        difficulty: "advanced",
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
        name: "LED and ESC Together",
        description: "Control a digital LED and ESC motor together",
        timeLimit: 120000, // 2 minutes
        targetCode: `#include <ESP32Servo.h>

Servo motor;

void setup() {
  pinMode(13, OUTPUT);
  motor.attach(9, 1000, 2000);
  motor.writeMicroseconds(1000);
  delay(3000);
}

void loop() {
  digitalWrite(13, HIGH);
  motor.writeMicroseconds(1500);
  delay(2000);
  digitalWrite(13, LOW);
  motor.writeMicroseconds(1000);
  delay(2000);
}`,
        hint: "Combine digitalWrite() for LED and motor.writeMicroseconds() for ESC",
        difficulty: "advanced",
        requiredPins: [9, 13],
        maxEvents: 8,
        requiresPWM: true,
        validationLoops: 1,
        autoComponents: [
            { type: 'LED', pin: 13 },
            { type: 'MOTOR', pin: 9 }
        ]
    },
    {
        id: 15,
        name: "Complex Coordination",
        description: "Create a complex pattern with two LEDs and variable ESC speeds",
        timeLimit: 150000, // 2.5 minutes
        targetCode: `#include <ESP32Servo.h>

Servo motor;

void setup() {
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
  motor.attach(9, 1000, 2000);
  motor.writeMicroseconds(1000);
  delay(3000);
}

void loop() {
  digitalWrite(13, HIGH);
  motor.writeMicroseconds(1250);
  delay(1000);
  digitalWrite(12, HIGH);
  motor.writeMicroseconds(1500);
  delay(1000);
  digitalWrite(13, LOW);
  motor.writeMicroseconds(1750);
  delay(1000);
  digitalWrite(12, LOW);
  motor.writeMicroseconds(1000);
  delay(1000);
}`,
        hint: "Coordinate two LEDs with ESC speeds: 1250, 1500, 1750, 1000 microseconds",
        difficulty: "advanced",
        requiredPins: [9, 12, 13],
        maxEvents: 12,
        requiresPWM: true,
        validationLoops: 1,
        autoComponents: [
            { type: 'LED', pin: 13 },
            { type: 'LED', pin: 12 },
            { type: 'MOTOR', pin: 9 }
        ]
    },
    {
        id: 16,
        name: "Different Pin ESC",
        description: "Control ESC on pin 13 instead of pin 9 - same ARM sequence",
        timeLimit: 120000, // 2 minutes
        targetCode: `#include <ESP32Servo.h>

Servo esc;

void setup() {
  esc.attach(13, 1000, 2000);
  esc.writeMicroseconds(1000);
  delay(3000);
}

void loop() {
  esc.writeMicroseconds(1000);
  delay(2000);
}`,
        hint: "Use esc.attach(13, 1000, 2000) for pin 13, then esc.writeMicroseconds(1000) to ARM",
        difficulty: "advanced",
        requiredPins: [13],
        maxEvents: 4,
        requiresPWM: true,
        validationLoops: 1,
        autoComponents: [
            { type: 'MOTOR', pin: 13 }
        ]
    },
    {
        id: 17,
        name: "ESC Speed Control",
        description: "Control ESC speed - stop, 25%, 50%, then stop again",
        timeLimit: 150000, // 2.5 minutes
        targetCode: `#include <ESP32Servo.h>

Servo esc;

void setup() {
  esc.attach(13, 1000, 2000);
  esc.writeMicroseconds(1000);
  delay(3000);
}

void loop() {
  esc.writeMicroseconds(1000);
  delay(2000);
  esc.writeMicroseconds(1250);
  delay(2000);
  esc.writeMicroseconds(1500);
  delay(2000);
  esc.writeMicroseconds(1000);
  delay(2000);
}`,
        hint: "1000µs = stop, 1250µs = 25%, 1500µs = 50%. Use writeMicroseconds() to control speed",
        difficulty: "advanced",
        requiredPins: [13],
        maxEvents: 8,
        requiresPWM: true,
        validationLoops: 1,
        autoComponents: [
            { type: 'MOTOR', pin: 13 }
        ]
    },
    {
        id: 18,
        name: "Full Speed Range",
        description: "Cycle through four speed levels: 0%, 25%, 50%, 75%",
        timeLimit: 150000, // 2.5 minutes
        targetCode: `#include <ESP32Servo.h>

Servo esc;

void setup() {
  esc.attach(13, 1000, 2000);
  esc.writeMicroseconds(1000);
  delay(3000);
}

void loop() {
  esc.writeMicroseconds(1000);
  delay(1000);
  esc.writeMicroseconds(1250);
  delay(1000);
  esc.writeMicroseconds(1500);
  delay(1000);
  esc.writeMicroseconds(1750);
  delay(1000);
}`,
        hint: "Use 1000, 1250, 1500, and 1750 microseconds for 0%, 25%, 50%, and 75% speeds",
        difficulty: "advanced",
        requiredPins: [13],
        maxEvents: 8,
        requiresPWM: true,
        validationLoops: 1,
        autoComponents: [
            { type: 'MOTOR', pin: 13 }
        ]
    },
    {
        id: 19,
        name: "Mixed ESP32 Control",
        description: "Control digital LED and ESC together on ESP32",
        timeLimit: 150000, // 2.5 minutes
        targetCode: `#include <ESP32Servo.h>

Servo esc;

void setup() {
  pinMode(12, OUTPUT);
  esc.attach(13, 1000, 2000);
  esc.writeMicroseconds(1000);
  delay(3000);
}

void loop() {
  digitalWrite(12, HIGH);
  esc.writeMicroseconds(1500);
  delay(2000);
  digitalWrite(12, LOW);
  esc.writeMicroseconds(1000);
  delay(2000);
}`,
        hint: "Combine digitalWrite() for LED on pin 12 with esc.writeMicroseconds() for ESC on pin 13",
        difficulty: "advanced",
        requiredPins: [12, 13],
        maxEvents: 8,
        requiresPWM: true,
        validationLoops: 1,
        autoComponents: [
            { type: 'LED', pin: 12 },
            { type: 'MOTOR', pin: 13 }
        ]
    },
    {
        id: 20,
        name: "ESP32 Pattern Master",
        description: "Create a complex pattern with digital LEDs and variable ESC speeds",
        timeLimit: 180000, // 3 minutes
        targetCode: `#include <ESP32Servo.h>

Servo esc;

void setup() {
  pinMode(12, OUTPUT);
  pinMode(11, OUTPUT);
  esc.attach(13, 1000, 2000);
  esc.writeMicroseconds(1000);
  delay(3000);
}

void loop() {
  digitalWrite(12, HIGH);
  esc.writeMicroseconds(1250);
  delay(1000);
  digitalWrite(11, HIGH);
  esc.writeMicroseconds(1500);
  delay(1000);
  digitalWrite(12, LOW);
  esc.writeMicroseconds(1750);
  delay(1000);
  digitalWrite(11, LOW);
  esc.writeMicroseconds(1000);
  delay(1000);
}`,
        hint: "Coordinate multiple digital pins with changing ESC speeds (1250, 1500, 1750, 1000)",
        difficulty: "advanced",
        requiredPins: [11, 12, 13],
        maxEvents: 12,
        requiresPWM: true,
        validationLoops: 1,
        autoComponents: [
            { type: 'LED', pin: 12 },
            { type: 'LED', pin: 11 },
            { type: 'MOTOR', pin: 13 }
        ]
    }
];

// Level categories for organization
const LEVEL_CATEGORIES = {
    beginner: {
        name: "Beginner",
        description: "Basic ESP32 digital control and simple LED patterns",
        levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    },
    advanced: {
        name: "Advanced - ESC Control",
        description: "ESP32 motor control using Servo library for ESC/motors",
        levels: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
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
