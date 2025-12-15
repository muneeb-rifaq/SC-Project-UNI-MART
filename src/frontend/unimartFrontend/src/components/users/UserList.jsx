// ============================================================================
// UserList.jsx - User List Component (Admin only)
// ============================================================================

import UserCard from "./UserCard";
import "./UserList.css";

const UserList = ({
  users,
  deleteAccess = false,
  onView,
  onDelete,
  loading = false,
  emptyMessage = "No users found",
}) => {
  if (loading) {
    return (
      <div className="user-list-loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="user-list-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="user-list-grid">
      {users.map((user) => (
        <UserCard
          key={user.userId}
          user={user}
          deleteAccess={deleteAccess}
          onView={onView}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default UserList;
