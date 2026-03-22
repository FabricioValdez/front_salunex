import "./Modal.css";

function Modal({ isOpen, onClose, title, children, className = "" }) {
  if (!isOpen) return null;

  return (
    <div className="salunex-modal-overlay" onClick={onClose}>
      <div
        className={`salunex-modal ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="salunex-modal-header">
          <h2>{title}</h2>
          <button
            className="salunex-modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="salunex-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;