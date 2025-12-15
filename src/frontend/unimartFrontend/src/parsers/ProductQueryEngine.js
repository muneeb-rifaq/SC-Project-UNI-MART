// ============================================================================
// ProductQueryEngine.js - Main Query Engine Interface
// ============================================================================
// Facade pattern - Combines Lexer, Parser, and Evaluator
// Provides simple interface for executing product queries
// ============================================================================

import Lexer from "./Lexer.js";
import Parser from "./Parser.js";
import Evaluator from "./Evaluator.js";

/**
 * ProductQueryEngine - Main interface for query execution
 *
 * Usage:
 *   const engine = new ProductQueryEngine(products, categories);
 *   const result = engine.execute('price < 1000 AND stock > 0');
 *   console.log(result.results); // Filtered products
 */
export class ProductQueryEngine {
  constructor(products, categories = []) {
    this.products = products;
    this.categories = categories;
  }

  /**
   * Execute a query string against product dataset
   *
   * @param {string} queryString - Query in Product Query Language syntax
   * @returns {Object} Result object with success, results, ast, tokens, error
   */
  execute(queryString) {
    try {
      // Handle empty query
      if (!queryString || queryString.trim() === "") {
        return {
          success: true,
          results: this.products,
          ast: null,
          tokens: [],
          error: null,
        };
      }

      // Step 1: Lexical Analysis
      const lexer = new Lexer(queryString);
      const tokens = lexer.tokenize();

      // Step 2: Syntax Analysis
      const parser = new Parser(tokens);
      const ast = parser.parse();

      // Step 3: Semantic Analysis & Execution
      const evaluator = new Evaluator(this.products, this.categories);
      const results = evaluator.execute(ast);

      return {
        success: true,
        results: results,
        ast: ast,
        tokens: tokens,
        error: null,
      };
    } catch (error) {
      // Return error with all products (graceful degradation)
      return {
        success: false,
        results: this.products,
        ast: null,
        tokens: [],
        error: error.message,
      };
    }
  }

  /**
   * Validate query syntax without executing
   *
   * @param {string} queryString - Query to validate
   * @returns {Object} Validation result {valid: boolean, error: string|null}
   */
  validate(queryString) {
    try {
      if (!queryString || queryString.trim() === "") {
        return { valid: true, error: null };
      }

      const lexer = new Lexer(queryString);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      parser.parse();

      return { valid: true, error: null };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Get AST for debugging purposes
   */
  getAST(queryString) {
    try {
      const lexer = new Lexer(queryString);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      return parser.parse();
    } catch (error) {
      return null;
    }
  }

  /**
   * Get tokens for debugging purposes
   */
  getTokens(queryString) {
    try {
      const lexer = new Lexer(queryString);
      return lexer.tokenize();
    } catch (error) {
      return [];
    }
  }
}

export default ProductQueryEngine;
