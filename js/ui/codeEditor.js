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
}

// Create global code editor instance
window.codeEditor = new ArduinoCodeEditor();
