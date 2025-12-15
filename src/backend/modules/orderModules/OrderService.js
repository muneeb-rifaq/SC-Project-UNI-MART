// src/backend/modules/orderModules/OrderService.js
import path from "path";
import { fileURLToPath } from "url";

import Order from "./Order.js";
import OrderFactory from "./OrderFactory.js";
import OrderSQLRepository from "./repository/OrderSQLRepository.js";
import OrderJSONRepository from "./repository/OrderJSONRepository.js";

class OrderService {
  #orders;
  #repository;

  constructor(filePath = null) {
    // -----------------------------------
    // Resolve default DB path if missing
    // -----------------------------------
    if (!filePath) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      filePath = path.resolve(
        __dirname,
        "../../storage/DBStorage/unimartDB.db"
      );
    }

    if (typeof filePath !== "string")
      throw new Error("filePath must be a string");

    // -----------------------------------
    // Choose JSON or SQLite repository
    // -----------------------------------
    if (filePath.endsWith(".json"))
      this.#repository = new OrderJSONRepository(filePath);
    else if (filePath.endsWith(".db") || filePath.endsWith(".sqlite"))
      this.#repository = new OrderSQLRepository(filePath);
    else throw new Error("Invalid storage file type");

    // -----------------------------------
    // Load orders (or fallback)
    // -----------------------------------
    try {
      this.#orders = this.#repository.load() || [];
    } catch {
      this.#orders = [];
    }
  }

  // Return immutable copies
  getAll() {
    return this.#orders.map((o) => Order.fromJSON(o.toJSON()));
  }

  async addOrder(
    productObj,
    buyerId,
    sellerId,
    volume,
    totalCost,
    status = "pending"
  ) {
    if (!productObj) throw new Error("productObj required");
    if (typeof buyerId !== "number" || buyerId <= 0)
      throw new Error("buyerId must be a positive number");
    if (typeof sellerId !== "number" || sellerId <= 0)
      throw new Error("sellerId must be a positive number");
    if (!Number.isInteger(volume) || volume <= 0)
      throw new Error("volume must be a positive integer");
    if (typeof totalCost !== "number" || totalCost < 0)
      throw new Error("totalCost invalid");

    const id = this.getNextAvailableID();

    let order;
    try {
      order = OrderFactory.makeOrder(
        id,
        productObj,
        buyerId,
        sellerId,
        volume,
        totalCost,
        status
      );
    } catch (err) {
      console.error("OrderFactory.makeOrder failed:", err);
      return null;
    }

    const persisted = this.#repository.addOrder(order);
    if (!persisted) return null;

    this.#orders.push(persisted);
    return persisted;
  }

  deleteOrder(id) {
    if (typeof id !== "number" || id <= 0) return false;
    const ok = this.#repository.deleteOrder(id);
    if (!ok) return false;

    this.#orders = this.#orders.filter((o) => o.getAttribute("orderId") !== id);
    return true;
  }

  updateAttribute(id, attr, val) {
    if (!attr || typeof id !== "number" || id <= 0) return null;

    const updated = this.#repository.updateAttribute(id, attr, val);
    if (!updated) return null;

    const idx = this.#orders.findIndex((o) => o.getAttribute("orderId") === id);

    if (idx >= 0) this.#orders[idx] = updated;
    else this.#orders.push(updated);

    return updated;
  }

  findByAttribute(attr, val) {
    if (!attr) return [];
    return this.getAll().filter((o) => o.getAttribute(attr) === val);
  }

  eraseAll() {
    const ok = this.#repository.eraseAll();
    if (!ok) return false;

    this.#orders = [];
    return true;
  }

  getNextAvailableID() {
    try {
      const repoHighest = this.#repository.getHighestID();
      if (typeof repoHighest === "number") return repoHighest + 1;
    } catch {
      // fallback
    }

    const maxId = this.#orders.reduce(
      (max, o) => Math.max(max, o.getAttribute("orderId")),
      0
    );
    return maxId + 1;
  }
}

export default OrderService;
