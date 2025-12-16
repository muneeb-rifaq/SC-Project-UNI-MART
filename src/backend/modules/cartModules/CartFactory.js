import Cart from "./Cart.js";

/**
 * CartFactory class
 * Responsible for creating new Cart instances with unique IDs.
 */
class CartFactory {
  static cartCounter = 1;

  /**
   * Creates a new Cart for a user.
   * @param {number} userId - The ID of the user
   * @returns {Cart} A new Cart instance
   * @throws {Error} If userId is invalid
   */
  static makeCart(userId) {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error("Invalid userId for creating cart");
    }

    return new Cart(this.cartCounter++, userId, []);
  }
}

export default CartFactory;
