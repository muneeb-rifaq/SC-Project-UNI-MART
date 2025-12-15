import assert from "assert";
import CategoryFactory from "../../../src/backend/modules/categoryModules/CategoryFactory.js";

class CategoryFactoryTests {
  // -------------------------------------------
  // Test 1: Create valid category via factory
  // -------------------------------------------
  testCreateValidCategory() {
    console.log("Running testCreateValidCategory()...");

    const c = CategoryFactory.createNewCategory(
      1,
      "Electronics",
      "Devices and gadgets"
    );

    assert.strictEqual(c.getAttribute("categoryId"), 1);
    assert.strictEqual(c.getAttribute("categoryName"), "Electronics");

    console.log("✔ testCreateValidCategory passed\n");
  }

  // -------------------------------------------
  // Test 2: Invalid factory inputs should throw
  // -------------------------------------------
  testInvalidInput() {
    console.log("Running testInvalidInput()...");

    assert.throws(() => {
      CategoryFactory.createNewCategory(-1, "", null);
    }, /Invalid Category attributes/);

    console.log("✔ testInvalidInput passed\n");
  }

  // -------------------------------------------
  // Test 3: Update attributes via factory-created instance
  // -------------------------------------------
  testUpdateAttributes() {
    console.log("Running testUpdateAttributes()...");

    const c = CategoryFactory.createNewCategory(2, "Home", "Home items");

    const oldName = c.getAttribute("categoryName");
    const success = c.updateAttribute("categoryName", "Home & Living");

    assert.strictEqual(success, true);
    assert.strictEqual(c.getAttribute("categoryName"), "Home & Living");
    assert.notStrictEqual(oldName, "Home & Living");

    console.log("✔ testUpdateAttributes passed\n");
  }

  // -------------------------------------------
  // Test 4: Invalid updates
  // -------------------------------------------
  testInvalidUpdate() {
    console.log("Running testInvalidUpdate()...");

    const c = CategoryFactory.createNewCategory(3, "Toys", "Kids toys");

    const success1 = c.updateAttribute("categoryName", "");
    assert.strictEqual(success1, false);

    const success2 = c.updateAttribute("categoryId", 100);
    assert.strictEqual(success2, false);

    console.log("✔ testInvalidUpdate passed\n");
  }

  // -------------------------------------------
  // RUN ALL TESTS
  // -------------------------------------------
  runAll() {
    console.log("========== Running Category Factory Tests ==========");

    this.testCreateValidCategory();
    this.testInvalidInput();
    this.testUpdateAttributes();
    this.testInvalidUpdate();

    console.log("========== ALL CATEGORY FACTORY TESTS PASSED! ==========\n");
  }
}

// Run tests
new CategoryFactoryTests().runAll();
