import "./Button.css";

function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  icon: Icon,
  disabled = false,
  active = false,
  className = ""
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`salunex-btn salunex-btn-${variant} ${active ? "active" : ""} ${className}`}
    >
      {Icon && <Icon size={18} className="btn-icon" />}
      {children}
    </button>
  );
}

export default Button;