import fs from "fs";
import Product from "../Product.js";
import ProductRepository from "./ProductRepository.js";

export default class ProductJSONRepository extends ProductRepository {
  constructor(filePath) {
    super(filePath);

    // Initialize file if missing
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(
        this.filePath,
        JSON.stringify({ lastId: 0, products: [] }, null, 2)
      );
    }
  }

  _read() {
    return JSON.parse(fs.readFileSync(this.filePath, "utf8"));
  }

  _write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  // -----------------------------------------
  // LOAD all products (including categoryId)
  // -----------------------------------------
  load() {
    const data = this._read();
    return data.products.map((p) => Product.fromJSON(p));
  }

  // -----------------------------------------
  // ADD PRODUCT with categoryId support
  // -----------------------------------------
  addProduct(productInstance) {
    const data = this._read();
    const expectedId = data.lastId + 1;
    const givenId = productInstance.getAttribute("productId");

    if (givenId !== expectedId) {
      throw new Error(
        `ProductJSONRepository.addProduct: productId must be ${expectedId}, received ${givenId}`
      );
    }

    data.lastId = expectedId;

    // Store all attributes including categoryId
    data.products.push(productInstance.toJSON());
    this._write(data);

    return Product.fromJSON(productInstance.toJSON());
  }

  deleteProduct(id) {
    const data = this._read();
    const before = data.products.length;
    data.products = data.products.filter((p) => p.productId !== id);
    this._write(data);
    return data.products.length !== before;
  }

  // -----------------------------------------
  // UPDATE ATTRIBUTE — now includes categoryId
  // -----------------------------------------
  updateAttribute(id, attribute, value) {
    const allowed = new Set([
      "name",
      "description",
      "price",
      "stock",
      "categoryId", // NEW - allows changing category
      "dateUpdated",
    ]);

    if (!allowed.has(attribute)) return null;

    const data = this._read();
    const idx = data.products.findIndex((p) => p.productId === id);
    if (idx === -1) return null;

    const product = Product.fromJSON(data.products[idx]);
    const success = product.updateAttribute(attribute, value);
    if (!success) return null;

    data.products[idx] = product.toJSON();
    this._write(data);

    return product;
  }

  eraseAll() {
    const data = this._read();
    data.products = [];
    this._write(data);
    return true;
  }

  getHighestID() {
    const data = this._read();
    return data.lastId || 0;
  }
}
