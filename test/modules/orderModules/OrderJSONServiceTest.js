// test/modules/orderModules/OrderJSONServiceTest.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import assert from "assert";

import OrderService from "../../../src/backend/modules/orderModules/OrderService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DIR = path.resolve(__dirname, "../../storage");
const TEST_FILE = path.resolve(TEST_DIR, "ordersDB.json");

if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });
if (fs.existsSync(TEST_FILE)) fs.unlinkSync(TEST_FILE);

const service = new OrderService(TEST_FILE);

const printOrders = (orders) => {
  if (!orders || orders.length === 0) return;
  const data = orders.map((o) =>
    typeof o.toJSON === "function" ? o.toJSON() : o
  );
  const keys = Object.keys(data[0]);
  const mid = Math.ceil(keys.length / 2);
  const A = keys.slice(0, mid);
  const B = keys.slice(mid);

  const t1 = data.map((x) => {
    const obj = {};
    A.forEach((k) => (obj[k] = x[k]));
    return obj;
  });
  const t2 = data.map((x) => {
    const obj = {};
    B.forEach((k) => (obj[k] = x[k]));
    return obj;
  });

  console.table(t1);
  console.table(t2);
};

const tests = {
  addOrderTests: async () => {
    console.log("EXPECT: First orderId = 1, statuses default to 'pending'.");
    console.log("\n=== ADD ORDER TESTS ===");

    const p1 = await service.addOrder({ name: "Keyboard" }, 1, 2, 1, 4500);
    const p2 = await service.addOrder({ name: "Mouse" }, 2, 3, 2, 4000);
    const p3 = await service.addOrder(
      "Lamp-string-product",
      3,
      2,
      1,
      1500,
      "confirmed"
    );

    assert.strictEqual(p1.getAttribute("orderId"), 1);
    assert.strictEqual(p1.getAttribute("status"), "pending");
    assert.strictEqual(p3.getAttribute("status"), "confirmed");

    return service.getAll();
  },

  getAllAndImmutabilityTests: () => {
    console.log(
      "EXPECT: getAll returns immutable copies (mutations to returned objects don't affect cache)."
    );
    console.log("\n=== GET ALL + IMMUTABILITY TESTS ===");

    const all = service.getAll();
    const originalProduct = all[0].getAttribute("product");

    all[0].updateAttribute("product", "HACKED");

    const cached = service.getAll()[0].getAttribute("product");
    assert.strictEqual(
      cached,
      originalProduct,
      "Cache should remain immutable"
    );

    return service.getAll();
  },

  changeAttributeTests: () => {
    console.log("EXPECT: Update status of order 1 to 'confirmed'.");
    console.log("\n=== CHANGE ATTRIBUTE TESTS ===");

    const updated = service.updateAttribute(1, "status", "confirmed");
    assert.strictEqual(updated.getAttribute("status"), "confirmed");
    return service.getAll();
  },

  findByAttributeTests: () => {
    console.log(
      "EXPECT: findByAttribute('buyerId', 1) returns orders for buyer 1."
    );
    console.log("\n=== FIND BY ATTRIBUTE TESTS ===");

    const buyer1 = service.findByAttribute("buyerId", 1);
    assert.ok(Array.isArray(buyer1));
    return buyer1;
  },

  deleteOrderTests: () => {
    console.log(
      "EXPECT: deleteOrder(2) returns true and removes order with id 2."
    );
    console.log("\n=== DELETE ORDER TESTS ===");

    const ok = service.deleteOrder(2);
    assert.strictEqual(ok, true);
    return service.getAll();
  },

  eraseAllTests: () => {
    console.log(
      "EXPECT: eraseAll() removes all orders but does not reset ID counter."
    );
    console.log("\n=== ERASE ALL ORDER TESTS ===");

    assert.strictEqual(service.eraseAll(), true);
    assert.strictEqual(service.getAll().length, 0);
    return [];
  },

  idValidationTests: async () => {
    console.log(
      "EXPECT: after eraseAll, new orders continue IDs (do not reuse deleted IDs)."
    );
    console.log("\n=== ID VALIDATION TESTS ===");

    service.eraseAll();
    let next = service.getNextAvailableID();
    // With JSON repository using lastId semantics, next ID will continue from last persisted lastId + 1.
    // Initially lastId = 3 after addOrderTests, so next should be 4.
    console.log("Next available ID (expected >= 4):", next);
    assert.ok(next >= 4, "Next available ID should continue from last used ID");

    const p = await service.addOrder({ name: "Chair" }, 5, 2, 1, 8000);
    const nextAfter = service.getNextAvailableID();
    assert.ok(
      nextAfter > p.getAttribute("orderId"),
      "Next ID should be greater than just-created order id"
    );

    service.eraseAll();
  },
};

const runAll = async () => {
  const added = await tests.addOrderTests();
  printOrders(added);

  const imm = tests.getAllAndImmutabilityTests();
  printOrders(imm);

  const changed = tests.changeAttributeTests();
  printOrders(changed);

  const found = tests.findByAttributeTests();
  printOrders(found);

  const deleted = tests.deleteOrderTests();
  printOrders(deleted);

  const erased = tests.eraseAllTests();
  printOrders(erased);

  await tests.idValidationTests();

  console.log("\nAll JSON OrderService tests completed.");
};

runAll();
