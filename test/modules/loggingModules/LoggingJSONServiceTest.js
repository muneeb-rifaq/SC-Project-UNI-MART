// LoggingJSONServiceTest.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import assert from "assert";

import LoggingService from "../../../src/backend/modules/loggingModules/LoggingService.js";

// --------------------
// Setup storage path
// --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DIR = path.resolve(__dirname, "../../storage");
const TEST_FILE = path.resolve(TEST_DIR, "testLogs.json");

// Create directory if missing
if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });
// Remove existing test file
if (fs.existsSync(TEST_FILE)) fs.unlinkSync(TEST_FILE);

const service = new LoggingService(TEST_FILE);

// --------------------
// Helper: print logs
// --------------------
const printLogs = (logs) => {
  if (!logs || logs.length === 0) {
    console.log("No logs to display");
    return;
  }

  const data = logs.map((log) =>
    typeof log.toJSON === "function" ? log.toJSON() : log
  );

  console.table(data);
};

// --------------------
// Test 1: Add logs
// --------------------
function testAddLogs() {
  console.log("\n=== TEST 1: ADD LOG TESTS ===");

  const log1 = service.addLog(
    "products",
    "CREATE",
    "admin@example.com",
    "Created new product: Keyboard"
  );

  const log2 = service.addLog(
    "users",
    "UPDATE",
    "admin@example.com",
    "Updated user role from buyer to seller"
  );

  const log3 = service.addLog(
    "categories",
    "DELETE",
    "admin@example.com",
    "Deleted obsolete category"
  );

  assert.strictEqual(log1.getAttribute("logId"), 1);
  assert.strictEqual(log2.getAttribute("logId"), 2);
  assert.strictEqual(log3.getAttribute("logId"), 3);
  assert.strictEqual(log1.getAttribute("tableName"), "products");
  assert.strictEqual(log2.getAttribute("operationType"), "UPDATE");

  printLogs(service.getAll());
}

// --------------------
// Test 2: Get all
// --------------------
function testGetAll() {
  console.log("\n=== TEST 2: GET ALL TESTS ===");

  const all = service.getAll();
  assert.strictEqual(all.length, 3, "Should have 3 logs");
  assert.strictEqual(all[0].getAttribute("logId"), 1);
  assert.strictEqual(all[2].getAttribute("logId"), 3);

  printLogs(all);
}

// --------------------
// Test 3: Find by table
// --------------------
function testFindByTable() {
  console.log("\n=== TEST 3: FIND BY TABLE TESTS ===");

  const productsLogs = service.findByTable("products");
  assert.strictEqual(productsLogs.length, 1);
  assert.strictEqual(productsLogs[0].getAttribute("tableName"), "products");

  const usersLogs = service.findByTable("users");
  assert.strictEqual(usersLogs.length, 1);
  assert.strictEqual(usersLogs[0].getAttribute("tableName"), "users");

  const ordersLogs = service.findByTable("orders");
  assert.strictEqual(ordersLogs.length, 0, "No orders logs exist");

  printLogs(productsLogs);
}

// --------------------
// Test 4: Find by operation
// --------------------
function testFindByOperation() {
  console.log("\n=== TEST 4: FIND BY OPERATION TESTS ===");

  const createLogs = service.findByOperation("CREATE");
  assert.strictEqual(createLogs.length, 1);

  const updateLogs = service.findByOperation("UPDATE");
  assert.strictEqual(updateLogs.length, 1);

  const deleteLogs = service.findByOperation("DELETE");
  assert.strictEqual(deleteLogs.length, 1);

  const readLogs = service.findByOperation("READ");
  assert.strictEqual(readLogs.length, 0);

  printLogs(createLogs);
}

// --------------------
// Test 5: Find by user
// --------------------
function testFindByUser() {
  console.log("\n=== TEST 5: FIND BY USER TESTS ===");

  const adminLogs = service.findByUser("admin@example.com");
  assert.strictEqual(adminLogs.length, 3, "Admin should have 3 logs");

  const otherLogs = service.findByUser("other@example.com");
  assert.strictEqual(otherLogs.length, 0);

  printLogs(adminLogs);
}

