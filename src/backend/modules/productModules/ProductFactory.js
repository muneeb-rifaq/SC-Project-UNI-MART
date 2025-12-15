import Product from "./Product.js";

class ProductFactory {
  /**
   * Creates a new Product instance.
   * @param {number} productId
   * @param {number} sellerId
   * @param {string} name
   * @param {string} description
   * @param {number} price
   * @param {number} stock
   * @param {number} categoryId
   * @returns {Product}
   */
  static makeProduct(
    productId,
    sellerId,
    name,
    description,
    price,
    stock,
    categoryId
  ) {
    return new Product(
      productId,
      sellerId,
      name,
      description,
      price,
      stock,
      categoryId
    );
  }

  /**
   * Create a sample Product with randomized values for testing
   * @param {number} id - product ID
   * @returns {Product}
   */
  static makeSampleProduct(id) {
    const randomId = id;

    const sampleNames = ["Laptop", "Phone", "Watch", "Headphones", "Keyboard"];
    const sampleDescriptions = [
      "High quality product",
      "Top-selling item",
      "Latest model",
      "Best performance",
      "Limited edition",
    ];

    const name = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const description =
      sampleDescriptions[Math.floor(Math.random() * sampleDescriptions.length)];

    const price = parseFloat((Math.random() * 500 + 50).toFixed(2)); // 50–550
    const sellerId = Math.floor(Math.random() * 50) + 1; // 1–50
    const stock = Math.floor(Math.random() * 100) + 1; // 1–100

    const categoryId = Math.floor(Math.random() * 10) + 1; // NEW: random category 1–10

    return new Product(
      randomId,
      sellerId,
      name,
      description,
      price,
      stock,
      categoryId
    );
  }
}

export default ProductFactory;
