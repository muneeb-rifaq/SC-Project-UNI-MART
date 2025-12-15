// ============================================================================
// ProductForm.jsx - Product Add/Edit Form Component
// ============================================================================
// Props:
// - product: Product object (null for new product)
// - categories: Array of category objects
// - sellers: Array of seller objects (admin only)
// - showSellerSelect: Whether to show seller selection (admin only)
// - onSubmit: Submit callback
// - onCancel: Cancel callback
// - isEdit: Whether this is edit mode
// ============================================================================

import { useState, useEffect } from "react";
import Input from "../common/Input";
import Button from "../common/Button";
import "./ProductForm.css";

const ProductForm = ({
  product = null,
  categories = [],
  sellers = [],
  showSellerSelect = false,
  onSubmit,
  onCancel,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    sellerId: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        stock: product.stock || "",
        categoryId: product.categoryId || "",
        sellerId: product.sellerId || "",
      });
    }
  }, [product]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!formData.stock || formData.stock < 0) {
      newErrors.stock = "Stock cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId: formData.categoryId || null,
      };

      // Only include sellerId if admin is changing it
      if (showSellerSelect && formData.sellerId) {
        submitData.sellerId = parseInt(formData.sellerId);
      }

      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <Input
        label="Product Name"
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        placeholder="Enter product name"
        required
        error={errors.name}
      />

      <div className="form-group">
        <label className="input-label">Description</label>
        <textarea
          className="textarea-field"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Enter product description"
          rows="4"
        />
      </div>

      <Input
        label="Price"
        type="number"
        step="0.01"
        value={formData.price}
        onChange={(e) => handleChange("price", e.target.value)}
        placeholder="0.00"
        required
        error={errors.price}
      />

      <Input
        label="Stock"
        type="number"
        value={formData.stock}
        onChange={(e) => handleChange("stock", e.target.value)}
        placeholder="0"
        required
        error={errors.stock}
      />

      {categories.length > 0 && (
        <div className="form-group">
          <label className="input-label">Category</label>
          <select
            className="select-field"
            value={formData.categoryId}
            onChange={(e) => handleChange("categoryId", e.target.value)}
          >
            <option value="">No Category</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                ID: {cat.categoryId} - {cat.categoryName || cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {showSellerSelect && sellers.length > 0 && (
        <div className="form-group">
          <label className="input-label">Seller (Admin Only)</label>
          <select
            className="select-field"
            value={formData.sellerId}
            onChange={(e) => handleChange("sellerId", e.target.value)}
          >
            <option value="">No Seller</option>
            {sellers.map((seller) => (
              <option key={seller.userId} value={seller.userId}>
                ID: {seller.userId} - {seller.name || seller.email}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {isEdit ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
