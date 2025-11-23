import Product from "./Product.js";

class ProductFactory {
  /*
    makeProduct: creates a new Product instance.
    params: attributes for Product class
    returns: Product instance
  */
  static makeProduct(
    productId,
    name,
    description,
    price,
    sellerId,
    category,
    stock
  ) {
    return new Product(
      productId,
      name,
      description,
      price,
      sellerId,
      category,
      stock
    );
  }

  /*
    makeSampleProduct: returns a new Product with randomized values.
    useful for testing / sample data.
  */
  static makeSampleProduct(id) {
    const randomId = id;
    // const randomId = Math.floor(Math.random() * 100000) + 1;

    const sampleNames = ["Laptop", "Phone", "Watch", "Headphones", "Keyboard"];
    const sampleCategories = [
      "Electronics",
      "Computers",
      "Gadgets",
      "Accessories",
    ];
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
    const category =
      sampleCategories[Math.floor(Math.random() * sampleCategories.length)];

    const price = parseFloat((Math.random() * 500 + 50).toFixed(2)); // random price 50–550
    const sellerId = Math.floor(Math.random() * 50) + 1; // random seller
    const stock = Math.floor(Math.random() * 100) + 1; // random stock

    return new Product(
      randomId,
      name,
      description,
      price,
      sellerId,
      category,
      stock
    );
  }
}

export default ProductFactory;
