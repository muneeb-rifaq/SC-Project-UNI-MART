// backend/utils/printDB.js
import Database from "better-sqlite3";
import path from "path";

// Path must match your DBHandler.DB_PATH output structure
const DB_PATH = path.join("../storage/DBStorage", "unimartDB.db");

// ---------------------------------------------
// Helper: Split console.table into two halves
// ---------------------------------------------
const printSplitTable = (rows, title = "") => {
  if (title) console.log("\n==== " + title + " ====");

  if (!rows || rows.length === 0) {
    console.log("No data.\n");
    return;
  }

  // Support raw objects or class instances with toJSON()
  const normalized = rows.map((r) =>
    typeof r.toJSON === "function" ? r.toJSON() : r
  );

  const keys = Object.keys(normalized[0]);
  const mid = Math.ceil(keys.length / 2);

  const firstHalfKeys = keys.slice(0, mid);
  const secondHalfKeys = keys.slice(mid);

  const firstHalf = normalized.map((row) => {
    const obj = {};
    for (const k of firstHalfKeys) obj[k] = row[k];
    return obj;
  });

  const secondHalf = normalized.map((row) => {
    const obj = {};
    for (const k of secondHalfKeys) obj[k] = row[k];
    return obj;
  });

  console.table(firstHalf);
  console.table(secondHalf);
};

// ---------------------------------------------
// Main: Read every table
// ---------------------------------------------
const printAllTables = () => {
  console.log("📦 Opening database:", DB_PATH);

  const db = new Database(DB_PATH);

  const tables = ["users", "products", "orders", "categories"];

  for (const table of tables) {
    console.log("\n---------------------------------------");
    console.log(`🔍 Reading table: ${table}`);

    try {
      const rows = db.prepare(`SELECT * FROM ${table}`).all();
      printSplitTable(rows, table);
    } catch (err) {
      console.log(`❌ Error reading table '${table}':`, err.message);
    }
  }

  console.log("\n✔ Finished printing all tables.\n");
};

// Run if executed directly
printAllTables();
