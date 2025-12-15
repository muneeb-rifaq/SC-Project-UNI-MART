// ============================================================================
// Parser.js - Syntax Analyzer for Product Query Language
// ============================================================================
// Implements recursive descent parser based on ProductQueryGrammar.g4
// Builds Abstract Syntax Tree (AST) from token stream
// ============================================================================

import { TokenType } from "./Lexer.js";

/**
 * AST Node types
 */
export const ASTNodeType = {
  BINARY_OP: "BinaryOp", // AND, OR
  UNARY_OP: "UnaryOp", // NOT
  COMPARISON: "Comparison", // <, <=, >, >=, =, !=
  FIELD_SEARCH: "FieldSearch", // field:value
  RANGE_SEARCH: "RangeSearch", // field:min..max
  TEXT_SEARCH: "TextSearch", // "search text"
  LITERAL: "Literal", // number or string value
  IDENTIFIER: "Identifier", // field name
};

/**
 * AST Node base class
 */
export class ASTNode {
  constructor(type) {
    this.type = type;
  }
}

/**
 * Binary operation node (AND, OR)
 */
export class BinaryOpNode extends ASTNode {
  constructor(operator, left, right) {
    super(ASTNodeType.BINARY_OP);
    this.operator = operator; // 'AND' or 'OR'
    this.left = left;
    this.right = right;
  }
}

/**
 * Unary operation node (NOT)
 */
export class UnaryOpNode extends ASTNode {
  constructor(operator, operand) {
    super(ASTNodeType.UNARY_OP);
    this.operator = operator; // 'NOT'
    this.operand = operand;
  }
}

/**
 * Comparison node (field < value, etc.)
 */
export class ComparisonNode extends ASTNode {
  constructor(field, operator, value) {
    super(ASTNodeType.COMPARISON);
    this.field = field;
    this.operator = operator; // '<', '<=', '>', '>=', '=', '!='
    this.value = value;
  }
}

/**
 * Field search node (field:value)
 */
export class FieldSearchNode extends ASTNode {
  constructor(field, value) {
    super(ASTNodeType.FIELD_SEARCH);
    this.field = field;
    this.value = value;
  }
}

/**
 * Range search node (field:min..max)
 */
export class RangeSearchNode extends ASTNode {
  constructor(field, min, max) {
    super(ASTNodeType.RANGE_SEARCH);
    this.field = field;
    this.min = min;
    this.max = max;
  }
}

/**
 * Text search node ("search term")
 */
export class TextSearchNode extends ASTNode {
  constructor(value) {
    super(ASTNodeType.TEXT_SEARCH);
    this.value = value;
  }
}

/**
 * Parser class - Implements recursive descent parsing
 */
