import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import UserService from "../../../src/backend/modules/userModules/UserService.js";

// ---------------------------------------------------
// Pretty Print Function (based on your printOrders)
// ---------------------------------------------------
const printUsers = (users) => {
  if (!users || users.length === 0) return;

  const data = users.map((u) =>
    typeof u.toJSON === "function" ? u.toJSON() : u
  );

  const keys = Object.keys(data[0]);
  const mid = Math.ceil(keys.length / 2);

  const A = keys.slice(0, mid);
  const B = keys.slice(mid);

  const t1 = data.map((x) => {
    const obj = {};
    A.forEach((k) => (obj[k] = x[k]));
    return obj;
  });

  const t2 = data.map((x) => {
    const obj = {};
    B.forEach((k) => (obj[k] = x[k]));
    return obj;
  });

  console.table(t1);
  console.table(t2);
};

// ---------------------------------------------------
// Setup file path
// ---------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Optional: direct DB path for testing
const DB_FILE = path.resolve(__dirname, "../../storage/unimartDB.db");

if (!fs.existsSync(DB_FILE)) {
  console.error("Database file does NOT exist:", DB_FILE);
  // process.exit(1);  // optional: do not exit if using UserService default path
}

// ---------------------------------------------------
// Initialize service
// ---------------------------------------------------
const service = new UserService();
// OR: const service = new UserService(DB_FILE);

// ---------------------------------------------------
// Read and display users with pretty formatting
// ---------------------------------------------------
console.log("=== Reading all users from DB ===");

const users = service.getAll();

if (users.length === 0) {
  console.log("Database is empty.");
} else {
  printUsers(users);
}

console.log("=== End of DB output ===");
