import assert from "assert";
import Cart from "../../../src/backend/modules/cartModules/Cart.js";
import ProductFactory from "../../../src/backend/modules/productModules/ProductFactory.js";

class CartTests {
  makeProduct(id = 1) {
    return ProductFactory.makeSampleProduct(id);
  }

  // -------------------------------------------------------------
  // Constructor & Validation
  // -------------------------------------------------------------
  testCreateValidCart() {
    console.log("Running testCreateValidCart()...");

    const p1 = this.makeProduct(1);
    const cart = new Cart(10, 5, [{ product: p1, productVolume: 2 }]);

    assert.strictEqual(cart.getAttribute("cartId"), 10);
    assert.strictEqual(cart.getAttribute("userId"), 5);
    assert.strictEqual(cart.getAttribute("items").length, 1);

    console.log("✔ testCreateValidCart passed\n");
  }

  testInvalidCartId() {
    console.log("Running testInvalidCartId()...");

    assert.throws(() => new Cart(-1, 5, []), /Invalid Cart attributes/);

    console.log("✔ testInvalidCartId passed\n");
  }

  testInvalidUserId() {
    console.log("Running testInvalidUserId()...");

    assert.throws(() => new Cart(1, 0, []), /Invalid Cart attributes/);

    console.log("✔ testInvalidUserId passed\n");
  }

  testInvalidItemInConstructor() {
    console.log("Running testInvalidItemInConstructor()...");

    assert.throws(
      () => new Cart(1, 1, [{ product: "bad", productVolume: 2 }]),
      /Invalid Cart attributes/
    );

    console.log("✔ testInvalidItemInConstructor passed\n");
  }

  // -------------------------------------------------------------
  // getAttribute
  // -------------------------------------------------------------
  testGetAttributeDeepClone() {
    console.log("Running testGetAttributeDeepClone()...");

    const p1 = this.makeProduct(1);
    const cart = new Cart(1, 1, [{ product: p1, productVolume: 3 }]);

    const items1 = cart.getAttribute("items");
    const items2 = cart.getAttribute("items");

    items1[0].productVolume = 999;

    assert.strictEqual(items2[0].productVolume, 3);

    console.log("✔ testGetAttributeDeepClone passed\n");
  }

  // -------------------------------------------------------------
  // addItem
  // -------------------------------------------------------------
  testAddItemNew() {
    console.log("Running testAddItemNew()...");

    const p1 = this.makeProduct(1);
    const cart = new Cart(1, 1, []);

    const ok = cart.addItem(p1, 5);

    assert.strictEqual(ok, true);
    assert.strictEqual(cart.getAttribute("items").length, 1);
    assert.strictEqual(cart.getAttribute("items")[0].productVolume, 5);

    console.log("✔ testAddItemNew passed\n");
  }

  testAddItemIncreaseVolume() {
    console.log("Running testAddItemIncreaseVolume()...");

    const p1 = this.makeProduct(1);
    const cart = new Cart(1, 1, [{ product: p1, productVolume: 2 }]);

    const ok = cart.addItem(p1, 3);

    assert.strictEqual(ok, true);
    assert.strictEqual(cart.getAttribute("items")[0].productVolume, 5);

    console.log("✔ testAddItemIncreaseVolume passed\n");
  }

  testAddItemInvalidVolume() {
    console.log("Running testAddItemInvalidVolume()...");

    const p1 = this.makeProduct(1);
    const cart = new Cart(1, 1, []);

    assert.strictEqual(cart.addItem(p1, 0), false);
    assert.strictEqual(cart.addItem(p1, -1), false);

    console.log("✔ testAddItemInvalidVolume passed\n");
  }

  // -------------------------------------------------------------
  // removeItem
  // -------------------------------------------------------------
  testRemoveItem() {
    console.log("Running testRemoveItem()...");

    const p1 = this.makeProduct(1);
    const cart = new Cart(1, 1, [{ product: p1, productVolume: 2 }]);

    const ok = cart.removeItem(1);

    assert.strictEqual(ok, true);
    assert.strictEqual(cart.getAttribute("items").length, 0);

    console.log("✔ testRemoveItem passed\n");
  }

  testRemoveItemNotFound() {
    console.log("Running testRemoveItemNotFound()...");

    const cart = new Cart(1, 1, []);

    assert.strictEqual(cart.removeItem(999), false);

    console.log("✔ testRemoveItemNotFound passed\n");
  }

