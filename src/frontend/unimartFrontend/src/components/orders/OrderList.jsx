// ============================================================================
// OrderList.jsx - Reusable Order List Component
// ============================================================================

import OrderCard from "./OrderCard";
import "./OrderList.css";

const OrderList = ({
  orders,
  role = "buyer",
  deleteAccess = false,
  updateAccess = false,
  onView,
  onDelete,
  onUpdateStatus,
  loading = false,
  emptyMessage = "No orders found",
}) => {
  if (loading) {
    return (
      <div className="order-list-loading">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="order-list-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="order-list-grid">
      {orders.map((order) => (
        <OrderCard
          key={order.orderId}
          order={order}
          role={role}
          deleteAccess={deleteAccess}
          updateAccess={updateAccess}
          onView={onView}
          onDelete={onDelete}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  );
};

export default OrderList;
