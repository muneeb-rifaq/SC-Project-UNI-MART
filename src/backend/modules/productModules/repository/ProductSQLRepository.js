// ProductSQLRepository.js
import Database from "better-sqlite3";
import Product from "../Product.js";
import ProductRepository from "./ProductRepository.js";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS products (
  productId     INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT,
  description   TEXT,
  price         REAL,
  stock         INTEGER,
  sellerId      INTEGER,
  categoryId    INTEGER,      -- NEW
  dateUpdated   TEXT
);
`;

class ProductSQLRepository extends ProductRepository {
  constructor(dbPath) {
    super(dbPath);
    this.db = new Database(dbPath);

    // Create table if missing
    this.db.prepare(SCHEMA).run();

    // Prepared statements
    this._selectAllStmt = this.db.prepare("SELECT * FROM products");
    this._selectByIdStmt = this.db.prepare(
      "SELECT * FROM products WHERE productId = ?"
    );
    this._deleteStmt = this.db.prepare(
      "DELETE FROM products WHERE productId = ?"
    );
  }

  load() {
    const rows = this._selectAllStmt.all();
    return rows.map((r) => Product.fromJSON(r));
  }

  addProduct(product) {
    const obj = product.toJSON();

    try {
      const stmt = this.db.prepare(
        `INSERT INTO products (
           name, description, price, stock, sellerId, categoryId, dateUpdated
         ) VALUES (?, ?, ?, ?, ?, ?, ?)`
      );

      const result = stmt.run(
        obj.name,
        obj.description,
        obj.price,
        obj.stock,
        obj.sellerId,
        obj.categoryId, // NEW
        obj.dateUpdated
      );

      return Product.fromJSON({
        ...obj,
        productId: result.lastInsertRowid,
      });
    } catch (err) {
      console.error("ProductSQLRepository.addProduct error:", err);
      return null;
    }
  }

  deleteProduct(id) {
    try {
      const result = this._deleteStmt.run(id);
      return result.changes > 0;
    } catch (err) {
      console.error("ProductSQLRepository.deleteProduct error:", err);
      return false;
    }
  }

  updateAttribute(id, attributeName, newValue) {
    const allowed = new Set([
      "name",
      "description",
      "price",
      "stock",
      "categoryId", // NEW — allow updating category
      "dateUpdated",
    ]);

    if (!allowed.has(attributeName)) {
      console.warn(
        `ProductSQLRepository.updateAttribute: attribute "${attributeName}" not allowed.`
      );
      return null;
    }

    try {
      const now = new Date().toISOString();

      const sql = `UPDATE products
                   SET ${attributeName} = ?, dateUpdated = ?
                   WHERE productId = ?`;

      const stmt = this.db.prepare(sql);
      const result = stmt.run(newValue, now, id);

      if (result.changes === 0) return null;

      const row = this._selectByIdStmt.get(id);
      return row ? Product.fromJSON(row) : null;
    } catch (err) {
      console.error("ProductSQLRepository.updateAttribute error:", err);
      return null;
    }
  }

  eraseAll() {
    try {
      this.db.prepare("DELETE FROM products").run();
      return true;
    } catch (err) {
      console.error("ProductSQLRepository.eraseAll error:", err);
      return false;
    }
  }

  getHighestID() {
    const row = this.db
      .prepare("SELECT seq FROM sqlite_sequence WHERE name = 'products'")
      .get();
    return row?.seq || 0;
  }
}

export default ProductSQLRepository;
