import assert from "assert";
import UserFactory from "../../../src/backend/modules/userModules/UserFactory.js";

class UserFactoryTests {
  // -------------------------------------------
  // Test 1: Create a valid user
  // -------------------------------------------
  testCreateValidUser() {
    console.log("Running testCreateValidUser()...");

    const u = UserFactory.makeUser(
      1,
      "john_doe",
      "john@example.com",
      "hashedPassword123"
    );

    assert.strictEqual(u.getAttribute("username"), "john_doe");
    assert.strictEqual(u.getAttribute("email"), "john@example.com");
    assert.strictEqual(u.getAttribute("role"), "user");

    console.log("✔ testCreateValidUser passed\n");
  }

  // -------------------------------------------
  // Test 2: Ensure invalid values throw an error
  // -------------------------------------------
  testInvalidUser() {
    console.log("Running testInvalidUser()...");

    assert.throws(() => {
      UserFactory.makeUser(-1, "", "", "");
    });

    console.log("✔ testInvalidUser passed\n");
  }

  // -------------------------------------------
  // Test 3: Update attributes
  // -------------------------------------------
  testUpdateAttributes() {
    console.log("Running testUpdateAttributes()...");

    const u = UserFactory.makeSampleUser(100);

    const oldUsername = u.getAttribute("username");

    let success = u.updateAttribute("username", "UpdatedUser");
    assert.strictEqual(success, true);
    assert.strictEqual(u.getAttribute("username"), "UpdatedUser");
    assert.notStrictEqual(oldUsername, "UpdatedUser");

    console.log("✔ testUpdateAttributes passed\n");
  }

  // -------------------------------------------
  // Test 4: Updating with invalid values should fail
  // -------------------------------------------
  testInvalidUpdate() {
    console.log("Running testInvalidUpdate()...");

    const u = UserFactory.makeSampleUser(200);

    const success = u.updateAttribute("email", "");
    assert.strictEqual(success, false);

    console.log("✔ testInvalidUpdate passed\n");
  }

  // -------------------------------------------
  // Test 5: userId cannot be changed
  // -------------------------------------------
  testUserIdNotChangeable() {
    console.log("Running testUserIdNotChangeable()...");

    const u = UserFactory.makeSampleUser(300);
    const idBefore = u.getAttribute("userId");

    const result = u.updateAttribute("userId", 999);
    assert.strictEqual(result, false);

    assert.strictEqual(u.getAttribute("userId"), idBefore);

    console.log("✔ testUserIdNotChangeable passed\n");
  }

  // -------------------------------------------
  // RUN ALL TESTS
  // -------------------------------------------
  runAll() {
    console.log("============== Running UserFactory Tests ==============");

    this.testCreateValidUser();
    this.testInvalidUser();
    this.testUpdateAttributes();
    this.testInvalidUpdate();
    this.testUserIdNotChangeable();

    console.log("============== ALL USER TESTS PASSED! =================\n");
  }
}

// Run tests
new UserFactoryTests().runAll();
