// ReadUserDBTest.js

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import UserService from "../../../src/backend/modules/userModules/UserService.js"; // make sure this exists

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
const service = new UserService(DB_FILE);

// ---------------------------------------------------
// Read and display all users
// ---------------------------------------------------
console.log("=== Reading all users from DB ===");

const users = service.getAll();

if (users.length === 0) {
  console.log("Database is empty.");
} else {
  console.table(users.map((u) => u.toJSON()));
}

console.log("=== End of DB output ===");
