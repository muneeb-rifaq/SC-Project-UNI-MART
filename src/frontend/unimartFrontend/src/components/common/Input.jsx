// ============================================================================
// Input.jsx - Reusable Input Component
// ============================================================================

import "./Input.css";

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = "",
}) => {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`input-field ${error ? "input-error" : ""}`}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default Input;
