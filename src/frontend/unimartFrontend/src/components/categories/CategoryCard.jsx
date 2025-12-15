// ============================================================================
// CategoryCard.jsx - Reusable Category Card Component
// ============================================================================

import Card from "../common/Card";
import Button from "../common/Button";
import "./CategoryCard.css";

const CategoryCard = ({
  category,
  deleteAccess = false,
  modifyAccess = false,
  onView,
  onDelete,
  onModify,
  onJumpToProducts,
}) => {
  const handleCardClick = () => {
    if (onView) onView(category);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(category);
  };

  const handleModify = (e) => {
    e.stopPropagation();
    if (onModify) onModify(category);
  };

  const handleJumpToProducts = (e) => {
    e.stopPropagation();
    if (onJumpToProducts) onJumpToProducts(category);
  };

  return (
    <Card hoverable onClick={handleCardClick} className="category-card">
      <div className="category-icon">🏷️</div>
      <h3 className="category-name">{category.name}</h3>
      <p className="category-description">
        {category.description || "No description"}
      </p>

      {onJumpToProducts && (
        <div className="category-actions">
          <Button variant="primary" size="small" onClick={handleJumpToProducts}>
            📦 View Products
          </Button>
        </div>
      )}

      {(deleteAccess || modifyAccess) && (
        <div className="category-actions">
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

export default CategoryCard;
