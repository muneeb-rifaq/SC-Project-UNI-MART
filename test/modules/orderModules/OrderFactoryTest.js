import assert from "assert";
import OrderFactory from "../../../src/backend/modules/orderModules/OrderFactory.js";

class OrderFactoryTests {
  // -------------------------------------------
  // Test 1: Create a valid order
  // -------------------------------------------
  testCreateValidOrder() {
    console.log("Running testCreateValidOrder()...");
    // orderId,
    // product,
    // buyerId,
    // sellerId,
    // volume,
    // totalCost,
    // status = "pending"
    const o = OrderFactory.makeOrder(
      1,
      JSON.stringify({ productId: 50, qty: 3 }),
      7,
      2,
      3,
      9000,
      "pending"
    );

    assert.strictEqual(o.getAttribute("orderId"), 1);
    assert.strictEqual(o.getAttribute("buyerId"), 7);
    assert.strictEqual(o.getAttribute("status"), "pending");
    assert.strictEqual(o.getAttribute("totalCost"), 9000);

    console.log("✔ testCreateValidOrder passed\n");
  }

  // -------------------------------------------
  // Test 2: Invalid order creation should throw
  // -------------------------------------------
  testInvalidOrder() {
    console.log("Running testInvalidOrder()...");

    assert.throws(() => {
      OrderFactory.makeOrder(-1, "", -5, -2, "invalid_status", -1, -1000);
    });

    console.log("✔ testInvalidOrder passed\n");
  }

  // -------------------------------------------
  // Test 3: Sample order generator
  // -------------------------------------------
  testSampleOrder() {
    console.log("Running testSampleOrder()...");

    const o = OrderFactory.makeSampleOrder(100);

    assert.strictEqual(o.getAttribute("orderId"), 100);
    assert.strictEqual(typeof o.getAttribute("product"), "string");
    assert.strictEqual(o.getAttribute("status"), "pending");

    console.log("✔ testSampleOrder passed\n");
  }

  // -------------------------------------------
  // Test 4: Updating attributes of a sample order
  // -------------------------------------------
  testUpdateAttributes() {
    console.log("Running testUpdateAttributes()...");

    const o = OrderFactory.makeSampleOrder(200);
    //       static STATUSES = new Set([
    //     "pending",
    //     "confirmed",
    //     "shipped",
    //     "delivered",
    //     "cancelled",
    //   ]);
    const success = o.updateAttribute("status", "confirmed");
    assert.strictEqual(success, true);
    assert.strictEqual(o.getAttribute("status"), "confirmed");

    console.log("✔ testUpdateAttributes passed\n");
  }

  // -------------------------------------------
  // Test 5: orderId cannot be changed
  // -------------------------------------------
  testOrderIdNotChangeable() {
    console.log("Running testOrderIdNotChangeable()...");

    const o = OrderFactory.makeSampleOrder(300);
    const oldId = o.getAttribute("orderId");

    const result = o.updateAttribute("orderId", 999);
    assert.strictEqual(result, false);
    assert.strictEqual(o.getAttribute("orderId"), oldId);

    console.log("✔ testOrderIdNotChangeable passed\n");
  }

  // -------------------------------------------
  // Run all tests
  // -------------------------------------------
  runAll() {
    console.log("============== Running OrderFactory Tests ==============");

    this.testCreateValidOrder();
    this.testInvalidOrder();
    this.testSampleOrder();
    this.testUpdateAttributes();
    this.testOrderIdNotChangeable();

    console.log(
      "============== ALL ORDER FACTORY TESTS PASSED! =================\n"
    );
  }
}

// Run tests
new OrderFactoryTests().runAll();
