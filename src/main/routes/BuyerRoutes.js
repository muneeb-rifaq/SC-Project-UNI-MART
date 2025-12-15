import express from "express";
import { verifyRole } from "../middleware/verifyUser.js";

import ProductController from "../../main/controllers/ProductController.js";
import CategoryController from "../../main/controllers/CategoryController.js";
import OrderController from "../../main/controllers/OrderController.js";
import UserController from "../../main/controllers/UserController.js";
import LoggingController from "../../main/controllers/LoggingController.js";

const router = express.Router();

// --------------------------------------
// HELPER FUNCTIONS
// --------------------------------------

/**
 * Get buyer's userId from email header
 * @param {string} userEmail - Email from x-user-email header
 * @returns {number|null} - Returns userId or null if not found
 */
function getBuyerIdFromEmail(userEmail) {
  const users = UserController.service.findByAttribute("email", userEmail);

  if (!users || users.length === 0) {
    return null;
  }

  return users[0].getAttribute("userId");
}

/**
 * Verify if an order belongs to the buyer
 * @param {number} orderId - The order ID to check
 * @param {number} buyerId - The buyer's userId
 * @returns {Object|null} - Returns order object if it belongs to buyer, null otherwise
 */
function verifyOrderOwnership(orderId, buyerId) {
  const orders = OrderController.service.findByAttribute("orderId", orderId);

  if (!orders || orders.length === 0) {
    return null;
  }

  const order = orders[0];

  if (order.getAttribute("buyerId") !== buyerId) {
    return null;
  }

  return order;
}

// --------------------------------------
// VERIFY BUYER ROLE FOR ALL ROUTES
// --------------------------------------
router.use((req, res, next) => {
  console.log("🔒 Buyer verification:", req.method, req.originalUrl);

  verifyRole("buyer")(req, res, (err) => {
    if (err) {
      console.error("❌ verifyRole error:", err);
      return res.status(500).json({ message: "Internal middleware error" });
    }
    next();
  });
});

// ======================================================
//  PRODUCT ROUTES  → /api/buyer/product
// ======================================================

// GET ALL PRODUCTS
router.get("/products", (req, res) => {
  console.log("📥 GET /buyer/products");
  return ProductController.getAll(req, res);
});

// FIND PRODUCTS
router.get("/products/find", (req, res) => {
  console.log("📥 GET /buyer/product/find", req.query);
  return ProductController.findByAttribute(req, res);
});

// ======================================================
//  CATEGORY ROUTES → /api/buyer/categories
// ======================================================

// GET ALL CATEGORIES
router.get("/categories", (req, res) => {
  console.log("📥 GET /buyer/categories");
  return CategoryController.getAll(req, res);
});

// FIND CATEGORIES
router.get("/categories/find", (req, res) => {
  console.log("📥 GET /buyer/categories/find", req.query);
  return CategoryController.findByAttribute(req, res);
});

// ======================================================
//  SELLER INFO ROUTES → /api/buyer/sellers
// ======================================================

