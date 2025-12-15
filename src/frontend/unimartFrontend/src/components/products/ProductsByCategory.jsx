// ============================================================================
// ProductsByCategory.jsx - Products Grouped by Category with Navigation
// ============================================================================

import { useRef, useEffect } from 'react';
import ProductCard from './ProductCard';
import './ProductsByCategory.css';

const ProductsByCategory = ({ 
  products, 
  categories,
  deleteAccess = false, 
  modifyAccess = false,
  onView,
  onDelete,
  onModify,
  loading = false 
}) => {
  const categoryRefs = useRef({});

  useEffect(() => {
    // Initialize refs for each category
    categories.forEach(cat => {
      if (!categoryRefs.current[cat.categoryId]) {
        categoryRefs.current[cat.categoryId] = null;
      }
    });
  }, [categories]);

  const scrollToCategory = (categoryId) => {
    const element = categoryRefs.current[categoryId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="products-loading">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  // Group products by category
  const productsByCategory = {};
  const uncategorizedProducts = [];

  products.forEach(product => {
    if (product.categoryId) {
      if (!productsByCategory[product.categoryId]) {
        productsByCategory[product.categoryId] = [];
      }
      productsByCategory[product.categoryId].push(product);
    } else {
      uncategorizedProducts.push(product);
    }
  });

  return (
    <div className="products-by-category">
      {/* Category Navigation */}
      <div className="category-nav">
        <h3>Jump to Category:</h3>
        <div className="category-links">
          {categories.map(category => {
            const count = productsByCategory[category.categoryId]?.length || 0;
            if (count === 0) return null;
            
            return (
              <button
                key={category.categoryId}
                onClick={() => scrollToCategory(category.categoryId)}
                className="category-link"
              >
                🏷️ {category.name} ({count})
              </button>
            );
          })}
          {uncategorizedProducts.length > 0 && (
            <button
              onClick={() => scrollToCategory('uncategorized')}
              className="category-link"
            >
              📦 Uncategorized ({uncategorizedProducts.length})
            </button>
          )}
        </div>
      </div>

      {/* Products by Category Sections */}
      <div className="category-sections">
        {categories.map(category => {
          const categoryProducts = productsByCategory[category.categoryId];
          if (!categoryProducts || categoryProducts.length === 0) return null;

          return (
            <div 
              key={category.categoryId}
              ref={el => categoryRefs.current[category.categoryId] = el}
              className="category-section"
            >
              <div className="category-header">
                <h2>🏷️ {category.name}</h2>
                {category.description && (
                  <p className="category-description">{category.description}</p>
                )}
                <div className="category-count">{categoryProducts.length} products</div>
              </div>
              
              <div className="product-grid">
                {categoryProducts.map(product => (
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
          );
        })}

        {/* Uncategorized Products */}
        {uncategorizedProducts.length > 0 && (
          <div 
            ref={el => categoryRefs.current['uncategorized'] = el}
            className="category-section"
          >
            <div className="category-header">
              <h2>📦 Uncategorized</h2>
              <div className="category-count">{uncategorizedProducts.length} products</div>
            </div>
            
            <div className="product-grid">
              {uncategorizedProducts.map(product => (
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
        )}
      </div>

      {products.length === 0 && (
        <div className="products-empty">
          <p>No products found</p>
        </div>
      )}
    </div>
  );
};

export default ProductsByCategory;
