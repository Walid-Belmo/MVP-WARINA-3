/**
 * Syntax Highlighter
 * Provides real-time syntax highlighting for Arduino code
 */

class SyntaxHighlighter {
    constructor() {
        // Token patterns
        this.patterns = {
            // Keywords (includes constants like HIGH, LOW, etc.)
            keywords: /\b(void|if|else|for|while|do|switch|case|break|continue|return|const|static|volatile|HIGH|LOW|INPUT|OUTPUT|INPUT_PULLUP|true|false)\b/g,

            // Function declarations (setup, loop)
            functionDecl: /\b(setup|loop)\b/g,

            // Data types
            types: /\b(int|float|double|char|byte|boolean|bool|String|long|short|unsigned|signed)\b/g,

            // Arduino functions (most specific, checked first)
            arduinoFunctions: /\b(pinMode|digitalWrite|digitalRead|analogRead|analogWrite|delay|delayMicroseconds|millis|micros|Serial|attachInterrupt|detachInterrupt)\b/g,

            // PWM/Custom functions
            pwmFunctions: /\b(setDutyCycle|getDutyCycle|setPWM|getPWM)\b/g,

            // Numbers
            numbers: /\b(\d+)\b/g,

            // Strings
            strings: /"([^"\\]*(\\.[^"\\]*)*)"/g,

            // Single-line comments
            comments: /\/\/.*/g,

            // Operators and special chars (for reference, but we keep them white)
            operators: /[=+\-*/<>!&|%^~;,()[\]{}]/g
        };

        // Token type priorities (higher = applied first)
        this.priorities = [
            'comments',         // Highest priority
            'strings',
            'arduinoFunctions', // Check Arduino functions BEFORE keywords/types
            'pwmFunctions',     // Check PWM functions early
            'functionDecl',
            'keywords',
            'types',
            'numbers'
        ];
    }

    /**
     * Highlight a single line of code
     * @param {string} line - Line of code to highlight
     * @returns {string} HTML with syntax highlighting
     */
    highlightLine(line) {
        if (!line || line.trim().length === 0) {
            return line || '&nbsp;'; // Preserve empty lines
        }

        // Create tokens array with positions
        let tokens = [];

        // Extract all tokens with their positions
        this.priorities.forEach(type => {
            const pattern = this.patterns[type];
            const regex = new RegExp(pattern.source, pattern.flags);
            let match;

            while ((match = regex.exec(line)) !== null) {
                tokens.push({
                    type: type,
                    value: match[0],
                    start: match.index,
                    end: match.index + match[0].length
                });
            }
        });

        // Sort tokens by start position, then by priority
        tokens.sort((a, b) => {
            if (a.start !== b.start) return a.start - b.start;
            return this.priorities.indexOf(a.type) - this.priorities.indexOf(b.type);
        });

        // Remove overlapping tokens (keep higher priority ones)
        let filteredTokens = [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            let hasOverlap = false;

            // Check if this token overlaps with any already accepted token
            for (let j = 0; j < filteredTokens.length; j++) {
                const existing = filteredTokens[j];

                // Check for any overlap
                if (!(token.end <= existing.start || token.start >= existing.end)) {
                    hasOverlap = true;
                    break;
                }
            }

            // Only add if no overlap found
            if (!hasOverlap) {
                filteredTokens.push(token);
            }
        }

        // Sort filtered tokens by position for rendering
        filteredTokens.sort((a, b) => a.start - b.start);

        // Build highlighted HTML
        let result = '';
        let currentPos = 0;

        filteredTokens.forEach(token => {
            // Add text before token (unhighlighted)
            if (token.start > currentPos) {
                result += this.escapeHtml(line.substring(currentPos, token.start));
            }

            // Add highlighted token
            result += `<span class="syntax-${token.type}">${this.escapeHtml(token.value)}</span>`;
            currentPos = token.end;
        });

        // Add remaining text
        if (currentPos < line.length) {
            result += this.escapeHtml(line.substring(currentPos));
        }

        return result;
    }

    /**
     * Highlight entire code block
     * @param {string} code - Full code to highlight
     * @returns {string} HTML with syntax highlighting
     */
    highlightCode(code) {
        const lines = code.split('\n');
        return lines.map(line => this.highlightLine(line)).join('\n');
    }

    /**
     * Check if a line is complete (ends with ; { or })
     * @param {string} line - Line to check
     * @returns {boolean} True if line is complete
     */
    isLineComplete(line) {
        const trimmed = line.trim();
        if (trimmed.length === 0) return false;

        const lastChar = trimmed[trimmed.length - 1];
        return lastChar === ';' || lastChar === '{' || lastChar === '}';
    }

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get CSS class for token type
     * @param {string} type - Token type
     * @returns {string} CSS class name
     */
    getTokenClass(type) {
        return `syntax-${type}`;
    }
}

// Create global instance
window.syntaxHighlighter = new SyntaxHighlighter();