// GET SELLER BASIC INFO BY ID
router.get("/sellers/:id", (req, res) => {
  console.log("📥 GET /buyer/sellers/:id", req.params.id);

  const sellerId = Number(req.params.id);

  if (!sellerId || sellerId <= 0) {
    return res.status(400).json({ error: "Valid seller ID is required" });
  }

  try {
    // Find the seller by userId
    const sellers = UserController.service.findByAttribute("userId", sellerId);

    if (!sellers || sellers.length === 0) {
      return res.status(404).json({ error: "Seller not found" });
    }

    const seller = sellers[0];

    // Verify it's actually a seller
    if (seller.getAttribute("role") !== "seller") {
      return res.status(404).json({ error: "User is not a seller" });
    }

    // Return only basic, non-sensitive information
    const basicInfo = {
      userId: seller.getAttribute("userId"),
      username: seller.getAttribute("username"),
      email: seller.getAttribute("email"),
      createdAt: seller.getAttribute("createdAt"),
    };

    return res.status(200).json(basicInfo);
  } catch (err) {
    console.error("❌ Error in GET /buyer/sellers/:id:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ======================================================
//  ORDER ROUTES → /api/buyer/orders
// ======================================================

// GET ALL ORDERS (filtered by buyer's userId)
router.get("/orders", (req, res) => {
  console.log("📥 GET /buyer/orders");

  const userEmail = req.headers["x-user-email"];

  if (!userEmail) {
    return res.status(400).json({ error: "x-user-email header is required" });
  }

  try {
    const buyerId = getBuyerIdFromEmail(userEmail);

    if (!buyerId) {
      return res.status(404).json({ error: "User not found" });
    }

    // Filter orders by buyerId
    const buyerOrders = OrderController.service.findByAttribute(
      "buyerId",
      buyerId
    );

    return res.status(200).json(buyerOrders.map((o) => o.toJSON()));
  } catch (err) {
    console.error("❌ Error in GET /buyer/orders:", err);
    return res.status(500).json({ error: err.message });
  }
});

// FIND ORDERS (filtered by buyer's userId)
router.get("/orders/find", (req, res) => {
  console.log("📥 GET /buyer/orders/find", req.query);

  const userEmail = req.headers["x-user-email"];
  const { attribute, value } = req.query;

  if (!userEmail) {
    return res.status(400).json({ error: "x-user-email header is required" });
  }

  if (!attribute) {
    return res.status(400).json({ error: "attribute query required" });
  }

  try {
    const buyerId = getBuyerIdFromEmail(userEmail);

    if (!buyerId) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find orders by attribute AND filter by buyerId
    let results = OrderController.service.findByAttribute(attribute, value);
    results = results.filter((o) => o.getAttribute("buyerId") === buyerId);

    return res.status(200).json(results.map((o) => o.toJSON()));
  } catch (err) {
    console.error("❌ Error in GET /buyer/orders/find:", err);
    return res.status(500).json({ error: err.message });
  }
});

// PLACE NEW ORDER
router.post("/orders", (req, res) => {
  console.log("📥 POST /buyer/orders", req.body);
  return OrderController.addOrder(req, res);
});

// DELETE ORDER (only if it belongs to the buyer and not completed)
router.delete("/orders/:id", (req, res) => {
  console.log("📥 DELETE /buyer/orders", req.params.id);

  const userEmail = req.headers["x-user-email"];

  if (!userEmail) {
    return res.status(400).json({ error: "x-user-email header is required" });
  }

  try {
    const buyerId = getBuyerIdFromEmail(userEmail);

    if (!buyerId) {
      return res.status(404).json({ error: "User not found" });
    }

    const orderId = Number(req.params.id);
    const order = verifyOrderOwnership(orderId, buyerId);

    if (!order) {
      return res.status(403).json({
        error: "Order not found or you can only delete your own orders",
      });
    }

    // Check if order is completed, shipped, or delivered
    const status = order.getAttribute("status");
    if (
      status === "shipped" ||
      status === "completed" ||
      status === "delivered"
    ) {
      return res.status(403).json({
        error:
          "Cannot cancel orders that have been shipped, completed, or delivered",
      });
    }

    return OrderController.deleteOrder(req, res);
  } catch (err) {
    console.error("❌ Error in DELETE /buyer/orders:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ======================================================
//  LOGGING ROUTES → /api/buyer/logs
//  Buyer can only access logs they created
// ======================================================

// GET BUYER'S OWN LOGS
router.get("/logs", (req, res) => {
  console.log("📥 GET /buyer/logs");
  try {
    const userEmail = req.headers["x-user-email"];

    if (!userEmail) {
      return res.status(400).json({ error: "x-user-email header is required" });
    }

    // Get all logs and filter by performedBy email
    const allLogs = LoggingController.service.getAll();
    const buyerLogs = allLogs.filter(
      (log) => log.getAttribute("performedBy") === userEmail
    );

    console.log(`✅ Retrieved ${buyerLogs.length} logs for buyer ${userEmail}`);
    return res.status(200).json(buyerLogs.map((log) => log.toJSON()));
  } catch (err) {
    console.error("❌ Error in GET /buyer/logs:", err);
    return res.status(500).json({ error: err.message });
  }
});

// FIND BUYER'S OWN LOGS BY ATTRIBUTE
router.get("/logs/find", (req, res) => {
  console.log("📥 GET /buyer/logs/find", req.query);
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
    const buyerLogs = filteredLogs.filter(
      (log) => log.getAttribute("performedBy") === userEmail
    );

    console.log(
      `✅ Found ${buyerLogs.length} logs for buyer ${userEmail} matching ${attribute}=${value}`
    );
    return res.status(200).json(buyerLogs.map((log) => log.toJSON()));
  } catch (err) {
    console.error("❌ Error in GET /buyer/logs/find:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
