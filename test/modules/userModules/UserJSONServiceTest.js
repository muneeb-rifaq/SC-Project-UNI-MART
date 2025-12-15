// UserJSONServiceTest.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import assert from "assert";

import UserService from "../../../src/backend/modules/userModules/UserService.js";

// --------------------
// Setup storage path
// --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DIR = path.resolve(__dirname, "../../storage");
const TEST_FILE = path.resolve(TEST_DIR, "users.json");

//if directory doesnt exist, make it
if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });
//clean up any existing test db file
if (fs.existsSync(TEST_FILE)) fs.unlinkSync(TEST_FILE);

const service = new UserService(TEST_FILE);

// --------------------
// Helper: print users
// --------------------
const printUsers = (users) => {
  if (!users || users.length === 0) return;

  const data = users.map((u) =>
    typeof u.toJSON === "function" ? u.toJSON() : u
  );

  const keys = Object.keys(data[0]);
  const mid = Math.ceil(keys.length / 2);

  const firstHalfKeys = keys.slice(0, mid);
  const secondHalfKeys = keys.slice(mid);

  const firstHalfData = data.map((u) => {
    const obj = {};
    firstHalfKeys.forEach((k) => (obj[k] = u[k]));
    return obj;
  });

  const secondHalfData = data.map((u) => {
    const obj = {};
    secondHalfKeys.forEach((k) => (obj[k] = u[k]));
    return obj;
  });

  console.table(firstHalfData);
  console.table(secondHalfData);
};

// --------------------
// TEST SECTIONS
// --------------------
const tests = {
  addUserTests: async () => {
    console.log("\n=== ADD USER TESTS ===");
    console.log("Adding 3 Rows");
    const u1 = await service.addUser(
      "user101",
      "user101@example.com",
      "pass101",
      "buyer"
    );
    const u2 = await service.addUser(
      "user102",
      "user102@example.com",
      "pass102",
      "seller"
    );
    const u3 = await service.addUser(
      "user103",
      "user103@example.com",
      "pass103",
      "admin"
    );

    assert.strictEqual(
      u1.getAttribute("userId"),
      1,
      "First user ID should be 1"
    );
    assert.strictEqual(
      u3.getAttribute("role"),
      "admin",
      "Third user role should be admin"
    );

    return service.getAll();
  },

  getAllAndImmutabilityTests: () => {
    console.log("\n=== GET ALL + IMMUTABILITY TESTS ===");
    console.log("Checking if returned users are immutable copies");

    const allUsers = service.getAll();
    const originalUsername = allUsers[0].getAttribute("username");

    // Attempt to mutate
    allUsers[0].updateAttribute("username", "hacked");

    const cachedUsername = service.getAll()[0].getAttribute("username");
    assert.strictEqual(
      cachedUsername,
      originalUsername,
      "Cache should remain immutable"
    );

    return service.getAll();
  },

  changeAttributeTests: () => {
    console.log("\n=== CHANGE ATTRIBUTE TESTS ===");
    console.log("Updating email of user with ID 1 to new101@example.com");

    const updated = service.updateAttribute(1, "email", "new101@example.com");
    assert.strictEqual(
      updated.getAttribute("email"),
      "new101@example.com",
      "Email should update"
    );
    return service.getAll();
  },

  findByAttributeTests: () => {
    console.log("\n=== FIND BY ATTRIBUTE TESTS ===");
    console.log('Finding users with role "buyer"');

    const buyers = service.findByAttribute("role", "buyer");
    assert.strictEqual(buyers.length, 1, "Should find 1 buyer");
    return buyers;
  },

  deleteUserTests: () => {
    console.log("\n=== DELETE USER TESTS ===");
    console.log("Deleting user with ID 2");

    const delSuccess = service.deleteUser(2);
    assert.strictEqual(delSuccess, true, "Delete should return true");
    return service.getAll();
  },

  eraseAllTests: () => {
    console.log("\n=== ERASE ALL USERS TESTS ===");
    console.log("Erasing all users from storage");

    const eraseOk = service.eraseAll();
    assert.strictEqual(eraseOk, true, "Erase all should succeed");
    assert.strictEqual(
      service.getAll().length,
      0,
      "All users should be erased"
    );
    return service.getAll();
  },

  idValidationTests: async () => {
    console.log("\n=== ID VALIDATION TESTS ===");
    console.log(
      "Checking next available ID after erase and add operations (Program should not reassign deleted id's)"
    );
    //first delete
    const eraseOk = service.eraseAll();
    assert.strictEqual(eraseOk, true, "Erase all should succeed");

    //check if next available id is 2
    let nextId = service.getNextAvailableID();
    assert.notStrictEqual(nextId, 1, "Next available ID should not be 1");

    //then add new user
    let u1 = await service.addUser(
      "user101",
      "user101@example.com",
      "pass101",
      "buyer"
    );
    //check if next available id is 2
    nextId = service.getNextAvailableID();
    assert.notStrictEqual(nextId, 2, "Next available ID should not be 2");
    //erase all again
    const finalEraseOk = service.eraseAll();
  },
};

// --------------------
// RUN TESTS & PRINT
// --------------------
const runAllTests = async () => {
  const addedUsers = await tests.addUserTests();
  printUsers(addedUsers);

  const afterGetAll = tests.getAllAndImmutabilityTests();
  printUsers(afterGetAll);

  const afterUpdate = tests.changeAttributeTests();
  printUsers(afterUpdate);

  const buyers = tests.findByAttributeTests();
  printUsers(buyers);

  const afterDelete = tests.deleteUserTests();
  printUsers(afterDelete);

  const afterErase = tests.eraseAllTests();
  printUsers(afterErase);

  await tests.idValidationTests();

  console.log("\nAll grouped tests executed successfully!");
};

runAllTests();
