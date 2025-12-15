// ============================================================================
// ProductCard.jsx - Reusable Product Card Component
// ============================================================================
// Props:
// - product: Product object
// - deleteAccess: Show delete button (default: false)
// - modifyAccess: Show modify button (default: false)
// - onView: Callback when product is clicked
// - onDelete: Callback when delete is clicked
// - onModify: Callback when modify is clicked
// ============================================================================

import Card from "../common/Card";
import Button from "../common/Button";
import "./ProductCard.css";

const ProductCard = ({
  product,
  deleteAccess = false,
  modifyAccess = false,
  onView,
  onDelete,
  onModify,
}) => {
  const handleCardClick = () => {
    if (onView) onView(product);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(product);
  };

  const handleModify = (e) => {
    e.stopPropagation();
    if (onModify) onModify(product);
  };

  return (
    <Card hoverable onClick={handleCardClick} className="product-card">
      <div className="product-image-placeholder">📦</div>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-description">{product.description}</p>

      <div className="product-info">
        <div className="product-price">${product.price?.toFixed(2)}</div>
        <div
          className={`product-stock ${
            product.stock > 0 ? "in-stock" : "out-of-stock"
          }`}
        >
          {product.stock > 0 ? `Stock: ${product.stock}` : "Out of Stock"}
        </div>
      </div>

      {product.category && (
        <div className="product-category">🏷️ {product.category}</div>
      )}

      {(deleteAccess || modifyAccess) && (
        <div className="product-actions">
          {modifyAccess && (
            <Button variant="warning" size="small" onClick={handleModify}>
              ✏️ Edit
            </Button>
          )}
          {deleteAccess && (
            <Button variant="danger" size="small" onClick={handleDelete}>
              🗑️ Delete
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default ProductCard;
