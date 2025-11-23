// UserJSONServiceTest.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import UserFactory from "../../../src/backend/modules/userModules/UserFactory.js";
import UserService from "../../../src/backend/modules/userModules/UserService.js";

// ----------------------------------------
// Setup test file path
// ----------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_FILE = path.resolve(__dirname, "../../storage/unimartDB.db");

// Remove test file if it exists for a clean start
if (fs.existsSync(TEST_FILE)) fs.unlinkSync(TEST_FILE);

// ----------------------------------------
// Initialize UserService
// ----------------------------------------
const service = new UserService(TEST_FILE);

// ----------------------------------------
// 1. Add sample users
// ----------------------------------------
const u1 = UserFactory.makeSampleUser(101);
const u2 = UserFactory.makeSampleUser(102);
const u3 = UserFactory.makeSampleUser(103);

service.addUser(u1);
service.addUser(u2);
service.addUser(u3);

console.log("=== All Users After Adding ===");
console.table(service.getAll().map((u) => u.toJSON()));

// ----------------------------------------
// 2. Change attribute
// ----------------------------------------
console.log("\n=== Update email of user 101 ===");
const updatedU1 = service.changeAttribute(
  101,
  "email",
  "updated101@example.com"
);
if (updatedU1) console.log(updatedU1.toJSON());
else console.log("Update failed");

// ----------------------------------------
// 3. Find by attribute
// ----------------------------------------
console.log("\n=== Find users with role matching u2 ===");
const filtered = service.findByAttribute("role", u2.getAttribute("role"));
console.table(filtered.map((u) => u.toJSON()));

// ----------------------------------------
// 4. Delete a user
// ----------------------------------------
console.log("\n=== Delete user 102 ===");
service.deleteUser(102);
console.table(service.getAll().map((u) => u.toJSON()));

// ----------------------------------------
// 5. Try invalid attribute update
// ----------------------------------------
console.log("\n=== Try invalid update on user 103 ===");
const invalidUpdate = service.changeAttribute(103, "userId", -50);
console.log(
  invalidUpdate === null ? "Invalid update prevented" : invalidUpdate.toJSON()
);

// ----------------------------------------
// 6. Erase all users
// ----------------------------------------
// console.log("\n=== Erase all users ===");
// service.eraseAll();
// console.table(service.getAll().map((u) => u.toJSON()));
// console.log("All users erased");
