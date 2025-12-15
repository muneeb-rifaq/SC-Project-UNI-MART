// LoggingTest.js
import assert from "assert";
import Logging from "../../../src/backend/modules/loggingModules/Logging.js";

// --------------------
// Test 1: Constructor and basic attributes
// --------------------
function testConstructorAndBasicAttributes() {
  console.log("\n=== TEST 1: Constructor and basic attributes ===");
  const log1 = new Logging(
    1,
    "products",
    "CREATE",
    "admin@example.com",
    "2024-01-15T10:30:00Z",
    "Created new product: Keyboard"
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
  console.log("✅ Constructor works correctly");
  console.log(log1.toString());
}

// --------------------
// Test 2: Valid operation types
// --------------------
function testValidOperationTypes() {
  console.log("\n=== TEST 2: Valid operation types ===");
  const validOperations = ["CREATE", "READ", "UPDATE", "DELETE"];

  validOperations.forEach((op, index) => {
    const log = new Logging(
      index + 10,
      "test_table",
      op,
      "test@example.com",
      "2024-01-15T10:00:00Z",
      `Test ${op} operation`
    );
    assert.strictEqual(log.getAttribute("operationType"), op);
    console.log(`   ✓ ${op} operation type accepted`);
  });
  console.log("✅ All valid operation types work");
}

// --------------------
// Test 3: Invalid operation type
// --------------------
function testInvalidOperationType() {
  console.log("\n=== TEST 3: Invalid operation type ===");
  try {
    new Logging(
      2,
      "products",
      "INVALID",
      "admin@example.com",
      "2024-01-15T10:30:00Z",
      "Test"
    );
    assert.fail("Should throw error for invalid operation type");
  } catch (err) {
    assert.strictEqual(
      err.message.includes("Invalid Logging attributes"),
      true
    );
    console.log("✅ Invalid operation type correctly rejected");
    console.log(`   Error: ${err.message}`);
  }
}

// --------------------
// Test 4: Empty tableName validation
// --------------------
function testEmptyTableNameValidation() {
  console.log("\n=== TEST 4: Empty tableName validation ===");
  try {
    new Logging(
      3,
      "",
      "CREATE",
      "admin@example.com",
      "2024-01-15T10:30:00Z",
      "Test"
    );
    assert.fail("Should throw error for empty tableName");
  } catch (err) {
    assert.strictEqual(
      err.message.includes("Invalid Logging attributes"),
      true
    );
    console.log("✅ Empty tableName correctly rejected");
    console.log(`   Error: ${err.message}`);
  }
}

// --------------------
// Test 5: Empty performedBy validation
// --------------------
function testEmptyPerformedByValidation() {
  console.log("\n=== TEST 5: Empty performedBy validation ===");
  try {
    new Logging(4, "products", "CREATE", "", "2024-01-15T10:30:00Z", "Test");
    assert.fail("Should throw error for empty performedBy");
  } catch (err) {
    assert.strictEqual(
      err.message.includes("Invalid Logging attributes"),
      true
    );
    console.log("✅ Empty performedBy correctly rejected");
    console.log(`   Error: ${err.message}`);
  }
}

// --------------------
// Test 6: Timestamp validation
// --------------------
function testTimestampValidation() {
  console.log("\n=== TEST 6: Empty timestamp defaults to current time ===");
  const log6_empty = new Logging(
    5,
    "products",
    "CREATE",
    "admin@example.com",
    "",
    "Test"
  );
  assert.strictEqual(typeof log6_empty.getAttribute("timestamp"), "string");
  assert.strictEqual(log6_empty.getAttribute("timestamp").length > 0, true);
  console.log("✅ Empty timestamp correctly defaults to current time");
  console.log(
    `   Generated timestamp: ${log6_empty.getAttribute("timestamp")}`
  );

  console.log("\n=== TEST 6b: Invalid timestamp format ===");
  try {
    new Logging(
      6,
      "products",
      "CREATE",
      "admin@example.com",
      "invalid-date",
      "Test"
    );
    assert.fail("Should throw error for invalid timestamp");
  } catch (err) {
    assert.strictEqual(
      err.message.includes("Invalid Logging attributes"),
      true
    );
    console.log("✅ Invalid timestamp format correctly rejected");
    console.log(`   Error: ${err.message}`);
  }
}

// --------------------
// Test 7: toJSON method
// --------------------
function testToJSON() {
  console.log("\n=== TEST 7: toJSON method ===");
  const log2 = new Logging(
    100,
    "users",
    "UPDATE",
    "admin@example.com",
    "2024-01-15T11:00:00Z",
    "Updated user role"
  );

  const json = log2.toJSON();
  assert.strictEqual(typeof json, "object");
  assert.strictEqual(json.logId, 100);
  assert.strictEqual(json.tableName, "users");
  assert.strictEqual(json.operationType, "UPDATE");
  assert.strictEqual(json.performedBy, "admin@example.com");
  assert.strictEqual(json.timestamp, "2024-01-15T11:00:00Z");
  assert.strictEqual(json.description, "Updated user role");
  console.log("✅ toJSON works correctly");
  console.table(json);
}

// --------------------
// Test 8: fromJSON method
// --------------------
function testFromJSON() {
  console.log("\n=== TEST 8: fromJSON method ===");
  const jsonData = {
    logId: 200,
    tableName: "categories",
    operationType: "DELETE",
    performedBy: "admin@example.com",
    timestamp: "2024-01-15T12:00:00Z",
    description: "Deleted obsolete category",
  };

  const log3 = Logging.fromJSON(jsonData);
  assert.strictEqual(log3 instanceof Logging, true);
  assert.strictEqual(log3.getAttribute("logId"), 200);
  assert.strictEqual(log3.getAttribute("tableName"), "categories");
  assert.strictEqual(log3.getAttribute("operationType"), "DELETE");
  assert.strictEqual(log3.getAttribute("performedBy"), "admin@example.com");
  assert.strictEqual(log3.getAttribute("timestamp"), "2024-01-15T12:00:00Z");
  assert.strictEqual(
    log3.getAttribute("description"),
    "Deleted obsolete category"
  );
  console.log("✅ fromJSON works correctly");
  console.log(log3.toString());
}

// --------------------
// Test 9: toString method
// --------------------
function testToString() {
  console.log("\n=== TEST 9: toString method ===");
  const log4 = new Logging(
    300,
    "orders",
    "READ",
    "buyer@example.com",
    "2024-01-15T13:00:00Z",
    "Viewed order history"
  );

  const str = log4.toString();
  assert.strictEqual(typeof str, "string");
  assert.strictEqual(str.includes("orders"), true);
  assert.strictEqual(str.includes("READ"), true);
  assert.strictEqual(str.includes("buyer@example.com"), true);
  assert.strictEqual(str.includes("Viewed order history"), true);
  console.log("✅ toString works correctly");
  console.log(`   ${str}`);
}

// --------------------
// Test 10: Private fields immutability
// --------------------
function testPrivateFieldsImmutability() {
  console.log("\n=== TEST 10: Private fields immutability ===");
  const log5 = new Logging(
    400,
    "products",
    "CREATE",
    "seller@example.com",
    "2024-01-15T14:00:00Z",
    "Added new product"
  );

  // Private fields cannot be accessed directly from outside the class
  assert.strictEqual(log5.getAttribute("logId"), 400);
  assert.strictEqual(
    log5.logId,
    undefined,
    "Private field not accessible directly"
  );
  assert.strictEqual(
    log5.tableName,
    undefined,
    "Private field not accessible directly"
  );

  // Verify getAttribute still returns original value
  assert.strictEqual(log5.getAttribute("logId"), 400);
  console.log("✅ Private fields are immutable and encapsulated");
}

// --------------------
// Test 11: Invalid getAttribute
// --------------------
function testInvalidGetAttribute() {
  console.log("\n=== TEST 11: Invalid getAttribute ===");
  const log6 = new Logging(
    500,
    "users",
    "UPDATE",
    "admin@example.com",
    "2024-01-15T15:00:00Z",
    "Updated user profile"
  );

  const invalidAttr = log6.getAttribute("invalidAttribute");
  assert.strictEqual(
    invalidAttr,
    undefined,
    "Invalid attribute should return undefined"
  );
  console.log("✅ Invalid attribute returns undefined");
  console.log(`   Result: ${invalidAttr}`);
}

// --------------------
// Test 12: Round-trip JSON conversion
// --------------------
function testRoundTripJSONConversion() {
  console.log("\n=== TEST 12: Round-trip JSON conversion ===");
  const original = new Logging(
    600,
    "categories",
    "CREATE",
    "admin@example.com",
    "2024-01-15T16:00:00Z",
    "Created new category"
  );

  const jsonRepresentation = original.toJSON();
  const restored = Logging.fromJSON(jsonRepresentation);

  assert.strictEqual(
    original.getAttribute("logId"),
    restored.getAttribute("logId")
  );
  assert.strictEqual(
    original.getAttribute("tableName"),
    restored.getAttribute("tableName")
  );
  assert.strictEqual(
    original.getAttribute("operationType"),
    restored.getAttribute("operationType")
  );
  assert.strictEqual(
    original.getAttribute("performedBy"),
    restored.getAttribute("performedBy")
  );
  assert.strictEqual(
    original.getAttribute("timestamp"),
    restored.getAttribute("timestamp")
  );
  assert.strictEqual(
    original.getAttribute("description"),
    restored.getAttribute("description")
  );
  console.log("✅ Round-trip JSON conversion preserves data");
}

// --------------------
// Test 13: Empty description
// --------------------
function testEmptyDescription() {
  console.log("\n=== TEST 13: Description can be empty ===");
  const log7 = new Logging(
    700,
    "products",
    "READ",
    "buyer@example.com",
    "2024-01-15T17:00:00Z",
    ""
  );

  assert.strictEqual(log7.getAttribute("description"), "");
  console.log("✅ Empty description is allowed");
}

// --------------------
// Test 14: Multiple instances independence
// --------------------
function testMultipleInstancesIndependence() {
  console.log("\n=== TEST 14: Multiple instances independence ===");
  const logA = new Logging(
    800,
    "tableA",
    "CREATE",
    "userA@example.com",
    "2024-01-15T18:00:00Z",
    "Log A"
  );

  const logB = new Logging(
    900,
    "tableB",
    "DELETE",
    "userB@example.com",
    "2024-01-15T19:00:00Z",
    "Log B"
  );

  assert.strictEqual(logA.getAttribute("logId"), 800);
  assert.strictEqual(logB.getAttribute("logId"), 900);
  assert.strictEqual(logA.getAttribute("tableName"), "tableA");
  assert.strictEqual(logB.getAttribute("tableName"), "tableB");
  console.log("✅ Multiple instances are independent");
}

// --------------------
// RUN ALL TESTS
// --------------------
console.log("\n╔════════════════════════════════════════════╗");
console.log("║  LOGGING CLASS TEST SUITE                 ║");
console.log("╚════════════════════════════════════════════╝");

testConstructorAndBasicAttributes();
testValidOperationTypes();
testInvalidOperationType();
testEmptyTableNameValidation();
testEmptyPerformedByValidation();
testTimestampValidation();
testToJSON();
testFromJSON();
testToString();
testPrivateFieldsImmutability();
testInvalidGetAttribute();
testRoundTripJSONConversion();
testEmptyDescription();
testMultipleInstancesIndependence();

console.log("\n✅ ALL LOGGING CLASS TESTS PASSED");
