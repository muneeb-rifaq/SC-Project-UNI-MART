import express from "express";
import { verifyRole } from "../middleware/verifyUser.js";

import ProductController from "../../main/controllers/ProductController.js";
import CategoryController from "../../main/controllers/CategoryController.js";
import OrderController from "../../main/controllers/OrderController.js";
import UserController from "../../main/controllers/UserController.js";
import LoggingController from "../../main/controllers/LoggingController.js";

const router = express.Router();

// --------------------------------------
// VERIFY ADMIN ROLE FOR ALL ROUTES
// --------------------------------------
router.use((req, res, next) => {
  console.log("🔒 Admin verification:", req.method, req.originalUrl);

  verifyRole("admin")(req, res, (err) => {
    if (err) {
      console.error("❌ verifyRole error:", err);
      return res.status(500).json({ message: "Internal middleware error" });
    }
    next();
  });
});

// ======================================================
//  PRODUCT ROUTES  → /api/admin/products
//  Admin has full CRUD access to all products
// ======================================================

// GET ALL PRODUCTS
router.get("/products", (req, res) => {
  console.log("📥 GET /admin/products");
  return ProductController.getAll(req, res);
});

// FIND PRODUCTS
router.get("/products/find", (req, res) => {
  console.log("📥 GET /admin/products/find", req.query);
  return ProductController.findByAttribute(req, res);
});

// UPDATE PRODUCT (supports both single attribute and bulk updates)
router.patch("/products/:id", (req, res) => {
  console.log("📥 PATCH /admin/products/:id", req.params.id, req.body);
  console.log("🔍 Request body keys:", Object.keys(req.body));
  console.log("🔍 Has 'attribute' key?", req.body.hasOwnProperty("attribute"));
  console.log("🔍 Has 'value' key?", req.body.hasOwnProperty("value"));

  // Check if this is a single attribute update or bulk update
  if (req.body.attribute && req.body.value !== undefined) {
    // Single attribute update
    console.log("➡️ Routing to ProductController.updateAttribute");
    return ProductController.updateAttribute(req, res);
  } else {
    // Bulk update
    console.log("➡️ Routing to ProductController.updateProduct");
    return ProductController.updateProduct(req, res);
  }
});

// DELETE PRODUCT
router.delete("/products/:id", (req, res) => {
  console.log("📥 DELETE /admin/products/:id", req.params.id);
  return ProductController.deleteProduct(req, res);
});

// ERASE ALL PRODUCTS (Admin only)
router.delete("/products", (req, res) => {
  console.log("📥 DELETE /admin/products (ERASE ALL)");
  return ProductController.eraseAll(req, res);
});

// ======================================================
//  CATEGORY ROUTES → /api/admin/categories
//  Admin has full CRUD access to all categories
// ======================================================

// GET ALL CATEGORIES
router.get("/categories", (req, res) => {
  console.log("📥 GET /admin/categories");
  return CategoryController.getAll(req, res);
});

// FIND CATEGORIES
router.get("/categories/find", (req, res) => {
  console.log("📥 GET /admin/categories/find", req.query);
  return CategoryController.findByAttribute(req, res);
});

// ADD NEW CATEGORY
router.post("/categories", (req, res) => {
  console.log("📥 POST /admin/categories", req.body);
  return CategoryController.addCategory(req, res);
});

// UPDATE CATEGORY (supports both single attribute and bulk updates)
router.patch("/categories/:id", (req, res) => {
  console.log("📥 PATCH /admin/categories/:id", req.params.id, req.body);
  console.log("🔍 Request body keys:", Object.keys(req.body));
  console.log("🔍 Has 'attribute' key?", req.body.hasOwnProperty("attribute"));
  console.log("🔍 Has 'value' key?", req.body.hasOwnProperty("value"));

  // Check if this is a single attribute update or bulk update
  if (req.body.attribute && req.body.value !== undefined) {
    // Single attribute update
    console.log("➡️ Routing to updateAttribute");
    return CategoryController.updateAttribute(req, res);
  } else {
    // Bulk update
    console.log("➡️ Routing to updateCategory");
    return CategoryController.updateCategory(req, res);
  }
});

// DELETE CATEGORY (also sets products' categoryId to null)
router.delete("/categories/:id", (req, res) => {
  console.log("📥 DELETE /admin/categories/:id", req.params.id);

  const categoryId = Number(req.params.id);

  try {
    // Find all products with this categoryId
    const products = ProductController.service.findByAttribute(
      "categoryId",
      categoryId
    );

    // Update each product's categoryId to null
    products.forEach((product) => {
      const productId = product.getAttribute("productId");
      ProductController.service.updateAttribute(productId, "categoryId", null);
    });

    console.log(
      `✅ Updated ${products.length} products, set categoryId to null`
    );

    // Now delete the category
    return CategoryController.deleteCategory(req, res);
  } catch (err) {
    console.error("❌ Error in DELETE /admin/categories/:id:", err);
    console.error("Stack trace:", err.stack);
    return res
      .status(500)
      .json({ error: err.message, source: "DELETE /admin/categories/:id" });
  }
});

