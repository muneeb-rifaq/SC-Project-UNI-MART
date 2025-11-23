//ProductJSONServiceTest
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import ProductFactory from "../../src/backend/modules/productModules/ProductFactory.js";
import ProductService from "../../src/backend/modules/productModules/ProductService.js";

// ----------------------------------------
// Setup test file path
// ----------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_FILE = path.resolve(__dirname, "products_test.db");

// Remove test file if it exists for a clean start
if (fs.existsSync(TEST_FILE)) fs.unlinkSync(TEST_FILE);

// ----------------------------------------
// Initialize ProductService
// ----------------------------------------
const service = new ProductService(TEST_FILE);

// ----------------------------------------
// 1. Add sample products
// ----------------------------------------
const p1 = ProductFactory.makeSampleProduct(101);
const p2 = ProductFactory.makeSampleProduct(102);
const p3 = ProductFactory.makeSampleProduct(103);

service.addProduct(p1);
service.addProduct(p2);
service.addProduct(p3);

console.log("=== All Products After Adding ===");
console.table(service.getAll().map((p) => p.toJSON()));

// ----------------------------------------
// 2. Change attribute
// ----------------------------------------
console.log("\n=== Update price of product 101 ===");
const updatedP1 = service.changeAttribute(101, "price", 999);
if (updatedP1) console.log(updatedP1.toJSON());
else console.log("Update failed");

// ----------------------------------------
// 3. Find by attribute
// ----------------------------------------
console.log("\n=== Find products with category matching p2 ===");
const filtered = service.findByAttribute(
  "category",
  p2.getAttribute("category")
);
console.table(filtered.map((p) => p.toJSON()));

// ----------------------------------------
// 4. Delete a product
// ----------------------------------------
console.log("\n=== Delete product 102 ===");
service.deleteProduct(102);
console.table(service.getAll().map((p) => p.toJSON()));

// ----------------------------------------
// 5. Try invalid attribute update
// ----------------------------------------
console.log("\n=== Try invalid update on product 103 ===");
const invalidUpdate = service.changeAttribute(103, "price", -50);
console.log(
  invalidUpdate === null ? "Invalid update prevented" : invalidUpdate.toJSON()
);

// ----------------------------------------
// 6. Erase all products
// ----------------------------------------
console.log("\n=== Erase all products ===");
service.eraseAll();
console.table(service.getAll().map((p) => p.toJSON()));
console.log("All products erased");
