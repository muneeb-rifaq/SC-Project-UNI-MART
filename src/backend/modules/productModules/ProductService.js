// ProductService.js
import Product from "./Product.js";
//import repositories
// import ProductRepository from "./repository/ProductRepository.js";
import ProductSQLRepository from "./repository/ProductSQLRepository.js";
import ProductJSONRepository from "./repository/productJSONRepository.js";

class ProductService {
  constructor(filePath) {
    if (filePath.endsWith(".json")) {
      this.repository = new ProductJSONRepository(filePath);
    } else if (filePath.endsWith(".db") || filePath.endsWith(".sqlite")) {
      this.repository = new ProductSQLRepository(filePath);
    } else {
      throw new Error("Invalid storage file type. Use .json or .db/.sqlite");
    }

    this.products = this.repository.load();
  }

  // Add a product
  addProduct(product) {
    const success = this.repository.addProduct(product);
    if (success) this.products.push(product);
  }

  // Delete a product by productId
  deleteProduct(id) {
    const success = this.repository.deleteProduct(id);
    if (success) {
      this.products = this.products.filter(
        (p) => p.getAttribute("productId") !== id
      );
    }
  }

  // Get all products (clone of internal cache)
  getAll() {
    return [...this.products];
  }

  // Change attribute of a product
  changeAttribute(id, attributeName, newValue) {
    const updated = this.repository.changeAttribute(
      id,
      attributeName,
      newValue
    );
    if (!updated) return null;

    const index = this.products.findIndex(
      (p) => p.getAttribute("productId") === id
    );
    if (index !== -1) this.products[index] = updated;

    return updated;
  }

  // Filter products by attribute and value
  findByAttribute(attributeName, value) {
    if (!Product.validateInput(attributeName, value)) return [];
    return this.products.filter((p) => p.getAttribute(attributeName) === value);
  }

  // Erase all products
  eraseAll() {
    const success = this.repository.eraseAll();
    if (success) this.products = [];
  }

  // ----------------------------------------------------
  // NEW METHOD 1: Get next available sequential ID
  // ----------------------------------------------------
  getNextAvailableID() {
    if (this.products.length === 0) return 1;

    const maxID = Math.max(
      ...this.products.map((p) => p.getAttribute("productId"))
    );

    return maxID + 1;
  }

  // ----------------------------------------------------
  // NEW METHOD 2: Validate a given ID
  // Rules:
  // - must not match any existing ID
  // - must not be less than the highest ID in the list
  // ----------------------------------------------------
  validateID(id) {
    if (typeof id !== "number" || id <= 0) return false;

    if (this.products.length === 0) return true;

    const ids = this.products.map((p) => p.getAttribute("productId"));
    const maxID = Math.max(...ids);

    // id cannot be less than highest assigned ID
    if (id < maxID) return false;

    // id cannot already exist
    if (ids.includes(id)) return false;

    return true;
  }
}

export default ProductService;
