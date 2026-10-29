import { useState } from "react";
import Button from "../../ui/Button";
import "./InventarioForm.css";

function InventarioForm({ onSubmit, onCancel, initialData, itemPadre }) {
  // Si estamos creando un lote nuevo, inicializamos vacío, de lo contrario usamos la data
  const [formData, setFormData] = useState(
    initialData || {
      lote: "",
      fecha_expiracion: "",
      cantidad: ""
    }
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      cantidad: Number(formData.cantidad)
    });
  };

  // Si pasamos itemPadre, pre-llenamos (visualmente) si es la primera vez que se agrega un lote
  const requiresInitConfig = !initialData && (!itemPadre?.stock_minimo);

  return (
    <form onSubmit={handleSubmit}>
      <div className="inventario-form-grid grid-2">
        <div className="inv-form-group">
          <label className="inv-form-label">Número de Lote *</label>
          <input
            className="inv-form-input"
            name="lote"
            placeholder="Ej. LOTE-A001"
            value={formData.lote}
            onChange={handleChange}
            required
          />
        </div>

        <div className="inv-form-group">
          <label className="inv-form-label">Fecha de Expiración *</label>
          <input
            className="inv-form-input"
            type="date"
            name="fecha_expiracion"
            value={formData.fecha_expiracion ? formData.fecha_expiracion.split('T')[0] : ''}
            onChange={handleChange}
            required
          />
        </div>

        <div className="inv-form-group" style={{ gridColumn: "span 2" }}>
          <label className="inv-form-label">Cantidad de Piezas (Ingreso) *</label>
          <input
            className="inv-form-input"
            type="number"
            name="cantidad"
            placeholder="0"
            value={formData.cantidad}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
      </div>

      {requiresInitConfig && (
        <div style={{ padding: "16px", backgroundColor: "#f3f4f6", borderRadius: "8px", marginBottom: "16px" }}>
          <p style={{ fontSize: "14px", color: "#4b5563", margin: "0 0 12px 0" }}>
            <strong style={{ color: "#111827" }}>Opcional:</strong> Define los parámetros de reabastecimiento iniciales.
          </p>
          <div className="inventario-form-grid" style={{ marginBottom: 0 }}>
            <div className="inv-form-group">
              <label className="inv-form-label">Mínimo</label>
              <input className="inv-form-input" type="number" name="stock_minimo" value={formData.stock_minimo || 10} onChange={handleChange} min="0" />
            </div>
            <div className="inv-form-group">
              <label className="inv-form-label">Medio</label>
              <input className="inv-form-input" type="number" name="stock_medio" value={formData.stock_medio || 25} onChange={handleChange} min="0" />
            </div>
            <div className="inv-form-group">
              <label className="inv-form-label">Deseado</label>
              <input className="inv-form-input" type="number" name="stock_deseado" value={formData.stock_deseado || 50} onChange={handleChange} min="0" />
            </div>
          </div>
        </div>
      )}

      <div className="inv-modal-actions">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" type="submit">Guardar Lote</Button>
      </div>
    </form>
  );
}

export default InventarioForm;