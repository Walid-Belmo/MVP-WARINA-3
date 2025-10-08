/**
 * Enhanced Arduino Code Editor
 * Handles code editing, syntax highlighting, and auto-completion
 */

class ArduinoCodeEditor {
    constructor() {
        this.editor = document.getElementById('codeEditor');
        this.lineNumbers = document.getElementById('lineNumbers');
        this.completion = document.getElementById('codeCompletion');
        this.cursorPosition = document.getElementById('cursorPosition');
        this.completionItems = [];
        this.selectedCompletionIndex = -1;
        this.currentHighlightedLine = null;
        this.currentPlaceholders = null;
        this.currentPlaceholderIndex = -1;
        
        console.log('📝 CodeEditor initialized:', {
            editor: !!this.editor,
            lineNumbers: !!this.lineNumbers,
            completion: !!this.completion,
            cursorPosition: !!this.cursorPosition
        });
        
        // Arduino function completions - Focused on robotics learning
        this.arduinoFunctions = [
            { 
                name: '#include <TimerOne.h>', 
                desc: 'Include TimerOne library for servo control',
                template: '#include <TimerOne.h>',
                placeholders: []
            },
            { 
                name: '#include <TimerZero.h>', 
                desc: 'Include TimerZero library for motor control',
                template: '#include <TimerZero.h>',
                placeholders: []
            },
            { 
                name: 'pinMode', 
                desc: '(pin, mode) - Set pin as OUTPUT',
                template: 'pinMode(${pin}, ${OUTPUT});',
                placeholders: ['pin', 'OUTPUT']
            },
            { 
                name: 'digitalWrite', 
                desc: '(pin, value) - Turn pin HIGH or LOW',
                template: 'digitalWrite(${pin}, ${HIGH});',
                placeholders: ['pin', 'HIGH']
            },
            { 
                name: 'delay', 
                desc: '(ms) - Wait for milliseconds',
                template: 'delay(${1000});',
                placeholders: ['1000']
            },
            { 
                name: 'Timer1.initialize', 
                desc: '(20000) - Setup 50Hz PWM (for servos)',
                template: 'Timer1.initialize(${20000});',
                placeholders: ['20000']
            },
            { 
                name: 'Timer1.pwm', 
                desc: '(pin, duty) - Set servo position (0-1023)',
                template: 'Timer1.pwm(${pin}, ${duty});',
                placeholders: ['pin', 'duty']
            },
            { 
                name: 'Timer0.initialize', 
                desc: '() - Setup PWM for motors',
                template: 'Timer0.initialize();',
                placeholders: []
            },
            { 
                name: 'Timer0.pwm', 
                desc: '(pin, duty) - Set motor speed (0-255)',
                template: 'Timer0.pwm(${pin}, ${duty});',
                placeholders: ['pin', 'duty']
            },
            { 
                name: 'setDutyCycle', 
                desc: '(pin, dutyCycle) - Set PWM duty cycle (0-100%)',
                template: 'setDutyCycle(${pin}, ${dutyCycle});',
                placeholders: ['pin', 'dutyCycle']
            },
            { 
                name: 'setup', 
                desc: '() - Initialize code (runs once)',
                template: 'void setup() {\n  \n}',
                placeholders: []
            },
            { 
                name: 'loop', 
                desc: '() - Main code (runs repeatedly)',
                template: 'void loop() {\n  \n}',
                placeholders: []
            }
        ];
        
        this.arduinoKeywords = [
            'void', 'int', 'float', 'bool', 'char', 'byte', 'word', 'long', 'unsigned',
            'const', 'static', 'volatile', 'if', 'else', 'for', 'while', 'do', 'switch',
            'case', 'break', 'continue', 'return', 'true', 'false', 'HIGH', 'LOW',
            'INPUT', 'OUTPUT', 'INPUT_PULLUP'
        ];
        
        this.init();
    }
    
    init() {
        this.updateLineNumbers();
        this.setupEventListeners();
        this.applySyntaxHighlighting();
    }
    
