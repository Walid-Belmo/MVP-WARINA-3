# ⚠️ BE CAREFUL ABOUT THIS

## 🎯 Project Purpose
This is a **robotics learning simulator** for students, NOT a full Arduino IDE.

## 🚫 Common Mistakes to Avoid

### 1. **Local Development Only**
- This runs ONLY on the user's local computer
- Do NOT try to make it work online or deploy it
- Keep all functionality local and simple

### 2. **Limited Scope - Robotics Learning Only**
- **DO NOT** implement full Arduino IDE features
- **DO NOT** add complex libraries or advanced functionality
- **DO NOT** try to replicate real Arduino behavior exactly

## ✅ What This Simulator Supports

### Basic Digital Control:
- `pinMode(pin, OUTPUT)` - Set pin as output
- `digitalWrite(pin, HIGH/LOW)` - Turn pin on/off
- `delay(ms)` - Wait for milliseconds

### PWM for Robotics:
- `Timer1.initialize(20000)` - Setup 50Hz PWM (for servos)
- `Timer1.pwm(pin, duty)` - Set servo position (0-1023)
- `Timer0.initialize()` - Setup PWM for motors
- `Timer0.pwm(pin, duty)` - Set motor speed (0-255)

### Basic Control:
- `if/else` statements (syntax recognition only)

## 🎓 Learning Objectives
Students learn:
1. **Basic pin control** (on/off)
2. **PWM syntax** for servos and motors
3. **Simple programming** concepts

## ❌ What NOT to Add
- Complex libraries
- Advanced Arduino functions
- Real-time execution
- Full IDE features
- Online functionality

**Keep it simple. Focus on robotics learning.**