export class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
    this.currentToken = this.tokens[0] || { type: TokenType.EOF, value: null };
  }

  /**
   * Advance to next token
   */
  advance() {
    this.position++;
    this.currentToken =
      this.position < this.tokens.length
        ? this.tokens[this.position]
        : { type: TokenType.EOF, value: null };
  }

  /**
   * Check if current token matches expected type
   */
  match(tokenType) {
    return this.currentToken.type === tokenType;
  }

  /**
   * Consume token if it matches expected type
   */
  consume(tokenType) {
    if (this.match(tokenType)) {
      const token = this.currentToken;
      this.advance();
      return token;
    }
    throw new Error(
      `Expected ${tokenType} but got ${this.currentToken.type} at position ${this.position}`
    );
  }

  /**
   * Main entry point: query
   * query: orExpression EOF | EOF
   */
  parse() {
    if (this.match(TokenType.EOF)) {
      return null; // Empty query
    }

    const ast = this.parseOrExpression();
    this.consume(TokenType.EOF);
    return ast;
  }

  /**
   * orExpression: andExpression (OR andExpression)*
   */
  parseOrExpression() {
    let left = this.parseAndExpression();

    while (this.match(TokenType.OR)) {
      this.advance();
      const right = this.parseAndExpression();
      left = new BinaryOpNode("OR", left, right);
    }

    return left;
  }

  /**
   * andExpression: notExpression (AND notExpression)*
   */
  parseAndExpression() {
    let left = this.parseNotExpression();

    while (this.match(TokenType.AND)) {
      this.advance();
      const right = this.parseNotExpression();
      left = new BinaryOpNode("AND", left, right);
    }

    return left;
  }

  /**
   * notExpression: NOT primaryExpression | primaryExpression
   */
  parseNotExpression() {
    if (this.match(TokenType.NOT)) {
      this.advance();
      const operand = this.parsePrimaryExpression();
      return new UnaryOpNode("NOT", operand);
    }

    return this.parsePrimaryExpression();
  }

  /**
   * primaryExpression: LPAREN orExpression RPAREN | comparison | fieldSearch | rangeSearch | textSearch
   */
  parsePrimaryExpression() {
    // Parenthesized expression
    if (this.match(TokenType.LPAREN)) {
      this.advance();
      const expr = this.parseOrExpression();
      this.consume(TokenType.RPAREN);
      return expr;
    }

    // Text search: STRING
    if (this.match(TokenType.STRING)) {
      const value = this.currentToken.value;
      this.advance();
      return new TextSearchNode(value);
    }

    // Field-based expressions
    if (this.match(TokenType.IDENTIFIER)) {
      const field = this.currentToken.value;
      this.advance();

      // Field search with colon: field:value or field:min..max
      if (this.match(TokenType.COLON)) {
        this.advance();

        // Range search: field:NUMBER..NUMBER
        if (this.match(TokenType.NUMBER)) {
          const min = this.currentToken.value;
          this.advance();

          if (this.match(TokenType.RANGE)) {
            this.advance();
            const max = this.consume(TokenType.NUMBER).value;
            return new RangeSearchNode(field, min, max);
          }

          // Just field:NUMBER
          return new FieldSearchNode(field, min);
        }

        // Field search: field:"value"
        if (this.match(TokenType.STRING)) {
          const value = this.currentToken.value;
          this.advance();
          return new FieldSearchNode(field, value);
        }

        // Field search with comparison after colon: field:>value
        if (this.isComparisonOperator()) {
          const operator = this.currentToken.value;
          this.advance();
          const value = this.parseValue();
          return new ComparisonNode(field, operator, value);
        }

        // Field search: field:identifier
        if (this.match(TokenType.IDENTIFIER)) {
          const value = this.currentToken.value;
          this.advance();
          return new FieldSearchNode(field, value);
        }
      }

      // Comparison: field OPERATOR value
      if (this.isComparisonOperator()) {
        const operator = this.currentToken.value;
        this.advance();
        const value = this.parseValue();
        return new ComparisonNode(field, operator, value);
      }

      // Bare identifier - treat as text search
      return new TextSearchNode(field);
    }

    throw new Error(
      `Unexpected token ${this.currentToken.type} at position ${this.position}`
    );
  }

  /**
   * Check if current token is a comparison operator
   */
  isComparisonOperator() {
    return [
      TokenType.LT,
      TokenType.LTE,
      TokenType.GT,
      TokenType.GTE,
      TokenType.EQ,
      TokenType.NEQ,
    ].includes(this.currentToken.type);
  }

  /**
   * Parse value: STRING | NUMBER | IDENTIFIER
   */
  parseValue() {
    if (this.match(TokenType.STRING)) {
      const value = this.currentToken.value;
      this.advance();
      return value;
    }

    if (this.match(TokenType.NUMBER)) {
      const value = this.currentToken.value;
      this.advance();
      return value;
    }

    if (this.match(TokenType.IDENTIFIER)) {
      const value = this.currentToken.value;
      this.advance();
      return value;
    }

    throw new Error(
      `Expected value but got ${this.currentToken.type} at position ${this.position}`
    );
  }
}

export default Parser;
