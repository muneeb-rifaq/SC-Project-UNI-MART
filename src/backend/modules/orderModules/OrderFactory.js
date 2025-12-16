// src/backend/modules/orderModules/OrderFactory.js
import Order from "./Order.js";

/**
 * Responsible for creating validated Order entities.
 * Accepts product as object or string; stores product as a string.
 */
class OrderFactory {
  /**
   * Create a new Order.
   * @param {number} orderId - Unique identifier for the order.
   * @param {object|string} productObj - Either an object (will be stringified) or a string representing the product.
   * @param {number} buyerId - ID of the buyer.
   * @param {number} sellerId - ID of the seller.
   * @param {number} volume - Quantity of items ordered.
   * @param {number} totalCost - Total cost of the order.
   * @param {string} [status="pending"] - Optional status, defaults to 'pending'.
   * @returns {Order} A new Order instance.
   * @throws {Error} If product object is not serializable or status is invalid.
   */
  static makeOrder(
    orderId,
    productObj,
    buyerId,
    sellerId,
    volume,
    totalCost,
    status = "pending"
  ) {
    // normalize product to string
    let productStr;
    if (typeof productObj === "string") {
      productStr = productObj;
    } else {
      try {
        productStr = JSON.stringify(productObj);
      } catch (err) {
        throw new Error("Product object must be serializable to JSON/string");
      }
    }

    // Validate status
    if (!Order.validateInput("status", status)) {
      throw new Error("Invalid status");
    }

    return new Order(
      orderId,
      productStr,
      buyerId,
      sellerId,
      volume,
      totalCost,
      status
    );
  }

  /**
   * Creates a sample order for testing or demonstration purposes.
   * @param {number} [id=1] - The ID to use for the sample order.
   * @returns {Order} A sample Order instance.
   */
  static makeSampleOrder(id = 1) {
    const product = { sample: `product-${id}`, price: 100 + id };
    return this.makeOrder(id, product, 1, 1, 1, 100 + id, "pending");
  }
}

export default OrderFactory;
