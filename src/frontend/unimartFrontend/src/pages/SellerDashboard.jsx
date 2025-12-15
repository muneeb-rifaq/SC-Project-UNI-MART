// ============================================================================
// SellerDashboard.jsx - Redesigned Seller Dashboard
// ============================================================================
// Features:
// - All Products (all sellers, read-only)
// - My Profile (user info with links)
// - Your Products (own products with edit/delete)
// - Your Orders (orders for own products)
// - Left sidebar navigation
// - Products grouped by category
// ============================================================================

import { useState, useEffect } from "react";
import { api, getCurrentUser } from "../utils/apiHandler";
import Sidebar from "../components/common/Sidebar";
import ProductsByCategory from "../components/products/ProductsByCategory";
import ProductDetails from "../components/products/ProductDetails";
import ProductForm from "../components/products/ProductForm";
import ProductSearchFilter from "../components/products/ProductSearchFilter";
import OrderList from "../components/orders/OrderList";
import LogList from "../components/logs/LogList";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import "./Dashboard.css";

const SellerDashboard = () => {
  const [activeView, setActiveView] = useState("allProducts");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [allProducts, setAllProducts] = useState([]);
  const [filteredAllProducts, setFilteredAllProducts] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [filteredMyProducts, setFilteredMyProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const sidebarItems = [
    { id: "allProducts", icon: "🛍️", label: "All Products" },
    { id: "profile", icon: "👤", label: "My Profile" },
    { id: "yourProducts", icon: "📦", label: "Your Products" },
    { id: "yourOrders", icon: "📋", label: "Your Orders" },
    { id: "yourLogs", icon: "📊", label: "Your Activity Logs" },
  ];

  useEffect(() => {
    setUser(getCurrentUser());
    loadCategories();
  }, []);

  useEffect(() => {
    loadData();
  }, [activeView]);

  const handleRefreshLogs = () => {
    console.log("🔄 Manual refresh triggered");
    loadData();
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeView === "allProducts") {
        // Load all products from all sellers
        const data = await api.get("/seller/products/all");
        setAllProducts(data);
        setFilteredAllProducts(data); // Initialize filtered with all products
      } else if (activeView === "yourProducts") {
        // Load only own products
        const data = await api.get("/seller/products");
        setMyProducts(data);
        setFilteredMyProducts(data); // Initialize filtered with all products
      } else if (activeView === "yourOrders") {
        // Load orders for own products
        const data = await api.get("/seller/orders");
        setOrders(data);
      } else if (activeView === "yourLogs") {
        // Load own activity logs with cache-busting
        console.log("🔄 Fetching seller logs...");
        const timestamp = new Date().getTime();
        const data = await api.get(`/seller/logs?_t=${timestamp}`);
        console.log("📥 Received logs:", data);
        console.log("📊 Number of logs:", data.length);
        if (data.length > 0) {
          console.log("📝 First log:", data[0]);
          const opTypes = data.reduce((acc, log) => {
            acc[log.operationType] = (acc[log.operationType] || 0) + 1;
            return acc;
          }, {});
          console.log("📊 Operation breakdown:", opTypes);
        }
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
      const data = await api.get("/seller/categories");
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsEditMode(false);
    setShowProductForm(true);
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
          `/seller/products/${selectedProduct.productId}`,
          formData
        );
        alert("Product updated successfully!");
      } else {
        await api.post("/seller/products", formData);
        alert("Product created successfully!");
      }
      setShowProductForm(false);
      loadData();
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Failed to save product: " + error.message);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Delete product "${product.name}"?`)) {
      try {
        await api.delete(`/seller/products/${product.productId}`);
        alert("Product deleted successfully!");
        loadData();
      } catch (error) {
        console.error("Failed to delete product:", error);
        alert("Failed to delete product: " + error.message);
      }
    }
  };

  const handleUpdateOrderStatus = async (order, newStatus) => {
    try {
      await api.patch(`/seller/orders/${order.orderId}`, {
        attribute: "status",
        value: newStatus,
      });
      alert(`Order status updated to ${newStatus}`);
      loadData();
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order status: " + error.message);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case "allProducts":
        return (
          <div className="view-content">
            <div className="content-header">
              <h2>🛍️ All Products (All Sellers)</h2>
              <p className="content-subtitle">
                Browse all products in the marketplace
              </p>
            </div>
            <ProductSearchFilter
              products={allProducts}
              categories={categories}
              onFilterChange={setFilteredAllProducts}
              showSellerFilter={true}
            />
            <ProductsByCategory
              products={filteredAllProducts}
              categories={categories}
              loading={loading}
              deleteAccess={false}
              modifyAccess={false}
              onView={handleViewProduct}
            />
          </div>
        );

      case "profile":
        return (
          <div className="view-content">
            <div className="profile-container">
              <div className="profile-header">
                <h2>👤 My Profile</h2>
              </div>

              <div className="profile-card">
                <div className="profile-info">
                  <div className="profile-field">
                    <label>Email:</label>
                    <span>{user?.email}</span>
                  </div>
                  <div className="profile-field">
                    <label>Role:</label>
                    <span className="role-badge seller">SELLER</span>
                  </div>
                  <div className="profile-field">
                    <label>User ID:</label>
                    <span>{user?.userId}</span>
                  </div>
                </div>

                <div className="profile-links">
                  <h3>Quick Links</h3>
                  <button
                    className="profile-link-btn"
                    onClick={() => setActiveView("yourProducts")}
                  >
                    📦 View Your Products
                  </button>
                  <button
                    className="profile-link-btn"
                    onClick={() => setActiveView("yourOrders")}
                  >
                    📋 View Your Orders
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "yourProducts":
        return (
          <div className="view-content">
            <div className="content-header">
              <h2>📦 Your Products</h2>
              <Button variant="success" onClick={handleAddProduct}>
                ➕ Add New Product
              </Button>
            </div>
            <ProductSearchFilter
              products={myProducts}
              categories={categories}
              onFilterChange={setFilteredMyProducts}
              showSellerFilter={false}
            />
            <ProductsByCategory
              products={filteredMyProducts}
              categories={categories}
              loading={loading}
              deleteAccess={true}
              modifyAccess={true}
              onView={handleViewProduct}
              onDelete={handleDeleteProduct}
              onModify={handleEditProduct}
            />
          </div>
        );

      case "yourOrders":
        return (
          <div className="view-content">
            <div className="content-header">
              <h2>📋 Your Orders</h2>
              <p className="content-subtitle">Orders for products you sell</p>
            </div>
            <OrderList
              orders={orders}
              role="seller"
              loading={loading}
              updateAccess={true}
              onUpdateStatus={handleUpdateOrderStatus}
              emptyMessage="No orders for your products yet"
            />
          </div>
        );

      case "yourLogs":
        return (
          <div className="view-content">
            <div className="content-header">
              <h2>📊 Your Activity Logs</h2>
              <p className="content-subtitle">Track your actions and changes</p>
            </div>
            <LogList
              logs={logs}
              loading={loading}
              onRefresh={handleRefreshLogs}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        items={sidebarItems}
        activeItem={activeView}
        onItemClick={setActiveView}
      />

      <div
        className={`dashboard-main ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        {renderContent()}
      </div>

      {/* Product Details Modal */}
      <ProductDetails
        product={selectedProduct}
        isOpen={showProductDetails}
        onClose={() => setShowProductDetails(false)}
        deleteAccess={activeView === "yourProducts"}
        modifyAccess={activeView === "yourProducts"}
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
    </div>
  );
};

export default SellerDashboard;
