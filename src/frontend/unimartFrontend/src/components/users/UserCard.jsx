// ============================================================================
// UserCard.jsx - User Card Component (Admin only)
// ============================================================================

import Card from "../common/Card";
import Button from "../common/Button";
import "./UserCard.css";

const UserCard = ({ user, deleteAccess = false, onView, onDelete }) => {
  const handleCardClick = () => {
    if (onView) onView(user);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(user);
  };

  const roleIcons = {
    admin: "👑",
    seller: "🏪",
    buyer: "🛍️",
  };

  return (
    <Card hoverable onClick={handleCardClick} className="user-card">
      <div className="user-icon">{roleIcons[user.role] || "👤"}</div>
      <h3 className="user-name">{user.name || user.email}</h3>
      <p className="user-email">{user.email}</p>
      <div className={`user-role user-role-${user.role}`}>
        {user.role?.toUpperCase()}
      </div>

      {deleteAccess && (
        <div className="user-actions">
          <Button
            variant="danger"
            size="small"
            onClick={handleDelete}
            fullWidth
          >
            🗑️ Delete User
          </Button>
        </div>
      )}
    </Card>
  );
};

export default UserCard;
