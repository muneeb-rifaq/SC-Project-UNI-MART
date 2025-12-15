import express from "express";
import { verifyRole } from "../middleware/verifyUser.js";

import ProductController from "../../main/controllers/ProductController.js";
import CategoryController from "../../main/controllers/CategoryController.js";
import OrderController from "../../main/controllers/OrderController.js";
import UserController from "../../main/controllers/UserController.js";
import LoggingController from "../../main/controllers/LoggingController.js";

const router = express.Router();

// ======================================================
//  HELPER: Verify Seller Ownership
// ======================================================
const verifySellerOwnership = async (sellerId, userEmail) => {
  // Check if sellerId is present
  if (!sellerId) {
    return { valid: false, error: "sellerId is required", status: 400 };
  }

  // Check if x-user-email header is present
  if (!userEmail) {
    return {
      valid: false,
      error: "x-user-email header is required",
      status: 400,
    };
  }

  try {
    // Fetch the user by sellerId to verify email
    const users = UserController.service.findByAttribute("userId", sellerId);

    if (!users || users.length === 0) {
      console.warn(`⚠️ No user found with sellerId: ${sellerId}`);
      return { valid: false, error: "Invalid sellerId", status: 403 };
    }

    const seller = users[0];
    const sellerEmail = seller.getAttribute("email");

    // Verify that the seller's email matches the x-user-email header
    if (sellerEmail !== userEmail) {
      console.warn(
        `⚠️ Email mismatch: seller email=${sellerEmail}, header email=${userEmail}`
      );
      return {
        valid: false,
        error: "sellerId does not match authenticated user email",
        status: 403,
      };
    }

    console.log("✅ Seller ownership verification passed");
    return { valid: true };
  } catch (err) {
    console.error("❌ Error in seller ownership verification:", err);
    return { valid: false, error: "Internal server error", status: 500 };
  }
};

// ======================================================
//  HELPER: Get Seller ID from Email
// ======================================================
const getSellerIdFromEmail = (userEmail) => {
  const users = UserController.service.findByAttribute("email", userEmail);

  if (!users || users.length === 0) {
    return null;
  }

  return users[0].getAttribute("userId");
};

// ======================================================
//  HELPER: Verify Product Belongs to Seller
// ======================================================
const verifyProductOwnership = async (productId, userEmail) => {
  if (!productId) {
    return { valid: false, error: "productId is required", status: 400 };
  }

  if (!userEmail) {
    return {
      valid: false,
      error: "x-user-email header is required",
      status: 400,
    };
  }

  try {
    // Fetch the product
    const products = ProductController.service.findByAttribute(
      "productId",
      Number(productId)
    );

    if (!products || products.length === 0) {
      console.warn(`⚠️ Product not found: ${productId}`);
      return { valid: false, error: "Product not found", status: 404 };
    }

    const product = products[0];
    const productSellerId = product.getAttribute("sellerId");

    // Verify seller ownership
    const ownershipCheck = await verifySellerOwnership(
      productSellerId,
      userEmail
    );

    if (!ownershipCheck.valid) {
      return {
        valid: false,
        error: "You do not own this product",
        status: 403,
      };
    }

    console.log("✅ Product ownership verification passed");
    return { valid: true };
  } catch (err) {
    console.error("❌ Error in product ownership verification:", err);
    return { valid: false, error: "Internal server error", status: 500 };
  }
};

// --------------------------------------
// VERIFY SELLER ROLE FOR ALL ROUTES
// --------------------------------------
router.use((req, res, next) => {
  console.log("🔒 Seller verification:", req.method, req.originalUrl);

  verifyRole("seller")(req, res, (err) => {
    if (err) {
      console.error("❌ verifyRole error:", err);
      return res.status(500).json({ message: "Internal middleware error" });
    }
    next();
  });
});

// ======================================================
//  PRODUCT ROUTES  → /api/seller/products
//  Seller can perform all CRUD operations on their own products
// ======================================================

// GET ALL PRODUCTS FROM ALL SELLERS (read-only for marketplace view)
router.get("/products/all", (req, res) => {
  console.log("📥 GET /seller/products/all - All products from all sellers");
  return ProductController.getAll(req, res);
});

// GET ALL PRODUCTS (seller's own products)
router.get("/products", (req, res) => {
  console.log("📥 GET /seller/products");

  const userEmail = req.headers["x-user-email"];

  // Get all products
  const allProducts = ProductController.service.getAll();

  // Filter products by seller email
  const sellerProducts = allProducts.filter((product) => {
    const sellerId = product.getAttribute("sellerId");
    if (!sellerId) return false;

    const sellers = UserController.service.findByAttribute("userId", sellerId);
    if (!sellers || sellers.length === 0) return false;

    return sellers[0].getAttribute("email") === userEmail;
  });

  // Convert to JSON
  const productsData = sellerProducts.map((p) => p.toJSON());

  return res.status(200).json(productsData);
});

