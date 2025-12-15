// ============================================================================
// CategoryList.jsx - Reusable Category List Component
// ============================================================================

import CategoryCard from "./CategoryCard";
import "./CategoryList.css";

const CategoryList = ({
  categories,
  deleteAccess = false,
  modifyAccess = false,
  onView,
  onDelete,
  onModify,
  onJumpToProducts,
  loading = false,
  emptyMessage = "No categories found",
}) => {
  if (loading) {
    return (
      <div className="category-list-loading">
        <div className="spinner"></div>
        <p>Loading categories...</p>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="category-list-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="category-list-grid">
      {categories.map((category) => (
        <CategoryCard
          key={category.categoryId}
          category={category}
          deleteAccess={deleteAccess}
          modifyAccess={modifyAccess}
          onView={onView}
          onDelete={onDelete}
          onModify={onModify}
          onJumpToProducts={onJumpToProducts}
        />
      ))}
    </div>
  );
};

export default CategoryList;
