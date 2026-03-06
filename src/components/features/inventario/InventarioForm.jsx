import { useState } from "react";
import Button from "../../ui/Button";
import "./InventarioForm.css";

function InventarioForm({ onSubmit, initialData }) {

  const [formData, setFormData] = useState(
    initialData || {
      nombre: "",
      lote: "",
      fechaExp: "",
      cantidad: "",
      ubicacion: ""
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

  return (
    <form className="inventario-form" onSubmit={handleSubmit}>

      <input
        name="nombre"
        placeholder="Nombre del medicamento"
        value={formData.nombre}
        onChange={handleChange}
        required
      />

      <input
        name="lote"
        placeholder="Lote"
        value={formData.lote}
        onChange={handleChange}
        required
      />

      <input
        type="date"
        name="fechaExp"
        value={formData.fechaExp}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="cantidad"
        placeholder="Cantidad"
        value={formData.cantidad}
        onChange={handleChange}
        required
      />

      <input
        name="ubicacion"
        placeholder="Ubicación"
        value={formData.ubicacion}
        onChange={handleChange}
        required
      />

      <div className="form-actions">
        <Button type="submit">
          Guardar
        </Button>
      </div>

    </form>
  );
}

export default InventarioForm;