// --------------------
// Test 6: Find by date range
// --------------------
function testFindByDateRange() {
  console.log("\n=== TEST 6: FIND BY DATE RANGE TESTS ===");

  // Add more logs for testing
  service.addLog("orders", "CREATE", "buyer@example.com", "Order created");

  service.addLog("orders", "UPDATE", "buyer@example.com", "Order updated");

  // Find logs in specific range
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const rangeResult = service.findByDateRange(
    yesterday.toISOString(),
    tomorrow.toISOString()
  );

  assert.strictEqual(
    rangeResult.length,
    5,
    "Should find all logs created today"
  );

  // Find all logs from yesterday onwards
  const allFromYesterday = service.findByDateRange(yesterday.toISOString());
  assert.strictEqual(allFromYesterday.length, 5, "Should find all 5 logs");

  printLogs(rangeResult);
}

// --------------------
// Test 7: Helper methods
// --------------------
function testHelperMethods() {
  console.log("\n=== TEST 7: HELPER METHOD TESTS ===");

  const createLog = service.logCreate(
    "products",
    "seller@example.com",
    "Added product: Mouse"
  );
  assert.strictEqual(createLog.getAttribute("operationType"), "CREATE");
  assert.strictEqual(createLog.getAttribute("tableName"), "products");

  const readLog = service.logRead(
    "products",
    "buyer@example.com",
    "Viewed product list"
  );
  assert.strictEqual(readLog.getAttribute("operationType"), "READ");

  const updateLog = service.logUpdate(
    "categories",
    "admin@example.com",
    "Updated category name"
  );
  assert.strictEqual(updateLog.getAttribute("operationType"), "UPDATE");

  const deleteLog = service.logDelete(
    "users",
    "admin@example.com",
    "Removed inactive user"
  );
  assert.strictEqual(deleteLog.getAttribute("operationType"), "DELETE");

  printLogs(service.getAll());
}

// --------------------
// Test 8: Delete log
// --------------------
function testDeleteLog() {
  console.log("\n=== TEST 8: DELETE LOG TESTS ===");

  const beforeCount = service.getAll().length;
  const deleted = service.deleteLog(1);
  const afterCount = service.getAll().length;

  assert.strictEqual(deleted, true, "Delete should return true");
  assert.strictEqual(afterCount, beforeCount - 1);

  const remaining = service.getAll();
  const ids = remaining.map((log) => log.getAttribute("logId"));
  assert.strictEqual(ids.includes(1), false);

  printLogs(remaining);
}

// --------------------
// Test 9: Persistence
// --------------------
function testPersistence() {
  console.log("\n=== TEST 9: PERSISTENCE TESTS ===");

  // Verify file exists
  assert.strictEqual(fs.existsSync(TEST_FILE), true, "JSON file should exist");

  // Read file content
  const content = JSON.parse(fs.readFileSync(TEST_FILE, "utf8"));
  assert.strictEqual(
    Array.isArray(content.logs),
    true,
    "Should have logs array"
  );
  assert.strictEqual(typeof content.lastId, "number", "Should have lastId");
  assert.strictEqual(content.lastId >= content.logs.length, true);

  printLogs(service.getAll());
}

// --------------------
// Test 10: Erase all
// --------------------
function testEraseAll() {
  console.log("\n=== TEST 10: ERASE ALL TESTS ===");

  service.eraseAll();
  const all = service.getAll();
  assert.strictEqual(all.length, 0, "All logs should be deleted");

  // Verify file is reset
  const content = JSON.parse(fs.readFileSync(TEST_FILE, "utf8"));
  assert.strictEqual(content.logs.length, 0);
  assert.strictEqual(content.lastId, 0);

  printLogs(all);
}

// --------------------
// RUN ALL TESTS
// --------------------
console.log("\n╔════════════════════════════════════════════╗");
console.log("║  LOGGING JSON SERVICE TEST SUITE          ║");
console.log("╚════════════════════════════════════════════╝");

testAddLogs();
testGetAll();
testFindByTable();
testFindByOperation();
testFindByUser();
testFindByDateRange();
testHelperMethods();
testDeleteLog();
testPersistence();
testEraseAll();

console.log("\n✅ ALL TESTS PASSED");