  // -------------------------------------------------------------
  // updateItem
  // -------------------------------------------------------------
  testUpdateItemPrice() {
    console.log("Running testUpdateItemPrice()...");

    const p1 = this.makeProduct(1);
    const cart = new Cart(1, 1, [{ product: p1, productVolume: 2 }]);

    const ok = cart.updateItem(1, { price: 200 });

    assert.strictEqual(ok, true);
    assert.strictEqual(
      cart.getAttribute("items")[0].product.getAttribute("price"),
      200
    );

    console.log("✔ testUpdateItemPrice passed\n");
  }

  testUpdateItemVolume() {
    console.log("Running testUpdateItemVolume()...");

    const p1 = this.makeProduct(1);
    const cart = new Cart(1, 1, [{ product: p1, productVolume: 2 }]);

    const ok = cart.updateItem(1, { volume: 10 });

    assert.strictEqual(ok, true);
    assert.strictEqual(cart.getAttribute("items")[0].productVolume, 10);

    console.log("✔ testUpdateItemVolume passed\n");
  }

  testUpdateItemInvalidVolume() {
    console.log("Running testUpdateItemInvalidVolume()...");

    const p1 = this.makeProduct(1);
    const cart = new Cart(1, 1, [{ product: p1, productVolume: 2 }]);

    assert.strictEqual(cart.updateItem(1, { volume: 0 }), false);
    assert.strictEqual(cart.updateItem(1, { volume: -5 }), false);

    console.log("✔ testUpdateItemInvalidVolume passed\n");
  }

  // -------------------------------------------------------------
  // updateAttribute
  // -------------------------------------------------------------
  testUpdateItemsArray() {
    console.log("Running testUpdateItemsArray()...");

    const p1 = this.makeProduct(1);
    const p2 = this.makeProduct(2);

    const cart = new Cart(1, 1, [{ product: p1, productVolume: 2 }]);

    const ok = cart.updateAttribute("items", [
      { product: p2, productVolume: 5 },
    ]);

    assert.strictEqual(ok, true);
    assert.strictEqual(
      cart.getAttribute("items")[0].product.getAttribute("productId"),
      2
    );

    console.log("✔ testUpdateItemsArray passed\n");
  }

  testUpdateItemsArrayInvalid() {
    console.log("Running testUpdateItemsArrayInvalid()...");

    const cart = new Cart(1, 1, []);

    const ok = cart.updateAttribute("items", [
      { product: "bad", productVolume: 2 },
    ]);

    assert.strictEqual(ok, false);

    console.log("✔ testUpdateItemsArrayInvalid passed\n");
  }

  // -------------------------------------------------------------
  // Serialization
  // -------------------------------------------------------------
  testToJSON() {
    console.log("Running testToJSON()...");

    const p1 = this.makeProduct(1);
    const cart = new Cart(1, 1, [{ product: p1, productVolume: 4 }]);

    const json = cart.toJSON();

    assert.strictEqual(json.cartId, 1);
    assert.strictEqual(json.userId, 1);
    assert.strictEqual(json.items[0].product.productId, 1);

    console.log("✔ testToJSON passed\n");
  }

  testFromJSON() {
    console.log("Running testFromJSON()...");

    const p1 = this.makeProduct(1);
    const cart = new Cart(1, 1, [{ product: p1, productVolume: 4 }]);

    const json = cart.toJSON();
    const restored = Cart.fromJSON(json);

    assert.strictEqual(restored.getAttribute("cartId"), 1);
    assert.strictEqual(restored.getAttribute("userId"), 1);
    assert.strictEqual(
      restored.getAttribute("items")[0].product.getAttribute("productId"),
      1
    );
    assert.strictEqual(restored.getAttribute("items")[0].productVolume, 4);

    console.log("✔ testFromJSON passed\n");
  }

  // -------------------------------------------------------------
  // RUN ALL TESTS
  // -------------------------------------------------------------
  runAll() {
    console.log("========== Running Cart Class Tests ========== \n");

    this.testCreateValidCart();
    this.testInvalidCartId();
    this.testInvalidUserId();
    this.testInvalidItemInConstructor();
    this.testGetAttributeDeepClone();
    this.testAddItemNew();
    this.testAddItemIncreaseVolume();
    this.testAddItemInvalidVolume();
    this.testRemoveItem();
    this.testRemoveItemNotFound();
    this.testUpdateItemPrice();
    this.testUpdateItemVolume();
    this.testUpdateItemInvalidVolume();
    this.testUpdateItemsArray();
    this.testUpdateItemsArrayInvalid();
    this.testToJSON();
    this.testFromJSON();

    console.log("========== ALL CART CLASS TESTS PASSED! ==========\n");
  }
}

// Run all tests
new CartTests().runAll();
