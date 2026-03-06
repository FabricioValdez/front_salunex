import { useState } from "react";
import "./OrdenForm.css";

const OrdenForm = ({ onSubmit, onClose }) => {

  const [proveedor, setProveedor] = useState("");
  const [total, setTotal] = useState("");
  const [fecha, setFecha] = useState("");
  const [estatus, setEstatus] = useState("enviado");

  const handleSubmit = (e) => {
    e.preventDefault();

    const nuevaOrden = {
      proveedor,
      fecha,
      estatus,
      total: Number(total),
    };

    onSubmit(nuevaOrden);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="orden-form">

      <label>Proveedor</label>
      <input
        type="text"
        placeholder="Proveedor"
        value={proveedor}
        onChange={(e) => setProveedor(e.target.value)}
        required
      />

      <label>Total de la orden</label>
      <input
        type="number"
        placeholder="Total"
        value={total}
        onChange={(e) => setTotal(e.target.value)}
        required
      />

      <label>Fecha</label>
      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        required
      />

      <label>Estatus</label>
      <select
        value={estatus}
        onChange={(e) => setEstatus(e.target.value)}
      >
        <option value="enviado">Enviado</option>
        <option value="completado">Completado</option>
        <option value="cancelado">Cancelado</option>
      </select>

      <div className="form-actions">
        <button type="button" onClick={onClose} className="secondary-btn">
          Cancelar
        </button>

        <button type="submit" className="primary-btn">
          Guardar Orden
        </button>
      </div>

    </form>
  );
};

export default OrdenForm;