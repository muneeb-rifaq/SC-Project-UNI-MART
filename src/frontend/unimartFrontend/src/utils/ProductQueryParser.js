// ============================================================================
// ProductQueryParser.js - Parser Generator for Product Search
// ============================================================================
// Implements a complete lexer-parser-evaluator pipeline for advanced queries
//
// Supported Query Syntax:
// - Field searches: name:"laptop" price:500 stock:>10
// - Ranges: price:100..500
// - Comparisons: price < 1000, stock >= 5
// - Logical operators: AND, OR
// - Grouping: (price < 500 OR stock > 10) AND category:"Electronics"
// - Text search: "gaming laptop" (searches name and description)
// ============================================================================

// ============================================================================
// LEXER (Tokenizer)
// ============================================================================
class Lexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.currentChar = this.input[0] || null;
  }

  advance() {
    this.position++;
    this.currentChar =
      this.position < this.input.length ? this.input[this.position] : null;
  }

  skipWhitespace() {
    while (this.currentChar && /\s/.test(this.currentChar)) {
      this.advance();
    }
  }

  readNumber() {
    let numStr = "";
    while (this.currentChar && /[0-9.]/.test(this.currentChar)) {
      numStr += this.currentChar;
      this.advance();
    }
    return parseFloat(numStr);
  }

  readString() {
    let str = "";
    const quote = this.currentChar; // ' or "
    this.advance(); // skip opening quote

    while (this.currentChar && this.currentChar !== quote) {
      str += this.currentChar;
      this.advance();
    }

    if (this.currentChar === quote) {
      this.advance(); // skip closing quote
    }

    return str;
  }

  readIdentifier() {
    let id = "";
    while (this.currentChar && /[a-zA-Z_]/.test(this.currentChar)) {
      id += this.currentChar;
      this.advance();
    }
    return id;
  }

  getNextToken() {
    while (this.currentChar) {
      if (/\s/.test(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }

      // Numbers
      if (/[0-9]/.test(this.currentChar)) {
        return { type: "NUMBER", value: this.readNumber() };
      }

      // Strings
      if (this.currentChar === '"' || this.currentChar === "'") {
        return { type: "STRING", value: this.readString() };
      }

      // Identifiers and keywords
      if (/[a-zA-Z_]/.test(this.currentChar)) {
        const id = this.readIdentifier();
        const upper = id.toUpperCase();

        if (upper === "AND") return { type: "AND", value: "AND" };
        if (upper === "OR") return { type: "OR", value: "OR" };
        if (upper === "NOT") return { type: "NOT", value: "NOT" };

        return { type: "IDENTIFIER", value: id };
      }

      // Operators
      if (this.currentChar === ":") {
        this.advance();
        return { type: "COLON", value: ":" };
      }

      if (this.currentChar === "(") {
        this.advance();
        return { type: "LPAREN", value: "(" };
      }

      if (this.currentChar === ")") {
        this.advance();
        return { type: "RPAREN", value: ")" };
      }

      if (this.currentChar === "<") {
        this.advance();
        if (this.currentChar === "=") {
          this.advance();
          return { type: "LTE", value: "<=" };
        }
        return { type: "LT", value: "<" };
      }

      if (this.currentChar === ">") {
        this.advance();
        if (this.currentChar === "=") {
          this.advance();
          return { type: "GTE", value: ">=" };
        }
        return { type: "GT", value: ">" };
      }

      if (this.currentChar === "=") {
        this.advance();
        if (this.currentChar === "=") {
          this.advance();
        }
        return { type: "EQ", value: "=" };
      }

      if (this.currentChar === "!") {
        this.advance();
        if (this.currentChar === "=") {
          this.advance();
          return { type: "NEQ", value: "!=" };
        }
        return { type: "NOT", value: "NOT" };
      }

      if (this.currentChar === ".") {
        this.advance();
        if (this.currentChar === ".") {
          this.advance();
          return { type: "RANGE", value: ".." };
        }
      }

      // Unknown character
      this.advance();
    }

    return { type: "EOF", value: null };
  }

  tokenize() {
    const tokens = [];
    let token = this.getNextToken();

    while (token.type !== "EOF") {
      tokens.push(token);
      token = this.getNextToken();
    }

    return tokens;
  }
}

