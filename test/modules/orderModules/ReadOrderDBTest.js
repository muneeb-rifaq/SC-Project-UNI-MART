// ReadOrderDBTest.js

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import OrderService from "../../../src/backend/modules/orderModules/OrderService.js";

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
// IMPORTANT: keep the SAME relative path format you used originally
// const service = new OrderService("../../storage/unimartDB.db");
const service = new OrderService();

// ---------------------------------------------------
// Read and display all orders
// ---------------------------------------------------
console.log("=== Reading all orders from DB ===");

const orders = service.getAll();

if (orders.length === 0) {
  console.log("Order table is empty.");
} else {
  console.table(orders.map((o) => o.toJSON()));
}

console.log("=== End of DB output ===");
