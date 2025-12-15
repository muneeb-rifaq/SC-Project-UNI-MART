import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import assert from "assert";

import CategoryService from "../../../src/backend/modules/categoryModules/CategoryService.js";

// --------------------
// Setup storage path
// --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DIR = path.resolve(__dirname, "../../storage");
const TEST_FILE = path.resolve(TEST_DIR, "categoriesDB.json");

// Create directory if missing
if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });
// Remove existing test file
if (fs.existsSync(TEST_FILE)) fs.unlinkSync(TEST_FILE);

const service = new CategoryService(TEST_FILE);

// --------------------
// Helper: print categories
// --------------------
const printCategories = (categories) => {
  if (!categories || categories.length === 0) return;

  const data = categories.map((c) =>
    typeof c.toJSON === "function" ? c.toJSON() : c
  );

  const keys = Object.keys(data[0]);
  const mid = Math.ceil(keys.length / 2);

  const firstHalfKeys = keys.slice(0, mid);
  const secondHalfKeys = keys.slice(mid);

  const t1 = data.map((x) => {
    const o = {};
    firstHalfKeys.forEach((k) => (o[k] = x[k]));
    return o;
  });

  const t2 = data.map((x) => {
    const o = {};
    secondHalfKeys.forEach((k) => (o[k] = x[k]));
    return o;
  });

  console.table(t1);
  console.table(t2);
};

// --------------------
// TESTS
// --------------------
const tests = {
  addCategoryTests: async () => {
    console.log("\n=== ADD CATEGORY TESTS ===");
    console.log(
      "Expected: IDs 1,2,3 assigned, names matching ['Electronics','Home','Office']"
    );

    const c1 = await service.addCategory("Electronics", "Devices and gadgets");
    const c2 = await service.addCategory("Home", "Home appliances");
    const c3 = await service.addCategory("Office", "Office supplies");

    assert.strictEqual(c1.getAttribute("categoryId"), 1);
    assert.strictEqual(c3.getAttribute("categoryName"), "Office");

    return service.getAll();
  },

  getAllAndImmutabilityTests: () => {
    console.log("\n=== GET ALL + IMMUTABILITY TESTS ===");
    console.log(
      "Expected: modifying returned array should NOT affect service data"
    );

    const all = service.getAll();
    const originalName = all[0].getAttribute("categoryName");

    all[0].updateAttribute("categoryName", "HACKED");

    const cached = service.getAll()[0].getAttribute("categoryName");
    assert.strictEqual(
      cached,
      originalName,
      "Immutable copies must be returned"
    );

    return service.getAll();
  },

  changeAttributeTests: () => {
    console.log("\n=== CHANGE ATTRIBUTE TESTS ===");
    console.log(
      "Expected: category with ID 1 description updated to 'Updated description'"
    );

    const updated = service.updateAttribute(
      1,
      "description",
      "Updated description"
    );
    assert.strictEqual(
      updated.getAttribute("description"),
      "Updated description"
    );

    return service.getAll();
  },

  findByAttributeTests: () => {
    console.log("\n=== FIND BY ATTRIBUTE TESTS ===");
    console.log("Expected: find category with name 'Electronics', length = 1");

    const electronics = service.findByAttribute("categoryName", "Electronics");
    assert.strictEqual(electronics.length, 1);

    return electronics;
  },

  deleteCategoryTests: () => {
    console.log("\n=== DELETE CATEGORY TESTS ===");
    console.log("Expected: category with ID 2 deleted successfully");

    const ok = service.deleteCategory(2);
    assert.strictEqual(ok, true);

    return service.getAll();
  },

  eraseAllTests: () => {
    console.log("\n=== ERASE ALL CATEGORY TESTS ===");
    console.log("Expected: all categories erased, length = 0");

    assert.strictEqual(service.eraseAll(), true);
    assert.strictEqual(service.getAll().length, 0);

    return [];
  },

  idValidationTests: async () => {
    console.log("\n=== ID VALIDATION TESTS ===");
    console.log(
      "Expected: IDs continue from highest existing ID even after deletion/erase"
    );

    service.eraseAll();

    let next = service.getNextAvailableID();
    assert.strictEqual(next, 4, "IDs must continue from highest existing ID");

    const c = await service.addCategory("Furniture", "Chairs and tables");
    next = service.getNextAvailableID();
    assert.strictEqual(next, 5, "JSON auto-increment must not reuse old IDs");

    service.eraseAll();
  },
};

// --------------------
// RUN TESTS
// --------------------
const runAllTests = async () => {
  const added = await tests.addCategoryTests();
  printCategories(added);

  const imm = tests.getAllAndImmutabilityTests();
  printCategories(imm);

  const updated = tests.changeAttributeTests();
  printCategories(updated);

  const found = tests.findByAttributeTests();
  printCategories(found);

  const afterDelete = tests.deleteCategoryTests();
  printCategories(afterDelete);

  const afterErase = tests.eraseAllTests();
  printCategories(afterErase);

  await tests.idValidationTests();

  console.log("\nAll JSON CategoryService tests passed successfully!");
};

runAllTests();
