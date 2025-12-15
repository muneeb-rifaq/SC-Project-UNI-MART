// ============================================================================
// Evaluator.js - Query Evaluator for Product Search
// ============================================================================
// Traverses AST and evaluates queries against product data
// Implements visitor pattern for AST node evaluation
// ============================================================================

import { ASTNodeType } from "./Parser.js";

/**
 * Evaluator class - Executes queries against product dataset
 */
export class Evaluator {
  constructor(products, categories = []) {
    this.products = products;
    this.categories = categories;
  }

  /**
   * Get category name from ID
   */
  getCategoryName(categoryId) {
    const category = this.categories.find((c) => c.categoryId === categoryId);
    return category ? category.categoryName || category.name : "";
  }

  /**
   * Map field names to product properties
   */
  getFieldValue(product, field) {
    const fieldLower = field.toLowerCase();

    const fieldMap = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      seller: product.sellerId,
      sellerid: product.sellerId,
      category: this.getCategoryName(product.categoryId),
      categoryid: product.categoryId,
      productid: product.productId,
    };

    return fieldMap[fieldLower] !== undefined ? fieldMap[fieldLower] : null;
  }

  /**
   * Evaluate AST node against a product
   * Returns true if product matches the query
   */
  evaluateNode(product, node) {
    if (!node) return true;

    switch (node.type) {
      case ASTNodeType.BINARY_OP:
        return this.evaluateBinaryOp(product, node);

      case ASTNodeType.UNARY_OP:
        return this.evaluateUnaryOp(product, node);

      case ASTNodeType.COMPARISON:
        return this.evaluateComparison(product, node);

      case ASTNodeType.FIELD_SEARCH:
        return this.evaluateFieldSearch(product, node);

      case ASTNodeType.RANGE_SEARCH:
        return this.evaluateRangeSearch(product, node);

      case ASTNodeType.TEXT_SEARCH:
        return this.evaluateTextSearch(product, node);

      default:
        console.warn(`Unknown node type: ${node.type}`);
        return true;
    }
  }

  /**
   * Evaluate binary operation (AND, OR)
   */
  evaluateBinaryOp(product, node) {
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
  }

  /**
   * Evaluate unary operation (NOT)
   */
  evaluateUnaryOp(product, node) {
    if (node.operator === "NOT") {
      return !this.evaluateNode(product, node.operand);
    }

    return false;
  }

  /**
   * Evaluate comparison (field < value, etc.)
   */
  evaluateComparison(product, node) {
    const fieldValue = this.getFieldValue(product, node.field);

    if (fieldValue === null) {
      return false;
    }

    const targetValue = node.value;

    switch (node.operator) {
      case "<":
        return fieldValue < targetValue;
      case "<=":
        return fieldValue <= targetValue;
      case ">":
        return fieldValue > targetValue;
      case ">=":
        return fieldValue >= targetValue;
      case "=":
        return this.compareEqual(fieldValue, targetValue);
      case "!=":
        return !this.compareEqual(fieldValue, targetValue);
      default:
        return false;
    }
  }

  /**
   * Evaluate field search (field:value)
   */
  evaluateFieldSearch(product, node) {
    const fieldValue = this.getFieldValue(product, node.field);

    if (fieldValue === null) {
      return false;
    }

    return this.compareEqual(fieldValue, node.value);
  }

  /**
   * Evaluate range search (field:min..max)
   */
  evaluateRangeSearch(product, node) {
    const fieldValue = this.getFieldValue(product, node.field);

    if (fieldValue === null || typeof fieldValue !== "number") {
      return false;
    }

    return fieldValue >= node.min && fieldValue <= node.max;
  }

  /**
   * Evaluate text search (searches name and description)
   */
  evaluateTextSearch(product, node) {
    const searchTerm = node.value.toLowerCase();

    return (
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Compare values for equality (handles strings case-insensitively)
   */
  compareEqual(fieldValue, targetValue) {
    // String comparison (case-insensitive, substring match)
    if (typeof fieldValue === "string" && typeof targetValue === "string") {
      return fieldValue.toLowerCase().includes(targetValue.toLowerCase());
    }

    // Numeric comparison
    if (typeof fieldValue === "number" && typeof targetValue === "number") {
      return fieldValue === targetValue;
    }

    // Mixed type - convert to string and compare
    return (
      String(fieldValue).toLowerCase() === String(targetValue).toLowerCase()
    );
  }

  /**
   * Execute query against all products
   * Returns filtered product array
   */
  execute(ast) {
    // Null or empty AST returns all products
    if (!ast) {
      return this.products;
    }

    return this.products.filter((product) => this.evaluateNode(product, ast));
  }
}

export default Evaluator;
