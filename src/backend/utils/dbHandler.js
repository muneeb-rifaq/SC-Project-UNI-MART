// dbHandler.js
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DBHandler {
  static STORAGE_FOLDER = path.resolve(__dirname, "../storage/DBStorage");
  static DB_NAME = "unimartDB.db";
  static DB_PATH = path.join(DBHandler.STORAGE_FOLDER, DBHandler.DB_NAME);

  // Create table SQL definitions
  static TABLE_SCHEMAS = {
    products: `
      CREATE TABLE IF NOT EXISTS products (
        productId     INTEGER PRIMARY KEY AUTOINCREMENT,
        name          TEXT,
        description   TEXT,
        price         REAL,
        stock         INTEGER,
        sellerId      INTEGER,
        categoryId    INTEGER,
        dateUpdated   TEXT
      );
    `,
    users: `
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
    `,
    orders: `
      CREATE TABLE IF NOT EXISTS orders (
        orderId INTEGER PRIMARY KEY AUTOINCREMENT,
        product TEXT,
        buyerId INTEGER,
        sellerId INTEGER,
        dateCreated TEXT,
        status TEXT,
        volume INTEGER,
        totalCost REAL
      );
    `,
    categories: `
      CREATE TABLE IF NOT EXISTS categories (
        categoryId   INTEGER PRIMARY KEY AUTOINCREMENT,
        categoryName TEXT,
        description  TEXT,
        dateCreated  TEXT
      );
    `,
  };

  // Expected column lists for strict checking
  static EXPECTED_COLUMNS = {
    products: [
      "productId",
      "name",
      "description",
      "price",
      "stock",
      "sellerId",
      "categoryId",
      "dateUpdated",
    ],
    users: [
      "userId",
      "username",
      "email",
      "passwordHash",
      "role",
      "createdAt",
      "updatedAt",
      "lastLogin",
    ],
    orders: [
      "orderId",
      "product",
      "buyerId",
      "sellerId",
      "dateCreated",
      "status",
      "volume",
      "totalCost",
    ],
    categories: ["categoryId", "categoryName", "description", "dateCreated"],
  };

  // ----------------------------------------------------
  // MAIN ENTRY POINT — CALLED ON SERVER START
  // ----------------------------------------------------
  static initialize() {
    try {
      console.log("🔍 Initializing database...");

      DBHandler.ensureStorageFolder();
      DBHandler.ensureDatabaseFile();
      const db = new Database(DBHandler.DB_PATH);

      DBHandler.validateSchemas(db);

      console.log("✅ Database ready.\n");
    } catch (err) {
      console.error("❌ Database initialization failed:");
      console.error(err);
      throw err; // STOP SERVER STARTUP
    }
  }

  // ----------------------------------------------------
  // Ensure storage folder
  // ----------------------------------------------------
  static ensureStorageFolder() {
    if (!fs.existsSync(DBHandler.STORAGE_FOLDER)) {
      fs.mkdirSync(DBHandler.STORAGE_FOLDER, { recursive: true });
    }
  }

  // ----------------------------------------------------
  // Ensure DB file
  // ----------------------------------------------------
  static ensureDatabaseFile() {
    if (!fs.existsSync(DBHandler.DB_PATH)) {
      fs.writeFileSync(DBHandler.DB_PATH, "");
    }
  }

  // ----------------------------------------------------
  // Validate table schemas
  // ----------------------------------------------------
  static validateSchemas(db) {
    for (const [tableName, createSQL] of Object.entries(
      DBHandler.TABLE_SCHEMAS
    )) {
      console.log(`\n🔎 Checking table: ${tableName}`);

      const tableExists = DBHandler.tableExists(db, tableName);

      if (!tableExists) {
        console.log(`⚠️ Table missing → Creating ${tableName}`);
        db.prepare(createSQL).run();
        continue;
      }

      // strict column checking
      const valid = DBHandler.validateColumns(db, tableName);

      if (!valid) {
        console.log(`❌ Schema mismatch → Rebuilding table ${tableName}`);

        db.prepare(`DROP TABLE IF EXISTS ${tableName}`).run();
        db.prepare(createSQL).run();
      } else {
        console.log(`✅ Table OK: ${tableName}`);
      }
    }
  }

  // ----------------------------------------------------
  // Check if table exists
  // ----------------------------------------------------
  static tableExists(db, tableName) {
    const row = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?;`)
      .get(tableName);

    return !!row;
  }

  // ----------------------------------------------------
  // Validate table columns strictly
  // ----------------------------------------------------
  static validateColumns(db, tableName) {
    const expected = DBHandler.EXPECTED_COLUMNS[tableName];

    const pragma = db.prepare(`PRAGMA table_info(${tableName});`).all();
    const actualColumns = pragma.map((col) => col.name);

    if (actualColumns.length !== expected.length) return false;

    for (const col of expected) {
      if (!actualColumns.includes(col)) return false;
    }

    return true;
  }
}

export default DBHandler;

DBHandler.initialize();
