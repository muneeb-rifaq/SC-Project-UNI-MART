import path from "path";
import { fileURLToPath } from "url";

import Category from "./Category.js";
import CategoryFactory from "./CategoryFactory.js";
import CategorySQLRepository from "./repository/CategorySQLRepository.js";
import CategoryJSONRepository from "./repository/CategoryJSONRepository.js";

/**
 * CategoryService class
 * Manages the lifecycle and operations of product categories.
 * Handles persistence via repositories (SQL or JSON).
 */
class CategoryService {
  #categories;
  #repository;

  /**
   * Initializes the CategoryService.
   * @param {string} [filePath] - Path to the storage file (DB or JSON). Defaults to unimartDB.db
   * @throws {Error} If filePath is invalid or file type is unsupported
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
      this.#repository = new CategoryJSONRepository(filePath);
    else if (filePath.endsWith(".db") || filePath.endsWith(".sqlite"))
      this.#repository = new CategorySQLRepository(filePath);
    else throw new Error("Invalid storage file type");

    // -----------------------------------
    // Load categories (or fallback)
    // -----------------------------------
    try {
      this.#categories = this.#repository.load() || [];
    } catch {
      this.#categories = [];
    }
  }

  getAll() {
    return this.#categories.map((c) => Category.fromJSON(c.toJSON()));
  }

  async addCategory(categoryName, description) {
    if (!categoryName) throw new Error("categoryName required");

    const id = this.getNextAvailableID();
    const category = CategoryFactory.createNewCategory(
      id,
      categoryName,
      description
    );

    const newCategory = this.#repository.addCategory(category);
    if (!newCategory) return null;

    this.#categories.push(newCategory);
    return newCategory;
  }

  deleteCategory(id) {
    if (typeof id !== "number" || id <= 0) return false;

    const ok = this.#repository.deleteCategory(id);
    if (!ok) return false;

    this.#categories = this.#categories.filter(
      (c) => c.getAttribute("categoryId") !== id
    );
    return true;
  }

  updateAttribute(id, attr, value) {
    if (!attr || typeof id !== "number" || id <= 0) return null;

    const updated = this.#repository.updateAttribute(id, attr, value);
    if (!updated) return null;

    const idx = this.#categories.findIndex(
      (c) => c.getAttribute("categoryId") === id
    );

    if (idx >= 0) this.#categories[idx] = updated;
    else this.#categories.push(updated);

    return updated;
  }

  findByAttribute(attr, val) {
    if (!attr) return [];
    return this.getAll().filter((c) => c.getAttribute(attr) === val);
  }

  eraseAll() {
    const ok = this.#repository.eraseAll();
    if (!ok) return false;

    this.#categories = [];
    return true;
  }

  getNextAvailableID() {
    if (this.#repository.getHighestID()) {
      return this.#repository.getHighestID() + 1;
    }

    const maxId = this.#categories.reduce(
      (max, c) => Math.max(max, c.getAttribute("categoryId")),
      0
    );

    return maxId + 1;
  }
}

export default CategoryService;