// ============================================================================
// PARSER (AST Builder)
// ============================================================================
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
    this.currentToken = this.tokens[0] || { type: "EOF", value: null };
  }

  advance() {
    this.position++;
    this.currentToken =
      this.position < this.tokens.length
        ? this.tokens[this.position]
        : { type: "EOF", value: null };
  }

  parse() {
    if (this.tokens.length === 0) {
      return null;
    }
    return this.parseExpression();
  }

  // Expression: OrExpression
  parseExpression() {
    return this.parseOrExpression();
  }

  // OrExpression: AndExpression (OR AndExpression)*
  parseOrExpression() {
    let left = this.parseAndExpression();

    while (this.currentToken.type === "OR") {
      this.advance();
      const right = this.parseAndExpression();
      left = {
        type: "BinaryOp",
        operator: "OR",
        left: left,
        right: right,
      };
    }

    return left;
  }

  // AndExpression: NotExpression (AND NotExpression)*
  parseAndExpression() {
    let left = this.parseNotExpression();

    while (this.currentToken.type === "AND") {
      this.advance();
      const right = this.parseNotExpression();
      left = {
        type: "BinaryOp",
        operator: "AND",
        left: left,
        right: right,
      };
    }

    return left;
  }

  // NotExpression: NOT? ComparisonExpression
  parseNotExpression() {
    if (this.currentToken.type === "NOT") {
      this.advance();
      return {
        type: "UnaryOp",
        operator: "NOT",
        operand: this.parseComparisonExpression(),
      };
    }

    return this.parseComparisonExpression();
  }

  // ComparisonExpression: FieldSearch | Comparison | Primary
  parseComparisonExpression() {
    // Check for parentheses first
    if (this.currentToken.type === "LPAREN") {
      this.advance();
      const expr = this.parseExpression();
      if (this.currentToken.type === "RPAREN") {
        this.advance();
      }
      return expr;
    }

    // Check for field:value or field operator value
    if (this.currentToken.type === "IDENTIFIER") {
      const field = this.currentToken.value;
      this.advance();

      // Field search: field:"value" or field:value
      if (this.currentToken.type === "COLON") {
        this.advance();

        // Range: field:min..max
        if (this.currentToken.type === "NUMBER") {
          const minValue = this.currentToken.value;
          this.advance();

          if (this.currentToken.type === "RANGE") {
            this.advance();
            const maxValue = this.currentToken.value;
            this.advance();

            return {
              type: "Range",
              field: field,
              min: minValue,
              max: maxValue,
            };
          }

          // Just field:number
          return {
            type: "FieldSearch",
            field: field,
            value: minValue,
          };
        }

        // field:"string"
        if (this.currentToken.type === "STRING") {
          const value = this.currentToken.value;
          this.advance();
          return {
            type: "FieldSearch",
            field: field,
            value: value,
          };
        }

        // field:>number, field:>=number, etc.
        if (
          ["GT", "GTE", "LT", "LTE", "EQ", "NEQ"].includes(
            this.currentToken.type
          )
        ) {
          const operator = this.currentToken.value;
          this.advance();
          const value = this.currentToken.value;
          this.advance();

          return {
            type: "Comparison",
            field: field,
            operator: operator,
            value: value,
          };
        }
      }

      // Comparison: field < value, field >= value, etc.
      if (
        ["GT", "GTE", "LT", "LTE", "EQ", "NEQ"].includes(this.currentToken.type)
      ) {
        const operator = this.currentToken.value;
        this.advance();
        const value = this.currentToken.value;
        this.advance();

        return {
          type: "Comparison",
          field: field,
          operator: operator,
          value: value,
        };
      }

      // Just field name - treat as text search
      return {
        type: "TextSearch",
        value: field,
      };
    }

    // Plain string - text search
    if (this.currentToken.type === "STRING") {
      const value = this.currentToken.value;
      this.advance();
      return {
        type: "TextSearch",
        value: value,
      };
    }

    return null;
  }
}

