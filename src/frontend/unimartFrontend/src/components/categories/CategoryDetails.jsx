// ============================================================================
// CategoryDetails.jsx - Category Details Modal Component
// ============================================================================

import Modal from "../common/Modal";
import Button from "../common/Button";
import "./CategoryDetails.css";

const CategoryDetails = ({ category, isOpen, onClose }) => {
  if (!category) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Category Details"
      size="medium"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="category-details">
        <div className="category-details-header">
          <div className="category-details-icon">🏷️</div>
          <h2>{category.categoryName || category.name}</h2>
        </div>

        <div className="category-details-body">
          <div className="category-detail-row">
            <span className="category-detail-label">Category ID:</span>
            <span className="category-detail-value">{category.categoryId}</span>
          </div>

          <div className="category-detail-row">
            <span className="category-detail-label">Name:</span>
            <span className="category-detail-value">
              {category.categoryName || category.name}
            </span>
          </div>

          <div className="category-detail-row">
            <span className="category-detail-label">Description:</span>
            <span className="category-detail-value">
              {category.description || "No description provided"}
            </span>
          </div>

          {category.dateCreated && (
            <div className="category-detail-row">
              <span className="category-detail-label">Created:</span>
              <span className="category-detail-value">
                {new Date(category.dateCreated).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CategoryDetails;
