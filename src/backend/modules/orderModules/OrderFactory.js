// src/backend/modules/orderModules/OrderFactory.js
import Order from "./Order.js";

/**
 * Responsible for creating validated Order entities.
 * Accepts product as object or string; stores product as a string.
 */
class OrderFactory {
  /**
   * Create a new Order.
   * @param {number} orderId
   * @param {object|string} productObj - either an object (will be stringified) or a string
   * @param {number} buyerId
   * @param {number} sellerId
   * @param {number} volume
   * @param {number} totalCost
   * @param {string} status - optional, defaults to 'pending'
   * @returns {Order}
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

  // convenience sample
  static makeSampleOrder(id = 1) {
    const product = { sample: `product-${id}`, price: 100 + id };
    return this.makeOrder(id, product, 1, 1, 1, 100 + id, "pending");
  }
}

export default OrderFactory;