// ============================================================================
// EVALUATOR (Query Executor)
// ============================================================================
class Evaluator {
  constructor(products, categories = []) {
    this.products = products;
    this.categories = categories;
  }

  // Map field names to product properties
  getFieldValue(product, field) {
    const fieldMap = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      seller: product.sellerId,
      sellerId: product.sellerId,
      category: this.getCategoryName(product.categoryId),
      categoryId: product.categoryId,
    };

    return fieldMap[field.toLowerCase()] || null;
  }

  getCategoryName(categoryId) {
    const category = this.categories.find((c) => c.categoryId === categoryId);
    return category ? category.categoryName || category.name : "";
  }

  evaluateNode(product, node) {
    if (!node) return true;

    switch (node.type) {
      case "BinaryOp":
        if (node.operator === "AND") {
          return (
            this.evaluateNode(product, node.left) &&
            this.evaluateNode(product, node.right)
          );
        }
        if (node.operator === "OR") {
          return (
            this.evaluateNode(product, node.left) ||
            this.evaluateNode(product, node.right)
          );
        }
        return false;

      case "UnaryOp":
        if (node.operator === "NOT") {
          return !this.evaluateNode(product, node.operand);
        }
        return false;

      case "FieldSearch":
        const fieldValue = this.getFieldValue(product, node.field);
        if (fieldValue === null) return false;

        // Case-insensitive string comparison
        if (typeof fieldValue === "string" && typeof node.value === "string") {
          return fieldValue.toLowerCase().includes(node.value.toLowerCase());
        }

        // Exact match for numbers
        return fieldValue == node.value;

      case "Range":
        const rangeValue = this.getFieldValue(product, node.field);
        if (rangeValue === null) return false;
        return rangeValue >= node.min && rangeValue <= node.max;

      case "Comparison":
        const compValue = this.getFieldValue(product, node.field);
        if (compValue === null) return false;

        switch (node.operator) {
          case "<":
            return compValue < node.value;
          case "<=":
            return compValue <= node.value;
          case ">":
            return compValue > node.value;
          case ">=":
            return compValue >= node.value;
          case "=":
            return compValue == node.value;
          case "!=":
            return compValue != node.value;
          default:
            return false;
        }

      case "TextSearch":
        // Search in name and description
        const searchTerm = node.value.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm)
        );

      default:
        return true;
    }
  }

  execute(ast) {
    if (!ast) {
      return this.products; // No query = return all
    }

    return this.products.filter((product) => this.evaluateNode(product, ast));
  }
}

// ============================================================================
// QUERY PARSER (Main Interface)
// ============================================================================
class ProductQueryParser {
  constructor(products, categories = []) {
    this.products = products;
    this.categories = categories;
  }

  parse(queryString) {
    try {
      // Empty query returns all products
      if (!queryString || queryString.trim() === "") {
        return {
          success: true,
          results: this.products,
          ast: null,
          tokens: [],
        };
      }

      // Lexer: tokenize input
      const lexer = new Lexer(queryString);
      const tokens = lexer.tokenize();

      // Parser: build AST
      const parser = new Parser(tokens);
      const ast = parser.parse();

      // Evaluator: execute query
      const evaluator = new Evaluator(this.products, this.categories);
      const results = evaluator.execute(ast);

      return {
        success: true,
        results: results,
        ast: ast,
        tokens: tokens,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        results: this.products, // Return all on error
      };
    }
  }
}

export default ProductQueryParser;
