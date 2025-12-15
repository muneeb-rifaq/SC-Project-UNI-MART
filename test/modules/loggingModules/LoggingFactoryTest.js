// LoggingFactoryTest.js
import assert from "assert";
import LoggingFactory from "../../../src/backend/modules/loggingModules/LoggingFactory.js";
import Logging from "../../../src/backend/modules/loggingModules/Logging.js";

// --------------------
// Test 1: createNewLog
// --------------------
function testCreateNewLog() {
  console.log("\n=== TEST 1: createNewLog ===");
  const log1 = LoggingFactory.createNewLog(
    1,
    "products",
    "CREATE",
    "admin@example.com",
    "2024-01-15T10:30:00Z",
    "Created new product: Keyboard"
  );

  assert.strictEqual(
    log1 instanceof Logging,
    true,
    "Should return Logging instance"
  );
  assert.strictEqual(log1.getAttribute("logId"), 1);
  assert.strictEqual(log1.getAttribute("tableName"), "products");
  assert.strictEqual(log1.getAttribute("operationType"), "CREATE");
  assert.strictEqual(log1.getAttribute("performedBy"), "admin@example.com");
  assert.strictEqual(log1.getAttribute("timestamp"), "2024-01-15T10:30:00Z");
  assert.strictEqual(
    log1.getAttribute("description"),
    "Created new product: Keyboard"
  );
  console.log("✅ createNewLog works correctly");
  console.log(log1.toString());
}

// --------------------
// Test 2: logCreate helper
// --------------------
function testLogCreateHelper() {
  console.log("\n=== TEST 2: logCreate helper ===");
  const createLog = LoggingFactory.logCreate(
    2,
    "users",
    "seller@example.com",
    "2024-01-15T11:00:00Z",
    "Added new seller"
  );

  assert.strictEqual(createLog.getAttribute("operationType"), "CREATE");
  assert.strictEqual(createLog.getAttribute("tableName"), "users");
  assert.strictEqual(
    createLog.getAttribute("performedBy"),
    "seller@example.com"
  );
  console.log("✅ logCreate helper works correctly");
  console.log(createLog.toString());
}

// --------------------
// Test 3: logRead helper
// --------------------
function testLogReadHelper() {
  console.log("\n=== TEST 3: logRead helper ===");
  const readLog = LoggingFactory.logRead(
    3,
    "categories",
    "buyer@example.com",
    "2024-01-15T12:00:00Z",
    "Viewed category list"
  );

  assert.strictEqual(readLog.getAttribute("operationType"), "READ");
  assert.strictEqual(readLog.getAttribute("tableName"), "categories");
  console.log("✅ logRead helper works correctly");
  console.log(readLog.toString());
}

// --------------------
// Test 4: logUpdate helper
// --------------------
function testLogUpdateHelper() {
  console.log("\n=== TEST 4: logUpdate helper ===");
  const updateLog = LoggingFactory.logUpdate(
    4,
    "orders",
    "admin@example.com",
    "2024-01-15T13:00:00Z",
    "Updated order status"
  );

  assert.strictEqual(updateLog.getAttribute("operationType"), "UPDATE");
  assert.strictEqual(updateLog.getAttribute("tableName"), "orders");
  console.log("✅ logUpdate helper works correctly");
  console.log(updateLog.toString());
}

// --------------------
// Test 5: logDelete helper
// --------------------
function testLogDeleteHelper() {
  console.log("\n=== TEST 5: logDelete helper ===");
  const deleteLog = LoggingFactory.logDelete(
    5,
    "products",
    "admin@example.com",
    "2024-01-15T14:00:00Z",
    "Removed obsolete product"
  );

  assert.strictEqual(deleteLog.getAttribute("operationType"), "DELETE");
  assert.strictEqual(deleteLog.getAttribute("tableName"), "products");
  console.log("✅ logDelete helper works correctly");
  console.log(deleteLog.toString());
}

// --------------------
// Test 6: makeSampleLog
// --------------------
function testMakeSampleLog() {
  console.log("\n=== TEST 6: makeSampleLog ===");
  const sampleLog = LoggingFactory.makeSampleLog();

  assert.strictEqual(sampleLog instanceof Logging, true);
  assert.strictEqual(sampleLog.getAttribute("logId"), 999);
  assert.strictEqual(sampleLog.getAttribute("tableName"), "sample_table");
  assert.strictEqual(sampleLog.getAttribute("operationType"), "CREATE");
  assert.strictEqual(
    sampleLog.getAttribute("performedBy"),
    "sample@example.com"
  );
  assert.strictEqual(typeof sampleLog.getAttribute("description"), "string");
  console.log("✅ makeSampleLog works correctly");
  console.log(sampleLog.toString());
}

// --------------------
// Test 7: Invalid operation type
// --------------------
function testInvalidOperationType() {
  console.log("\n=== TEST 7: Invalid operation type validation ===");
  try {
    LoggingFactory.createNewLog(
      6,
      "products",
      "INVALID_OP",
      "admin@example.com",
      "2024-01-15T15:00:00Z",
      "Test"
    );
    assert.fail("Should throw error for invalid operation type");
  } catch (err) {
    assert.strictEqual(
      err.message.includes("Invalid Logging attributes"),
      true,
      "Should throw validation error"
    );
    console.log("✅ Invalid operation type correctly rejected");
    console.log(`   Error: ${err.message}`);
  }
}

// --------------------
// Test 8: Empty values validation
// --------------------
function testEmptyValuesValidation() {
  console.log("\n=== TEST 8: Empty values validation ===");
  try {
    LoggingFactory.createNewLog(
      7,
      "",
      "CREATE",
      "admin@example.com",
      "2024-01-15T16:00:00Z",
      "Test"
    );
    assert.fail("Should throw error for empty tableName");
  } catch (err) {
    assert.strictEqual(
      err.message.includes("Invalid Logging attributes"),
      true,
      "Should throw validation error"
    );
    console.log("✅ Empty tableName correctly rejected");
    console.log(`   Error: ${err.message}`);
  }
}

// --------------------
// Test 9: JSON serialization
// --------------------
function testJSONSerialization() {
  console.log("\n=== TEST 9: JSON serialization ===");
  const log = LoggingFactory.createNewLog(
    8,
    "categories",
    "UPDATE",
    "admin@example.com",
    "2024-01-15T17:00:00Z",
    "Category updated"
  );

  const json = log.toJSON();
  assert.strictEqual(typeof json, "object");
  assert.strictEqual(json.logId, 8);
  assert.strictEqual(json.tableName, "categories");
  assert.strictEqual(json.operationType, "UPDATE");
  assert.strictEqual(json.performedBy, "admin@example.com");
  assert.strictEqual(json.timestamp, "2024-01-15T17:00:00Z");
  assert.strictEqual(json.description, "Category updated");
  console.log("✅ JSON serialization works correctly");
  console.table(json);
}

// --------------------
// RUN ALL TESTS
// --------------------
console.log("\n╔════════════════════════════════════════════╗");
console.log("║  LOGGING FACTORY TEST SUITE               ║");
console.log("╚════════════════════════════════════════════╝");

testCreateNewLog();
testLogCreateHelper();
testLogReadHelper();
testLogUpdateHelper();
testLogDeleteHelper();
testMakeSampleLog();
testInvalidOperationType();
testEmptyValuesValidation();
testJSONSerialization();

console.log("\n✅ ALL FACTORY TESTS PASSED");
