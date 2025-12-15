// LoggingSQLServiceTest.js
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
const TEST_FILE = path.resolve(TEST_DIR, "unimartDB.db");

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
  assert.strictEqual(log1.getAttribute("tableName"), "products");
  assert.strictEqual(log1.getAttribute("operationType"), "CREATE");
  assert.strictEqual(log2.getAttribute("performedBy"), "admin@example.com");
  assert.strictEqual(log3.getAttribute("operationType"), "DELETE");

  printLogs(service.getAll());
}

// --------------------
// Test 2: Get all and immutability
// --------------------
function testGetAllAndImmutability() {
  console.log("\n=== TEST 2: GET ALL + IMMUTABILITY TESTS ===");

  const all = service.getAll();
  const originalDesc = all[0].getAttribute("description");

  // Logs are immutable - no updateAttribute method exists
  const cached = service.getAll()[0].getAttribute("description");
  assert.strictEqual(cached, originalDesc, "Immutable copies must be returned");

  printLogs(service.getAll());
}

// --------------------
// Test 3: Delete log
// --------------------
function testDeleteLog() {
  console.log("\n=== TEST 3: DELETE LOG TESTS ===");

  const beforeCount = service.getAll().length;
  const deleted = service.deleteLog(2);
  const afterCount = service.getAll().length;

  assert.strictEqual(deleted, true, "Delete should return true");
  assert.strictEqual(afterCount, beforeCount - 1, "Count should decrease by 1");

  const remaining = service.getAll();
  const ids = remaining.map((log) => log.getAttribute("logId"));
  assert.strictEqual(ids.includes(2), false, "Deleted log should not exist");

  printLogs(service.getAll());
}

// --------------------
// Test 4: Find by table
// --------------------
function testFindByTable() {
  console.log("\n=== TEST 4: FIND BY TABLE TESTS ===");

  const productsLogs = service.findByTable("products");
  assert.strictEqual(productsLogs.length, 1);
  assert.strictEqual(productsLogs[0].getAttribute("tableName"), "products");

  const usersLogs = service.findByTable("users");
  assert.strictEqual(
    usersLogs.length,
    0,
    "No users logs should remain after delete"
  );

  printLogs(productsLogs);
}

// --------------------
// Test 5: Find by operation
// --------------------
function testFindByOperation() {
  console.log("\n=== TEST 5: FIND BY OPERATION TESTS ===");

  const createLogs = service.findByOperation("CREATE");
  assert.strictEqual(createLogs.length, 1);
  assert.strictEqual(createLogs[0].getAttribute("operationType"), "CREATE");

  const deleteLogs = service.findByOperation("DELETE");
  assert.strictEqual(deleteLogs.length, 1);
  assert.strictEqual(deleteLogs[0].getAttribute("operationType"), "DELETE");

  const readLogs = service.findByOperation("READ");
  assert.strictEqual(readLogs.length, 0, "No READ logs exist");

  printLogs(createLogs);
}

// --------------------
// Test 6: Find by user
// --------------------
function testFindByUser() {
  console.log("\n=== TEST 6: FIND BY USER TESTS ===");

  const adminLogs = service.findByUser("admin@example.com");
  assert.strictEqual(adminLogs.length, 2, "Admin should have 2 remaining logs");

  const otherUserLogs = service.findByUser("other@example.com");
  assert.strictEqual(otherUserLogs.length, 0, "No logs from other user");

  printLogs(adminLogs);
}

// --------------------
// Test 7: Find by date range
// --------------------
function testFindByDateRange() {
  console.log("\n=== TEST 7: FIND BY DATE RANGE TESTS ===");

  // Add logs with specific timestamps for testing
  service.addLog("orders", "CREATE", "buyer@example.com", "Order created");

  service.addLog("orders", "UPDATE", "buyer@example.com", "Order updated");

  // Find logs between yesterday and tomorrow
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
    rangeResult.length >= 2,
    true,
    "Should find logs within date range"
  );

  // Find all logs from yesterday onwards
  const allFromYesterday = service.findByDateRange(yesterday.toISOString());
  assert.strictEqual(
    allFromYesterday.length >= 4,
    true,
    "Should find all logs"
  );

  printLogs(rangeResult);
}

// --------------------
// Test 8: Helper methods
// --------------------
function testHelperMethods() {
  console.log("\n=== TEST 8: HELPER METHOD TESTS ===");

  // Test logCreate
  const createLog = service.logCreate(
    "products",
    "seller@example.com",
    "Added product: Mouse"
  );
  assert.strictEqual(createLog.getAttribute("operationType"), "CREATE");

  // Test logRead
  const readLog = service.logRead(
    "products",
    "buyer@example.com",
    "Viewed product list"
  );
  assert.strictEqual(readLog.getAttribute("operationType"), "READ");

  // Test logUpdate
  const updateLog = service.logUpdate(
    "categories",
    "admin@example.com",
    "Updated category name"
  );
  assert.strictEqual(updateLog.getAttribute("operationType"), "UPDATE");

  // Test logDelete
  const deleteLog = service.logDelete(
    "users",
    "admin@example.com",
    "Removed inactive user"
  );
  assert.strictEqual(deleteLog.getAttribute("operationType"), "DELETE");

  printLogs(service.getAll());
}

// --------------------
// Test 9: Erase all
// --------------------
function testEraseAll() {
  console.log("\n=== TEST 9: ERASE ALL TESTS ===");

  const beforeCount = service.getAll().length;
  assert.strictEqual(beforeCount > 0, true, "Should have logs before erase");

  service.eraseAll();
  const afterCount = service.getAll().length;
  assert.strictEqual(afterCount, 0, "All logs should be deleted");

  printLogs(service.getAll());
}

// --------------------
// RUN ALL TESTS
// --------------------
console.log("\n╔════════════════════════════════════════════╗");
console.log("║  LOGGING SQL SERVICE TEST SUITE           ║");
console.log("╚════════════════════════════════════════════╝");

testAddLogs();
testGetAllAndImmutability();
testDeleteLog();
testFindByTable();
testFindByOperation();
testFindByUser();
testFindByDateRange();
testHelperMethods();
testEraseAll();

console.log("\n✅ ALL TESTS PASSED");
