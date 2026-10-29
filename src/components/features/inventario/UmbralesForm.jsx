import { useState } from "react";
import Button from "../../ui/Button";
import "./InventarioForm.css";

function UmbralesForm({ item, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        id_inventario: item.id,
        stock_minimo: item.stock_minimo || 0,
        stock_medio: item.stock_medio || 0,
        stock_deseado: item.stock_deseado || 0
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: Number(e.target.value) });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <p style={{ color: "#4b5563", fontSize: "14px", marginBottom: "20px" }}>
                Define las alertas de reabastecimiento para <strong>{item.producto}</strong> en la sucursal <strong>{item.ubicacion_nombre}</strong>.
            </p>

            <div className="inventario-form-grid">
                <div className="inv-form-group">
                    <label className="inv-form-label">Mínimo (Bajo)</label>
                    <input className="inv-form-input" type="number" name="stock_minimo" value={formData.stock_minimo} onChange={handleChange} min="0" required />
                </div>
                <div className="inv-form-group">
                    <label className="inv-form-label">Medio</label>
                    <input className="inv-form-input" type="number" name="stock_medio" value={formData.stock_medio} onChange={handleChange} min="0" required />
                </div>
                <div className="inv-form-group">
                    <label className="inv-form-label">Deseado (Óptimo)</label>
                    <input className="inv-form-input" type="number" name="stock_deseado" value={formData.stock_deseado} onChange={handleChange} min="0" required />
                </div>
            </div>

            <div className="inv-modal-actions">
                <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
                <Button variant="primary" type="submit">Guardar Umbrales</Button>
            </div>
        </form>
    );
}

export default UmbralesForm;