// ============================================================================
// Lexer.js - Lexical Analyzer for Product Query Language
// ============================================================================
// Implements tokenization based on ProductQueryGrammar.g4
// Converts input string into stream of tokens
// ============================================================================

/**
 * Token types matching ANTLR grammar
 */
export const TokenType = {
  // Keywords
  AND: "AND",
  OR: "OR",
  NOT: "NOT",

  // Operators
  LT: "LT",
  LTE: "LTE",
  GT: "GT",
  GTE: "GTE",
  EQ: "EQ",
  NEQ: "NEQ",
  COLON: "COLON",
  RANGE: "RANGE",

  // Delimiters
  LPAREN: "LPAREN",
  RPAREN: "RPAREN",

  // Literals
  NUMBER: "NUMBER",
  STRING: "STRING",
  IDENTIFIER: "IDENTIFIER",

  // Special
  EOF: "EOF",
  WHITESPACE: "WHITESPACE",
};

/**
 * Token class representing a single lexical unit
 */
export class Token {
  constructor(type, value, position) {
    this.type = type;
    this.value = value;
    this.position = position;
  }

  toString() {
    return `Token(${this.type}, '${this.value}', pos=${this.position})`;
  }
}

/**
 * Lexer class - Tokenizes input based on ANTLR grammar
 */
export class Lexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.currentChar = this.input[0] || null;
    this.line = 1;
    this.column = 1;
  }

  /**
   * Advance to next character
   */
  advance() {
    if (this.currentChar === "\n") {
      this.line++;
      this.column = 0;
    }

    this.position++;
    this.column++;
    this.currentChar =
      this.position < this.input.length ? this.input[this.position] : null;
  }

  /**
   * Peek ahead without consuming
   */
  peek(offset = 1) {
    const peekPos = this.position + offset;
    return peekPos < this.input.length ? this.input[peekPos] : null;
  }

  /**
   * Skip whitespace characters
   */
  skipWhitespace() {
    while (this.currentChar && /\s/.test(this.currentChar)) {
      this.advance();
    }
  }

  /**
   * Read NUMBER token: [0-9]+ ('.' [0-9]+)?
   */
  readNumber() {
    const startPos = this.position;
    let numStr = "";

    while (this.currentChar && /[0-9.]/.test(this.currentChar)) {
      numStr += this.currentChar;
      this.advance();
    }

    return new Token(TokenType.NUMBER, parseFloat(numStr), startPos);
  }

  /**
   * Read STRING token: '"' (~["\r\n])* '"' | '\'' (~['\r\n])* '\''
   */
  readString() {
    const startPos = this.position;
    const quote = this.currentChar; // Opening quote
    let str = "";

    this.advance(); // Skip opening quote

    while (this.currentChar && this.currentChar !== quote) {
      if (this.currentChar === "\\" && this.peek() === quote) {
        // Handle escaped quotes
        this.advance();
        str += this.currentChar;
        this.advance();
      } else {
        str += this.currentChar;
        this.advance();
      }
    }

    if (this.currentChar === quote) {
      this.advance(); // Skip closing quote
    }

    return new Token(TokenType.STRING, str, startPos);
  }

  /**
   * Read IDENTIFIER or keyword: [a-zA-Z_][a-zA-Z0-9_]*
   */
  readIdentifier() {
    const startPos = this.position;
    let id = "";

    while (this.currentChar && /[a-zA-Z0-9_]/.test(this.currentChar)) {
      id += this.currentChar;
      this.advance();
    }

    // Check for keywords (case-insensitive)
    const upper = id.toUpperCase();
    if (upper === "AND" || upper === "&&") {
      return new Token(TokenType.AND, "AND", startPos);
    }
    if (upper === "OR" || upper === "||") {
      return new Token(TokenType.OR, "OR", startPos);
    }
    if (upper === "NOT" || upper === "!") {
      return new Token(TokenType.NOT, "NOT", startPos);
    }

    return new Token(TokenType.IDENTIFIER, id, startPos);
  }

  /**
   * Get next token from input
   */
  getNextToken() {
    while (this.currentChar) {
      const startPos = this.position;

      // Skip whitespace
      if (/\s/.test(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }

      // Skip comments: // ...
      if (this.currentChar === "/" && this.peek() === "/") {
        while (this.currentChar && this.currentChar !== "\n") {
          this.advance();
        }
        continue;
      }

      // NUMBER: [0-9]+
      if (/[0-9]/.test(this.currentChar)) {
        return this.readNumber();
      }

      // STRING: "..." or '...'
      if (this.currentChar === '"' || this.currentChar === "'") {
        return this.readString();
      }

      // IDENTIFIER or keyword: [a-zA-Z_]
      if (/[a-zA-Z_]/.test(this.currentChar)) {
        return this.readIdentifier();
      }

      // Two-character operators
      if (this.currentChar === "<") {
        this.advance();
        if (this.currentChar === "=") {
          this.advance();
          return new Token(TokenType.LTE, "<=", startPos);
        }
        if (this.currentChar === ">") {
          this.advance();
          return new Token(TokenType.NEQ, "<>", startPos);
        }
        return new Token(TokenType.LT, "<", startPos);
      }

      if (this.currentChar === ">") {
        this.advance();
        if (this.currentChar === "=") {
          this.advance();
          return new Token(TokenType.GTE, ">=", startPos);
        }
        return new Token(TokenType.GT, ">", startPos);
      }

      if (this.currentChar === "=") {
        this.advance();
        if (this.currentChar === "=") {
          this.advance();
        }
        return new Token(TokenType.EQ, "=", startPos);
      }

      if (this.currentChar === "!") {
        this.advance();
        if (this.currentChar === "=") {
          this.advance();
          return new Token(TokenType.NEQ, "!=", startPos);
        }
        return new Token(TokenType.NOT, "NOT", startPos);
      }

      if (this.currentChar === "&" && this.peek() === "&") {
        this.advance();
        this.advance();
        return new Token(TokenType.AND, "AND", startPos);
      }

      if (this.currentChar === "|" && this.peek() === "|") {
        this.advance();
        this.advance();
        return new Token(TokenType.OR, "OR", startPos);
      }

      // Range operator: ..
      if (this.currentChar === "." && this.peek() === ".") {
        this.advance();
        this.advance();
        return new Token(TokenType.RANGE, "..", startPos);
      }

      // Single-character tokens
      const char = this.currentChar;
      this.advance();

      switch (char) {
        case ":":
          return new Token(TokenType.COLON, ":", startPos);
        case "(":
          return new Token(TokenType.LPAREN, "(", startPos);
        case ")":
          return new Token(TokenType.RPAREN, ")", startPos);
        default:
          throw new Error(
            `Unexpected character '${char}' at position ${startPos}`
          );
      }
    }

    return new Token(TokenType.EOF, null, this.position);
  }

  /**
   * Tokenize entire input into array of tokens
   */
  tokenize() {
    const tokens = [];
    let token = this.getNextToken();

    while (token.type !== TokenType.EOF) {
      tokens.push(token);
      token = this.getNextToken();
    }

    tokens.push(token); // Add EOF token
    return tokens;
  }
}

export default Lexer;
