// initDB.js
import path from "path";
import { fileURLToPath } from "url";

import UserService from "../modules/userModules/UserService.js";
import CategoryService from "../modules/categoryModules/CategoryService.js";
import ProductService from "../modules/productModules/ProductService.js";
import OrderService from "../modules/orderModules/OrderService.js";

// -----------------------------------------------------
// Pretty print utilities (same style as your printProducts)
// -----------------------------------------------------
// splitPrint.js
export const splitPrint = (items, tableName = "table") => {
  if (!items || items.length === 0) {
    console.log(`No data found for ${tableName}`);
    return;
  }

  // Convert items to plain objects
  const data = items.map((item) => {
    let obj = typeof item.toJSON === "function" ? item.toJSON() : { ...item };

    // Special handling for orders → parse product JSON if needed
    if (tableName.toLowerCase() === "orders" && obj.product) {
      if (typeof obj.product === "string") {
        try {
          obj.product = JSON.parse(obj.product);
        } catch {}
      }
      // Flatten product info
      if (typeof obj.product === "object") {
        obj.productId = obj.product.productId;
        obj.productName = obj.product.name;
        obj.productPrice = obj.product.price;
        delete obj.product;
      }
    }

    return obj;
  });

  // Split keys in half for better console display
  const keys = Object.keys(data[0]);
  const mid = Math.ceil(keys.length / 2);

  const A = keys.slice(0, mid);
  const B = keys.slice(mid);

  const t1 = data.map((x) => {
    const o = {};
    A.forEach((k) => (o[k] = x[k]));
    return o;
  });

  const t2 = data.map((x) => {
    const o = {};
    B.forEach((k) => (o[k] = x[k]));
    return o;
  });

  console.log(`\n==== ${tableName} (Part 1) ====`);
  console.table(t1);
  console.log(`==== ${tableName} (Part 2) ====`);
  console.table(t2);
};

const printUsers = (users) => splitPrint(users);
const printCategories = (categories) => splitPrint(categories);
const printProducts = (products) => splitPrint(products);
const printOrders = (orders) => splitPrint(orders);

// -----------------------------------------------------
// Create Service Instances
// -----------------------------------------------------
const userService = new UserService();
const categoryService = new CategoryService();
const productService = new ProductService();
const orderService = new OrderService();

// -----------------------------------------------------
// Utility: Create FIXED sample data
// -----------------------------------------------------
async function generateStarterData() {
  console.log("\n🚀 Initializing Database With Starter Data...\n");

  // ============================
  // 1. USERS
  // ============================
  console.log("Creating users...");

  await userService.eraseAll();

  const userAdmin = await userService.addUser(
    "admin",
    "admin@unimart.com",
    "hashed_admin_pass",
    "admin"
  );

  const userSeller1 = await userService.addUser(
    "sellerAli",
    "ali@shop.com",
    "hashed_pass1",
    "seller"
  );

  const userSeller2 = await userService.addUser(
    "sellerSara",
    "sara@shop.com",
    "hashed_pass2",
    "seller"
  );

  const buyer1 = await userService.addUser(
    "johnDoe",
    "john@example.com",
    "hashed_pass3",
    "buyer"
  );

  const buyer2 = await userService.addUser(
    "maryJane",
    "mary@example.com",
    "hashed_pass4",
    "buyer"
  );

  console.log("Users inserted ✔");
  printUsers(userService.getAll());

  // ============================
  // 2. CATEGORIES
  // ============================
  console.log("Creating categories...");

  await categoryService.eraseAll();

  const electronics = await categoryService.addCategory(
    "Electronics",
    "Laptops, phones, gadgets"
  );

  const clothing = await categoryService.addCategory(
    "Clothing",
    "Men & Women Apparel"
  );

  const groceries = await categoryService.addCategory(
    "Groceries",
    "Daily food and home essentials"
  );

  console.log("Categories inserted ✔");
  printCategories(categoryService.getAll());

  // ============================
  // 3. PRODUCTS
  // ============================
  console.log("Creating products...");

  await productService.eraseAll();

  await productService.addProduct(
    "Lenovo Thinkpad",
    userSeller1.getAttribute("userId"),
    "High-performance business laptop",
    799.99,
    10,
    electronics.getAttribute("categoryId")
  );

  await productService.addProduct(
    "iPhone 14 Case",
    userSeller2.getAttribute("userId"),
    "Shock proof, transparent",
    19.99,
    200,
    electronics.getAttribute("categoryId")
  );

  await productService.addProduct(
    "Blue Denim Jacket",
    userSeller1.getAttribute("userId"),
    "Comfortable and durable",
    49.99,
    50,
    clothing.getAttribute("categoryId")
  );

  await productService.addProduct(
    "Organic Honey 500g",
    userSeller2.getAttribute("userId"),
    "Pure organic honey",
    14.99,
    80,
    groceries.getAttribute("categoryId")
  );

  console.log("Products inserted ✔");
  printProducts(productService.getAll());

  // ============================
  // 4. ORDERS
  // ============================
  console.log("Creating sample orders...");

  await orderService.eraseAll();

  const allProducts = productService.getAll();

  await orderService.addOrder(
    allProducts[0],
    buyer1.getAttribute("userId"),
    userSeller1.getAttribute("userId"),
    1,
    allProducts[0].getAttribute("price")
  );

  await orderService.addOrder(
    allProducts[2],
    buyer2.getAttribute("userId"),
    userSeller1.getAttribute("userId"),
    2,
    2 * allProducts[2].getAttribute("price")
  );

  await orderService.addOrder(
    allProducts[1],
    buyer1.getAttribute("userId"),
    userSeller2.getAttribute("userId"),
    3,
    3 * allProducts[1].getAttribute("price")
  );

  console.log("Orders inserted ✔");
  printOrders(orderService.getAll());

  console.log("\n🎉 DATABASE INITIALIZED SUCCESSFULLY!\n");
}

// Run
generateStarterData().catch((err) =>
  console.error("Initialization Failed:", err)
);
