// src/backend/modules/orderModules/OrderService.js
import path from "path";
import { fileURLToPath } from "url";

import Order from "./Order.js";
import OrderFactory from "./OrderFactory.js";
import OrderSQLRepository from "./repository/OrderSQLRepository.js";
import OrderJSONRepository from "./repository/OrderJSONRepository.js";

/**
 * Service class for managing Order entities.
 * Handles storage, retrieval, and business logic for orders.
 */
class OrderService {
  #orders;
  #repository;

  /**
   * Initializes the OrderService with a specific file path for storage.
   * Automatically selects between JSON and SQL repositories based on file extension.
   * @param {string} [filePath=null] - Path to the storage file. Defaults to the standard DB path if not provided.
   * @throws {Error} If filePath is not a string or has an invalid extension.
   */
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

  /**
   * Retrieves all orders as immutable objects.
   * @returns {Order[]} Array of Order instances.
   */
  getAll() {
    return this.#orders.map((o) => Order.fromJSON(o.toJSON()));
  }

  /**
   * Creates and adds a new order to the system.
   * @param {object|string} productObj - The product being ordered.
   * @param {number} buyerId - ID of the buyer.
   * @param {number} sellerId - ID of the seller.
   * @param {number} volume - Quantity ordered.
   * @param {number} totalCost - Total cost of the order.
   * @param {string} [status="pending"] - Initial status of the order.
   * @returns {Promise<Order|null>} The created Order object if successful, null otherwise.
   * @throws {Error} If validation fails for any parameter.
   */
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

  /**
   * Deletes an order by its ID.
   * @param {number} id - The ID of the order to delete.
   * @returns {boolean} True if deletion was successful, false otherwise.
   */
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
