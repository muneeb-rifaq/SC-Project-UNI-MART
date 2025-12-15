import assert from "assert";
import CartFactory from "../../../src/backend/modules/cartModules/CartFactory.js";
import Cart from "../../../src/backend/modules/cartModules/Cart.js";

class CartFactoryTests {
  // -----------------------------------------------------
  // Test 1: Create valid cart for a user
  // -----------------------------------------------------
  testMakeValidCart() {
    console.log("Running testMakeValidCart()...");

    const cart = CartFactory.makeCart(10);

    assert.ok(cart instanceof Cart);
    assert.strictEqual(cart.getAttribute("userId"), 10);
    assert.strictEqual(typeof cart.getAttribute("cartId"), "number");
    assert.ok(cart.getAttribute("cartId") > 0);

    assert.deepStrictEqual(cart.getAttribute("items"), []);

    console.log("✔ testMakeValidCart passed\n");
  }

  // -----------------------------------------------------
  // Test 2: Invalid userId should throw
  // -----------------------------------------------------
  testInvalidUserId() {
    console.log("Running testInvalidUserId()...");

    assert.throws(() => CartFactory.makeCart(0), /Invalid userId/);
    assert.throws(() => CartFactory.makeCart(-5), /Invalid userId/);
    assert.throws(() => CartFactory.makeCart("abc"), /Invalid userId/);

    console.log("✔ testInvalidUserId passed\n");
  }

  // -----------------------------------------------------
  // Test 3: Each call should make a unique cartId
  // -----------------------------------------------------
  testUniqueCartIds() {
    console.log("Running testUniqueCartIds()...");

    const c1 = CartFactory.makeCart(1);
    const c2 = CartFactory.makeCart(1);

    assert.notStrictEqual(
      c1.getAttribute("cartId"),
      c2.getAttribute("cartId"),
      "Cart IDs must be unique"
    );

    console.log("✔ testUniqueCartIds passed\n");
  }

  // -----------------------------------------------------
  // RUN ALL
  // -----------------------------------------------------
  runAll() {
    console.log("========== Running CartFactory Tests ==========");

    this.testMakeValidCart();
    this.testInvalidUserId();
    this.testUniqueCartIds();

    console.log("========== ALL CART FACTORY TESTS PASSED! ==========\n");
  }
}

// Run tests automatically
new CartFactoryTests().runAll();
