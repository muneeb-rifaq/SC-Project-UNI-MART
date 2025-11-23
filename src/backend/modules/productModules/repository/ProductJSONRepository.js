// ProductJSONRepository.js
import fs from "fs";
import Product from "../Product.js";
import ProductFactory from "../ProductFactory.js";
//import abstract repo class
import ProductRepository from "./ProductRepository.js";

class ProductJSONRepository extends ProductRepository {
  constructor(filePath) {
    super(filePath);
    this.initializeFileIfMissing();
  }

  initializeFileIfMissing() {
    if (!fs.existsSync(this.filePath)) {
      const sampleProducts = [
        ProductFactory.makeSampleProduct(1),
        ProductFactory.makeSampleProduct(2),
        ProductFactory.makeSampleProduct(3),
      ];
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(
          sampleProducts.map((p) => p.toJSON()),
          null,
          2
        )
      );
    }
  }

  load() {
    if (!fs.existsSync(this.filePath)) return [];
    const raw = fs.readFileSync(this.filePath, "utf8");
    return JSON.parse(raw).map((obj) => Product.fromJSON(obj));
  }

  save(products) {
    try {
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(
          products.map((p) => p.toJSON()),
          null,
          2
        )
      );
      return true;
    } catch {
      return false;
    }
  }

  addProduct(product) {
    const products = this.load();
    products.push(product);
    return this.save(products) ? product : null;
  }

  deleteProduct(id) {
    let products = this.load();
    const before = products.length;
    products = products.filter((p) => p.getAttribute("productId") !== id);
    return this.save(products) && products.length !== before;
  }

  changeAttribute(id, attributeName, newValue) {
    const products = this.load();
    const product = products.find((p) => p.getAttribute("productId") === id);

    if (!product || !product.updateAttribute(attributeName, newValue))
      return null;

    return this.save(products) ? product : null;
  }

  eraseAll() {
    return this.save([]);
  }
}

export default ProductJSONRepository;
