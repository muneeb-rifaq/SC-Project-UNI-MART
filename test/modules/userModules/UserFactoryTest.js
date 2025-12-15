import assert from "assert";
import UserFactory from "../../../src/backend/modules/userModules/UserFactory.js";
import User from "../../../src/backend/modules/userModules/User.js";

class UserFactoryTests {
  // -------------------------------------------
  // Test 1: Create a valid user
  // -------------------------------------------
  async testCreateValidUser() {
    console.log("Running testCreateValidUser()...");

    const u = await UserFactory.createNewUser(
      1,
      "john_doe",
      "john@example.com",
      "Password123",
      "buyer"
    );

    assert.ok(u instanceof User);
    assert.strictEqual(u.getAttribute("username"), "john_doe");
    assert.strictEqual(u.getAttribute("email"), "john@example.com");
    assert.strictEqual(u.getAttribute("role"), "buyer");

    // Password must be hashed (not equal to raw password)
    assert.notStrictEqual(
      u.getAttribute("passwordHash"),
      "Password123",
      "Password should be hashed!"
    );

    console.log("✔ testCreateValidUser passed\n");
  }

  // -------------------------------------------
  // Test 2: Invalid input throws an error
  // -------------------------------------------
  async testInvalidUser() {
    console.log("Running testInvalidUser()...");

    await assert.rejects(async () => {
      await UserFactory.createNewUser(
        -1,
        "",
        "invalid-email",
        "",
        "invalidRole"
      );
    });

    console.log("✔ testInvalidUser passed\n");
  }

  // -------------------------------------------
  // Test 3: makeSampleUser produces valid User
  // -------------------------------------------
  async testMakeSampleUser() {
    console.log("Running testMakeSampleUser()...");

    const u = await UserFactory.makeSampleUser(10);

    assert.ok(u instanceof User);
    assert.strictEqual(u.getAttribute("userId"), 10);
    assert.ok(u.getAttribute("username").length > 0);
    assert.ok(u.getAttribute("email").includes("@"));

    console.log("✔ testMakeSampleUser passed\n");
  }

  // -------------------------------------------
  // Test 4: Update attributes
  // -------------------------------------------
  async testUpdateAttributes() {
    console.log("Running testUpdateAttributes()...");

    const u = await UserFactory.makeSampleUser(100);
    const oldUsername = u.getAttribute("username");

    const success = u.updateAttribute("username", "UpdatedUser");
    assert.strictEqual(success, true);
    assert.strictEqual(u.getAttribute("username"), "UpdatedUser");
    assert.notStrictEqual(oldUsername, "UpdatedUser");

    console.log("✔ testUpdateAttributes passed\n");
  }

  // -------------------------------------------
  // Test 5: Updating invalid attributes fails
  // -------------------------------------------
  async testInvalidUpdate() {
    console.log("Running testInvalidUpdate()...");

    const u = await UserFactory.makeSampleUser(200);

    assert.strictEqual(u.updateAttribute("email", ""), false);
    assert.strictEqual(u.updateAttribute("role", "invalid-role"), false);
    assert.strictEqual(u.updateAttribute("unknownField", "value"), false);

    console.log("✔ testInvalidUpdate passed\n");
  }

  // -------------------------------------------
  // Test 6: userId cannot change
  // -------------------------------------------
  async testUserIdNotChangeable() {
    console.log("Running testUserIdNotChangeable()...");

    const u = await UserFactory.makeSampleUser(300);
    const idBefore = u.getAttribute("userId");

    const result = u.updateAttribute("userId", 999);
    assert.strictEqual(result, false);
    assert.strictEqual(u.getAttribute("userId"), idBefore);

    console.log("✔ testUserIdNotChangeable passed\n");
  }

  // -------------------------------------------
  // Run all tests
  // -------------------------------------------
  async runAll() {
    console.log("============== Running UserFactory Tests ==============");

    await this.testCreateValidUser();
    await this.testInvalidUser();
    await this.testMakeSampleUser();
    await this.testUpdateAttributes();
    await this.testInvalidUpdate();
    await this.testUserIdNotChangeable();

    console.log(
      "============== ALL USERFACTORY TESTS PASSED! =================\n"
    );
  }
}

// Run tests
new UserFactoryTests().runAll();
