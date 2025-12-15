// ============================================================================
// Button.jsx - Reusable Button Component
// ============================================================================

import "./Button.css";

const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
  type = "button",
  fullWidth = false,
  className = "",
}) => {
  const buttonClass = `btn btn-${variant} btn-${size} ${
    fullWidth ? "btn-full-width" : ""
  } ${className}`;

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
