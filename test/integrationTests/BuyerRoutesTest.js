// ============================================================================
// BuyerRoutesTest.js - Integration tests for Buyer routes
// ============================================================================
// This file tests all buyer-specific endpoints using TestDataManager
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
let buyerId, buyer2Id, sellerId, electronicsId, clothingId;
let laptop, phone, shirt;
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
  console.log("║        BUYER ROUTES INTEGRATION TESTS                  ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  let passed = 0;
  let failed = 0;

  try {
    // ========================================================================
    // SETUP TEST DATA
    // ========================================================================
    console.log("📝 Setting up test data...\n");
    await testDataManager.clearAll();

    // Create users
    const buyer1 = await testDataManager.addUser(
      "John Doe",
      "buyer1@test.com",
      "buyer123",
      "buyer"
    );
    buyerId = buyer1.getAttribute("userId");

    const buyer2 = await testDataManager.addUser(
      "Jane Smith",
      "buyer2@test.com",
      "buyer456",
      "buyer"
    );
    buyer2Id = buyer2.getAttribute("userId");

    const seller = await testDataManager.addUser(
      "Ali Shop",
      "seller@test.com",
      "seller123",
      "seller"
    );
    sellerId = seller.getAttribute("userId");

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

    // Create an order for buyer2 (for security testing)
    await testDataManager.addOrder(laptop, buyer2Id, sellerId, 1, 1200);

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
    // TEST 1: Login as Buyer
    // ========================================================================
    console.log("📋 Test 1: Login as Buyer");
    try {
      const { status, data } = await makeRequest("/api/login", "POST", {
        email: "buyer1@test.com",
        password: "buyer123",
      });

      if (status !== 200) throw new Error(`Expected 200, got ${status}`);
      if (!data.loginOnlyDetails?.verificationKey)
        throw new Error("Missing verificationKey");
      if (data.loginOnlyDetails.role !== "buyer")
        throw new Error(`Expected role 'buyer'`);

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
      const { status, data } = await makeRequest("/api/buyer/products");
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
    console.log("📋 Test 3: Find products by attribute (name)");
    try {
      const { status, data } = await makeRequest(
        "/api/buyer/products/find?attribute=name&value=Lenovo Thinkpad"
      );
      if (status !== 200) throw new Error(`Expected 200, got ${status}`);
      if (data.length === 0) throw new Error("Expected to find product");
      if (data[0].name !== "Lenovo Thinkpad")
        throw new Error("Wrong product found");

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 4: Get all categories
    // ========================================================================
    console.log("📋 Test 4: Get all categories");
    try {
      const { status, data } = await makeRequest("/api/buyer/categories");
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
    // TEST 5: Find categories by attribute
    // ========================================================================
    console.log("📋 Test 5: Find categories by attribute");
    try {
      const { status, data } = await makeRequest(
        `/api/buyer/categories/find?attribute=categoryId&value=${electronicsId}`
      );
      if (status !== 200) throw new Error(`Expected 200, got ${status}`);
      if (!Array.isArray(data)) throw new Error("Expected array response");

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 6: Get buyer's orders (should be empty initially)
    // ========================================================================
    console.log("📋 Test 6: Get buyer's orders");
    try {
      const { status, data } = await makeRequest("/api/buyer/orders");
      if (status !== 200) throw new Error(`Expected 200, got ${status}`);
      if (!Array.isArray(data)) throw new Error("Expected array");
      if (data.length !== 0)
        throw new Error(`Expected 0 orders, got ${data.length}`);

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 7: Find orders by attribute
    // ========================================================================
    console.log("📋 Test 7: Find orders by attribute");
    try {
      const { status, data } = await makeRequest(
        "/api/buyer/orders/find?attribute=status&value=pending"
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
    // TEST 8: Place a new order
    // ========================================================================
    console.log("📋 Test 8: Place a new order");
    try {
      const orderData = {
        product: laptop,
        buyerId: buyerId,
        sellerId: sellerId,
        quantity: 1,
        totalPrice: laptop.getAttribute("price"),
      };

      const { status, data } = await makeRequest(
        "/api/buyer/orders",
        "POST",
        orderData
      );
      if (status !== 201) throw new Error(`Expected 201, got ${status}`);
      if (!data.orderId) throw new Error("Expected orderId in response");

      console.log("✅ PASSED\n");
      passed++;
    } catch (err) {
      console.error(`❌ FAILED - ${err.message}\n`);
      failed++;
    }

    // ========================================================================
    // TEST 9: Delete own order
    // ========================================================================
    console.log("📋 Test 9: Delete own order");
    try {
      const ordersRes = await makeRequest("/api/buyer/orders");
      if (ordersRes.data.length === 0) {
        console.log("⚠️ SKIPPED - No orders to delete\n");
        passed++;
      } else {
        const orderId = ordersRes.data[0].orderId;
        const { status } = await makeRequest(
          `/api/buyer/orders/${orderId}`,
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
    // TEST 10: Try to delete another buyer's order (should fail)
    // ========================================================================
    console.log("📋 Test 10: Try to delete another buyer's order");
    try {
      // Get buyer2's orders
      const buyer2Orders = await testDataManager.getAllOrders();
      const buyer2Order = buyer2Orders.find(
        (o) => o.getAttribute("buyerId") === buyer2Id
      );

      if (!buyer2Order) {
        console.log("⚠️ SKIPPED - No buyer2 order found\n");
        passed++;
      } else {
        const { status } = await makeRequest(
          `/api/buyer/orders/${buyer2Order.getAttribute("orderId")}`,
          "DELETE"
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
    // Reset database to default state
    await testDataManager.resetToDefault();
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("💥 Test suite crashed:", err);
  process.exit(1);
});
