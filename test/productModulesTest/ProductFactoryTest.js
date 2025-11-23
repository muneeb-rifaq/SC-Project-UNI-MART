import assert from "assert";
import ProductFactory from "../../src/backend/modules/productModules/ProductFactory.js";

class ProductTests {
  // -------------------------------------------
  // Test 1: Create a valid product
  // -------------------------------------------
  testCreateValidProduct() {
    console.log("Running testCreateValidProduct()...");

    const p = ProductFactory.makeProduct(
      1,
      "Laptop",
      "Gaming laptop",
      1500,
      10,
      "Electronics",
      5
    );

    assert.strictEqual(p.getAttribute("name"), "Laptop");
    assert.strictEqual(p.getAttribute("price"), 1500);
    assert.strictEqual(p.getAttribute("stock"), 5);

    console.log("✔ testCreateValidProduct passed\n");
  }

  // -------------------------------------------
  // Test 2: Ensure invalid values throw an error
  // -------------------------------------------
  testInvalidProduct() {
    console.log("Running testInvalidProduct()...");

    assert.throws(() => {
      ProductFactory.makeProduct(-1, "", "", -10, -4, "", -2);
    });

    console.log("✔ testInvalidProduct passed\n");
  }

  // -------------------------------------------
  // Test 3: Update attributes
  // -------------------------------------------
  testUpdateAttributes() {
    console.log("Running testUpdateAttributes()...");

    const p = ProductFactory.makeSampleProduct(100);

    const oldName = p.getAttribute("name");

    let success = p.updateAttribute("name", "UpdatedName");
    assert.strictEqual(success, true);
    assert.strictEqual(p.getAttribute("name"), "UpdatedName");
    assert.notStrictEqual(oldName, "UpdatedName");

    console.log("✔ testUpdateAttributes passed\n");
  }

  // -------------------------------------------
  // Test 4: Updating with invalid values should fail
  // -------------------------------------------
  testInvalidUpdate() {
    console.log("Running testInvalidUpdate()...");

    const p = ProductFactory.makeSampleProduct(200);

    const success = p.updateAttribute("price", -50);
    assert.strictEqual(success, false);

    console.log("✔ testInvalidUpdate passed\n");
  }

  // -------------------------------------------
  // Test 5: productId cannot be changed
  // -------------------------------------------
  testProductIdNotChangeable() {
    console.log("Running testProductIdNotChangeable()...");

    const p = ProductFactory.makeSampleProduct(300);
    const idBefore = p.getAttribute("productId");

    const result = p.updateAttribute("productId", 999);
    assert.strictEqual(result, false);

    assert.strictEqual(p.getAttribute("productId"), idBefore);

    console.log("✔ testProductIdNotChangeable passed\n");
  }

  // -------------------------------------------
  // RUN ALL TESTS
  // -------------------------------------------
  runAll() {
    console.log("============== Running Product Tests ==============");

    this.testCreateValidProduct();
    this.testInvalidProduct();
    this.testUpdateAttributes();
    this.testInvalidUpdate();
    this.testProductIdNotChangeable();

    console.log("============== ALL TESTS PASSED! =================\n");
  }
}

// Run tests
new ProductTests().runAll();
