// UserSQLRepository.js
import Database from "better-sqlite3";
import User from "../User.js";
import UserRepository from "./UserRepository.js";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  userId INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  email TEXT UNIQUE,
  passwordHash TEXT,
  role TEXT,
  createdAt TEXT,
  updatedAt TEXT,
  lastLogin TEXT
);
`;

class UserSQLRepository extends UserRepository {
  constructor(dbPath) {
    super(dbPath);
    this.db = new Database(dbPath);

    // Ensure table exists
    this.db.prepare(SCHEMA).run();

    // Prepared statements
    this._selectAllStmt = this.db.prepare("SELECT * FROM users");
    this._selectByIdStmt = this.db.prepare(
      "SELECT * FROM users WHERE userId = ?"
    );
    this._deleteStmt = this.db.prepare("DELETE FROM users WHERE userId = ?");
  }

  // Load all users (returns array of User instances)
  load() {
    const rows = this._selectAllStmt.all();
    return rows.map((r) => User.fromJSON(r));
  }

  // Add a single user, userId auto-generated
  addUser(user) {
    const obj = user.toJSON();

    try {
      const stmt = this.db.prepare(
        `INSERT INTO users (username, email, passwordHash, role, createdAt, updatedAt, lastLogin)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
      );

      if (user.getAttribute("userId") != this.getHighestID() + 1) {
        throw new Error(
          "UserSQLRepository.addUser: userId is incorrectly set. It should be omitted or set to next available ID."
        );
      }

      const result = stmt.run(
        obj.username,
        obj.email,
        obj.passwordHash,
        obj.role,
        obj.createdAt,
        obj.updatedAt,
        obj.lastLogin
      );

      // Create a new immutable User instance with the auto-generated ID
      const newUser = User.fromJSON({ ...obj, userId: result.lastInsertRowid });
      return newUser;
    } catch (err) {
      console.error("UserSQLRepository.addUser error:", err.message);
      return null;
    }
  }

  // Delete user by ID -> returns boolean
  deleteUser(id) {
    try {
      const result = this._deleteStmt.run(id);
      return result.changes > 0;
    } catch (err) {
      console.error("UserSQLRepository.deleteUser error:", err);
      return false;
    }
  }

  // Change attribute safely -> returns updated User instance or null
  updateAttribute(id, attributeName, newValue) {
    const allowed = new Set([
      "username",
      "email",
      "passwordHash",
      "role",
      "lastLogin",
    ]);

    console.log(
      `🔍 UserSQLRepository.updateAttribute: id=${id}, attr="${attributeName}", value="${newValue}"`
    );

    if (!allowed.has(attributeName)) {
      console.warn(
        `⚠️ UserSQLRepository.updateAttribute: attribute "${attributeName}" not in allowed set:`,
        Array.from(allowed)
      );
      return null;
    }

    try {
      const updatedAt = new Date().toISOString();
      const sql = `UPDATE users SET ${attributeName} = ?, updatedAt = ? WHERE userId = ?`;
      console.log(
        `🔍 Executing SQL: ${sql} with values [${newValue}, ${updatedAt}, ${id}]`
      );
      const stmt = this.db.prepare(sql);
      const result = stmt.run(newValue, updatedAt, id);
      console.log(`🔍 Update result: changes=${result.changes}`);

      if (result.changes === 0) {
        console.warn(`⚠️ No rows updated for user ${id}`);
        return null;
      }

      const row = this._selectByIdStmt.get(id);
      console.log(`✅ User ${id} updated successfully`);
      return row ? User.fromJSON(row) : null;
    } catch (err) {
      console.error("❌ UserSQLRepository.updateAttribute error:", err);
      console.error("   Error details:", err.message);
      console.error("   Stack:", err.stack);
      return null;
    }
  }

  // Erase all users
  eraseAll() {
    try {
      this.db.prepare("DELETE FROM users").run();
      return true;
    } catch (err) {
      console.error("UserSQLRepository.eraseAll error:", err);
      return false;
    }
  }

  // Returns the last auto-generated userId, or 0 if table is empty
  getHighestID() {
    const row = this.db
      .prepare("SELECT seq FROM sqlite_sequence WHERE name = 'users'")
      .get();
    return row?.seq || 0; // use seq, not maxId
  }
}

export default UserSQLRepository;
