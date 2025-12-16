// Category.js

/**
 * Category class
 * Represents a product category in the system.
 * Encapsulates category data and validation logic.
 */
class Category {
  #categoryId;
  #categoryName;
  #description;
  #dateCreated;

  /**
   * Creates a new Category instance.
   * @constructor
   * @param {number} categoryId - Unique identifier for the category
   * @param {string} categoryName - Name of the category
   * @param {string} description - Description of the category
   * @param {string} [dateCreated] - ISO date string of creation (defaults to now)
   * @throws {Error} If attributes are invalid
   */
  constructor(categoryId, categoryName, description, dateCreated) {
    this.#categoryId = categoryId;
    this.#categoryName = categoryName;
    this.#description = description;
    this.#dateCreated = dateCreated || new Date().toISOString();

    // Validate on creation
    if (!this.validateInput()) {
      throw new Error("Invalid Category attributes");
    }
  }

  // --------------------------
  // Validate attributes
  // --------------------------
  validateInput() {
    // categoryId must be a positive number
    if (typeof this.#categoryId !== "number" || this.#categoryId <= 0)
      return false;

    // categoryName must be non-empty string
    if (!this.#categoryName || typeof this.#categoryName !== "string")
      return false;

    // description must be a string (can be empty)
    if (typeof this.#description !== "string") return false;

    // dateCreated must be valid ISO string
    if (!this.#dateCreated || isNaN(Date.parse(this.#dateCreated)))
      return false;

    return true;
  }

  getAttribute(attr) {
    switch (attr) {
      case "categoryId":
        return this.#categoryId;
      case "categoryName":
        return this.#categoryName;
      case "description":
        return this.#description;
      case "dateCreated":
        return this.#dateCreated;
      default:
        return undefined;
    }
  }

  updateAttribute(attr, value) {
    switch (attr) {
      case "categoryName":
        if (typeof value !== "string" || value.trim() === "") return false;
        this.#categoryName = value;
        break;
      case "description":
        if (typeof value !== "string") return false;
        this.#description = value;
        break;
      default:
        return false;
    }
    return true;
  }

  toJSON() {
    return {
      categoryId: this.#categoryId,
      categoryName: this.#categoryName,
      description: this.#description,
      dateCreated: this.#dateCreated,
    };
  }

  static fromJSON(obj) {
    return new Category(
      obj.categoryId,
      obj.categoryName,
      obj.description,
      obj.dateCreated
    );
  }
}

export default Category;
