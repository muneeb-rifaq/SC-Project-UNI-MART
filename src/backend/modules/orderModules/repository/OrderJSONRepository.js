import fs from "fs";
import Order from "../Order.js";
import OrderRepository from "./OrderRepository.js";

export default class OrderJSONRepository extends OrderRepository {
  constructor(jsonPath) {
    super(jsonPath);
    this.path = jsonPath;

    // If file doesn't exist → create blank DB structure
    if (!fs.existsSync(this.path)) {
      const initial = {
        meta: { lastId: 0 },
        data: [],
      };
      fs.writeFileSync(this.path, JSON.stringify(initial, null, 2));
    }
  }

  // ----------------------------
  // Internal helper to read file
  // ----------------------------
  #readFile() {
    const raw = fs.readFileSync(this.path, "utf8");
    const parsed = JSON.parse(raw);

    // Guarantee structure
    if (!parsed.meta) parsed.meta = { lastId: 0 };
    if (!Array.isArray(parsed.data)) parsed.data = [];

    return parsed;
  }

  #writeFile(obj) {
    fs.writeFileSync(this.path, JSON.stringify(obj, null, 2));
  }

  // ----------------------------
  // Load all orders
  // ----------------------------
  load() {
    const obj = this.#readFile();
    return obj.data.map((o) => Order.fromJSON(o));
  }

  // ----------------------------
  // Add a new order
  // ----------------------------
  addOrder(orderInstance) {
    const db = this.#readFile();
    const obj = orderInstance.toJSON();

    const expected = db.meta.lastId + 1;
    const given = obj.orderId;

    // Exactly match SQL behavior – caller must send correct ID
    if (given !== expected) {
      console.error(
        `OrderJSONRepository.addOrder: orderId must be ${expected} (got ${given}).`
      );
      return null;
    }

    // Persist
    db.data.push(obj);

    // Update lastId (just like auto-increment)
    db.meta.lastId = given;

    this.#writeFile(db);

    return Order.fromJSON(obj);
  }

  // ----------------------------
  // Delete order
  // ----------------------------
  deleteOrder(id) {
    const db = this.#readFile();
    const before = db.data.length;

    db.data = db.data.filter((o) => o.orderId !== id);

    const changed = db.data.length < before;
    if (changed) this.#writeFile(db);

    return changed;
  }

  // ----------------------------
  // Update attribute
  // ----------------------------
  updateAttribute(id, attr, value) {
    const allowed = new Set(["product", "status", "volume", "totalCost"]);

    if (!allowed.has(attr)) {
      console.warn(
        "OrderJSONRepository.updateAttribute: invalid attribute:",
        attr
      );
      return null;
    }

    if (!Order.validateInput(attr, value)) {
      console.warn(
        "OrderJSONRepository.updateAttribute: invalid value for:",
        attr
      );
      return null;
    }

    const db = this.#readFile();
    const idx = db.data.findIndex((o) => o.orderId === id);
    if (idx === -1) return null;

    // update & timestamp
    db.data[idx][attr] = value;
    db.data[idx].dateCreated = new Date().toISOString();

    this.#writeFile(db);

    return Order.fromJSON(db.data[idx]);
  }

  // ----------------------------
  // Erase all
  // ----------------------------
  eraseAll() {
    try {
      const db = this.#readFile();

      // Keep meta.lastId intact (DO NOT RESET)
      const lastId = db.meta.lastId;

      const blank = {
        meta: { lastId },
        data: [],
      };

      this.#writeFile(blank);
      return true;
    } catch (err) {
      console.error("OrderJSONRepository.eraseAll error:", err);
      return false;
    }
  }

  // ----------------------------
  // Highest ID (never reused)
  // ----------------------------
  getHighestID() {
    const db = this.#readFile();
    return db.meta.lastId || 0;
  }
}
