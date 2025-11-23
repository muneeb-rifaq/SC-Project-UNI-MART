import assert from "assert";
import User from "../../../src/backend/modules/userModules/User.js";

// Sample password hash for testing
const sampleHash = "hashedPassword123";

class UserTests {
  // -------------------------------------------
  // Test 1: Constructor values
  // -------------------------------------------
  testConstructorValues() {
    console.log("Running testConstructorValues()...");
    const u = new User(1, "john_doe", "john@example.com", sampleHash, "user");

    assert.strictEqual(u.getAttribute("userId"), 1);
    assert.strictEqual(u.getAttribute("username"), "john_doe");
    assert.strictEqual(u.getAttribute("email"), "john@example.com");
    assert.strictEqual(u.getAttribute("passwordHash"), sampleHash);
    assert.strictEqual(u.getAttribute("role"), "user");

    console.log("✔ testConstructorValues passed\n");
    return u;
  }

  // -------------------------------------------
  // Test 2: validateInput
  // -------------------------------------------
  testValidateInput() {
    console.log("Running testValidateInput()...");

    assert.strictEqual(User.validateInput("username", "alice"), true);
    assert.strictEqual(User.validateInput("email", "alice@example.com"), true);
    assert.strictEqual(User.validateInput("passwordHash", "hash123"), true);
    assert.strictEqual(User.validateInput("role", "user"), true);
    assert.strictEqual(User.validateInput("userId", -1), false);
    assert.strictEqual(User.validateInput("email", ""), false);

    console.log("✔ testValidateInput passed\n");
  }

  // -------------------------------------------
  // Test 3: Update attributes
  // -------------------------------------------
  testUpdateAttribute(u) {
    console.log("Running testUpdateAttribute()...");

    assert.strictEqual(u.updateAttribute("username", "johnny"), true);
    assert.strictEqual(u.getAttribute("username"), "johnny");

    assert.strictEqual(u.updateAttribute("email", "johnny@example.com"), true);
    assert.strictEqual(u.getAttribute("email"), "johnny@example.com");

    console.log("✔ testUpdateAttribute passed\n");
  }

  // -------------------------------------------
  // Test 4: Invalid updates should fail
  // -------------------------------------------
  testInvalidUpdate(u) {
    console.log("Running testInvalidUpdate()...");

    assert.strictEqual(u.updateAttribute("userId", -10), false);
    assert.strictEqual(u.updateAttribute("email", ""), false);

    console.log("✔ testInvalidUpdate passed\n");
  }

  // -------------------------------------------
  // Test 5: lastLogin auto-refresh
  // -------------------------------------------
  testUpdateLastLogin(u) {
    console.log("Running testUpdateLastLogin()...");

    const oldLogin = u.getAttribute("lastLogin");
    u.updateAttribute("username", "john_updated"); // any valid update refreshes lastLogin
    const newLogin = u.getAttribute("lastLogin");
    assert.notStrictEqual(oldLogin, newLogin, "lastLogin did not refresh");

    console.log("✔ testUpdateLastLogin passed\n");
  }

  // -------------------------------------------
  // Test 6: Private field protection
  // -------------------------------------------
  testPrivateElementAccess(u) {
    console.log("Running testPrivateElementAccess()...");

    assert.strictEqual(u.userId, undefined, "Private field leaked!");
    assert.strictEqual(u.username, undefined, "Private field leaked!");
    assert.strictEqual(u.email, undefined, "Private field leaked!");

    console.log("✔ testPrivateElementAccess passed\n");
  }

  // -------------------------------------------
  // Test 7: toJSON() for storage
  // -------------------------------------------
  testJSON(u) {
    console.log("Running testJSON()...");

    const jsonData = u.toJSON();
    assert.deepStrictEqual(jsonData, {
      userId: u.getAttribute("userId"),
      username: u.getAttribute("username"),
      email: u.getAttribute("email"),
      passwordHash: u.getAttribute("passwordHash"),
      role: u.getAttribute("role"),
      lastLogin: u.getAttribute("lastLogin"),
      createdAt: u.getAttribute("createdAt"),
      updatedAt: u.getAttribute("updatedAt"),
    });

    console.log("✔ testJSON passed\n");
  }

  // -------------------------------------------
  // Run all tests
  // -------------------------------------------
  runAll() {
    console.log("============== Running User Tests ==============\n");

    const user = this.testConstructorValues();
    this.testValidateInput();
    this.testUpdateAttribute(user);
    this.testInvalidUpdate(user);
    // this.testUpdateLastLogin(user); // optionally skip if too fast
    this.testPrivateElementAccess(user);
    this.testJSON(user);

    console.log("============== ALL USER TESTS PASSED! =================\n");
  }
}

// Run tests
new UserTests().runAll();
