// ProductSQLRepository.js
import Database from "better-sqlite3";
import Product from "../Product.js";
import ProductFactory from "../ProductFactory.js";
//import abstract repo class
import ProductRepository from "./ProductRepository.js";

class ProductSQLRepository extends ProductRepository {
  constructor(dbPath) {
    super(dbPath);
    this.db = new Database(dbPath);

    this.initializeTable();
    //this.initializeSampleRows();
  }

  initializeTable() {
    this.db
      .prepare(
        `
      CREATE TABLE IF NOT EXISTS products (
        productId INTEGER PRIMARY KEY,
        name TEXT,
        description TEXT,
        price REAL,
        sellerId INTEGER,
        category TEXT,
        stock INTEGER,
        dateUpdated TEXT
      )
    `
      )
      .run();
  }

  initializeSampleRows() {
    const count = this.db.prepare("SELECT COUNT(*) AS c FROM products").get().c;

    if (count === 0) {
      const sample = [
        ProductFactory.makeSampleProduct(1),
        ProductFactory.makeSampleProduct(2),
        ProductFactory.makeSampleProduct(3),
      ];

      const insert = this.db.prepare(`
        INSERT INTO products (productId, name, description, price, sellerId, category, stock, dateUpdated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const p of sample) {
        const obj = p.toJSON();
        insert.run(
          obj.productId,
          obj.name,
          obj.description,
          obj.price,
          obj.sellerId,
          obj.category,
          obj.stock,
          obj.dateUpdated
        );
      }
    }
  }

  load() {
    const rows = this.db.prepare("SELECT * FROM products").all();
    return rows.map((r) => Product.fromJSON(r));
  }

  save(products) {
    const deleteAll = this.db.prepare("DELETE FROM products");
    const insert = this.db.prepare(`
      INSERT INTO products
      (productId, name, description, price, sellerId, category, stock, dateUpdated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const tx = this.db.transaction((list) => {
      deleteAll.run();
      for (const p of list) {
        const obj = p.toJSON();
        insert.run(
          obj.productId,
          obj.name,
          obj.description,
          obj.price,
          obj.sellerId,
          obj.category,
          obj.stock,
          obj.dateUpdated
        );
      }
    });

    try {
      tx(products);
      return true;
    } catch {
      return false;
    }
  }

  addProduct(product) {
    const obj = product.toJSON();
    const insert = this.db.prepare(`
      INSERT INTO products (productId, name, description, price, sellerId, category, stock, dateUpdated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      insert.run(
        obj.productId,
        obj.name,
        obj.description,
        obj.price,
        obj.sellerId,
        obj.category,
        obj.stock,
        obj.dateUpdated
      );
      return product;
    } catch {
      return null;
    }
  }

  deleteProduct(id) {
    const stmt = this.db.prepare("DELETE FROM products WHERE productId = ?");
    return stmt.run(id).changes > 0;
  }

  changeAttribute(id, attributeName, newValue) {
    const products = this.load();
    const p = products.find((x) => x.getAttribute("productId") === id);
    if (!p) return null;

    const updated = p.updateAttribute(attributeName, newValue);
    if (!updated) return null;

    return this.save(products) ? p : null;
  }

  eraseAll() {
    try {
      this.db.prepare("DELETE FROM products").run();
      return true;
    } catch {
      return false;
    }
  }
}

export default ProductSQLRepository;
