import assert from "assert";
import Category from "../../../src/backend/modules/categoryModules/Category.js";

class CategoryTests {
  // -------------------------------------------
  // Test 1: Create valid category
  // -------------------------------------------
  testCreateValidCategory() {
    console.log("Running testCreateValidCategory()...");

    const c = new Category(1, "Electronics", "Devices and gadgets");

    assert.strictEqual(c.getAttribute("categoryId"), 1);
    assert.strictEqual(c.getAttribute("categoryName"), "Electronics");
    assert.strictEqual(c.getAttribute("description"), "Devices and gadgets");

    console.log("✔ testCreateValidCategory passed\n");
  }

  // -------------------------------------------
  // Test 2: Invalid constructor inputs
  // -------------------------------------------
  testInvalidCategory() {
    console.log("Running testInvalidCategory()...");

    assert.throws(() => {
      new Category(-1, "", null);
    }, /Invalid Category attributes/);

    console.log("✔ testInvalidCategory passed\n");
  }

  // -------------------------------------------
  // Test 3: Update attributes successfully
  // -------------------------------------------
  testUpdateAttributes() {
    console.log("Running testUpdateAttributes()...");

    const c = new Category(2, "Home", "Home items");

    const oldName = c.getAttribute("categoryName");
    const success = c.updateAttribute("categoryName", "Home & Living");
    assert.strictEqual(success, true);
    assert.strictEqual(c.getAttribute("categoryName"), "Home & Living");
    assert.notStrictEqual(oldName, "Home & Living");

    console.log("✔ testUpdateAttributes passed\n");
  }

  // -------------------------------------------
  // Test 4: Invalid updates should fail
  // -------------------------------------------
  testInvalidUpdate() {
    console.log("Running testInvalidUpdate()...");

    const c = new Category(3, "Toys", "Kids toys");

    const success1 = c.updateAttribute("categoryName", "");
    assert.strictEqual(success1, false);

    const success2 = c.updateAttribute("categoryId", 100);
    assert.strictEqual(success2, false);

    console.log("✔ testInvalidUpdate passed\n");
  }

  // -------------------------------------------
  // Test 5: categoryId is immutable
  // -------------------------------------------
  testCategoryIdImmutable() {
    console.log("Running testCategoryIdImmutable()...");

    const c = new Category(4, "Sports", "Sports equipment");

    const idBefore = c.getAttribute("categoryId");
    const result = c.updateAttribute("categoryId", 999);
    assert.strictEqual(result, false);
    assert.strictEqual(c.getAttribute("categoryId"), idBefore);

    console.log("✔ testCategoryIdImmutable passed\n");
  }

  // -------------------------------------------
  // RUN ALL TESTS
  // -------------------------------------------
  runAll() {
    console.log("========== Running Category Class Tests ==========");

    this.testCreateValidCategory();
    this.testInvalidCategory();
    this.testUpdateAttributes();
    this.testInvalidUpdate();
    this.testCategoryIdImmutable();

    console.log("========== ALL CATEGORY CLASS TESTS PASSED! ==========\n");
  }
}

// Run tests
new CategoryTests().runAll();
