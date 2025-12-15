import assert from "assert";
import Order from "../../../src/backend/modules/orderModules/Order.js";

class OrderTests {
  // -------------------------------------------
  // Test 1: Constructor values
  // -------------------------------------------
  testConstructorValues() {
    console.log("Running testConstructorValues()...");

    // orderId,
    // product,
    // buyerId,
    // sellerId,
    // volume,
    // totalCost,
    // status = "pending"
    const o = new Order(
      1,
      JSON.stringify({ productId: 10, qty: 2 }),
      5,
      3,
      2,
      3000,
      "pending"
    );

    assert.strictEqual(o.getAttribute("orderId"), 1);
    assert.strictEqual(
      o.getAttribute("product"),
      JSON.stringify({ productId: 10, qty: 2 })
    );
    assert.strictEqual(o.getAttribute("buyerId"), 5);
    assert.strictEqual(o.getAttribute("sellerId"), 3);
    assert.strictEqual(o.getAttribute("status"), "pending");
    assert.strictEqual(o.getAttribute("volume"), 2);
    assert.strictEqual(o.getAttribute("totalCost"), 3000);

    console.log("✔ testConstructorValues passed\n");
    return o;
  }

  // -------------------------------------------
  // Test 2: validateInput
  // -------------------------------------------
  testValidateInput() {
    console.log("Running testValidateInput()...");

    assert.strictEqual(Order.validateInput("orderId", 10), true);
    assert.strictEqual(Order.validateInput("product", "{}"), true);
    assert.strictEqual(Order.validateInput("buyerId", 5), true);
    assert.strictEqual(Order.validateInput("sellerId", 3), true);
    assert.strictEqual(Order.validateInput("status", "shipped"), true);
    assert.strictEqual(Order.validateInput("volume", 3), true);
    assert.strictEqual(Order.validateInput("totalCost", 4500), true);

    // invalid
    assert.strictEqual(Order.validateInput("orderId", -1), false);
    assert.strictEqual(Order.validateInput("product", ""), false);
    assert.strictEqual(Order.validateInput("status", "invalid_status"), false);

    console.log("✔ testValidateInput passed\n");
  }

  // -------------------------------------------
  // Test 3: Update attributes
  // -------------------------------------------
  testUpdateAttribute(o) {
    console.log("Running testUpdateAttribute()...");

    assert.strictEqual(o.updateAttribute("status", "confirmed"), true);
    assert.strictEqual(o.getAttribute("status"), "confirmed");
    //       static STATUSES = new Set([
    //     "pending",
    //     "confirmed",
    //     "shipped",
    //     "delivered",
    //     "cancelled",
    //   ]);

    assert.strictEqual(o.updateAttribute("volume", 5), true);
    assert.strictEqual(o.getAttribute("volume"), 5);

    console.log("✔ testUpdateAttribute passed\n");
  }

  // -------------------------------------------
  // Test 4: Invalid updates should fail
  // -------------------------------------------
  testInvalidUpdate(o) {
    console.log("Running testInvalidUpdate()...");

    assert.strictEqual(o.updateAttribute("orderId", 999), false);
    assert.strictEqual(o.updateAttribute("status", "???"), false);
    assert.strictEqual(o.updateAttribute("totalCost", -200), false);

    console.log("✔ testInvalidUpdate passed\n");
  }

  // -------------------------------------------
  // Test 5: Private field protection
  // -------------------------------------------
  testPrivateElementAccess(o) {
    console.log("Running testPrivateElementAccess()...");

    // Direct field access should fail
    assert.strictEqual(o.orderId, undefined);
    assert.strictEqual(o.buyerId, undefined);
    assert.strictEqual(o.status, undefined);

    console.log("✔ testPrivateElementAccess passed\n");
  }

  // -------------------------------------------
  // Test 6: toJSON() for storage
  // -------------------------------------------
  testJSON(o) {
    console.log("Running testJSON()...");

    const json = o.toJSON();

    assert.deepStrictEqual(json, {
      orderId: o.getAttribute("orderId"),
      product: o.getAttribute("product"),
      buyerId: o.getAttribute("buyerId"),
      sellerId: o.getAttribute("sellerId"),
      dateCreated: o.getAttribute("dateCreated"),
      status: o.getAttribute("status"),
      volume: o.getAttribute("volume"),
      totalCost: o.getAttribute("totalCost"),
    });

    console.log("✔ testJSON passed\n");
  }

  // -------------------------------------------
  // Run all tests
  // -------------------------------------------
  runAll() {
    console.log("============== Running Order Tests ==============\n");

    const order = this.testConstructorValues();
    this.testValidateInput();
    this.testUpdateAttribute(order);
    this.testInvalidUpdate(order);
    this.testPrivateElementAccess(order);
    this.testJSON(order);

    console.log("============== ALL ORDER TESTS PASSED! =================\n");
  }
}

// Run tests
new OrderTests().runAll();
