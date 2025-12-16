import path from "path";
import { fileURLToPath } from "url";

import Product from "./Product.js";
import ProductFactory from "./ProductFactory.js";
import ProductSQLRepository from "./repository/ProductSQLRepository.js";
import ProductJSONRepository from "./repository/ProductJSONRepository.js";

/**
 * Service class for managing Product entities.
 * Handles storage, retrieval, and business logic for products.
 */
class ProductService {
  #repository;

  /**
   * Initializes the ProductService with a specific file path for storage.
   * Automatically selects between JSON and SQL repositories based on file extension.
   * @param {string} [filePath=null] - Path to the storage file. Defaults to the standard DB path if not provided.
   * @throws {Error} If filePath is not a string or has an invalid extension.
   */
  constructor(filePath = null) {
    // ---------------------------
    // Resolve default file path
    // ---------------------------
    if (!filePath) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      // Default DB location
      filePath = path.resolve(
        __dirname,
        "../../storage/DBStorage/unimartDB.db"
      );
    }

    if (typeof filePath !== "string")
      throw new Error("filePath must be a string");

    // ---------------------------
    // Select repository based on file extension
    // ---------------------------
    if (filePath.endsWith(".json"))
      this.#repository = new ProductJSONRepository(filePath);
    else if (filePath.endsWith(".db") || filePath.endsWith(".sqlite"))
      this.#repository = new ProductSQLRepository(filePath);
    else throw new Error("Invalid storage file type: must be JSON or SQLite");
  }

  /**
   * Retrieves all products as immutable objects.
   * @returns {Product[]} Array of Product instances.
   */
  getAll() {
    return this.#repository.load().map((p) => Product.fromJSON(p.toJSON()));
  }

  // -----------------------------------------
  // ADD PRODUCT with categoryId SUPPORT
  // -----------------------------------------
  /**
   * Creates and adds a new product to the system.
   * @param {string} name - Name of the product.
   * @param {number} sellerId - ID of the seller.
   * @param {string} description - Description of the product.
   * @param {number} price - Price of the product.
   * @param {number} stock - Initial stock quantity.
   * @param {number} categoryId - ID of the category.
   * @returns {Promise<Product|null>} The created Product object if successful, null otherwise.
   * @throws {Error} If validation fails for any parameter.
   */
  async addProduct(name, sellerId, description, price, stock, categoryId) {
    if (!name || typeof price !== "number" || typeof sellerId !== "number")
      throw new Error("name, price, and sellerId required");

    if (typeof categoryId !== "number" || categoryId <= 0)
      throw new Error("Valid categoryId required");

    const id = this.getNextAvailableID();

    const product = ProductFactory.makeProduct(
      id,
      sellerId,
      name,
      description,
      price,
      stock,
      categoryId // NEW
    );

    return this.#repository.addProduct(product);
  }

  /**
   * Deletes a product by its ID.
   * @param {number} id - The ID of the product to delete.
   * @returns {boolean} True if deletion was successful, false otherwise.
   */
  deleteProduct(id) {
    if (typeof id !== "number" || id <= 0) return false;
    return this.#repository.deleteProduct(id);
  }

  /**
   * Updates a specific attribute of a product.
   * @param {number} id - The ID of the product to update.
   * @param {string} attribute - The attribute name to update.
   * @param {any} value - The new value for the attribute.
   * @returns {boolean|null} True if update successful, false if failed, null if invalid input.
   */
  updateAttribute(id, attribute, value) {
    if (!attribute || typeof id !== "number" || id <= 0) return null;
    return this.#repository.updateAttribute(id, attribute, value);
  }

  /**
   * Finds products by a specific attribute value.
   * @param {string} attribute - The attribute to search by.
   * @param {any} value - The value to match.
   * @returns {Product[]} Array of matching Product instances.
   */
  findByAttribute(attribute, value) {
    if (!attribute) return [];
    return this.getAll().filter((p) => p.getAttribute(attribute) === value);
  }

  /**
   * Erases all products from the repository.
   * @returns {boolean} True if successful.
   */
  eraseAll() {
    return this.#repository.eraseAll();
  }

  /**
   * Gets the next available product ID.
   * @returns {number} The next available ID.
   */
  getNextAvailableID() {
    return this.#repository.getHighestID() + 1;
  }
}

export default ProductService;
