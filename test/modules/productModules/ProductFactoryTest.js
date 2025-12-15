import assert from "assert";
import ProductFactory from "../../../src/backend/modules/productModules/ProductFactory.js";

class ProductFactoryTests {
  // -------------------------------------------
  // Test 1: Create a valid product
  // -------------------------------------------
  testCreateValidProduct() {
    console.log("Running testCreateValidProduct()...");

    const p = ProductFactory.makeProduct(
      1,
      10, // sellerId
      "Laptop",
      "Gaming laptop",
      1500,
      5, // stock
      2 // categoryId
    );

    assert.strictEqual(p.getAttribute("name"), "Laptop");
    assert.strictEqual(p.getAttribute("price"), 1500);
    assert.strictEqual(p.getAttribute("stock"), 5);
    assert.strictEqual(p.getAttribute("sellerId"), 10);
    assert.strictEqual(p.getAttribute("categoryId"), 2);

    console.log("✔ testCreateValidProduct passed\n");
  }

  // -------------------------------------------
  // Test 2: Ensure invalid values throw an error
  // -------------------------------------------
  testInvalidProduct() {
    console.log("Running testInvalidProduct()...");

    assert.throws(() => {
      ProductFactory.makeProduct(-1, -2, "", "", -10, -5, 0);
    });

    console.log("✔ testInvalidProduct passed\n");
  }

  // -------------------------------------------
  // Test 3: Update attributes
  // -------------------------------------------
  testUpdateAttributes() {
    console.log("Running testUpdateAttributes()...");

    const p = ProductFactory.makeProduct(
      100,
      7,
      "Phone",
      "Smartphone",
      500,
      50,
      1
    );

    const oldName = p.getAttribute("name");

    let success = p.updateAttribute("name", "UpdatedName");
    assert.strictEqual(success, true);
    assert.strictEqual(p.getAttribute("name"), "UpdatedName");
    assert.notStrictEqual(oldName, "UpdatedName");

    // sellerId cannot be updated
    success = p.updateAttribute("sellerId", 99);
    assert.strictEqual(success, false);
    assert.strictEqual(p.getAttribute("sellerId"), 7);

    // categoryId can be updated
    success = p.updateAttribute("categoryId", 5);
    assert.strictEqual(success, true);
    assert.strictEqual(p.getAttribute("categoryId"), 5);

    console.log("✔ testUpdateAttributes passed\n");
  }

  // -------------------------------------------
  // Test 4: Updating with invalid values should fail
  // -------------------------------------------
  testInvalidUpdate() {
    console.log("Running testInvalidUpdate()...");

    const p = ProductFactory.makeProduct(
      200,
      8,
      "Tablet",
      "New tablet",
      400,
      20,
      2
    );

    const successPrice = p.updateAttribute("price", -50);
    const successSeller = p.updateAttribute("sellerId", -10);
    const successCategory = p.updateAttribute("categoryId", 0);

    assert.strictEqual(successPrice, false);
    assert.strictEqual(successSeller, false);
    assert.strictEqual(successCategory, false);

    console.log("✔ testInvalidUpdate passed\n");
  }

  // -------------------------------------------
  // Test 5: productId cannot be changed
  // -------------------------------------------
  testProductIdNotChangeable() {
    console.log("Running testProductIdNotChangeable()...");

    const p = ProductFactory.makeProduct(
      300,
      5,
      "Monitor",
      "HD Monitor",
      250,
      30,
      3
    );
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
    console.log("============== Running ProductFactory Tests ==============");

    this.testCreateValidProduct();
    this.testInvalidProduct();
    this.testUpdateAttributes();
    this.testInvalidUpdate();
    this.testProductIdNotChangeable();

    console.log("============== ALL TESTS PASSED! =================\n");
  }
}

// Run tests
new ProductFactoryTests().runAll();
