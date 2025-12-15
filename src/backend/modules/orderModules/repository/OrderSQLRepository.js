// src/backend/modules/orderModules/repository/OrderSQLRepository.js
import Database from "better-sqlite3";
import Order from "../Order.js";
import OrderRepository from "./OrderRepository.js";

const SCHEMA = `
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
`;

class OrderSQLRepository extends OrderRepository {
  constructor(dbPath) {
    super(dbPath);
    this.db = new Database(dbPath);

    // create table
    this.db.prepare(SCHEMA).run();

    // prepared statements
    this._selectAllStmt = this.db.prepare("SELECT * FROM orders");
    this._selectByIdStmt = this.db.prepare(
      "SELECT * FROM orders WHERE orderId = ?"
    );
    this._deleteStmt = this.db.prepare("DELETE FROM orders WHERE orderId = ?");
  }

  load() {
    const rows = this._selectAllStmt.all();
    return rows.map((r) => Order.fromJSON(r));
  }

  addOrder(orderInstance) {
    const obj = orderInstance.toJSON();

    try {
      // Ensure caller gave expected orderId (should equal getHighestID()+1) OR allow 0/undefined
      const expected = this.getHighestID() + 1;
      const given = obj.orderId;
      if (given !== expected) {
        // caller must set orderId to next available
        throw new Error(
          `OrderSQLRepository.addOrder: orderId must be ${expected} (got ${given}).`
        );
      }

      const stmt = this.db.prepare(
        `INSERT INTO orders (product, buyerId, sellerId, dateCreated, status, volume, totalCost)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      );

      const result = stmt.run(
        obj.product,
        obj.buyerId,
        obj.sellerId,
        obj.dateCreated,
        obj.status,
        obj.volume,
        obj.totalCost
      );

      // return fresh Order instance with DB assigned id (autoincrement)
      return Order.fromJSON({ ...obj, orderId: result.lastInsertRowid });
    } catch (err) {
      console.error("OrderSQLRepository.addOrder error:", err.message);
      return null;
    }
  }

  deleteOrder(id) {
    try {
      const res = this._deleteStmt.run(id);
      return res.changes > 0;
    } catch (err) {
      console.error("OrderSQLRepository.deleteOrder error:", err);
      return false;
    }
  }

  updateAttribute(id, attributeName, newValue) {
    const allowed = new Set(["product", "status", "volume", "totalCost"]);

    if (!allowed.has(attributeName)) {
      console.warn(
        "OrderSQLRepository.updateAttribute: attribute not allowed:",
        attributeName
      );
      return null;
    }

    if (!Order.validateInput(attributeName, newValue)) {
      console.warn(
        "OrderSQLRepository.updateAttribute: invalid value for",
        attributeName
      );
      return null;
    }

    try {
      const now = new Date().toISOString();
      const sql = `UPDATE orders SET ${attributeName} = ?, dateCreated = ? WHERE orderId = ?`;
      const stmt = this.db.prepare(sql);
      const res = stmt.run(newValue, now, id);
      if (res.changes === 0) return null;
      const row = this._selectByIdStmt.get(id);
      return row ? Order.fromJSON(row) : null;
    } catch (err) {
      console.error("OrderSQLRepository.updateAttribute error:", err);
      return null;
    }
  }

  eraseAll() {
    try {
      this.db.prepare("DELETE FROM orders").run();
      return true;
    } catch (err) {
      console.error("OrderSQLRepository.eraseAll error:", err);
      return false;
    }
  }

  // Returns the last auto-generated userId, or 0 if table is empty
  getHighestID() {
    const row = this.db
      .prepare("SELECT seq FROM sqlite_sequence WHERE name = 'orders'")
      .get();
    return row?.seq || 0; // use seq, not maxId
  }
}

export default OrderSQLRepository;
