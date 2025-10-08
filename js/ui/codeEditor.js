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
        
        console.log('📝 CodeEditor initialized:', {
            editor: !!this.editor,
            lineNumbers: !!this.lineNumbers,
            completion: !!this.completion,
            cursorPosition: !!this.cursorPosition
        });
        
        // Arduino function completions
        this.arduinoFunctions = [
            { name: 'pinMode', desc: '(pin, mode) - Set pin as INPUT or OUTPUT' },
            { name: 'digitalWrite', desc: '(pin, value) - Write HIGH or LOW to pin' },
            { name: 'digitalRead', desc: '(pin) - Read HIGH or LOW from pin' },
            { name: 'analogWrite', desc: '(pin, value) - Write PWM value (0-255)' },
            { name: 'analogRead', desc: '(pin) - Read analog value (0-1023)' },
            { name: 'delay', desc: '(ms) - Wait for milliseconds' },
            { name: 'millis', desc: '() - Get milliseconds since start' },
            { name: 'setup', desc: '() - Initialize code (runs once)' },
            { name: 'loop', desc: '() - Main code (runs repeatedly)' }
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
                    break;
                case 'Escape':
                    this.hideCompletion();
                    break;
            }
        }
        
        // Handle Tab for indentation
        if (e.key === 'Tab') {
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
        // Show completion on certain triggers
        if (e.key === '.' || e.key === '(' || e.key === ' ') {
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
        const wordMatch = textBeforeCursor.match(/\w+$/);
        
        if (!wordMatch) {
            this.hideCompletion();
            return;
        }
        
        const currentWord = wordMatch[0].toLowerCase();
        this.completionItems = this.arduinoFunctions.filter(func => 
            func.name.toLowerCase().startsWith(currentWord)
        );
        
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
            const wordMatch = textBeforeCursor.match(/\w+$/);
            
            if (wordMatch) {
                const start = cursorPos - wordMatch[0].length;
                const end = cursorPos;
                const value = this.editor.value;
                
                this.editor.value = value.substring(0, start) + selectedItem.name + value.substring(end);
                this.editor.selectionStart = this.editor.selectionEnd = start + selectedItem.name.length;
                this.updateLineNumbers();
            }
        }
        this.hideCompletion();
    }
    
    hideCompletion() {
        this.completion.style.display = 'none';
        this.selectedCompletionIndex = -1;
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
        
        // Calculate line position
        const lineHeight = this.getLineHeight();
        const editorPadding = this.getEditorPadding();
        const topOffset = (lineNumber - 1) * lineHeight + editorPadding.top;
        
        // Position the overlay
        highlightOverlay.style.top = `${topOffset}px`;
        highlightOverlay.style.height = `${lineHeight}px`;
        highlightOverlay.style.display = 'block';
        
        // Ensure the highlighted line is visible
        this.scrollToLine(lineNumber);
        
        console.log(`🎯 Highlighting line ${lineNumber}: "${lines[lineNumber - 1]}"`, {
            lineHeight: lineHeight,
            topOffset: topOffset,
            editorPadding: editorPadding,
            totalLines: lines.length
        });
    }
    
    /**
     * Clear line highlighting
     */
    clearLineHighlight() {
        const highlightOverlay = document.getElementById('line-highlight-overlay');
        if (highlightOverlay) {
            highlightOverlay.style.display = 'none';
        }
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
                console.log(`Testing line ${i}/${lines.length}`);
            }, i * 1000); // 1 second delay between each line
        }
        
        // Clear after testing
        setTimeout(() => {
            this.clearLineHighlight();
            console.log('Highlighting test completed');
        }, (lines.length + 1) * 1000);
    }
}

// Create global code editor instance
window.codeEditor = new ArduinoCodeEditor();