// FIND PRODUCTS
router.get("/products/find", (req, res) => {
  console.log("📥 GET /seller/products/find", req.query);
  return ProductController.findByAttribute(req, res);
});

// ADD NEW PRODUCT
router.post("/products", async (req, res) => {
  console.log("📥 POST /seller/products", req.body);

  const userEmail = req.headers["x-user-email"];

  if (!userEmail) {
    return res.status(400).json({ error: "x-user-email header is required" });
  }

  // Get seller's userId from email
  const sellers = UserController.service.findByAttribute("email", userEmail);
  if (!sellers || sellers.length === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  const sellerId = sellers[0].getAttribute("userId");

  // Add sellerId to request body
  req.body.sellerId = sellerId;

  return ProductController.addProduct(req, res);
});

// UPDATE PRODUCT (supports both single attribute and bulk updates)
router.patch("/products/:id", async (req, res) => {
  console.log("📥 PATCH /seller/products/:id - ROUTE HANDLER CALLED");
  console.log("   Product ID:", req.params.id);
  console.log("   Request body:", JSON.stringify(req.body, null, 2));
  console.log("   Body keys:", Object.keys(req.body));
  console.log("   Has 'attribute'?", req.body.hasOwnProperty("attribute"));
  console.log("   Has 'value'?", req.body.hasOwnProperty("value"));
  console.log("   req.body.attribute value:", req.body.attribute);
  console.log("   req.body.value value:", req.body.value);

  const userEmail = req.headers["x-user-email"];
  console.log("   User email:", userEmail);

  const verification = await verifyProductOwnership(req.params.id, userEmail);
  console.log("   Ownership verified:", verification.valid);

  if (!verification.valid) {
    console.log("❌ Ownership verification failed:", verification.error);
    return res.status(verification.status).json({ error: verification.error });
  }

  // Check if this is a single attribute update or bulk update
  const hasAttributeKey = req.body.attribute && req.body.value !== undefined;
  console.log(
    "   Condition check (attribute && value !== undefined):",
    hasAttributeKey
  );

  if (hasAttributeKey) {
    // Single attribute update
    console.log("➡️ ROUTING TO: ProductController.updateAttribute");
    return ProductController.updateAttribute(req, res);
  } else {
    // Bulk update
    console.log("➡️ ROUTING TO: ProductController.updateProduct");
    return ProductController.updateProduct(req, res);
  }
});

// DELETE PRODUCT
router.delete("/products/:id", async (req, res) => {
  console.log("📥 DELETE /seller/products/:id", req.params.id);

  const userEmail = req.headers["x-user-email"];
  const verification = await verifyProductOwnership(req.params.id, userEmail);

  if (!verification.valid) {
    return res.status(verification.status).json({ error: verification.error });
  }

  return ProductController.deleteProduct(req, res);
});

// ======================================================
//  CATEGORY ROUTES → /api/seller/categories
//  Seller can only READ categories
// ======================================================

// GET ALL CATEGORIES
router.get("/categories", (req, res) => {
  console.log("📥 GET /seller/categories");
  return CategoryController.getAll(req, res);
});

// FIND CATEGORIES
router.get("/categories/find", (req, res) => {
  console.log("📥 GET /seller/categories/find", req.query);
  return CategoryController.findByAttribute(req, res);
});

// ======================================================
//  ORDER ROUTES → /api/seller/orders
//  Seller can READ and UPDATE orders (status changes)
// ======================================================

// GET ALL ORDERS (filtered by seller's userId)
router.get("/orders", (req, res) => {
  console.log("📥 GET /seller/orders");

  const userEmail = req.headers["x-user-email"];

  if (!userEmail) {
    return res.status(400).json({ error: "x-user-email header is required" });
  }

  try {
    const sellerId = getSellerIdFromEmail(userEmail);

    if (!sellerId) {
      return res.status(404).json({ error: "User not found" });
    }

    // Filter orders by sellerId
    const sellerOrders = OrderController.service.findByAttribute(
      "sellerId",
      sellerId
    );

    return res.status(200).json(sellerOrders.map((o) => o.toJSON()));
  } catch (err) {
    console.error("❌ Error in GET /seller/orders:", err);
    return res.status(500).json({ error: err.message });
  }
});

// FIND ORDERS (filtered by seller's userId)
router.get("/orders/find", (req, res) => {
  console.log("📥 GET /seller/orders/find", req.query);

  const userEmail = req.headers["x-user-email"];
  const { attribute, value } = req.query;

  if (!userEmail) {
    return res.status(400).json({ error: "x-user-email header is required" });
  }

  if (!attribute) {
    return res.status(400).json({ error: "attribute query required" });
  }

  try {
    const sellerId = getSellerIdFromEmail(userEmail);

    if (!sellerId) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find orders by attribute AND filter by sellerId
    let results = OrderController.service.findByAttribute(attribute, value);
    results = results.filter((o) => o.getAttribute("sellerId") === sellerId);

    return res.status(200).json(results.map((o) => o.toJSON()));
  } catch (err) {
    console.error("❌ Error in GET /seller/orders/find:", err);
    return res.status(500).json({ error: err.message });
  }
});

// UPDATE ORDER (e.g., status change) - only if it belongs to the seller
router.patch("/orders/:id", (req, res) => {
  console.log("📥 PATCH /seller/orders/:id", req.params.id, req.body);

  const userEmail = req.headers["x-user-email"];

  if (!userEmail) {
    return res.status(400).json({ error: "x-user-email header is required" });
  }

  try {
    const sellerId = getSellerIdFromEmail(userEmail);

    if (!sellerId) {
      return res.status(404).json({ error: "User not found" });
    }

    const orderId = Number(req.params.id);
    const orders = OrderController.service.findByAttribute("orderId", orderId);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orders[0];

    if (order.getAttribute("sellerId") !== sellerId) {
      return res.status(403).json({
        error: "You can only update orders for your own products",
      });
    }

    return OrderController.updateAttribute(req, res);
  } catch (err) {
    console.error("❌ Error in PATCH /seller/orders/:id:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ======================================================
//  LOGGING ROUTES → /api/seller/logs
//  Seller can only access logs they created
// ======================================================

// GET SELLER'S OWN LOGS
router.get("/logs", (req, res) => {
  console.log("📥 GET /seller/logs");
  try {
    const userEmail = req.headers["x-user-email"];

    if (!userEmail) {
      return res.status(400).json({ error: "x-user-email header is required" });
    }

    // Get all logs and filter by performedBy email
    const allLogs = LoggingController.service.getAll();
    console.log(`🔍 Total logs in database: ${allLogs.length}`);
    console.log(`🔍 Filtering for user: ${userEmail}`);

    // Debug: Show all unique performedBy emails
    const uniqueEmails = [
      ...new Set(allLogs.map((log) => log.getAttribute("performedBy"))),
    ];
    console.log(`🔍 Unique emails in logs:`, uniqueEmails);

    const sellerLogs = allLogs.filter(
      (log) => log.getAttribute("performedBy") === userEmail
    );

    console.log(
      `✅ Retrieved ${sellerLogs.length} logs for seller ${userEmail}`
    );

    // Debug: Show operation types breakdown
    const opTypeCounts = {};
    sellerLogs.forEach((log) => {
      const opType = log.getAttribute("operationType");
      opTypeCounts[opType] = (opTypeCounts[opType] || 0) + 1;
    });
    console.log(`📊 Operation breakdown:`, opTypeCounts);

    return res.status(200).json(sellerLogs.map((log) => log.toJSON()));
  } catch (err) {
    console.error("❌ Error in GET /seller/logs:", err);
    return res.status(500).json({ error: err.message });
  }
});

// FIND SELLER'S OWN LOGS BY ATTRIBUTE
router.get("/logs/find", (req, res) => {
  console.log("📥 GET /seller/logs/find", req.query);
  try {
    const userEmail = req.headers["x-user-email"];
    let { attribute, value } = req.query;

    if (!userEmail) {
      return res.status(400).json({ error: "x-user-email header is required" });
    }

    if (!attribute) {
      return res.status(400).json({ error: "attribute query required" });
    }

    // Convert numeric strings to numbers for logId
    if (attribute === "logId" && !isNaN(value)) {
      value = Number(value);
    }

    // Get filtered logs and then filter by performedBy email
    const filteredLogs = LoggingController.service.findByAttribute(
      attribute,
      value
    );
    const sellerLogs = filteredLogs.filter(
      (log) => log.getAttribute("performedBy") === userEmail
    );

    console.log(
      `✅ Found ${sellerLogs.length} logs for seller ${userEmail} matching ${attribute}=${value}`
    );
    return res.status(200).json(sellerLogs.map((log) => log.toJSON()));
  } catch (err) {
    console.error("❌ Error in GET /seller/logs/find:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
