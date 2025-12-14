// ============================================================================
// TestDataManager.js - Test Data Management Utility
// ============================================================================
// This module provides low-level utilities for managing test data.
// It does NOT create sample data - that's the responsibility of each test.
//
// Key Responsibilities:
// 1. Clear all data from tables
// 2. Provide methods to insert data into tables
// 3. Reset to default state (via initDB.js)
//
// Usage Pattern:
// 1. testDataManager.clearAll() - Clear all tables
// 2. Insert your test-specific data using add methods
// 3. Run your tests
// 4. testDataManager.resetToDefault() - Restore default state
// ============================================================================

import UserService from "../modules/userModules/UserService.js";
import ProductService from "../modules/productModules/ProductService.js";
import CategoryService from "../modules/categoryModules/CategoryService.js";
import OrderService from "../modules/orderModules/OrderService.js";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestDataManager {
  constructor() {
    // Initialize all services
    this.userService = new UserService();
    this.productService = new ProductService();
    this.categoryService = new CategoryService();
    this.orderService = new OrderService();
  }

  // ========================================================================
  // CLEAR ALL DATA FROM TABLES
  // ========================================================================
  async clearAll() {
    console.log("🗑️  Clearing all test data...");

    // Clear in correct order (respecting foreign key constraints)
    await this.orderService.eraseAll();
    await this.productService.eraseAll();
    await this.categoryService.eraseAll();
    await this.userService.eraseAll();

    console.log("✅ All data cleared\n");
  }

  // ========================================================================
  // ADD USER
  // Parameters:
  //   - username: User's full name
  //   - email: User's email address
  //   - password: Plain text password (will be hashed by UserService)
  //   - role: "buyer", "seller", or "admin"
  // Returns: Created User object
  // ========================================================================
  async addUser(username, email, password, role) {
    const user = await this.userService.addUser(
      username,
      email,
      password,
      role
    );
    return user;
  }

  // ========================================================================
  // ADD CATEGORY
  // Parameters:
  //   - name: Category name
  //   - description: Category description
  // Returns: Created Category object
  // ========================================================================
  async addCategory(name, description) {
    const category = await this.categoryService.addCategory(name, description);
    return category;
  }

  // ========================================================================
  // ADD PRODUCT
  // Parameters:
  //   - name: Product name
  //   - sellerId: ID of the seller
  //   - description: Product description
  //   - price: Product price
  //   - stock: Available stock quantity
  //   - categoryId: ID of the category
  // Returns: Created Product object
  // ========================================================================
  async addProduct(name, sellerId, description, price, stock, categoryId) {
    const product = await this.productService.addProduct(
      name,
      sellerId,
      description,
      price,
      stock,
      categoryId
    );
    return product;
  }

  // ========================================================================
  // ADD ORDER
  // Parameters:
  //   - product: Product object (not just ID)
  //   - buyerId: ID of the buyer
  //   - sellerId: ID of the seller
  //   - quantity: Order quantity
  //   - totalPrice: Total order price
  // Returns: Created Order object
  // ========================================================================
  async addOrder(product, buyerId, sellerId, quantity, totalPrice) {
    const order = await this.orderService.addOrder(
      product,
      buyerId,
      sellerId,
      quantity,
      totalPrice
    );
    return order;
  }

  // ========================================================================
  // GET ALL METHODS (for verification in tests)
  // ========================================================================
  getAllUsers() {
    return this.userService.getAll();
  }

  getAllCategories() {
    return this.categoryService.getAll();
  }

  getAllProducts() {
    return this.productService.getAll();
  }

  getAllOrders() {
    return this.orderService.getAll();
  }

  // ========================================================================
  // RESET TO DEFAULT STATE
  // Executes initDB.js to restore the database to its default state
  // ========================================================================
  async resetToDefault() {
    console.log("\n🔄 Resetting database to default state...\n");

    const initDBPath = path.resolve(__dirname, "initDB.js");

    try {
      execSync(`node "${initDBPath}"`, { stdio: "inherit" });
      console.log("\n✅ Database reset to default state complete\n");
    } catch (err) {
      console.error("❌ Failed to reset database:", err.message);
      throw err;
    }
  }
}

export default TestDataManager;
