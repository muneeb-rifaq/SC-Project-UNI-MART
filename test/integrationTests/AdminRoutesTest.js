// ============================================================================
// AdminRoutesTest.js - Integration tests for Admin routes
// ============================================================================
// This file tests all admin-specific endpoints using TestDataManager
// for consistent, isolated test data.
//
// Test Flow:
// 1. Clear all tables
// 2. Insert test-specific data
// 3. Run integration tests
// 4. Reset to default state
// ============================================================================

import TestDataManager from "../../src/backend/utils/TestDataManager.js";

const BASE_URL = "http://localhost:3000";
const testDataManager = new TestDataManager();

// Test data variables
let adminId, sellerId, buyerId, electronicsId, clothingId, booksId;
let laptop, phone, shirt;
let createdCategoryId, createdUserId;
let authHeaders = {};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
async function makeRequest(
  endpoint,
  method = "GET",
  body = null,
  headers = {}
) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(url, options);
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================
async function runTests() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║        ADMIN ROUTES INTEGRATION TESTS                  ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  let passed = 0;
  let failed = 0;

  try {
    // ========================================================================
    // SETUP TEST DATA
    // ========================================================================
    console.log("📝 Setting up test data...\n");
    await testDataManager.clearAll();

    // Create admin
    const admin = await testDataManager.addUser(
      "Admin User",
      "admin@test.com",
      "admin123",
      "admin"
    );
    adminId = admin.getAttribute("userId");

    // Create other users
    const seller = await testDataManager.addUser(
      "Ali Seller",
      "seller@test.com",
      "seller123",
      "seller"
    );
    sellerId = seller.getAttribute("userId");

    const buyer = await testDataManager.addUser(
      "John Buyer",
      "buyer@test.com",
      "buyer123",
      "buyer"
    );
    buyerId = buyer.getAttribute("userId");

    // Create categories
    const electronics = await testDataManager.addCategory(
      "Electronics",
      "Electronic devices"
    );
    electronicsId = electronics.getAttribute("categoryId");

    const clothing = await testDataManager.addCategory(
      "Clothing",
      "Apparel items"
    );
    clothingId = clothing.getAttribute("categoryId");

    const books = await testDataManager.addCategory(
      "Books",
      "Books and publications"
    );
    booksId = books.getAttribute("categoryId");

    // Create products
    laptop = await testDataManager.addProduct(
      "Lenovo Thinkpad",
      sellerId,
      "Business laptop",
      1200,
      10,
      electronicsId
    );
    phone = await testDataManager.addProduct(
      "Samsung Phone",
      sellerId,
      "Smartphone",
      800,
      15,
      electronicsId
    );
    shirt = await testDataManager.addProduct(
      "Cotton Shirt",
      sellerId,
      "Comfortable shirt",
      25,
      50,
      clothingId
    );

    // Create orders
    await testDataManager.addOrder(laptop, buyerId, sellerId, 1, 1200);
    await testDataManager.addOrder(phone, buyerId, sellerId, 2, 1600);

    console.log("✅ Test data ready\n");

    // ========================================================================
    // IMPORTANT: RESTART SERVER TO LOAD NEW DATA
    // ========================================================================
    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║  ⚠️  RESTART THE SERVER NOW                            ║");
    console.log("║                                                        ║");
    console.log("║  The server needs to reload data from the database.   ║");
    console.log("║                                                        ║");
    console.log("║  1. Stop server (Ctrl+C)                               ║");
    console.log("║  2. Run 'npm start'                                    ║");
    console.log("║  3. Press any key to continue                          ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    await new Promise((resolve) => {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.once("data", () => {
        process.stdin.setRawMode(false);
        resolve();
      });
    });

    console.log("✅ Continuing with tests...\n");

    // ========================================================================
    // TEST 1: Login as Admin
    // ========================================================================
    console.log("📋 Test 1: Login as Admin");
    try {
      const { status, data } = await makeRequest("/api/login", "POST", {
        email: "admin@test.com",
        password: "admin123",
      });

      if (status !== 200) throw new Error(`Expected 200, got ${status}`);
      if (!data.loginOnlyDetails?.verificationKey)
        throw new Error("Missing verificationKey");
      if (data.loginOnlyDetails.role !== "admin")
        throw new Error(`Expected role 'admin'`);

      authHeaders = {
        "x-user-email": data.loginOnlyDetails.email,
        "x-user-key": data.loginOnlyDetails.verificationKey,
        "x-user-role": data.loginOnlyDetails.role,
      };

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 2: Get all products
    // ========================================================================
    console.log("📋 Test 2: Get all products");
    try {
      const { status, data } = await makeRequest("/api/admin/products");
      if (status !== 200) throw new Error(`Expected 200, got ${status}`);
      if (data.length !== 3)
        throw new Error(`Expected 3 products, got ${data.length}`);

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 3: Find products by attribute
    // ========================================================================
    console.log("📋 Test 3: Find products by attribute");
    try {
      const { status, data } = await makeRequest(
        "/api/admin/products/find?attribute=name&value=Lenovo Thinkpad"
      );
      if (status !== 200) throw new Error(`Expected 200, got ${status}`);
      if (data.length === 0) throw new Error("Expected to find product");

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 4: Update any product
    // ========================================================================
    console.log("📋 Test 4: Update any product");
    try {
      const laptopId = laptop.getAttribute("productId");
      const updateData = {
        attribute: "price",
        value: 1100,
      };

      const { status, data } = await makeRequest(
        `/api/admin/products/${laptopId}`,
        "PATCH",
        updateData
      );
      if (status !== 200) throw new Error(`Expected 200, got ${status}`);
      if (data.price !== 1100) throw new Error("Price not updated");

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 5: Delete any product
    // ========================================================================
    console.log("📋 Test 5: Delete any product");
    try {
      const phoneId = phone.getAttribute("productId");
      const { status } = await makeRequest(
        `/api/admin/products/${phoneId}`,
        "DELETE"
      );
      if (status !== 200) throw new Error(`Expected 200, got ${status}`);

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 6: Get all categories
    // ========================================================================
    console.log("📋 Test 6: Get all categories");
    try {
      const { status, data } = await makeRequest("/api/admin/categories");
      if (status !== 200) throw new Error(`Expected 200, got ${status}`);
      if (data.length !== 3)
        throw new Error(`Expected 3 categories, got ${data.length}`);

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 7: Find categories by attribute
    // ========================================================================
    console.log("📋 Test 7: Find categories by attribute");
    try {
      const { status, data } = await makeRequest(
        `/api/admin/categories/find?attribute=categoryId&value=${electronicsId}`
      );
      if (status !== 200) throw new Error(`Expected 200, got ${status}`);
      if (!Array.isArray(data)) throw new Error("Expected array");

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 8: Add new category
    // ========================================================================
    console.log("📋 Test 8: Add new category");
    try {
      const newCategory = {
        name: "Toys",
        description: "Toys and games",
      };

      const { status, data } = await makeRequest(
        "/api/admin/categories",
        "POST",
        newCategory
      );
      if (status !== 201) throw new Error(`Expected 201, got ${status}`);
      if (!data.categoryId) throw new Error("Expected categoryId in response");

      createdCategoryId = data.categoryId;
      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 9: Update category
    // ========================================================================
    console.log("📋 Test 9: Update category");
    try {
      if (!createdCategoryId) throw new Error("No category to update");

      const updateData = {
        attribute: "description",
        value: "Updated toys description",
      };

      const { status, data } = await makeRequest(
        `/api/admin/categories/${createdCategoryId}`,
        "PATCH",
        updateData
      );
      if (status !== 200) throw new Error(`Expected 200, got ${status}`);
      if (data.description !== "Updated toys description")
        throw new Error("Description not updated");

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 10: Delete category
    // ========================================================================
    console.log("📋 Test 10: Delete category");
    try {
      if (!createdCategoryId) throw new Error("No category to delete");

      const { status } = await makeRequest(
        `/api/admin/categories/${createdCategoryId}`,
        "DELETE"
      );
      if (status !== 200) throw new Error(`Expected 200, got ${status}`);

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 11: Get all orders
    // ========================================================================
    console.log("📋 Test 11: Get all orders");
    try {
      const { status, data } = await makeRequest("/api/admin/orders");
      if (status !== 200) throw new Error(`Expected 200, got ${status}`);
      if (!Array.isArray(data)) throw new Error("Expected array");
      if (data.length !== 2)
        throw new Error(`Expected 2 orders, got ${data.length}`);

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 12: Find orders by attribute
    // ========================================================================
    console.log("📋 Test 12: Find orders by attribute");
    try {
      const { status, data } = await makeRequest(
        "/api/admin/orders/find?attribute=status&value=pending"
      );
      if (status !== 200) throw new Error(`Expected 200, got ${status}`);
      if (!Array.isArray(data)) throw new Error("Expected array");

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 13: Update any order
    // ========================================================================
    console.log("📋 Test 13: Update any order");
    try {
      const ordersRes = await makeRequest("/api/admin/orders");
      if (ordersRes.data.length === 0) {
        console.log("⚠️ SKIPPED - No orders to update\n");
        passed++;
      } else {
        const orderId = ordersRes.data[0].orderId;
        const updateData = {
          attribute: "status",
          value: "delivered",
        };

        const { status, data } = await makeRequest(
          `/api/admin/orders/${orderId}`,
          "PATCH",
          updateData
        );
        if (status !== 200) throw new Error(`Expected 200, got ${status}`);
        if (data.status !== "delivered") throw new Error("Status not updated");

        console.log("✅ PASSED\n");
        passed++;
      }
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 14: Delete any order
    // ========================================================================
    console.log("📋 Test 14: Delete any order");
    try {
      const ordersRes = await makeRequest("/api/admin/orders");
      if (ordersRes.data.length === 0) {
        console.log("⚠️ SKIPPED - No orders to delete\n");
        passed++;
      } else {
        const orderId = ordersRes.data[0].orderId;
        const { status } = await makeRequest(
          `/api/admin/orders/${orderId}`,
          "DELETE"
        );
        if (status !== 200) throw new Error(`Expected 200, got ${status}`);

        console.log("✅ PASSED\n");
        passed++;
      }
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 15: Get all users
    // ========================================================================
    console.log("📋 Test 15: Get all users");
    try {
      const { status, data } = await makeRequest("/api/admin/users");
      if (status !== 200) throw new Error(`Expected 200, got ${status}`);
      if (data.length !== 3)
        throw new Error(`Expected 3 users, got ${data.length}`);

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 16: Find users by attribute
    // ========================================================================
    console.log("📋 Test 16: Find users by attribute");
    try {
      const { status, data } = await makeRequest(
        "/api/admin/users/find?attribute=role&value=seller"
      );
      if (status !== 200) throw new Error(`Expected 200, got ${status}`);
      if (!Array.isArray(data)) throw new Error("Expected array");

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 17: Add new user
    // ========================================================================
    console.log("📋 Test 17: Add new user");
    try {
      const newUser = {
        name: "New Seller",
        email: "newseller@test.com",
        passwordHash: "newpass123",
        role: "seller",
      };

      const { status, data } = await makeRequest(
        "/api/admin/users",
        "POST",
        newUser
      );
      if (status !== 201) throw new Error(`Expected 201, got ${status}`);
      if (!data.userId) throw new Error("Expected userId in response");

      createdUserId = data.userId;
      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 18: Update user
    // ========================================================================
    console.log("📋 Test 18: Update user");
    try {
      if (!createdUserId) throw new Error("No user to update");

      const updateData = {
        attribute: "username",
        value: "Updated Seller Name",
      };

      const { status, data } = await makeRequest(
        `/api/admin/users/${createdUserId}`,
        "PATCH",
        updateData
      );
      if (status !== 200) throw new Error(`Expected 200, got ${status}`);
      if (data.username !== "Updated Seller Name")
        throw new Error("Username not updated");

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 19: Delete user
    // ========================================================================
    console.log("📋 Test 19: Delete user");
    try {
      if (!createdUserId) throw new Error("No user to delete");

      const { status } = await makeRequest(
        `/api/admin/users/${createdUserId}`,
        "DELETE"
      );
      if (status !== 200) throw new Error(`Expected 200, got ${status}`);

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 20: Erase all products
    // ========================================================================
    console.log("📋 Test 20: Erase all products");
    try {
      const { status } = await makeRequest("/api/admin/products", "DELETE");
      if (status !== 200) throw new Error(`Expected 200, got ${status}`);

      // Verify products are erased
      const verifyRes = await makeRequest("/api/admin/products");
      if (verifyRes.data.length !== 0) throw new Error("Products not erased");

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST SUMMARY
    // ========================================================================
    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║                   TEST SUMMARY                         ║");
    console.log("╚════════════════════════════════════════════════════════╝");
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total:  ${passed + failed}`);
    console.log(
      `📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(2)}%\n`
    );
  } catch (error) {
    console.error("💥 Test suite error:", error);
  } finally {
    await testDataManager.resetToDefault();
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("💥 Test suite crashed:", err);
  process.exit(1);
});
