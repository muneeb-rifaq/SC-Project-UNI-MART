import Database from "better-sqlite3";
import Category from "../Category.js";
import CategoryRepository from "./CategoryRepository.js";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS categories (
  categoryId   INTEGER PRIMARY KEY AUTOINCREMENT,
  categoryName TEXT,
  description  TEXT,
  dateCreated  TEXT
);
`;

class CategorySQLRepository extends CategoryRepository {
  constructor(dbPath) {
    super(dbPath);
    this.db = new Database(dbPath);

    // create table
    this.db.prepare(SCHEMA).run();

    // prepared statements
    this._selectAllStmt = this.db.prepare("SELECT * FROM categories");
    this._selectByIdStmt = this.db.prepare(
      "SELECT * FROM categories WHERE categoryId = ?"
    );
    this._deleteStmt = this.db.prepare(
      "DELETE FROM categories WHERE categoryId = ?"
    );
  }

  load() {
    const rows = this._selectAllStmt.all();
    return rows.map((r) => Category.fromJSON(r));
  }

  addCategory(category) {
    const obj = category.toJSON();
    try {
      const stmt = this.db.prepare(
        `INSERT INTO categories (categoryName, description, dateCreated)
         VALUES (?, ?, ?)`
      );
      const result = stmt.run(
        obj.categoryName,
        obj.description,
        obj.dateCreated
      );

      return Category.fromJSON({ ...obj, categoryId: result.lastInsertRowid });
    } catch (err) {
      console.error("CategorySQLRepository.addCategory error:", err);
      return null;
    }
  }

  deleteCategory(id) {
    try {
      const result = this._deleteStmt.run(id);
      return result.changes > 0;
    } catch (err) {
      console.error("CategorySQLRepository.deleteCategory error:", err);
      return false;
    }
  }

  updateAttribute(id, attr, value) {
    const allowed = new Set(["categoryName", "description"]);

    console.log(
      `🔍 CategorySQLRepository.updateAttribute: id=${id}, attr="${attr}", value="${value}"`
    );

    if (!allowed.has(attr)) {
      console.warn(
        `⚠️ CategorySQLRepository: attribute "${attr}" not in allowed set:`,
        Array.from(allowed)
      );
      return null;
    }

    try {
      const sql = `UPDATE categories SET ${attr} = ? WHERE categoryId = ?`;
      console.log(`🔍 Executing SQL: ${sql} with values [${value}, ${id}]`);
      const stmt = this.db.prepare(sql);
      const result = stmt.run(value, id);
      console.log(`🔍 Update result: changes=${result.changes}`);

      if (result.changes === 0) {
        console.warn(`⚠️ No rows updated for category ${id}`);
        return null;
      }

      const row = this._selectByIdStmt.get(id);
      console.log(`✅ Category ${id} updated successfully`);
      return row ? Category.fromJSON(row) : null;
    } catch (err) {
      console.error("❌ CategorySQLRepository.updateAttribute error:", err);
      return null;
    }
  }

  eraseAll() {
    try {
      this.db.prepare("DELETE FROM categories").run();
      return true;
    } catch (err) {
      console.error("CategorySQLRepository.eraseAll error:", err);
      return false;
    }
  }

  getHighestID() {
    const row = this.db
      .prepare("SELECT seq FROM sqlite_sequence WHERE name='categories'")
      .get();
    return row?.seq || 0;
  }
}

export default CategorySQLRepository;
