// ============================================================================
// BuyerDashboard.jsx - Buyer Dashboard Page
// ============================================================================
// Features:
// - View all products (read-only)
// - View categories
// - View own orders
// - Create new orders
// - Delete own orders
// ============================================================================

import { useState, useEffect } from "react";
import { api } from "../utils/apiHandler";
import ProductList from "../components/products/ProductList";
import ProductDetails from "../components/products/ProductDetails";
import ProductSearchFilter from "../components/products/ProductSearchFilter";
import CategoryList from "../components/categories/CategoryList";
import CategoryDetails from "../components/categories/CategoryDetails";
import OrderList from "../components/orders/OrderList";
import LogList from "../components/logs/LogList";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import "./Dashboard.css";

const BuyerDashboard = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryDetails, setShowCategoryDetails] = useState(false);
  const [scrollToCategoryId, setScrollToCategoryId] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleRefreshLogs = () => {
    console.log("🔄 Manual refresh triggered");
    loadData();
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "products") {
        // Load both products and categories for grouping
        const [productsData, categoriesData] = await Promise.all([
          api.get("/buyer/products"),
          api.get("/buyer/categories"),
        ]);
        setProducts(productsData);
        setFilteredProducts(productsData); // Initialize filtered products
        setCategories(categoriesData);
      } else if (activeTab === "categories") {
        const data = await api.get("/buyer/categories");
        setCategories(data);
      } else if (activeTab === "orders") {
        const data = await api.get("/buyer/orders");
        setOrders(data);
      } else if (activeTab === "logs") {
        // Add cache-busting timestamp to prevent browser caching
        const timestamp = new Date().getTime();
        const data = await api.get(`/buyer/logs?_t=${timestamp}`);
        setLogs(data);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      alert("Failed to load data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setShowCategoryDetails(true);
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

  const handleCreateOrder = (product) => {
    setSelectedProduct(product);
    setOrderQuantity(1);
    setShowOrderModal(true);
  };

  const handleSubmitOrder = async () => {
    try {
      const orderData = {
        productId: selectedProduct.productId,
        quantity: parseInt(orderQuantity),
      };
      await api.post("/buyer/orders", orderData);
      alert("Order created successfully!");
      setShowOrderModal(false);
      if (activeTab === "orders") {
        loadData();
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Failed to create order: " + error.message);
    }
  };

  const handleDeleteOrder = async (order) => {
    if (window.confirm(`Delete order #${order.orderId}?`)) {
      try {
        await api.delete(`/buyer/orders/${order.orderId}`);
        alert("Order deleted successfully!");
        loadData();
      } catch (error) {
        console.error("Failed to delete order:", error);
        alert("Failed to delete order: " + error.message);
      }
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🛍️ Buyer Dashboard</h1>
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
          📋 My Orders
        </button>
        <button
          className={`tab ${activeTab === "logs" ? "active" : ""}`}
          onClick={() => setActiveTab("logs")}
        >
          📊 My Activity Logs
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "products" && (
          <>
            <div className="content-header">
              <h2>Available Products</h2>
            </div>
            <ProductSearchFilter
              products={products}
              categories={categories}
              onFilterChange={setFilteredProducts}
              showSellerFilter={true}
            />
            <ProductList
              products={filteredProducts}
              onJumpToProducts={handleJumpToProducts}
              categories={categories}
              loading={loading}
              onView={handleViewProduct}
              groupByCategory={true}
              emptyMessage="No products available"
            />
          </>
        )}

        {activeTab === "categories" && (
          <>
            <div className="content-header">
              <h2>Product Categories</h2>
            </div>
            <CategoryList
              categories={categories}
              loading={loading}
              onView={handleViewCategory}
              onJumpToProducts={handleJumpToProducts}
              emptyMessage="No categories available"
            />
          </>
        )}

        {activeTab === "orders" && (
          <>
            <div className="content-header">
              <h2>My Orders</h2>
            </div>
            <OrderList
              orders={orders}
              role="buyer"
              loading={loading}
              deleteAccess={true}
              onDelete={handleDeleteOrder}
              emptyMessage="You haven't placed any orders yet"
            />
          </>
        )}

        {activeTab === "logs" && (
          <>
            <div className="content-header">
              <h2>My Activity Logs</h2>
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
        purchaseAccess={true}
        onPurchase={() => loadData()}
      />

      {/* Category Details Modal */}
      <CategoryDetails
        category={selectedCategory}
        isOpen={showCategoryDetails}
        onClose={() => setShowCategoryDetails(false)}
      />

      {/* Create Order Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title="Create Order"
        size="small"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowOrderModal(false)}
            >
              Cancel
            </Button>
            <Button variant="success" onClick={handleSubmitOrder}>
              Place Order
            </Button>
          </>
        }
      >
        {selectedProduct && (
          <div>
            <h3>{selectedProduct.name}</h3>
            <p className="order-modal-price">
              Price: ${selectedProduct.price?.toFixed(2)}
            </p>
            <p className="order-modal-stock">
              Available: {selectedProduct.stock} units
            </p>

            <Input
              label="Quantity"
              type="number"
              min="1"
              max={selectedProduct.stock}
              value={orderQuantity}
              onChange={(e) => setOrderQuantity(e.target.value)}
            />

            <div className="order-modal-total">
              <strong>
                Total: ${(selectedProduct.price * orderQuantity).toFixed(2)}
              </strong>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BuyerDashboard;
