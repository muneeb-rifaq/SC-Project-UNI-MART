import Product from "../productModules/Product.js";

/**
 * Cart class
 * Represents a shopping cart for a specific user.
 * Stores independent product instances (one per unit of quantity).
 * Provides ONLY: view, add, delete operations.
 * No attribute modification allowed directly.
 */
class Cart {
  #cartId;
  #userId;
  #items; // array of Product instances (each representing 1 unit)

  /**
   * Creates a new Cart instance.
   * @constructor
   * @param {number} cartId - Unique identifier for the cart
   * @param {number} userId - ID of the user who owns the cart
   * @param {Product[]} items - Array of Product instances (default is empty)
   */
  constructor(cartId, userId, items = []) {
    this.#cartId = cartId;
    this.#userId = userId;
    this.#items = items;

    if (!this.#validateCart()) {
      throw new Error("Invalid Cart attributes");
    }
  }

  // ------------------------------------------------------------------
  // VALIDATION METHODS
  // ------------------------------------------------------------------

  /**
   * Validate cart's overall structure
   * @returns {boolean}
   * @private
   */
  #validateCart() {
    if (typeof this.#cartId !== "number" || this.#cartId <= 0) return false;
    if (typeof this.#userId !== "number" || this.#userId <= 0) return false;
    if (!Array.isArray(this.#items)) return false;

    for (const product of this.#items) {
      if (!(product instanceof Product)) return false;
    }

    return true;
  }

  // ------------------------------------------------------------------
  // GETTERS
  // ------------------------------------------------------------------

  /**
   * Get an attribute
   * @param {string} attr - "cartId" | "userId" | "items"
   * @returns {*}
   */
  getAttribute(attr) {
    switch (attr) {
      case "cartId":
        return this.#cartId;

      case "userId":
        return this.#userId;

      case "items":
        // return deep clone of each Product instance
        return this.#items.map((p) => Product.fromJSON(p.toJSON()));

      default:
        return undefined;
    }
  }

  // ------------------------------------------------------------------
  // ADD PRODUCTS
  // ------------------------------------------------------------------

  /**
   * Add a product to the cart as multiple independent instances.
   * Each unit of volume produces 1 cloned Product instance.
   *
   * @param {Product} productInstance
   * @param {number} volume - number of copies to add
   * @returns {boolean}
   */
  addItem(productInstance, volume) {
    if (!(productInstance instanceof Product)) return false;
    if (typeof volume !== "number" || volume <= 0) return false;

    for (let i = 0; i < volume; i++) {
      // clone → remove stock → create Product instance
      const raw = productInstance.toJSON();
      delete raw.stock; // remove stock to prevent ambiguity

      const cloned = Product.fromJSON(raw);
      this.#items.push(cloned);
    }

    return true;
  }

  // ------------------------------------------------------------------
  // REMOVE PRODUCTS
  // ------------------------------------------------------------------

  /**
   * Removes **all instances** of a product with the given productId
   *
   * @param {number} productId
   * @returns {boolean} - true if removal happened
   */
  removeItem(productId) {
    const before = this.#items.length;

    this.#items = this.#items.filter(
      (p) => p.getAttribute("productId") !== productId
    );

    return this.#items.length !== before;
  }

  // ------------------------------------------------------------------
  // SERIALIZATION
  // ------------------------------------------------------------------

  /**
   * Convert cart into JSON object
   * @returns {object}
   */
  toJSON() {
    return {
      cartId: this.#cartId,
      userId: this.#userId,
      items: this.#items.map((p) => p.toJSON()),
    };
  }

  /**
   * Build a Cart instance from JSON data
   * @param {object} obj
   * @returns {Cart}
   */
  static fromJSON(obj) {
    const items = (obj.items || []).map((prod) => Product.fromJSON(prod));
    return new Cart(obj.cartId, obj.userId, items);
  }
}

export default Cart;
