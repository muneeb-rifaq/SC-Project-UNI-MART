import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import assert from "assert";

import ProductService from "../../../src/backend/modules/productModules/ProductService.js";

// --------------------
// Setup storage path
// --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DIR = path.resolve(__dirname, "../../storage");
const TEST_FILE = path.resolve(TEST_DIR, "unimartDB.db");

// Create directory if missing
if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });
// Remove existing test file
if (fs.existsSync(TEST_FILE)) fs.unlinkSync(TEST_FILE);

const service = new ProductService(TEST_FILE);

// --------------------
// Helper: print products
// --------------------
const printProducts = (products) => {
  if (!products || products.length === 0) return;

  const data = products.map((p) =>
    typeof p.toJSON === "function" ? p.toJSON() : p
  );

  const keys = Object.keys(data[0]);
  const mid = Math.ceil(keys.length / 2);

  const A = keys.slice(0, mid);
  const B = keys.slice(mid);

  const t1 = data.map((x) => {
    const o = {};
    A.forEach((k) => (o[k] = x[k]));
    return o;
  });

  const t2 = data.map((x) => {
    const o = {};
    B.forEach((k) => (o[k] = x[k]));
    return o;
  });

  console.table(t1);
  console.table(t2);
};

// --------------------
// TESTS
// --------------------
const tests = {
  addProductTests: async () => {
    console.log("\n=== ADD PRODUCT TESTS ===");

    const p1 = await service.addProduct(
      "Keyboard",
      10,
      "Mechanical RGB keyboard",
      4500,
      50, // stock
      1 // categoryId
    );

    const p2 = await service.addProduct(
      "Mouse",
      20,
      "Wireless optical mouse",
      2000,
      120,
      1
    );

    const p3 = await service.addProduct(
      "Lamp",
      30,
      "LED desk lamp",
      1500,
      30,
      2
    );

    assert.strictEqual(p1.getAttribute("productId"), 1);
    assert.strictEqual(p3.getAttribute("name"), "Lamp");
    assert.strictEqual(p2.getAttribute("sellerId"), 20);
    assert.strictEqual(p2.getAttribute("categoryId"), 1);

    return service.getAll();
  },

  getAllAndImmutabilityTests: () => {
    console.log("\n=== GET ALL + IMMUTABILITY TESTS ===");

    const all = service.getAll();
    const originalName = all[0].getAttribute("name");

    // Try mutating externally
    all[0].updateAttribute("name", "HACKED");

    const cached = service.getAll()[0].getAttribute("name");
    assert.strictEqual(
      cached,
      originalName,
      "Immutable copies must be returned"
    );

    return service.getAll();
  },

  changeAttributeTests: () => {
    console.log("\n=== CHANGE ATTRIBUTE TESTS ===");

    const updatedPrice = service.updateAttribute(1, "price", 5000);
    assert.strictEqual(updatedPrice.getAttribute("price"), 5000);

    // sellerId should not be updatable
    const updatedStatus = service.updateAttribute(1, "sellerId", 99);
    assert.strictEqual(updatedStatus, null);

    // categoryId should  be updatable
    const updatedCategory = service.updateAttribute(1, "categoryId", 99);
    assert.notStrictEqual(updatedCategory, null);

    return service.getAll();
  },

  findByAttributeTests: () => {
    console.log("\n=== FIND BY ATTRIBUTE TESTS ===");

    const found = service.findByAttribute("stock", 120);
    assert.strictEqual(found.length, 1);

    return found;
  },

  deleteProductTests: () => {
    console.log("\n=== DELETE PRODUCT TESTS ===");

    const ok = service.deleteProduct(2);
    assert.strictEqual(ok, true);

    return service.getAll();
  },

  eraseAllTests: () => {
    console.log("\n=== ERASE ALL PRODUCT TESTS ===");

    assert.strictEqual(service.eraseAll(), true);
    assert.strictEqual(service.getAll().length, 0);

    return [];
  },

  idValidationTests: async () => {
    console.log("\n=== ID VALIDATION TESTS ===");
    let initial = service.getNextAvailableID();

    service.eraseAll();

    let next = service.getNextAvailableID();
    // IDs should never be reused
    assert.notStrictEqual(next, 1);
    assert.strictEqual(next, initial, "ID must continue from last value");

    await service.addProduct("Chair", 1, "Office chair", 8000, 10, 3);

    next = service.getNextAvailableID();
    assert.notStrictEqual(
      next,
      2,
      "SQLite auto-increment must not reuse old IDs"
    );

    service.eraseAll();
  },
};

// --------------------
// RUN TESTS
// --------------------
const runAllTests = async () => {
  const added = await tests.addProductTests();
  printProducts(added);

  const imm = tests.getAllAndImmutabilityTests();
  printProducts(imm);

  const updated = tests.changeAttributeTests();
  printProducts(updated);

  const found = tests.findByAttributeTests();
  printProducts(found);

  const afterDelete = tests.deleteProductTests();
  printProducts(afterDelete);

  const afterErase = tests.eraseAllTests();
  printProducts(afterErase);

  await tests.idValidationTests();

  console.log("\nAll SQLite ProductService tests passed successfully!");
};

runAllTests();
