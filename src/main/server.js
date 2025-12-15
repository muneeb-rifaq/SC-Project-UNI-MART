// ------------ Import Modules ------------
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

// Import Routes needed for the server
import DBHandler from "../backend/utils/dbHandler.js";
import AuthRoutes from "./routes/AuthRoutes.js";
import BuyerRoutes from "./routes/BuyerRoutes.js";
import SellerRoutes from "./routes/SellerRoutes.js";
import AdminRoutes from "./routes/AdminRoutes.js";

// Import Logging Service
import LoggingService from "../backend/modules/loggingModules/LoggingService.js";

// ------------ Initialize DB ------------
try {
  DBHandler.initialize();
} catch (err) {
  console.error("Server stopped due to DB error.");
  process.exit(1);
}

// ------------ Initialize Logging Service ------------
const loggingService = new LoggingService();

// ------------ Initialize Server ------------
const app = express();
const PORT = 3000;

// ------------ Middleware ------------
app.use(cors());
app.use(bodyParser.json());

// ------------ Logging Middleware ------------
app.use((req, res, next) => {
  // Only log CREATE, UPDATE, DELETE operations (not GET)
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    // Map HTTP methods to operation types
    const operationMap = {
      POST: "CREATE",
      PUT: "UPDATE",
      PATCH: "UPDATE",
      DELETE: "DELETE",
    };

    const operationType = operationMap[req.method];

    // Extract resource name from URL path, ignoring :id parameters
    // e.g., /api/buyer/products/:id -> products, /api/admin/users -> users
    const pathParts = req.path
      .split("/")
      .filter((p) => p && !p.startsWith(":"));

    // Get the last non-numeric part (table name)
    let tableName = "unknown";
    for (let i = pathParts.length - 1; i >= 0; i--) {
      // Skip numeric IDs and common keywords
      if (
        !/^\d+$/.test(pathParts[i]) &&
        !["api", "admin", "buyer", "seller"].includes(pathParts[i])
      ) {
        tableName = pathParts[i];
        break;
      }
    }

    // Get user email from header (most routes) or body (login route)
    const performedBy =
      req.headers["x-user-email"] || req.body?.email || "anonymous";

    // Create description with method, path, and optional resource info
    const description = `${req.method} ${req.path}`;

    // Log the operation
    try {
      loggingService.addLog(tableName, operationType, performedBy, description);
    } catch (err) {
      console.error("Logging error:", err.message);
    }
  }

  next();
});

// ------------ Home Page ------------
app.get("/", (req, res) => {
  res.send("<h1>UNIMART Backend Server Running</h1>");
});

// ------------ API Routes ------------
app.use("/api/login", AuthRoutes);
app.use("/api/buyer", BuyerRoutes);
app.use("/api/seller", SellerRoutes);
app.use("/api/admin", AdminRoutes);

// ------------ Start Server Only If Not Testing ------------
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

// ------------ Export App for Integration Tests ------------
export default app;
