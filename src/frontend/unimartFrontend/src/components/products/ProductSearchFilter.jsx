// ============================================================================
// ProductSearchFilter.jsx - Advanced Product Search & Filter Component
// ============================================================================
// Features:
// - Text search across name, description
// - Price range filtering (min-max)
// - Stock availability filter
// - Category filtering (multi-select)
// - Seller filtering (by sellerId)
// - Sort options (price, name, stock, date)
// - Clear all filters
// ============================================================================

import { useState, useEffect } from "react";
import Input from "../common/Input";
import Button from "../common/Button";
import ProductQueryEngine from "../../parsers/ProductQueryEngine";
import "./ProductSearchFilter.css";

const ProductSearchFilter = ({
  products = [],
  categories = [],
  onFilterChange,
  showSellerFilter = false, // For admin/buyer views
}) => {
  // Filter states
  const [searchText, setSearchText] = useState("");
  const [useAdvancedParser, setUseAdvancedParser] = useState(false); // Toggle for parser mode
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // 'all', 'inStock', 'outOfStock'
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState("");
  const [sortBy, setSortBy] = useState("name-asc"); // 'name-asc', 'name-desc', 'price-asc', 'price-desc', 'stock-asc', 'stock-desc', 'date-desc'
  const [isExpanded, setIsExpanded] = useState(false);
  const [parseError, setParseError] = useState("");

  // Get unique seller IDs from products
  const uniqueSellers = [...new Set(products.map((p) => p.sellerId))].sort(
    (a, b) => a - b
  );

  const applyFilters = () => {
    let filtered = [...products];

    // 1. Advanced Parser Mode - use ANTLR-style query language
    if (useAdvancedParser && searchText.trim()) {
      const engine = new ProductQueryEngine(products, categories);
      const result = engine.execute(searchText);

      if (result.success) {
        filtered = result.results;
        setParseError("");
      } else {
        setParseError(result.error);
        // On error, fall back to simple search
        const search = searchText.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(search) ||
            p.description.toLowerCase().includes(search)
        );
      }
    }
    // 1b. Simple Text search (case-insensitive, searches name and description)
    else if (!useAdvancedParser && searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
      );
      setParseError("");
    }

    // 2. Price range filter
    if (minPrice !== "" && !isNaN(minPrice)) {
      filtered = filtered.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice !== "" && !isNaN(maxPrice)) {
      filtered = filtered.filter((p) => p.price <= Number(maxPrice));
    }

    // 3. Stock availability filter
    if (stockFilter === "inStock") {
      filtered = filtered.filter((p) => p.stock > 0);
    } else if (stockFilter === "outOfStock") {
      filtered = filtered.filter((p) => p.stock === 0);
    }

    // 4. Category filter (multi-select)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(
        (p) =>
          selectedCategories.includes(p.categoryId) ||
          (selectedCategories.includes("uncategorized") && !p.categoryId)
      );
    }

    // 5. Seller filter
    if (selectedSeller !== "" && !isNaN(selectedSeller)) {
      filtered = filtered.filter((p) => p.sellerId === Number(selectedSeller));
    }

    // 6. Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "stock-asc":
          return a.stock - b.stock;
        case "stock-desc":
          return b.stock - a.stock;
        case "date-desc":
          return new Date(b.dateUpdated) - new Date(a.dateUpdated);
        default:
          return 0;
      }
    });

    // Send filtered results to parent
    onFilterChange(filtered);
  };

  // Apply filters whenever any filter changes
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchText,
    minPrice,
    maxPrice,
    stockFilter,
    selectedCategories,
    selectedSeller,
    sortBy,
    products,
  ]);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleClearFilters = () => {
    setSearchText("");
    setMinPrice("");
    setMaxPrice("");
    setStockFilter("all");
    setSelectedCategories([]);
    setSelectedSeller("");
    setSortBy("name-asc");
  };

  const hasActiveFilters =
    searchText ||
    minPrice !== "" ||
    maxPrice !== "" ||
    stockFilter !== "all" ||
    selectedCategories.length > 0 ||
    selectedSeller !== "" ||
    sortBy !== "name-asc";

  return (
    <div className="product-search-filter">
      {/* Toggle Button */}
      <div className="filter-header">
        <button
          className="filter-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "🔽" : "▶️"} Search & Filter Products
          {hasActiveFilters && <span className="active-indicator">●</span>}
        </button>
        {hasActiveFilters && (
          <Button variant="secondary" size="small" onClick={handleClearFilters}>
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {isExpanded && (
        <div className="filter-panel">
          {/* Row 1: Search Text with Parser Toggle */}
          <div className="filter-row">
            <div className="filter-group full-width">
              <div className="search-header">
                <label>🔍 Search Products</label>
                <label className="parser-toggle">
                  <input
                    type="checkbox"
                    checked={useAdvancedParser}
                    onChange={(e) => setUseAdvancedParser(e.target.checked)}
                  />
                  <span>Advanced Query Language</span>
                </label>
              </div>
              <Input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={
                  useAdvancedParser
                    ? "Try: price < 1000 AND stock > 0"
                    : "Search by name or description..."
                }
              />
              {parseError && <div className="parse-error">❌ {parseError}</div>}
              {useAdvancedParser && !parseError && searchText && (
                <div className="parse-help">
                  💡 Examples: name:"laptop" | price:100..500 | (stock > 0 AND
                  category:"Electronics")
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Price Range */}
          <div className="filter-row">
            <div className="filter-group">
              <label>💵 Min Price</label>
              <Input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="$0"
                min="0"
                step="0.01"
              />
            </div>
            <div className="filter-group">
              <label>💵 Max Price</label>
              <Input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Any"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Row 3: Stock & Sort */}
          <div className="filter-row">
            <div className="filter-group">
              <label>📦 Stock Status</label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Products</option>
                <option value="inStock">In Stock Only</option>
                <option value="outOfStock">Out of Stock Only</option>
              </select>
            </div>
            <div className="filter-group">
              <label>🔀 Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low-High)</option>
                <option value="price-desc">Price (High-Low)</option>
                <option value="stock-asc">Stock (Low-High)</option>
                <option value="stock-desc">Stock (High-Low)</option>
                <option value="date-desc">Recently Updated</option>
              </select>
            </div>
          </div>

          {/* Row 4: Categories */}
          {categories.length > 0 && (
            <div className="filter-row">
              <div className="filter-group full-width">
                <label>🏷️ Categories</label>
                <div className="category-chips">
                  {categories.map((cat) => (
                    <button
                      key={cat.categoryId}
                      onClick={() => handleCategoryToggle(cat.categoryId)}
                      className={`category-chip ${
                        selectedCategories.includes(cat.categoryId)
                          ? "active"
                          : ""
                      }`}
                    >
                      {cat.categoryName || cat.name}
                    </button>
                  ))}
                  <button
                    onClick={() => handleCategoryToggle("uncategorized")}
                    className={`category-chip ${
                      selectedCategories.includes("uncategorized")
                        ? "active"
                        : ""
                    }`}
                  >
                    Uncategorized
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Row 5: Seller Filter (if enabled) */}
          {showSellerFilter && uniqueSellers.length > 0 && (
            <div className="filter-row">
              <div className="filter-group">
                <label>👤 Seller ID</label>
                <select
                  value={selectedSeller}
                  onChange={(e) => setSelectedSeller(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Sellers</option>
                  {uniqueSellers.map((sellerId) => (
                    <option key={sellerId} value={sellerId}>
                      Seller #{sellerId}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearchFilter;
