// ============================================================================
// ProductList.jsx - Reusable Product List Component
// ============================================================================
// Props:
// - products: Array of product objects
// - categories: Array of category objects (optional, for grouping)
// - deleteAccess: Pass delete access to cards (default: false)
// - modifyAccess: Pass modify access to cards (default: false)
// - onView: Callback when product is viewed
// - onDelete: Callback when product is deleted
// - onModify: Callback when product is modified
// - loading: Show loading state
// - emptyMessage: Message when no products
// - groupByCategory: Whether to group products by category (default: false)
// ============================================================================

import ProductCard from "./ProductCard";
import "./ProductList.css";

const ProductList = ({
  products,
  categories = [],
  deleteAccess = false,
  modifyAccess = false,
  onView,
  onDelete,
  onModify,
  loading = false,
  emptyMessage = "No products found",
  groupByCategory = false,
}) => {
  if (loading) {
    return (
      <div className="product-list-loading">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="product-list-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  // If not grouping by category, render flat list
  if (!groupByCategory) {
    return (
      <div className="product-list-grid">
        {products.map((product) => (
          <ProductCard
            key={product.productId}
            product={product}
            deleteAccess={deleteAccess}
            modifyAccess={modifyAccess}
            onView={onView}
            onDelete={onDelete}
            onModify={onModify}
          />
        ))}
      </div>
    );
  }

  // Group products by categoryId
  const groupedProducts = products.reduce((acc, product) => {
    const categoryId = product.categoryId || "uncategorized";
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(product);
    return acc;
  }, {});

  // Helper function to get category name
  const getCategoryName = (categoryId) => {
    if (categoryId === "uncategorized") return "Uncategorized";
    // Convert categoryId to number for comparison since it might be a string from object keys
    const numericCategoryId =
      typeof categoryId === "string" ? parseInt(categoryId) : categoryId;
    const category = categories.find(
      (cat) => cat.categoryId === numericCategoryId
    );
    return category
      ? category.categoryName || category.name
      : `Category ${categoryId}`;
  };

  // Sort category IDs to ensure consistent ordering
  const sortedCategoryIds = Object.keys(groupedProducts).sort((a, b) => {
    if (a === "uncategorized") return 1;
    if (b === "uncategorized") return -1;
    return a - b;
  });

  return (
    <div className="product-list-grouped">
      {sortedCategoryIds.map((categoryId) => (
        <div
          key={categoryId}
          id={`category-${categoryId}`}
          className="product-category-section"
        >
          <div className="category-header">
            <h3 className="category-title">🏷️ {getCategoryName(categoryId)}</h3>
            <span className="category-count">
              {groupedProducts[categoryId].length} product
              {groupedProducts[categoryId].length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="product-list-grid">
            {groupedProducts[categoryId].map((product) => (
              <ProductCard
                key={product.productId}
                product={product}
                deleteAccess={deleteAccess}
                modifyAccess={modifyAccess}
                onView={onView}
                onDelete={onDelete}
                onModify={onModify}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
