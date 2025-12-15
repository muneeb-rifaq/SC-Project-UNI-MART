//Order.js
class Order {
  // Attributes: orderId, product (stringified product object), buyerId, sellerId, dateCreated, status, volume, totalCost
  static ATTRIBUTES = [
    "orderId",
    "product",
    "buyerId",
    "sellerId",
    "dateCreated",
    "status",
    "volume",
    "totalCost",
  ];

  static STATUSES = new Set([
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ]);

  // Rules for validation
  static RULES = {
    orderId: (v) => typeof v === "number" && v > 0,
    product: (v) => typeof v === "string" && v.length > 0,
    buyerId: (v) => typeof v === "number" && v > 0,
    sellerId: (v) => typeof v === "number" && v > 0,
    dateCreated: (v) => v === null || typeof v === "string",
    status: (v) => typeof v === "string" && Order.STATUSES.has(v),
    volume: (v) => Number.isInteger(v) && v > 0,
    totalCost: (v) => typeof v === "number" && v >= 0,
  };

  // Mutable attributes can be updated
  static MUTABLE = ["product", "status", "volume", "totalCost"];

  #orderId;
  #product;
  #buyerId;
  #sellerId;
  #dateCreated;
  #status;
  #volume;
  #totalCost;

  constructor(
    orderId,
    product,
    buyerId,
    sellerId,
    volume,
    totalCost,
    status = "pending"
  ) {
    if (!Order.validateInput("orderId", orderId))
      throw new Error(`Invalid orderId: ${orderId}`);
    if (!Order.validateInput("product", product))
      throw new Error(`Invalid product`);
    if (!Order.validateInput("buyerId", buyerId))
      throw new Error(`Invalid buyerId: ${buyerId}`);
    if (!Order.validateInput("sellerId", sellerId))
      throw new Error(`Invalid sellerId: ${sellerId}`);
    if (!Order.validateInput("volume", volume))
      throw new Error(`Invalid volume: ${volume}`);
    if (!Order.validateInput("totalCost", totalCost))
      throw new Error(`Invalid totalCost: ${totalCost}`);
    if (!Order.validateInput("status", status))
      throw new Error(`Invalid status: ${status}`);

    this.#orderId = orderId;
    this.#product = product;
    this.#buyerId = buyerId;
    this.#sellerId = sellerId;
    this.#dateCreated = new Date().toISOString();
    this.#status = status;
    this.#volume = volume;
    this.#totalCost = totalCost;
  }

  static validateInput(attr, value) {
    const rule = Order.RULES[attr];
    return rule ? rule(value) : false;
  }

  getAttribute(attr) {
    switch (attr) {
      case "orderId":
        return this.#orderId;
      case "product":
        return this.#product;
      case "buyerId":
        return this.#buyerId;
      case "sellerId":
        return this.#sellerId;
      case "dateCreated":
        return this.#dateCreated;
      case "status":
        return this.#status;
      case "volume":
        return this.#volume;
      case "totalCost":
        return this.#totalCost;
      default:
        return undefined;
    }
  }

  // updateAttribute returns true on success, false if invalid or not allowed
  updateAttribute(attr, value) {
    if (!Order.MUTABLE.includes(attr)) return false;
    if (!Order.validateInput(attr, value)) return false;

    switch (attr) {
      case "product":
        this.#product = value;
        break;
      case "status":
        this.#status = value;
        break;
      case "volume":
        this.#volume = value;
        break;
      case "totalCost":
        this.#totalCost = value;
        break;
      default:
        return false;
    }
    return true;
  }

  toJSON() {
    return {
      orderId: this.#orderId,
      product: this.#product,
      buyerId: this.#buyerId,
      sellerId: this.#sellerId,
      dateCreated: this.#dateCreated,
      status: this.#status,
      volume: this.#volume,
      totalCost: this.#totalCost,
    };
  }

  static fromJSON(obj) {
    // create instance and override dateCreated if provided
    const o = new Order(
      obj.orderId,
      obj.product,
      obj.buyerId,
      obj.sellerId,
      obj.volume,
      obj.totalCost,
      obj.status
    );
    o.#dateCreated = obj.dateCreated ?? o.#dateCreated;
    return o;
  }
}

export default Order;
