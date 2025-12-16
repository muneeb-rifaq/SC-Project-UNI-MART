// ============================================================================
// AdminDashboard.jsx - Admin Dashboard Page
// ============================================================================
// Features:
// - Full CRUD on products (all products)
// - Full CRUD on categories
// - View all orders
// - View/Delete users
// ============================================================================

import { useState, useEffect } from "react";
import { api } from "../utils/apiHandler";
import ProductList from "../components/products/ProductList";
import ProductDetails from "../components/products/ProductDetails";
import ProductForm from "../components/products/ProductForm";
import ProductSearchFilter from "../components/products/ProductSearchFilter";
import CategoryList from "../components/categories/CategoryList";
import OrderList from "../components/orders/OrderList";
import UserList from "../components/users/UserList";
import LogList from "../components/logs/LogList";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import "./Dashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [scrollToCategoryId, setScrollToCategoryId] = useState(null);

  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
  });

  const [userFormData, setUserFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "buyer",
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleRefreshLogs = () => {
    console.log("🔄 Manual refresh triggered");
    loadData();
  };

  useEffect(() => {
    if (activeTab === "products") {
      loadCategories();
    }
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "products") {
        // Load both products and categories for grouping
        const [productsData, categoriesData] = await Promise.all([
          api.get("/admin/products"),
          api.get("/admin/categories"),
        ]);
        setProducts(productsData);
        setFilteredProducts(productsData); // Initialize filtered products
        setCategories(categoriesData);
      } else if (activeTab === "categories") {
        const data = await api.get("/admin/categories");
        setCategories(data);
      } else if (activeTab === "orders") {
        const data = await api.get("/admin/orders");
        setOrders(data);
      } else if (activeTab === "users") {
        const data = await api.get("/admin/users");
        setUsers(data);
      } else if (activeTab === "logs") {
        // Add cache-busting timestamp to prevent browser caching
        const timestamp = new Date().getTime();
        const data = await api.get(`/admin/logs?_t=${timestamp}`);
        setLogs(data);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      alert("Failed to load data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.get("/admin/categories");
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleJumpToProducts = (category) => {
    setActiveTab("products");
    // Set the category ID to scroll to after products load
    setScrollToCategoryId(category.categoryId);
  };

  // Scroll to category section after products are loaded
  useEffect(() => {
    if (scrollToCategoryId && activeTab === "products" && !loading) {
      const categoryElement = document.getElementById(
        `category-${scrollToCategoryId}`
      );
      if (categoryElement) {
        categoryElement.scrollIntoView({ behavior: "smooth", block: "start" });
        // Clear the scroll target after scrolling
        setTimeout(() => setScrollToCategoryId(null), 500);
      }
    }
  }, [scrollToCategoryId, activeTab, loading]);

  // Product handlers
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsEditMode(true);
    setShowProductForm(true);
  };

  const handleSubmitProduct = async (formData) => {
    try {
      if (isEditMode && selectedProduct) {
        await api.patch(
          `/admin/products/${selectedProduct.productId}`,
          formData
        );
        alert("Product updated successfully!");
        setShowProductForm(false);
        loadData();
      } else {
        alert(
          "Admin cannot create products. Only sellers can create products."
        );
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Failed to save product: " + error.message);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Delete product "${product.name}"?`)) {
      try {
        await api.delete(`/admin/products/${product.productId}`);
        alert("Product deleted successfully!");
        loadData();
      } catch (error) {
        console.error("Failed to delete product:", error);
        alert("Failed to delete product: " + error.message);
      }
    }
  };

  // Category handlers
  const handleAddCategory = () => {
    setSelectedCategory(null);
    setCategoryFormData({ name: "", description: "" });
    setIsEditMode(false);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setCategoryFormData({
      name: category.categoryName || category.name,
      description: category.description || "",
    });
    setIsEditMode(true);
    setShowCategoryForm(true);
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedCategory) {
        await api.patch(
          `/admin/categories/${selectedCategory.categoryId}`,
          categoryFormData
        );
        alert("Category updated successfully!");
      } else {
        await api.post("/admin/categories", categoryFormData);
        alert("Category created successfully!");
      }
      setShowCategoryForm(false);
      loadData();
    } catch (error) {
      console.error("Failed to save category:", error);
      alert("Failed to save category: " + error.message);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (
      window.confirm(
        `Delete category "${category.name}"? Products in this category will have their category set to null.`
      )
    ) {
      try {
        await api.delete(`/admin/categories/${category.categoryId}`);
        alert("Category deleted successfully!");
        loadData();
      } catch (error) {
        console.error("Failed to delete category:", error);
        alert("Failed to delete category: " + error.message);
      }
    }
  };

  // Order handlers
  const handleDeleteOrder = async (order) => {
    if (window.confirm(`Delete order #${order.orderId}?`)) {
      try {
        await api.delete(`/admin/orders/${order.orderId}`);
        alert("Order deleted successfully!");
        loadData();
      } catch (error) {
        console.error("Failed to delete order:", error);
        alert("Failed to delete order: " + error.message);
      }
    }
  };

  // User handlers
  const handleAddUser = () => {
    setUserFormData({
      username: "",
      email: "",
      password: "",
      role: "buyer",
    });
    setShowUserForm(true);
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();

    try {
      await api.post("/admin/users", userFormData);
      alert("User created successfully!");
      setShowUserForm(false);
      loadData();
    } catch (error) {
      console.error("Failed to create user:", error);
      alert("Failed to create user: " + error.message);
    }
  };

  const handleDeleteUser = async (user) => {
    if (
      window.confirm(
        `Delete user "${user.email}"? Their products will have seller set to null.`
      )
    ) {
      try {
        await api.delete(`/admin/users/${user.userId}`);
        alert("User deleted successfully!");
        loadData();
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert("Failed to delete user: " + error.message);
      }
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>👑 Admin Dashboard</h1>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          📦 Products
        </button>
        <button
          className={`tab ${activeTab === "categories" ? "active" : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          🏷️ Categories
        </button>
        <button
          className={`tab ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          📋 Orders
        </button>
        <button
          className={`tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 Users
        </button>
        <button
          className={`tab ${activeTab === "logs" ? "active" : ""}`}
          onClick={() => setActiveTab("logs")}
        >
          📊 All Activity Logs
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "products" && (
          <>
            <div className="content-header">
              <h2>All Products</h2>
            </div>
            <ProductSearchFilter
              products={products}
              categories={categories}
              onFilterChange={setFilteredProducts}
              showSellerFilter={true}
            />
            <ProductList
              products={filteredProducts}
              categories={categories}
              loading={loading}
              deleteAccess={true}
              modifyAccess={true}
              onView={handleViewProduct}
              onModify={handleEditProduct}
              onDelete={handleDeleteProduct}
              groupByCategory={true}
              emptyMessage="No products in system"
            />
          </>
        )}

        {activeTab === "categories" && (
          <>
            <div className="content-header">
              <h2>All Categories</h2>
              <Button variant="success" onClick={handleAddCategory}>
                ➕ Add Category
              </Button>
            </div>
            <CategoryList
              categories={categories}
              loading={loading}
              deleteAccess={true}
              modifyAccess={true}
              onModify={handleEditCategory}
              onDelete={handleDeleteCategory}
              onJumpToProducts={handleJumpToProducts}
              emptyMessage="No categories in system"
            />
          </>
        )}

        {activeTab === "orders" && (
          <>
            <div className="content-header">
              <h2>All Orders</h2>
            </div>
            <OrderList
              orders={orders}
              role="admin"
              loading={loading}
              deleteAccess={true}
              onDelete={handleDeleteOrder}
              emptyMessage="No orders in system"
            />
          </>
        )}

        {activeTab === "users" && (
          <>
            <div className="content-header">
              <h2>All Users</h2>
              <Button variant="success" onClick={handleAddUser}>
                ➕ Add User
              </Button>
            </div>
            <UserList
              users={users}
              loading={loading}
              deleteAccess={true}
              onDelete={handleDeleteUser}
              emptyMessage="No users in system"
            />
          </>
        )}

        {activeTab === "logs" && (
          <>
            <div className="content-header">
              <h2>All Activity Logs</h2>
            </div>
            <LogList
              logs={logs}
              loading={loading}
              onRefresh={handleRefreshLogs}
            />
          </>
        )}
      </div>

      {/* Product Details Modal */}
      <ProductDetails
        product={selectedProduct}
        isOpen={showProductDetails}
        onClose={() => setShowProductDetails(false)}
        deleteAccess={true}
        modifyAccess={true}
        onDelete={handleDeleteProduct}
        onModify={handleEditProduct}
      />

      {/* Product Form Modal */}
      <Modal
        isOpen={showProductForm}
        onClose={() => setShowProductForm(false)}
        title={isEditMode ? "Edit Product" : "Add New Product"}
        size="medium"
      >
        <ProductForm
          product={selectedProduct}
          categories={categories}
          isEdit={isEditMode}
          onSubmit={handleSubmitProduct}
          onCancel={() => setShowProductForm(false)}
        />
      </Modal>

      {/* Category Form Modal */}
      <Modal
        isOpen={showCategoryForm}
        onClose={() => setShowCategoryForm(false)}
        title={isEditMode ? "Edit Category" : "Add New Category"}
        size="small"
      >
        <form onSubmit={handleSubmitCategory}>
          <Input
            label="Category Name"
            value={categoryFormData.name}
            onChange={(e) =>
              setCategoryFormData({ ...categoryFormData, name: e.target.value })
            }
            required
          />
          <div className="form-group">
            <label className="input-label">Description</label>
            <textarea
              className="textarea-field"
              value={categoryFormData.description}
              onChange={(e) =>
                setCategoryFormData({
                  ...categoryFormData,
                  description: e.target.value,
                })
              }
              rows="3"
            />
          </div>
          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCategoryForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {isEditMode ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* User Form Modal */}
      <Modal
        isOpen={showUserForm}
        onClose={() => setShowUserForm(false)}
        title="Add New User"
        size="small"
      >
        <form onSubmit={handleSubmitUser}>
          <Input
            label="Username"
            value={userFormData.username}
            onChange={(e) =>
              setUserFormData({ ...userFormData, username: e.target.value })
            }
            required
          />
          <Input
            label="Email"
            type="email"
            value={userFormData.email}
            onChange={(e) =>
              setUserFormData({ ...userFormData, email: e.target.value })
            }
            required
          />
          <Input
            label="Password"
            type="password"
            value={userFormData.password}
            onChange={(e) =>
              setUserFormData({ ...userFormData, password: e.target.value })
            }
            required
          />
          <div className="form-group">
            <label className="input-label">Role</label>
            <select
              className="select-field"
              value={userFormData.role}
              onChange={(e) =>
                setUserFormData({ ...userFormData, role: e.target.value })
              }
              required
            >
              <option value="buyer">🛍️ Buyer</option>
              <option value="seller">💼 Seller</option>
              <option value="admin">🛡️ Admin</option>
            </select>
          </div>
          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowUserForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
