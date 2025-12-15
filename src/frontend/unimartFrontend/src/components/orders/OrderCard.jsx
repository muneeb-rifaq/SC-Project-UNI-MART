// ============================================================================
// OrderCard.jsx - Reusable Order Card Component
// ============================================================================
// Props:
// - order: Order object
// - role: User role ('buyer', 'seller', 'admin')
// - deleteAccess: Show delete button
// - onView: View details callback
// - onDelete: Delete callback
// ============================================================================

import { useMemo, useState } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import "./OrderCard.css";

const OrderCard = ({
  order,
  role = "buyer",
  deleteAccess = false,
  updateAccess = false,
  onView,
  onDelete,
  onUpdateStatus,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(order);
  };

  const handleStatusChange = (e, newStatus) => {
    e.stopPropagation();
    if (onUpdateStatus) onUpdateStatus(order, newStatus);
  };

  // Parse product data from JSON string
  const productData = useMemo(() => {
    if (!order.product) return null;

    try {
      // If product is already an object, return it
      if (typeof order.product === "object") {
        return order.product;
      }
      // If product is a JSON string, parse it
      if (typeof order.product === "string") {
        return JSON.parse(order.product);
      }
    } catch (error) {
      console.error("Failed to parse product data:", error);
      return null;
    }
    return null;
  }, [order.product]);

  // Format date
  const orderDate = order.dateCreated
    ? new Date(order.dateCreated).toLocaleDateString()
    : "N/A";

  const orderTime = order.dateCreated
    ? new Date(order.dateCreated).toLocaleTimeString()
    : "";

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      className={`order-card ${isExpanded ? "expanded" : ""}`}
    >
      {/* Order Header */}
      <div className="order-header">
        <span className="order-id">Order #{order.orderId}</span>
        <span
          className={`order-status-badge status-${order.status || "pending"}`}
        >
          {order.status || "pending"}
        </span>
      </div>

      {/* Product Name - Always Visible */}
      {productData && (
        <div className="product-name-preview">
          📦 {productData.name || productData.productName || "Unknown Product"}
        </div>
      )}

      {/* Order Date & Time */}
      <div className="order-date-section">
        <span className="order-date">📅 {orderDate}</span>
        {orderTime && <span className="order-time">🕐 {orderTime}</span>}
      </div>

      {/* Order Details - Always Visible */}
      <div className="order-details-section">
        <h4 className="section-title">📋 Order Details</h4>
        <div className="order-details-grid">
          <div>
            <span className="label">Quantity:</span>
            <span className="value">{order.volume}</span>
          </div>
          <div>
            <span className="label">Total Cost:</span>
            <span className="value price">${order.totalCost?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Expanded Product Information - Only visible when clicked */}
      {isExpanded && productData && (
        <div className="order-product-section expanded-section">
          <h4 className="section-title">📦 Complete Product Information</h4>
          <div className="product-info-card">
            <div className="product-details-row">
              <span className="label">Product ID:</span>
              <span className="value">{productData.productId}</span>
            </div>
            {productData.description && (
              <div className="product-description">
                <span className="label">Description:</span>
                <p>{productData.description}</p>
              </div>
            )}
            <div className="product-pricing-grid">
              <div className="pricing-item">
                <span className="label">Unit Price:</span>
                <span className="value price">
                  ${productData.price?.toFixed(2)}
                </span>
              </div>
              {productData.stock !== undefined && (
                <div className="pricing-item">
                  <span className="label">Stock:</span>
                  <span className="value">{productData.stock} units</span>
                </div>
              )}
            </div>
            {productData.sellerId && (
              <div className="product-details-row">
                <span className="label">Seller ID:</span>
                <span className="value">{productData.sellerId}</span>
              </div>
            )}
            {productData.categoryId && (
              <div className="product-details-row">
                <span className="label">Category ID:</span>
                <span className="value">{productData.categoryId}</span>
              </div>
            )}
            {productData.dateUpdated && (
              <div className="product-details-row">
                <span className="label">Last Updated:</span>
                <span className="value">
                  {new Date(productData.dateUpdated).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Buyer/Seller Information */}
      {role === "buyer" && order.sellerId && (
        <div className="order-info">
          <span className="label">Seller ID:</span> {order.sellerId}
        </div>
      )}

      {role === "seller" && order.buyerId && (
        <div className="order-info">
          <span className="label">Buyer ID:</span> {order.buyerId}
        </div>
      )}

      {role === "admin" && (
        <div className="order-info">
          <div>
            <span className="label">Buyer ID:</span> {order.buyerId}
          </div>
          <div>
            <span className="label">Seller ID:</span> {order.sellerId}
          </div>
        </div>
      )}

      {/* Actions */}
      {updateAccess &&
        order.status !== "completed" &&
        order.status !== "delivered" && (
          <div className="order-actions">
            <div className="status-update-buttons">
              {order.status === "pending" && (
                <Button
                  variant="primary"
                  size="small"
                  onClick={(e) => handleStatusChange(e, "confirmed")}
                  fullWidth
                >
                  ✅ Confirm Order
                </Button>
              )}
              {order.status === "confirmed" && (
                <Button
                  variant="primary"
                  size="small"
                  onClick={(e) => handleStatusChange(e, "shipped")}
                  fullWidth
                >
                  🚚 Mark as Shipped
                </Button>
              )}
              {order.status === "shipped" && (
                <Button
                  variant="success"
                  size="small"
                  onClick={(e) => handleStatusChange(e, "completed")}
                  fullWidth
                >
                  ✔️ Mark as Completed
                </Button>
              )}
            </div>
          </div>
        )}
      {deleteAccess &&
        order.status !== "shipped" &&
        order.status !== "completed" &&
        order.status !== "delivered" && (
          <div className="order-actions">
            <Button
              variant="danger"
              size="small"
              onClick={handleDelete}
              fullWidth
            >
              🗑️ Cancel Order
            </Button>
          </div>
        )}
      {(order.status === "shipped" ||
        order.status === "completed" ||
        order.status === "delivered") && (
        <div className="order-completed-notice">
          ✅ This order has been {order.status} and cannot be cancelled
        </div>
      )}
    </Card>
  );
};

export default OrderCard;
