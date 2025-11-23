// ReadDBTest.js

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import ProductService from "../../../src/backend/modules/productModules/ProductService.js";

// ---------------------------------------------------
// Setup file path
// ---------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Change this path to match your SQL/JSON backend file
const DB_FILE = path.resolve(__dirname, "../../storage/unimartDB.db");

// ---------------------------------------------------
// Ensure file exists
// ---------------------------------------------------
if (!fs.existsSync(DB_FILE)) {
  console.error("Database file does NOT exist:", DB_FILE);
  process.exit(1);
}

// ---------------------------------------------------
// Initialize service
// ---------------------------------------------------
const service = new ProductService(DB_FILE);

// ---------------------------------------------------
// Read and display all products
// ---------------------------------------------------
console.log("=== Reading all products from DB ===");

const products = service.getAll();

if (products.length === 0) {
  console.log("Database is empty.");
} else {
  console.table(products.map((p) => p.toJSON()));
}

console.log("=== End of DB output ===");
