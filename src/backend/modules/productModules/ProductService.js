import path from "path";
import { fileURLToPath } from "url";

import Product from "./Product.js";
import ProductFactory from "./ProductFactory.js";
import ProductSQLRepository from "./repository/ProductSQLRepository.js";
import ProductJSONRepository from "./repository/ProductJSONRepository.js";

class ProductService {
  #repository;

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

  getAll() {
    return this.#repository.load().map((p) => Product.fromJSON(p.toJSON()));
  }

  // -----------------------------------------
  // ADD PRODUCT with categoryId SUPPORT
  // -----------------------------------------
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

  deleteProduct(id) {
    if (typeof id !== "number" || id <= 0) return false;
    return this.#repository.deleteProduct(id);
  }

  updateAttribute(id, attribute, value) {
    if (!attribute || typeof id !== "number" || id <= 0) return null;
    return this.#repository.updateAttribute(id, attribute, value);
  }

  findByAttribute(attribute, value) {
    if (!attribute) return [];
    return this.getAll().filter((p) => p.getAttribute(attribute) === value);
  }

  eraseAll() {
    return this.#repository.eraseAll();
  }

  getNextAvailableID() {
    return this.#repository.getHighestID() + 1;
  }
}

export default ProductService;
