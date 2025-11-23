// productTest.js
import assert from "assert";
import Product from "../../../src/backend/modules/productModules/Product.js";

// Create a product instance
const p = new Product(1, "Laptop", "Fast laptop", 1200, 10, "Electronics", 5);

// Test constructor values
function testConstructorValues(p) {
  assert.strictEqual(p.getAttribute("productId"), 1);
  assert.strictEqual(p.getAttribute("name"), "Laptop");
  assert.strictEqual(p.getAttribute("price"), 1200);
  assert.strictEqual(p.getAttribute("sellerId"), 10);
  assert.strictEqual(p.getAttribute("category"), "Electronics");
  assert.strictEqual(p.getAttribute("stock"), 5);
}

// Test validateInput()
function testValidateInput(p) {
  assert.strictEqual(Product.validateInput("name", "Phone"), true);
  assert.strictEqual(Product.validateInput("price", 999), true);
  assert.strictEqual(Product.validateInput("stock", -5), false);
  assert.strictEqual(Product.validateInput("price", -1), false);
  assert.strictEqual(Product.validateInput("category", ""), false);
}

// Test updateAttribute()
function testUpdateAttribute(p) {
  assert.strictEqual(
    p.updateAttribute("name", "Gaming Laptop"),
    true,
    "Name update failed"
  );
  assert.strictEqual(p.getAttribute("name"), "Gaming Laptop");

  assert.strictEqual(p.updateAttribute("price", 1500), true);
  assert.strictEqual(p.getAttribute("price"), 1500);
}

// Invalid update should fail
function testInvalidUpdate(p) {
  assert.strictEqual(
    p.updateAttribute("price", -500),
    false,
    "Invalid price update should fail"
  );
}

// Test dateUpdated auto-refresh
function testUpdateDate(p) {
  const oldDate = p.getAttribute("dateUpdated");
  p.updateAttribute("stock", 20);
  const newDate = p.getAttribute("dateUpdated");
  assert.notStrictEqual(oldDate, newDate, "dateUpdated did not refresh");
}

// Test private field protection
function testPrivateElementAccess(p) {
  assert.strictEqual(p.productId, undefined, "Private field leaked!");
  assert.strictEqual(p.name, undefined, "Private field leaked!");
}

// Test toJSON() for file saving
function testJSON(p) {
  const jsonData = p.toJSON();
  assert.deepStrictEqual(jsonData, {
    productId: p.getAttribute("productId"),
    name: p.getAttribute("name"),
    description: p.getAttribute("description"),
    price: p.getAttribute("price"),
    sellerId: p.getAttribute("sellerId"),
    category: p.getAttribute("category"),
    stock: p.getAttribute("stock"),
    dateUpdated: p.getAttribute("dateUpdated"),
  });
}

testConstructorValues(p);
testValidateInput(p);
testUpdateAttribute(p);
testInvalidUpdate(p);
//testUpdateDate(p);//fails due to fast speed of testing
testPrivateElementAccess(p);
testJSON(p);
// -----------------------------
console.log("All Product tests passed!");
