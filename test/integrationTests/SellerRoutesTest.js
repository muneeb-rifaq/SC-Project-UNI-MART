// ============================================================================
// SellerRoutesTest.js - Integration tests for Seller routes
// ============================================================================
// This file tests all seller-specific endpoints using TestDataManager
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
let seller1Id, seller2Id, buyerId, electronicsId, clothingId;
let laptop, phone, shirt, jeans;
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
  console.log("║        SELLER ROUTES INTEGRATION TESTS                 ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  let passed = 0;
  let failed = 0;

  try {
    // ========================================================================
    // SETUP TEST DATA
    // ========================================================================
    console.log("📝 Setting up test data...\n");
    await testDataManager.clearAll();

    // Create sellers
    const seller1 = await testDataManager.addUser(
      "Ali Shop",
      "seller1@test.com",
      "seller123",
      "seller"
    );
    seller1Id = seller1.getAttribute("userId");

    const seller2 = await testDataManager.addUser(
      "Bob Store",
      "seller2@test.com",
      "seller456",
      "seller"
    );
    seller2Id = seller2.getAttribute("userId");

    // Create a buyer
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

    // Create products for seller1
    laptop = await testDataManager.addProduct(
      "Lenovo Thinkpad",
      seller1Id,
      "Business laptop",
      1200,
      10,
      electronicsId
    );
    phone = await testDataManager.addProduct(
      "Samsung Phone",
      seller1Id,
      "Smartphone",
      800,
      15,
      electronicsId
    );

    // Create products for seller2
    shirt = await testDataManager.addProduct(
      "Cotton Shirt",
      seller2Id,
      "Comfortable shirt",
      25,
      50,
      clothingId
    );
    jeans = await testDataManager.addProduct(
      "Blue Jeans",
      seller2Id,
      "Denim jeans",
      60,
      30,
      clothingId
    );

    // Create orders for seller1
    await testDataManager.addOrder(laptop, buyerId, seller1Id, 1, 1200);
    await testDataManager.addOrder(phone, buyerId, seller1Id, 2, 1600);

    // Create order for seller2
    await testDataManager.addOrder(shirt, buyerId, seller2Id, 3, 75);

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
    // TEST 1: Login as Seller
    // ========================================================================
    console.log("📋 Test 1: Login as Seller");
    try {
      const { status, data } = await makeRequest("/api/login", "POST", {
        email: "seller1@test.com",
        password: "seller123",
      });

      if (status !== 200) throw new Error(`Expected 200, got ${status}`);
      if (!data.loginOnlyDetails?.verificationKey)
        throw new Error("Missing verificationKey");
      if (data.loginOnlyDetails.role !== "seller")
        throw new Error(`Expected role 'seller'`);

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
      const { status, data } = await makeRequest("/api/seller/products");
      if (status !== 200) throw new Error(`Expected 200, got ${status}`);
      if (data.length !== 4)
        throw new Error(`Expected 4 products, got ${data.length}`);

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
        "/api/seller/products/find?attribute=name&value=Lenovo Thinkpad"
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
    // TEST 4: Add new product
    // ========================================================================
    console.log("📋 Test 4: Add new product");
    try {
      const newProduct = {
        name: "Tablet",
        sellerId: seller1Id,
        description: "Android tablet",
        price: 300,
        stock: 20,
        categoryId: electronicsId,
      };

      const { status, data } = await makeRequest(
        "/api/seller/products",
        "POST",
        newProduct
      );
      if (status !== 201) throw new Error(`Expected 201, got ${status}`);
      if (!data.productId) throw new Error("Expected productId in response");

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 5: Try to add product with wrong sellerId (should fail)
    // ========================================================================
    console.log(
      "📋 Test 5: Try to add product with wrong sellerId (should fail)"
    );
    try {
      const badProduct = {
        name: "Fake Product",
        sellerId: seller2Id, // Wrong seller ID
        description: "Should not be created",
        price: 100,
        stock: 10,
        categoryId: electronicsId,
      };

      const { status } = await makeRequest(
        "/api/seller/products",
        "POST",
        badProduct
      );
      if (status !== 403) throw new Error(`Expected 403, got ${status}`);

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 6: Update own product
    // ========================================================================
    console.log("📋 Test 6: Update own product");
    try {
      const laptopId = laptop.getAttribute("productId");
      const updateData = {
        attribute: "price",
        value: 1100,
      };

      const { status, data } = await makeRequest(
        `/api/seller/products/${laptopId}`,
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
    // TEST 7: Try to update another seller's product (should fail)
    // ========================================================================
    console.log(
      "📋 Test 7: Try to update another seller's product (should fail)"
    );
    try {
      const shirtId = shirt.getAttribute("productId");
      const updateData = {
        attribute: "price",
        value: 999,
      };

      const { status } = await makeRequest(
        `/api/seller/products/${shirtId}`,
        "PATCH",
        updateData
      );
      if (status !== 403) throw new Error(`Expected 403, got ${status}`);

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 8: Delete own product
    // ========================================================================
    console.log("📋 Test 8: Delete own product");
    try {
      const phoneId = phone.getAttribute("productId");
      const { status } = await makeRequest(
        `/api/seller/products/${phoneId}`,
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
    // TEST 9: Try to delete another seller's product (should fail)
    // ========================================================================
    console.log(
      "📋 Test 9: Try to delete another seller's product (should fail)"
    );
    try {
      const jeansId = jeans.getAttribute("productId");
      const { status } = await makeRequest(
        `/api/seller/products/${jeansId}`,
        "DELETE"
      );
      if (status !== 403) throw new Error(`Expected 403, got ${status}`);

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 10: Get all categories
    // ========================================================================
    console.log("📋 Test 10: Get all categories");
    try {
      const { status, data } = await makeRequest("/api/seller/categories");
      if (status !== 200) throw new Error(`Expected 200, got ${status}`);
      if (data.length !== 2)
        throw new Error(`Expected 2 categories, got ${data.length}`);

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 11: Find categories by attribute
    // ========================================================================
    console.log("📋 Test 11: Find categories by attribute");
    try {
      const { status, data } = await makeRequest(
        `/api/seller/categories/find?attribute=categoryId&value=${electronicsId}`
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
    // TEST 12: Get seller's orders
    // ========================================================================
    console.log("📋 Test 12: Get seller's orders");
    try {
      const { status, data } = await makeRequest("/api/seller/orders");
      if (status !== 200) throw new Error(`Expected 200, got ${status}`);
      if (!Array.isArray(data)) throw new Error("Expected array");
      // Seller1 should have 2 orders
      if (data.length !== 2)
        throw new Error(`Expected 2 orders, got ${data.length}`);

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 13: Find orders by attribute
    // ========================================================================
    console.log("📋 Test 13: Find orders by attribute");
    try {
      const { status, data } = await makeRequest(
        "/api/seller/orders/find?attribute=status&value=pending"
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
    // TEST 14: Update own order status
    // ========================================================================
    console.log("📋 Test 14: Update own order status");
    try {
      const ordersRes = await makeRequest("/api/seller/orders");
      if (ordersRes.data.length === 0) {
        console.log("⚠️ SKIPPED - No orders to update\n");
        passed++;
      } else {
        const orderId = ordersRes.data[0].orderId;
        const updateData = {
          attribute: "status",
          value: "shipped",
        };

        const { status, data } = await makeRequest(
          `/api/seller/orders/${orderId}`,
          "PATCH",
          updateData
        );
        if (status !== 200) throw new Error(`Expected 200, got ${status}`);
        if (data.status !== "shipped") throw new Error("Status not updated");

        console.log("✅ PASSED\n");
        passed++;
      }
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 15: Try to update another seller's order (should fail)
    // ========================================================================
    console.log(
      "📋 Test 15: Try to update another seller's order (should fail)"
    );
    try {
      const seller2Orders = await testDataManager.getAllOrders();
      const seller2Order = seller2Orders.find(
        (o) => o.getAttribute("sellerId") === seller2Id
      );

      if (!seller2Order) {
        console.log("⚠️ SKIPPED - No seller2 order found\n");
        passed++;
      } else {
        const updateData = {
          attribute: "status",
          value: "shipped",
        };

        const { status } = await makeRequest(
          `/api/seller/orders/${seller2Order.getAttribute("orderId")}`,
          "PATCH",
          updateData
        );
        if (status !== 403) throw new Error(`Expected 403, got ${status}`);

        console.log("✅ PASSED\n");
        passed++;
      }
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
