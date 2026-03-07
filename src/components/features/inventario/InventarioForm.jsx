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
      categoria: "", // Reemplazamos ubicacion por categoria
      precio: ""     // Nuevo campo
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

    // Convertimos cantidad y precio a número
    onSubmit({
      ...formData,
      cantidad: Number(formData.cantidad),
      precio: Number(formData.precio)
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

      <select
        name="categoria"
        value={formData.categoria}
        onChange={handleChange}
        required
      >
        <option value="">Selecciona categoría</option>
        <option value="Antibiótico">Antibiótico</option>
        <option value="Antiinflamatorio">Antiinflamatorio</option>
        <option value="Antihistamínico">Antihistamínico</option>
        <option value="Antiácido">Antiácido</option>
        <option value="Hormona">Hormona</option>
        <option value="Antidiabético">Antidiabético</option>
      </select>

      <input
        type="number"
        name="precio"
        placeholder="Precio"
        value={formData.precio}
        onChange={handleChange}
        step="0.01"
        min="0"
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