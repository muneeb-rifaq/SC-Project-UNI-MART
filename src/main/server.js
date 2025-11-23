import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import ProductService from "../backend/modules/productModules/ProductService.js";
import ProductFactory from "../backend/modules/productModules/ProductFactory.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const service = new ProductService(
  "../backend/storage/productStorage/products_test.json"
);

// --------------------------------------------------
// GET: All Products
// --------------------------------------------------
app.get("/api/products", (req, res) => {
  const products = service.getAll();
  console.log(`GET: ProductList: SUCCESS (Total: ${products.length})`);
  res.json(products.map((p) => p.toJSON()));
});

// --------------------------------------------------
// POST: Add New Product
// --------------------------------------------------
app.post("/api/products", (req, res) => {
  const { name, description, price, sellerId, category, stock } = req.body;

  const id = service.getNextAvailableID();

  const product = ProductFactory.makeProduct(
    id,
    name,
    description,
    Number(price),
    Number(sellerId),
    category,
    Number(stock)
  );

  service.addProduct(product);

  console.log(
    `POST: /api/products: SUCCESS (Added productId: ${product.productId})`
  );

  res.json({ success: true, product: product.toJSON() });
});

// --------------------------------------------------
// PUT: Update Attribute
// --------------------------------------------------
app.put("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const updates = req.body;

  const failed = [];
  const succeeded = [];

  for (const [attribute, value] of Object.entries(updates)) {
    const result = service.changeAttribute(id, attribute, value);
    result ? succeeded.push(attribute) : failed.push(attribute);
  }

  const updatedProduct = service.findByAttribute("productId", id)[0] || null;

  const response = {
    success: failed.length === 0,
    message:
      failed.length === 0
        ? "Product updated successfully"
        : `Update failed in: ${failed.join(", ")}`,
    updatedAttributes: succeeded,
    failedAttributes: failed,
    product: updatedProduct ? updatedProduct.toJSON() : null,
  };

  console.log(
    `PUT: /api/products/${id}: ${response.success ? "SUCCESS" : "FAILED"}${
      succeeded.length ? ` (Updated: ${succeeded.join(", ")})` : ""
    }`
  );

  return res.json(response);
});

// --------------------------------------------------
// DELETE: Delete One Product
// --------------------------------------------------
app.delete("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);

  const success = service.deleteProduct(id);

  console.log(`DELETE: /api/products/${id}: ${success ? "SUCCESS" : "FAILED"}`);

  res.json({ success });
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
