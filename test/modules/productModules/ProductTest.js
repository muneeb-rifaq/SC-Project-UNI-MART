import assert from "assert";
import Product from "../../../src/backend/modules/productModules/Product.js";

// Create a product instance including sellerId and categoryId
const p = new Product(1, 10, "Laptop", "Fast laptop", 1200, 5, 2);
// params: productId, sellerId, name, description, price, stock, categoryId

// -----------------------------
// Test constructor values
// -----------------------------
function testConstructorValues(p) {
  console.log("=== START: testConstructorValues ===");

  assert.strictEqual(p.getAttribute("productId"), 1, "productId mismatch");
  assert.strictEqual(p.getAttribute("name"), "Laptop", "name mismatch");
  assert.strictEqual(
    p.getAttribute("description"),
    "Fast laptop",
    "description mismatch"
  );
  assert.strictEqual(p.getAttribute("price"), 1200, "price mismatch");
  assert.strictEqual(p.getAttribute("sellerId"), 10, "sellerId mismatch");
  assert.strictEqual(p.getAttribute("stock"), 5, "stock mismatch");
  assert.strictEqual(p.getAttribute("categoryId"), 2, "categoryId mismatch");

  console.log("=== END: testConstructorValues ===\n");
}

// -----------------------------
// Test validateInput()
// -----------------------------
function testValidateInput(p) {
  console.log("=== START: testValidateInput ===");

  assert.strictEqual(
    Product.validateInput("name", "Phone"),
    true,
    "name validation failed"
  );
  assert.strictEqual(
    Product.validateInput("price", 999),
    true,
    "price validation failed"
  );
  assert.strictEqual(
    Product.validateInput("stock", -5),
    false,
    "stock negative validation failed"
  );
  assert.strictEqual(
    Product.validateInput("price", -1),
    false,
    "price negative validation failed"
  );
  assert.strictEqual(
    Product.validateInput("sellerId", 0),
    false,
    "sellerId zero validation failed"
  );
  assert.strictEqual(
    Product.validateInput("sellerId", 5),
    true,
    "sellerId valid validation failed"
  );
  assert.strictEqual(
    Product.validateInput("categoryId", 0),
    false,
    "categoryId zero validation failed"
  );
  assert.strictEqual(
    Product.validateInput("categoryId", 3),
    true,
    "categoryId valid validation failed"
  );

  console.log("=== END: testValidateInput ===\n");
}

// -----------------------------
// Test updateAttribute()
// -----------------------------
function testUpdateAttribute(p) {
  console.log("=== START: testUpdateAttribute ===");

  assert.strictEqual(
    p.updateAttribute("name", "Gaming Laptop"),
    true,
    "update name failed"
  );
  assert.strictEqual(
    p.getAttribute("name"),
    "Gaming Laptop",
    "name not updated"
  );

  assert.strictEqual(
    p.updateAttribute("price", 1500),
    true,
    "update price failed"
  );
  assert.strictEqual(p.getAttribute("price"), 1500, "price not updated");

  assert.strictEqual(
    p.updateAttribute("sellerId", 20),
    false,
    "sellerId should not update"
  );
  assert.strictEqual(
    p.getAttribute("sellerId"),
    10,
    "sellerId changed incorrectly"
  );

  assert.strictEqual(
    p.updateAttribute("categoryId", 5),
    true,
    "update categoryId failed"
  );
  assert.strictEqual(p.getAttribute("categoryId"), 5, "categoryId not updated");

  console.log("=== END: testUpdateAttribute ===\n");
}

// -----------------------------
// Invalid update should fail
// -----------------------------
function testInvalidUpdate(p) {
  console.log("=== START: testInvalidUpdate ===");

  assert.strictEqual(
    p.updateAttribute("price", -500),
    false,
    "negative price should fail"
  );
  assert.strictEqual(
    p.updateAttribute("sellerId", -10),
    false,
    "negative sellerId should fail"
  );
  assert.strictEqual(
    p.updateAttribute("productId", 999),
    false,
    "productId should not change"
  );
  assert.strictEqual(
    p.updateAttribute("categoryId", 0),
    false,
    "invalid categoryId should fail"
  );

  console.log("=== END: testInvalidUpdate ===\n");
}

// -----------------------------
// Test dateUpdated auto-refresh
// -----------------------------
function testUpdateDate(p) {
  console.log("=== START: testUpdateDate ===");

  const oldDate = p.getAttribute("dateUpdated");
  p.updateAttribute("stock", 20);
  const newDate = p.getAttribute("dateUpdated");
  assert.notStrictEqual(oldDate, newDate, "dateUpdated did not refresh");

  console.log("=== END: testUpdateDate ===\n");
}

// -----------------------------
// Test private field protection
// -----------------------------
function testPrivateElementAccess(p) {
  console.log("=== START: testPrivateElementAccess ===");

  assert.strictEqual(p.productId, undefined, "Private field productId leaked!");
  assert.strictEqual(p.name, undefined, "Private field name leaked!");
  assert.strictEqual(p.sellerId, undefined, "Private field sellerId leaked!");
  assert.strictEqual(
    p.categoryId,
    undefined,
    "Private field categoryId leaked!"
  );

  console.log("=== END: testPrivateElementAccess ===\n");
}

// -----------------------------
// Test toJSON() for file saving
// -----------------------------
function testJSON(p) {
  console.log("=== START: testJSON ===");

  const jsonData = p.toJSON();
  assert.deepStrictEqual(
    jsonData,
    {
      productId: p.getAttribute("productId"),
      name: p.getAttribute("name"),
      description: p.getAttribute("description"),
      price: p.getAttribute("price"),
      sellerId: p.getAttribute("sellerId"),
      stock: p.getAttribute("stock"),
      categoryId: p.getAttribute("categoryId"),
      dateUpdated: p.getAttribute("dateUpdated"),
    },
    "toJSON output mismatch"
  );

  console.log("=== END: testJSON ===\n");
}

// -----------------------------
// Run all tests
// -----------------------------
testConstructorValues(p);
testValidateInput(p);
testUpdateAttribute(p);
testInvalidUpdate(p);
testUpdateDate(p);
testPrivateElementAccess(p);
testJSON(p);

console.log("All Product tests passed!");
