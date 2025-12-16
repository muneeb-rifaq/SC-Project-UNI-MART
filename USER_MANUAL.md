# UniMart User Manual

Welcome to **UniMart**, a modular e-commerce platform. This manual guides you through setting up, installing dependencies, and running the application.

## 1. Prerequisites

Before starting, ensure you have the following installed on your computer:

- **Node.js** (Version 16 or higher recommended)
- **npm** (Node Package Manager, usually comes with Node.js)
- **Git** (Optional, for version control)

---

## 2. Installation (Downloading Node Modules)

The project is divided into two parts: the **Backend** (Server) and the **Frontend** (User Interface). You must install dependencies for **both**.

### Step A: Install Backend Dependencies

1. Open your terminal (Command Prompt, PowerShell, or VS Code Terminal).
2. Navigate to the root `unimart` or 'SC-Project-UNI-MART' folder.
3. Run the following command:
   ```bash
   npm install
   ```
   _This installs libraries like Express, SQLite, and CORS required for the server._

### Step B: Install Frontend Dependencies

1. In the terminal, navigate to the frontend directory:
   ```bash
   cd src/frontend/unimartFrontend
   ```
2. Run the install command again:
   ```bash
   npm install
   ```
   _This installs React, Vite, and other UI libraries._

---

## 3. Running the Application

To use UniMart, you need to run both the Backend and Frontend simultaneously. It is best to use **two separate terminal windows**.

### Terminal 1: Start the Backend Server

1. Open a terminal at the root `unimart` folder.
2. Run the start command:
   ```bash
   npm start
   ```
3. You should see a message indicating the server is running (e.g., `Server running on port 3000` or `Database connected`).

### Terminal 2: Start the Frontend Interface

1. Open a **new** terminal window.
2. Navigate to the frontend folder:
   ```bash
   cd src/frontend/unimartFrontend
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. You will see a local URL (usually `http://localhost:5173`).
5. **Ctrl + Click** the link or open it in your browser to access UniMart.

---

## 4. Troubleshooting

- **"Module not found"**: Ensure you ran `npm install` in the correct folder (Root for backend, `unimartFrontend` for frontend).
- **Port already in use**: If `npm start` fails, check if another node process is running and close it.
- **Database errors**: The system uses `unimartDB.db`. If it gets corrupted, you can delete it, and the system will regenerate it on the next restart (if configured to do so).

---

## 5. About UniMart

**UniMart** is a simulated e-commerce platform designed to demonstrate modern software construction principles. In practical terms, it is a digital marketplace where:

- **Sellers** can list products (laptops, clothes, groceries) and manage their inventory.
- **Buyers** can browse these products, search using advanced filters, and place orders.
- **Admins** oversee the entire system, managing users and viewing system-wide logs.

It mimics real-world platforms like Amazon or eBay but is simplified for educational purposes, focusing on clean architecture, modularity, and role-based access control.

---

## 6. User Roles & Capabilities

The system supports three distinct user roles, each with specific permissions:

### 🛒 Buyer

The standard customer role.

- **Capabilities**:
  - Browse the product catalog.
  - Search for products by name, category, or price range.
  - Add items to a shopping cart.
  - Place orders and view order history.
- **Goal**: To find and purchase items efficiently.

### 🏪 Seller

The merchant role.

- **Capabilities**:
  - Create new product listings.
  - Update product details (price, stock, description).
  - View orders placed for their specific products.
  - Manage inventory levels.
- **Goal**: To sell products and maintain accurate stock information.

### 🛡️ Admin

The system administrator role.

- **Capabilities**:
  - View all users in the system.
  - Create new users (including other admins).
  - View system audit logs (who did what and when).
  - Oversee all platform activity.
- **Goal**: To ensure the system runs smoothly and securely.

---

## 7. Basic User Tasks

### How to Log In

1. Open the frontend in your browser (`http://localhost:5173`).
2. You will be greeted by the Login screen.
3. Enter a valid **Email** and **Password**.
4. Click **Login**.
5. You will be redirected to the Dashboard appropriate for your role (e.g., Buyer Dashboard).

| Role       | Email               | Password            |
| :--------- | :------------------ | :------------------ |
| **Admin**  | `admin@unimart.com` | `hashed_admin_pass` |
| **Seller** | `ali@shop.com`      | `hashed_pass1`      |
| **Buyer**  | `john@example.com`  | `hashed_pass3`      |

### How to Browse & Buy (Buyer)

1. Log in as a Buyer.
2. On the **Dashboard**, you will see a grid of products.
3. Use the **Search Bar** to find specific items (e.g., type "Laptop").
4. Click **"Add to Cart"** on any item.
5. Navigate to the **Cart** page (if available) or proceed to checkout.

### How to List a Product (Seller)

1. Log in as a Seller.
2. Navigate to the **"My Products"** or **"Add Product"** section.
3. Fill in the details: Name, Price, Stock, Category.
4. Click **Submit**. The product is now visible to all Buyers.

---

## 8. Sample Login Credentials

To help you get started immediately, the system is pre-loaded with the following users. You can use these to test the different roles.

| Role       | Email               | Password            |
| :--------- | :------------------ | :------------------ |
| **Admin**  | `admin@unimart.com` | `hashed_admin_pass` |
| **Seller** | `ali@shop.com`      | `hashed_pass1`      |
| **Buyer**  | `john@example.com`  | `hashed_pass3`      |

> **Note**: The passwords listed above are the raw strings used in the seed data. In a real production environment, these would be complex passwords, but for this simulation, they are simple strings.
