// ============================================================================
// ProductDetails.jsx - Product Details Modal
// ============================================================================
// Props:
// - product: Product object
// - isOpen: Modal open state
// - onClose: Close callback
// - deleteAccess: Show delete button
// - modifyAccess: Show modify button
// - onDelete: Delete callback
// - onModify: Modify callback
// ============================================================================

import { useState, useEffect } from "react";
import { api, getCurrentUser } from "../../utils/apiHandler";
import Modal from "../common/Modal";
import Button from "../common/Button";
import "./ProductDetails.css";

const ProductDetails = ({
  product,
  isOpen,
  onClose,
  deleteAccess = false,
  modifyAccess = false,
  purchaseAccess = false,
  onDelete,
  onModify,
  onPurchase,
}) => {
  const [sellerInfo, setSellerInfo] = useState(null);
  const [loadingSeller, setLoadingSeller] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [user, setUser] = useState(null);

  // Get current user on mount
  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  // Fetch seller information when product changes (for buyers and admins)
  useEffect(() => {
    if (product && product.sellerId && isOpen) {
      // Fetch seller info for buyers (purchaseAccess) or admins (modifyAccess)
      if (purchaseAccess || modifyAccess) {
        fetchSellerInfo(product.sellerId);
      } else {
        setSellerInfo(null);
      }
    } else {
      setSellerInfo(null);
    }
  }, [product, isOpen, purchaseAccess, modifyAccess]);

  const fetchSellerInfo = async (sellerId) => {
    setLoadingSeller(true);
    try {
      let endpoint;
      let data;

      // Determine which endpoint to use based on user role
      if (purchaseAccess) {
        // Buyer view - use buyer endpoint
        endpoint = `/buyer/sellers/${sellerId}`;
        data = await api.get(endpoint);
        setSellerInfo(data);
      } else if (modifyAccess && user?.role === "admin") {
        // Admin view - use admin endpoint
        endpoint = `/admin/users/find?attribute=userId&value=${sellerId}`;
        data = await api.get(endpoint);
        // Admin endpoint returns array, get first item
        setSellerInfo(Array.isArray(data) ? data[0] : data);
      } else if (modifyAccess && user?.role === "seller") {
        // Seller viewing their own products - don't fetch (they already know their info)
        // Set seller info from current user
        setSellerInfo({
          userId: user.userId,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        });
        setLoadingSeller(false);
        return;
      } else {
        setSellerInfo(null);
      }
    } catch (error) {
      console.error("Failed to fetch seller info:", error);
      setSellerInfo(null);
    } finally {
      setLoadingSeller(false);
    }
  };

  if (!product) return null;

  const handleDelete = () => {
    if (onDelete) onDelete(product);
    onClose();
  };

  const handleModify = () => {
    if (onModify) onModify(product);
    onClose();
  };

  const handlePurchase = async () => {
    if (!user || !product) return;

    if (quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    if (quantity > product.stock) {
      alert(`Only ${product.stock} units available in stock`);
      return;
    }

    setPurchasing(true);
    try {
      const orderData = {
        product: JSON.stringify({
          productId: product.productId,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          sellerId: product.sellerId,
          categoryId: product.categoryId,
          dateUpdated: product.dateUpdated,
        }),
        buyerId: user.userId,
        sellerId: product.sellerId,
        quantity: quantity,
        totalPrice: product.price * quantity,
      };

      await api.post("/buyer/orders", orderData);
      alert(
        `Order placed successfully! ${quantity} unit(s) of ${product.name}`
      );

      if (onPurchase) onPurchase(product);
      setQuantity(1);
      onClose();
    } catch (error) {
      console.error("Failed to place order:", error);
      alert(error.message || "Failed to place order. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>
        Close
      </Button>
      {purchaseAccess && product.stock > 0 && (
        <div className="purchase-section">
          <input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="quantity-input"
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            variant="primary"
            onClick={handlePurchase}
            disabled={purchasing || quantity <= 0 || quantity > product.stock}
          >
            {purchasing ? "⏳ Placing Order..." : "🛒 Purchase Item"}
          </Button>
        </div>
      )}
      {modifyAccess && (
        <Button variant="warning" onClick={handleModify}>
          ✏️ Edit Product
        </Button>
      )}
      {deleteAccess && (
        <Button variant="danger" onClick={handleDelete}>
          🗑️ Delete Product
        </Button>
      )}
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      footer={footer}
      size="medium"
    >
      <div className="product-details">
        <div className="product-details-image">📦</div>

        <div className="product-details-section">
          <h3>Description</h3>
          <p>{product.description || "No description available"}</p>
        </div>

        <div className="product-details-section">
          <h3>Pricing & Stock</h3>
          <div className="product-details-grid">
            <div>
              <strong>Price:</strong>
              <div className="product-details-price">
                ${product.price?.toFixed(2)}
              </div>
            </div>
            <div>
              <strong>Stock:</strong>
              <div
                className={
                  product.stock > 0 ? "stock-available" : "stock-unavailable"
                }
              >
                {product.stock > 0 ? `${product.stock} units` : "Out of Stock"}
              </div>
            </div>
          </div>
        </div>

        {product.category && (
          <div className="product-details-section">
            <h3>Category</h3>
            <div className="product-details-category">
              🏷️ {product.category}
            </div>
          </div>
        )}

        {product.sellerId && (
          <div className="product-details-section">
            <h3>Seller Information</h3>
            {loadingSeller ? (
              <div className="seller-loading">Loading seller info...</div>
            ) : sellerInfo ? (
              <div className="seller-info-card">
                <div className="seller-info-row">
                  <span className="seller-info-label">Name:</span>
                  <span className="seller-info-value">
                    {sellerInfo.username}
                  </span>
                </div>
                <div className="seller-info-row">
                  <span className="seller-info-label">Email:</span>
                  <span className="seller-info-value">{sellerInfo.email}</span>
                </div>
                <div className="seller-info-row">
                  <span className="seller-info-label">Member Since:</span>
                  <span className="seller-info-value">
                    {new Date(sellerInfo.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="seller-info-row">
                  <span className="seller-info-label">Seller ID:</span>
                  <span className="seller-info-value">{sellerInfo.userId}</span>
                </div>
              </div>
            ) : (
              <p className="seller-info-error">
                Unable to load seller information
              </p>
            )}
          </div>
        )}

        <div className="product-details-section">
          <h3>Product ID</h3>
          <p className="product-id">{product.productId}</p>
        </div>
      </div>
    </Modal>
  );
};

export default ProductDetails;
