// Product.js
class Product {
  #productId;
  #sellerId;
  #name;
  #description;
  #price;
  #stock;
  #dateUpdated;
  #categoryId; // <-- NEW ATTRIBUTE

  /**
   * Create a new Product instance
   */
  constructor(
    productId,
    sellerId,
    name,
    description,
    price,
    stock,
    categoryId
  ) {
    if (!Product.validateInput("productId", productId))
      throw new Error(`Invalid productId: ${productId}`);
    if (!Product.validateInput("sellerId", sellerId))
      throw new Error(`Invalid sellerId: ${sellerId}`);
    if (!Product.validateInput("name", name))
      throw new Error(`Invalid name: ${name}`);
    if (!Product.validateInput("description", description))
      throw new Error(`Invalid description: ${description}`);
    if (!Product.validateInput("price", price))
      throw new Error(`Invalid price: ${price}`);
    if (!Product.validateInput("stock", stock))
      throw new Error(`Invalid stock: ${stock}`);
    if (!Product.validateInput("categoryId", categoryId))
      throw new Error(`Invalid categoryId: ${categoryId}`);

    this.#productId = productId;
    this.#sellerId = sellerId;
    this.#name = name;
    this.#description = description;
    this.#price = price;
    this.#stock = stock;
    this.#categoryId = categoryId; // <-- NEW
    this.#dateUpdated = new Date().toISOString();
  }

  /**
   * Validate input for a specific attribute
   */
  static validateInput(attributeName, value) {
    switch (attributeName) {
      case "productId":
      case "sellerId":
      case "categoryId": // <-- NEW
        return typeof value === "number" && value > 0;
      case "name":
      case "description":
        return typeof value === "string" && value.length > 0;
      case "price":
        return typeof value === "number" && value >= 0;
      case "stock":
        return Number.isInteger(value) && value >= 0;
      case "dateUpdated":
        return typeof value === "string";
      default:
        return false;
    }
  }

  /**
   * Update allowed attributes
   */
  updateAttribute(attributeName, newValue) {
    if (!Product.validateInput(attributeName, newValue)) return false;

    switch (attributeName) {
      case "name":
        this.#name = newValue;
        break;
      case "description":
        this.#description = newValue;
        break;
      case "price":
        this.#price = newValue;
        break;
      case "stock":
        this.#stock = newValue;
        break;
      case "categoryId": // <-- category can be changed
        this.#categoryId = newValue;
        break;
      default:
        return false;
    }

    this.#dateUpdated = new Date().toISOString();
    return true;
  }

  /**
   * Get attribute value
   */
  getAttribute(attributeName) {
    switch (attributeName) {
      case "productId":
        return this.#productId;
      case "sellerId":
        return this.#sellerId;
      case "name":
        return this.#name;
      case "description":
        return this.#description;
      case "price":
        return this.#price;
      case "stock":
        return this.#stock;
      case "dateUpdated":
        return this.#dateUpdated;
      case "categoryId": // <-- NEW
        return this.#categoryId;
      default:
        return null;
    }
  }

  /**
   * Convert to plain object
   */
  toJSON() {
    return {
      productId: this.#productId,
      sellerId: this.#sellerId,
      name: this.#name,
      description: this.#description,
      price: this.#price,
      stock: this.#stock,
      dateUpdated: this.#dateUpdated,
      categoryId: this.#categoryId, // <-- NEW
    };
  }

  /**
   * Create product from JSON data
   */
  static fromJSON(data) {
    const p = new Product(
      data.productId,
      data.sellerId,
      data.name,
      data.description,
      data.price,
      data.stock,
      data.categoryId // <-- NEW
    );

    // Restore original update timestamp
    if (data.dateUpdated) p.updateAttribute("dateUpdated", data.dateUpdated);

    return p;
  }

  // Safe clone
  clone() {
    return Product.fromJSON(this.toJSON());
  }
}

export default Product;
