// ============================================================================
// Card.jsx - Reusable Card Component
// ============================================================================

import "./Card.css";

const Card = ({
  children,
  title,
  onClick,
  hoverable = false,
  className = "",
}) => {
  const cardClass = `card ${hoverable ? "card-hoverable" : ""} ${className}`;

  return (
    <div className={cardClass} onClick={onClick}>
      {title && <div className="card-title">{title}</div>}
      <div className="card-content">{children}</div>
    </div>
  );
};

export default Card;