// ERASE ALL CATEGORIES (Admin only - also sets all products' categoryId to null)
router.delete("/categories", (req, res) => {
  console.log("📥 DELETE /admin/categories (ERASE ALL)");

  try {
    // Get all products
    const allProducts = ProductController.service.getAll();

    // Update each product's categoryId to null
    allProducts.forEach((product) => {
      const productId = product.getAttribute("productId");
      ProductController.service.updateAttribute(productId, "categoryId", null);
    });

    console.log(
      `✅ Updated ${allProducts.length} products, set all categoryId to null`
    );

    // Now delete all categories
    return CategoryController.eraseAll(req, res);
  } catch (err) {
    console.error("❌ Error in DELETE /admin/categories (ERASE ALL):", err);
    console.error("Stack trace:", err.stack);
    return res.status(500).json({
      error: err.message,
      source: "DELETE /admin/categories (ERASE ALL)",
    });
  }
});

// ======================================================
//  ORDER ROUTES → /api/admin/orders
//  Admin has full CRUD access to all orders
// ======================================================

// GET ALL ORDERS
router.get("/orders", (req, res) => {
  console.log("📥 GET /admin/orders");
  return OrderController.getAll(req, res);
});

// FIND ORDERS
router.get("/orders/find", (req, res) => {
  console.log("📥 GET /admin/orders/find", req.query);
  return OrderController.findByAttribute(req, res);
});

// UPDATE ORDER ATTRIBUTE
router.patch("/orders/:id", (req, res) => {
  console.log("📥 PATCH /admin/orders/:id", req.params.id, req.body);
  return OrderController.updateAttribute(req, res);
});

// DELETE ORDER
router.delete("/orders/:id", (req, res) => {
  console.log("📥 DELETE /admin/orders/:id", req.params.id);
  return OrderController.deleteOrder(req, res);
});

// ERASE ALL ORDERS (Admin only)
router.delete("/orders", (req, res) => {
  console.log("📥 DELETE /admin/orders (ERASE ALL)");
  return OrderController.eraseAll(req, res);
});

// ======================================================
//  USER ROUTES → /api/admin/users
//  Admin has full CRUD access to all users
// ======================================================

// GET ALL USERS
router.get("/users", (req, res) => {
  console.log("📥 GET /admin/users");
  return UserController.getAll(req, res);
});

// FIND USERS
router.get("/users/find", (req, res) => {
  console.log("📥 GET /admin/users/find", req.query);
  return UserController.findByAttribute(req, res);
});

// ADD NEW USER
router.post("/users", (req, res) => {
  console.log("📥 POST /admin/users", req.body);
  return UserController.addUser(req, res);
});

// UPDATE USER ATTRIBUTE
router.patch("/users/:id", (req, res) => {
  console.log("📥 PATCH /admin/users/:id", req.params.id, req.body);
  return UserController.updateAttribute(req, res);
});

// DELETE USER (also sets sellerId to null for their products)
router.delete("/users/:id", (req, res) => {
  console.log("📥 DELETE /admin/users/:id", req.params.id);

  try {
    const userId = Number(req.params.id);

    // Get all products owned by this user
    const products = ProductController.service.findByAttribute(
      "sellerId",
      userId
    );

    // Update each product's sellerId to null
    products.forEach((product) => {
      const productId = product.getAttribute("productId");
      ProductController.service.updateAttribute(productId, "sellerId", null);
    });

    console.log(`✅ Updated ${products.length} products, set sellerId to null`);

    // Now delete the user
    return UserController.deleteUser(req, res);
  } catch (err) {
    console.error("❌ Error in DELETE /admin/users/:id:", err);
    console.error("Stack trace:", err.stack);
    return res
      .status(500)
      .json({ error: err.message, source: "DELETE /admin/users/:id" });
  }
});

// ERASE ALL USERS (Admin only - also sets all products' sellerId to null)
router.delete("/users", (req, res) => {
  console.log("📥 DELETE /admin/users (ERASE ALL)");

  try {
    // Get all products
    const allProducts = ProductController.service.getAll();

    // Update each product's sellerId to null
    allProducts.forEach((product) => {
      const productId = product.getAttribute("productId");
      ProductController.service.updateAttribute(productId, "sellerId", null);
    });

    console.log(
      `✅ Updated ${allProducts.length} products, set all sellerId to null`
    );

    // Now delete all users
    return UserController.eraseAll(req, res);
  } catch (err) {
    console.error("❌ Error in DELETE /admin/users (ERASE ALL):", err);
    console.error("Stack trace:", err.stack);
    return res
      .status(500)
      .json({ error: err.message, source: "DELETE /admin/users (ERASE ALL)" });
  }
});

// ======================================================
//  LOGGING ROUTES → /api/admin/logs
//  Admin has full read access to all logs
// ======================================================

// GET ALL LOGS
router.get("/logs", (req, res) => {
  console.log("📥 GET /admin/logs");
  return LoggingController.getAll(req, res);
});

// FIND LOGS BY ATTRIBUTE
router.get("/logs/find", (req, res) => {
  console.log("📥 GET /admin/logs/find", req.query);
  return LoggingController.findByAttribute(req, res);
});

export default router;