    setupEventListeners() {
        this.editor.addEventListener('input', () => {
            this.updateLineNumbers();
            this.updateCursorPosition();
            this.applySyntaxHighlighting();
        });
        
        this.editor.addEventListener('scroll', () => {
            this.lineNumbers.scrollTop = this.editor.scrollTop;
            // Update highlight position when scrolling
            this.updateHighlightPosition();
        });
        
        this.editor.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        this.editor.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
        });
        
        this.editor.addEventListener('click', () => {
            this.updateCursorPosition();
        });
        
        this.editor.addEventListener('keyup', () => {
            this.updateCursorPosition();
        });
    }
    
    updateLineNumbers() {
        const lines = this.editor.value.split('\n');
        const lineNumbersHTML = lines.map((_, index) => index + 1).join('\n');
        this.lineNumbers.textContent = lineNumbersHTML;
    }
    
    updateCursorPosition() {
        const cursorPos = this.editor.selectionStart;
        const textBeforeCursor = this.editor.value.substring(0, cursorPos);
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines.length;
        const currentColumn = lines[lines.length - 1].length + 1;
        
        this.cursorPosition.textContent = `Line ${currentLine}, Column ${currentColumn}`;
    }
    
    applySyntaxHighlighting() {
        // This is a simplified syntax highlighting
        // In a real implementation, you'd want to use a proper syntax highlighter
        const code = this.editor.value;
        
        // For now, we'll just ensure the text is properly formatted
        // The actual highlighting would require a more complex implementation
        // that replaces the textarea with a contentEditable div or uses a library
    }
    
    handleKeyDown(e) {
        // Tab navigation for placeholders
        if (e.key === 'Tab' && this.currentPlaceholders && this.currentPlaceholders.length > 0) {
            e.preventDefault();
            
            this.currentPlaceholderIndex++;
            if (this.currentPlaceholderIndex >= this.currentPlaceholders.length) {
                // No more placeholders, move cursor to end
                const lastPlaceholder = this.currentPlaceholders[this.currentPlaceholders.length - 1];
                this.editor.selectionStart = this.editor.selectionEnd = lastPlaceholder.end;
                this.currentPlaceholders = null;
            } else {
                const placeholder = this.currentPlaceholders[this.currentPlaceholderIndex];
                this.editor.selectionStart = placeholder.start;
                this.editor.selectionEnd = placeholder.end;
            }
            return;
        }
        
        // Clear placeholders when user types
        if (e.key.length === 1 && this.currentPlaceholders) {
            this.currentPlaceholders = null;
        }
        
        if (this.completion.style.display === 'block') {
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.selectedCompletionIndex = Math.min(
                        this.selectedCompletionIndex + 1, 
                        this.completionItems.length - 1
                    );
                    this.updateCompletionSelection();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.selectedCompletionIndex = Math.max(
                        this.selectedCompletionIndex - 1, 
                        -1
                    );
                    this.updateCompletionSelection();
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.acceptCompletion();
                    return; // CRITICAL: Return to prevent Enter from triggering auto-indentation
                case 'Escape':
                    this.hideCompletion();
                    break;
            }
        }
        
        // Handle Tab for indentation (only if no placeholders)
        if (e.key === 'Tab' && (!this.currentPlaceholders || this.currentPlaceholders.length === 0)) {
            e.preventDefault();
            this.insertText('  '); // Insert 2 spaces for indentation
        }
        
        // Handle Enter for auto-indentation
        if (e.key === 'Enter') {
            e.preventDefault();
            this.handleEnterKey();
        }
    }
    
    handleKeyUp(e) {
        // Get the current line
        const cursorPos = this.editor.selectionStart;
        const textBeforeCursor = this.editor.value.substring(0, cursorPos);
        const currentLine = textBeforeCursor.split('\n').pop();
        
        // Show completion if typing a letter, or if line starts with #
        if ((e.key.length === 1 && /[a-zA-Z]/.test(e.key)) || currentLine.trim().startsWith('#')) {
            this.showCompletion();
        }
    }
    
    insertText(text) {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const value = this.editor.value;
        
        this.editor.value = value.substring(0, start) + text + value.substring(end);
        this.editor.selectionStart = this.editor.selectionEnd = start + text.length;
        this.updateLineNumbers();
        this.updateCursorPosition();
    }
    
    handleEnterKey() {
        const cursorPos = this.editor.selectionStart;
        const textBeforeCursor = this.editor.value.substring(0, cursorPos);
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines[lines.length - 1];
        
        // Calculate indentation based on current line
        let indent = '';
        const match = currentLine.match(/^(\s*)/);
        if (match) {
            indent = match[1];
        }
        
        // Add extra indentation for opening braces
        if (currentLine.includes('{')) {
            indent += '  ';
        }
        
        // Insert newline with proper indentation
        this.insertText('\n' + indent);
    }
    
    showCompletion() {
        const cursorPos = this.editor.selectionStart;
        const textBeforeCursor = this.editor.value.substring(0, cursorPos);
        
        // Match words or #include patterns
        const wordMatch = textBeforeCursor.match(/[#\w\.]+$/);
        
        if (!wordMatch) {
            this.hideCompletion();
            return;
        }
        
        const currentWord = wordMatch[0].toLowerCase();

        // Use smarter filtering based on what was typed
        if (currentWord.startsWith('#')) {
            // For includes, match if the function name includes the typed text
            this.completionItems = this.arduinoFunctions.filter(func => 
                func.name.toLowerCase().includes(currentWord)
            );
        } else {
            // For regular functions, only match if they start with the typed text
            this.completionItems = this.arduinoFunctions.filter(func => 
                func.name.toLowerCase().startsWith(currentWord)
            );
        }
        
        if (this.completionItems.length > 0) {
            this.renderCompletion();
            this.selectedCompletionIndex = 0;
            this.updateCompletionSelection();
        } else {
            this.hideCompletion();
        }
    }
    
    renderCompletion() {
        this.completion.innerHTML = '';
        this.completionItems.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'completion-item';
            div.innerHTML = `
                <span class="function-name">${item.name}</span>
                <span class="function-desc">${item.desc}</span>
            `;
            div.addEventListener('click', () => {
                this.selectedCompletionIndex = index;
                this.acceptCompletion();
            });
            this.completion.appendChild(div);
        });
        
        // Position the completion dropdown
        const rect = this.editor.getBoundingClientRect();
        this.completion.style.left = '15px';
        this.completion.style.top = '200px'; // Approximate position
        this.completion.style.display = 'block';
    }
    
    updateCompletionSelection() {
        const items = this.completion.querySelectorAll('.completion-item');
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedCompletionIndex);
        });
    }
    
    acceptCompletion() {
        if (this.selectedCompletionIndex >= 0 && this.selectedCompletionIndex < this.completionItems.length) {
            const selectedItem = this.completionItems[this.selectedCompletionIndex];
            const cursorPos = this.editor.selectionStart;
            const textBeforeCursor = this.editor.value.substring(0, cursorPos);
            const wordMatch = textBeforeCursor.match(/[#\w\.]+$/);
            
            if (wordMatch) {
                const start = cursorPos - wordMatch[0].length;
                const end = cursorPos;
                const value = this.editor.value;
                
                // Insert template instead of just name
                const template = selectedItem.template || selectedItem.name;
                const parsedTemplate = this.parseTemplate(template);
                
                this.editor.value = value.substring(0, start) + parsedTemplate.text + value.substring(end);
                
                // Position cursor at first placeholder
                if (parsedTemplate.placeholders.length > 0) {
                    const firstPlaceholder = parsedTemplate.placeholders[0];
                    this.editor.selectionStart = start + firstPlaceholder.start;
                    this.editor.selectionEnd = start + firstPlaceholder.end;
                    
                    // Store placeholders for Tab navigation
                    this.currentPlaceholders = parsedTemplate.placeholders.map(p => ({
                        start: start + p.start,
                        end: start + p.end
                    }));
                    this.currentPlaceholderIndex = 0;
                }
                
                this.updateLineNumbers();
            }
        }
        this.hideCompletion();
    }
    
    hideCompletion() {
        this.completion.style.display = 'none';
        this.selectedCompletionIndex = -1;
    }
    
    /**
     * Parse template and extract placeholder positions
     */
    parseTemplate(template) {
        const placeholders = [];
        let text = template;
        let offset = 0;
        
        // Find all ${placeholder} patterns
        const regex = /\$\{([^}]+)\}/g;
        let match;
        
        while ((match = regex.exec(template)) !== null) {
            const placeholderText = match[1];
            const placeholderStart = match.index - offset;
            
            placeholders.push({
                start: placeholderStart,
                end: placeholderStart + placeholderText.length,
                text: placeholderText
            });
            
            // Replace ${placeholder} with just placeholder
            text = text.replace(match[0], placeholderText);
            offset += match[0].length - placeholderText.length;
        }
        
        return { text, placeholders };
    }
    
    getValue() {
        const value = this.editor ? this.editor.value : '';
        console.log('📖 CodeEditor.getValue() called, returning:', value);
        return value;
    }
    
    setValue(value) {
        this.editor.value = value;
        this.updateLineNumbers();
        this.updateCursorPosition();
        this.applySyntaxHighlighting();
    }
    
    /**
     * Highlight a specific line number
     */
    highlightLine(lineNumber) {
        // Remove any existing highlights
        this.clearLineHighlight();
        
        if (!this.editor || lineNumber < 1) return;
        
        const lines = this.editor.value.split('\n');
        if (lineNumber > lines.length) return;
        
        // Store the current highlighted line
        this.currentHighlightedLine = lineNumber;
        
        // Create or get the highlight overlay
        let highlightOverlay = document.getElementById('line-highlight-overlay');
        if (!highlightOverlay) {
            highlightOverlay = document.createElement('div');
            highlightOverlay.id = 'line-highlight-overlay';
            highlightOverlay.className = 'line-highlight-overlay';
            
            // Position the overlay relative to the editor
            const editorWrapper = this.editor.parentElement;
            editorWrapper.style.position = 'relative';
            editorWrapper.appendChild(highlightOverlay);
        }
        
        // Update the highlight position
        this.updateHighlightPosition();
        
        // Ensure the highlighted line is visible
        this.scrollToLine(lineNumber);
        
        console.log(`🎯 Highlighting line ${lineNumber}: "${lines[lineNumber - 1]}"`);
    }
    
    /**
     * Update the highlight overlay position based on scroll
     */
    updateHighlightPosition() {
        if (!this.currentHighlightedLine) return;
        
        const highlightOverlay = document.getElementById('line-highlight-overlay');
        if (!highlightOverlay) return;
        
        // Calculate line position accounting for scroll
        const lineHeight = this.getLineHeight();
        const editorPadding = this.getEditorPadding();
        const scrollTop = this.editor.scrollTop;
        const topOffset = (this.currentHighlightedLine - 1) * lineHeight + editorPadding.top - scrollTop;
        
        // Position the overlay
        highlightOverlay.style.top = `${topOffset}px`;
        highlightOverlay.style.height = `${lineHeight}px`;
        highlightOverlay.style.display = 'block';
    }
    
    /**
     * Clear line highlighting
     */
    clearLineHighlight() {
        const highlightOverlay = document.getElementById('line-highlight-overlay');
        if (highlightOverlay) {
            highlightOverlay.style.display = 'none';
        }
        this.currentHighlightedLine = null;
    }
    
    /**
     * Get the line height of the editor
     */
    getLineHeight() {
        if (!this.editor) return 28.8; // fallback based on CSS (16px * 1.8)
        
        // Get computed style to determine line height
        const computedStyle = window.getComputedStyle(this.editor);
        const fontSize = parseFloat(computedStyle.fontSize);
        const lineHeightValue = computedStyle.lineHeight;
        
        // Parse line height - it could be a number (multiplier) or pixels
        let lineHeight;
        if (lineHeightValue === 'normal') {
            lineHeight = fontSize * 1.2; // browser default
        } else if (lineHeightValue.includes('px')) {
            lineHeight = parseFloat(lineHeightValue);
        } else {
            lineHeight = fontSize * parseFloat(lineHeightValue);
        }
        
        return lineHeight;
    }
    
    /**
     * Get the editor's padding values
     */
    getEditorPadding() {
        if (!this.editor) return { top: 25, left: 25, right: 25, bottom: 25 };
        
        const computedStyle = window.getComputedStyle(this.editor);
        return {
            top: parseFloat(computedStyle.paddingTop) || 25,
            left: parseFloat(computedStyle.paddingLeft) || 25,
            right: parseFloat(computedStyle.paddingRight) || 25,
            bottom: parseFloat(computedStyle.paddingBottom) || 25
        };
    }
    
    /**
     * Scroll to a specific line number
     */
    scrollToLine(lineNumber) {
        if (!this.editor || lineNumber < 1) return;
        
        const lines = this.editor.value.split('\n');
        if (lineNumber > lines.length) return;
        
        // Get actual line height
        const lineHeight = this.getLineHeight();
        const scrollTop = (lineNumber - 1) * lineHeight;
        
        // Calculate the editor's visible area
        const editorHeight = this.editor.clientHeight;
        const currentScrollTop = this.editor.scrollTop;
        const visibleTop = currentScrollTop;
        const visibleBottom = currentScrollTop + editorHeight;
        
        // Only scroll if the line is not already visible
        const lineTop = scrollTop;
        const lineBottom = scrollTop + lineHeight;
        
        if (lineTop < visibleTop) {
            // Line is above visible area, scroll up
            this.editor.scrollTop = Math.max(0, lineTop - 50);
        } else if (lineBottom > visibleBottom) {
            // Line is below visible area, scroll down
            this.editor.scrollTop = lineBottom - editorHeight + 50;
        }
        // If line is already visible, don't scroll at all
    }
    
    /**
     * Get the line number from a line of code
     */
    getLineNumberFromCode(code, targetLine) {
        if (!code || !targetLine) return 0;
        
        const lines = code.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === targetLine.trim()) {
                return i + 1; // Line numbers start from 1
            }
        }
        return 0;
    }
    
    /**
     * Test method to verify highlighting works for all lines
     * Call this from browser console: window.codeEditor.testHighlighting()
     */
    testHighlighting() {
        const lines = this.editor.value.split('\n');
        console.log(`Testing highlighting for ${lines.length} lines`);
        
        // Test each line
        for (let i = 1; i <= lines.length; i++) {
            setTimeout(() => {
                this.highlightLine(i);
                console.log(`Testing line ${i}/${lines.length}: "${lines[i-1]}"`);
                
                // Test scrolling while highlighting
                if (i === Math.floor(lines.length / 2)) {
                    setTimeout(() => {
                        console.log('Testing scroll behavior...');
                        this.editor.scrollTop = this.editor.scrollHeight / 2;
                    }, 500);
                }
            }, i * 1000); // 1 second delay between each line
        }
        
        // Clear after testing
        setTimeout(() => {
            this.clearLineHighlight();
            console.log('Highlighting test completed');
        }, (lines.length + 1) * 1000);
    }
    
    /**
     * Test method to simulate code execution timing
     * Call this from browser console: window.codeEditor.testExecutionTiming()
     */
    testExecutionTiming() {
        const testCode = `#include <TimerOne.h>

void setup() {
  pinMode(13, OUTPUT);         // LED pin
  Timer1.initialize(20000);   // 50Hz for servo
  Timer1.pwm(9, 512);         // Servo center position
}

void loop() {
  digitalWrite(13, HIGH);     // Turn LED on
  delay(1000);
  digitalWrite(13, LOW);      // Turn LED off
  delay(1000);
}`;
        
        console.log('🧪 Testing execution timing with motor control code...');
        this.setValue(testCode);
        
        // Simulate the execution timing
        const lines = testCode.split('\n');
        let currentLine = 0;
        
        const simulateExecution = () => {
            if (currentLine >= lines.length) {
                console.log('✅ Execution timing test completed');
                this.clearLineHighlight();
                return;
            }
            
            const line = lines[currentLine].trim();
            const lineNumber = currentLine + 1;
            
            console.log(`🎯 Line ${lineNumber}: "${line}"`);
            
            if (line && !line.startsWith('//') && !line.includes('void') && !line.includes('{') && !line.includes('}')) {
                // This is an executable line
                this.highlightLine(lineNumber);
                
                // Simulate execution delay
                const delay = line.includes('delay') ? 100 : 50; // Shorter delays for testing
                setTimeout(() => {
                    console.log(`⚡ Executed line ${lineNumber}`);
                    currentLine++;
                    simulateExecution();
                }, delay);
            } else {
                // Skip non-executable lines instantly
                console.log(`⏭️ Skipping line ${lineNumber} (non-executable)`);
                currentLine++;
                setTimeout(simulateExecution, 0);
            }
        };
        
        simulateExecution();
    }
}

// Create global code editor instance
window.codeEditor = new ArduinoCodeEditor();
