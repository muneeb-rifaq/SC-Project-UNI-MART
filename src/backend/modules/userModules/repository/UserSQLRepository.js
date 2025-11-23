// UserSQLRepository.js
import Database from "better-sqlite3";
import User from "../User.js";
import UserFactory from "../UserFactory.js";
import UserRepository from "./UserRepository.js";

class UserSQLRepository extends UserRepository {
  constructor(dbPath) {
    super(dbPath);
    this.db = new Database(dbPath);

    this.initializeTable();
    // this.initializeSampleRows();
  }

  initializeTable() {
    this.db
      .prepare(
        `
      CREATE TABLE IF NOT EXISTS users (
        userId INTEGER PRIMARY KEY,
        username TEXT,
        email TEXT,
        passwordHash TEXT,
        role TEXT,
        lastLogin TEXT
      )
    `
      )
      .run();
  }

  initializeSampleRows() {
    const count = this.db.prepare("SELECT COUNT(*) AS c FROM users").get().c;

    if (count === 0) {
      const sample = [
        UserFactory.makeSampleUser(1),
        UserFactory.makeSampleUser(2),
        UserFactory.makeSampleUser(3),
      ];

      const insert = this.db.prepare(`
        INSERT INTO users (userId, username, email, passwordHash, role, lastLogin)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const u of sample) {
        const obj = u.toJSON();
        insert.run(
          obj.userId,
          obj.username,
          obj.email,
          obj.passwordHash,
          obj.role,
          obj.lastLogin
        );
      }
    }
  }

  load() {
    const rows = this.db.prepare("SELECT * FROM users").all();
    return rows.map((r) => User.fromJSON(r));
  }

  save(users) {
    const deleteAll = this.db.prepare("DELETE FROM users");
    const insert = this.db.prepare(`
      INSERT INTO users (userId, username, email, passwordHash, role, lastLogin)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const tx = this.db.transaction((list) => {
      deleteAll.run();
      for (const u of list) {
        const obj = u.toJSON();
        insert.run(
          obj.userId,
          obj.username,
          obj.email,
          obj.passwordHash,
          obj.role,
          obj.lastLogin
        );
      }
    });

    try {
      tx(users);
      return true;
    } catch {
      return false;
    }
  }

  addUser(user) {
    const obj = user.toJSON();
    const insert = this.db.prepare(`
      INSERT INTO users (userId, username, email, passwordHash, role, lastLogin)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    try {
      insert.run(
        obj.userId,
        obj.username,
        obj.email,
        obj.passwordHash,
        obj.role,
        obj.lastLogin
      );
      return user;
    } catch {
      return null;
    }
  }

  deleteUser(id) {
    const stmt = this.db.prepare("DELETE FROM users WHERE userId = ?");
    return stmt.run(id).changes > 0;
  }

  changeAttribute(id, attributeName, newValue) {
    const users = this.load();
    const u = users.find((x) => x.getAttribute("userId") === id);
    if (!u) return null;

    const updated = u.updateAttribute(attributeName, newValue);
    if (!updated) return null;

    return this.save(users) ? u : null;
  }

  eraseAll() {
    try {
      this.db.prepare("DELETE FROM users").run();
      return true;
    } catch {
      return false;
    }
  }
}

export default UserSQLRepository;
