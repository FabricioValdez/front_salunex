import { useState, useContext } from "react";
import InventoryContext from "../../../context/InventoryContext";
import SearchBar from "../../ui/SearchBar";
import "./OrdenForm.css";

const OrdenForm = ({ onSubmit, onClose }) => {

  const { inventario } = useContext(InventoryContext);

  const [proveedor, setProveedor] = useState("");
  const [estatus, setEstatus] = useState("enviado");
  const [busqueda, setBusqueda] = useState("");
  const [productos, setProductos] = useState([]);

  // Filtrar medicamentos
  const medicamentosFiltrados = inventario.filter((med) =>
    med.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Agregar medicamento
  const agregarProducto = (med) => {

    const existe = productos.find(p => p.id === med.id);

    if (existe) {

      setProductos(
        productos.map(p =>
          p.id === med.id
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        )
      );

    } else {

      setProductos([
        ...productos,
        {
          id: med.id,
          nombre: med.nombre,
          precio: med.precio,
          cantidad: 1
        }
      ]);

    }
  };

  // Cambiar cantidad
  const cambiarCantidad = (id, cantidad) => {

    setProductos(
      productos.map(p =>
        p.id === id
          ? { ...p, cantidad: Number(cantidad) }
          : p
      )
    );

  };

  // Calcular total
  const total = productos.reduce(
    (acc, p) => acc + p.precio * p.cantidad,
    0
  );

  const handleSubmit = (e) => {

    e.preventDefault();

    const nuevaOrden = {
      proveedor,
      fecha: new Date().toISOString().split("T")[0],
      estatus,
      productos,
      total
    };

    onSubmit(nuevaOrden);
    onClose();
  };

  return (

    <form onSubmit={handleSubmit} className="orden-form">

      <div className="form-group">
        <label>Proveedor</label>
        <input
          type="text"
          value={proveedor}
          onChange={(e) => setProveedor(e.target.value)}
          placeholder="Nombre del proveedor"
          required
        />
      </div>

      <div className="form-group">
        <label>Buscar medicamento</label>

        <SearchBar
          placeholder="Buscar medicamento..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {busqueda && (
        <div className="med-list">

          {medicamentosFiltrados.slice(0, 5).map((med) => (

            <div key={med.id} className="med-item">

              <span>
                {med.nombre}
                <small>${med.precio}</small>
              </span>

              <button
                type="button"
                className="add-btn"
                onClick={() => agregarProducto(med)}
              >
                Agregar
              </button>

            </div>

          ))}

        </div>
      )}

      <h4 className="section-title">Productos seleccionados</h4>

      {productos.length === 0 && (
        <p className="empty-products">
          No hay medicamentos agregados
        </p>
      )}

      {productos.map((p) => (

        <div key={p.id} className="producto-row">

          <span className="producto-nombre">
            {p.nombre}
          </span>

          <input
            type="number"
            min="1"
            value={p.cantidad}
            onChange={(e) =>
              cambiarCantidad(p.id, e.target.value)
            }
          />

          <span className="producto-subtotal">
            ${(p.precio * p.cantidad).toFixed(2)}
          </span>

        </div>

      ))}

      <h3 className="orden-total">
        Total: ${total.toFixed(2)}
      </h3>

      <div className="form-group">

        <label>Estatus</label>

        <select
          value={estatus}
          onChange={(e) => setEstatus(e.target.value)}
        >
          <option value="enviado">Enviado</option>
          <option value="completado">Completado</option>
          <option value="cancelado">Cancelado</option>
        </select>

      </div>

      <div className="form-actions">

        <button
          type="button"
          onClick={onClose}
          className="secondary-btn"
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="primary-btn"
        >
          Guardar Orden
        </button>

      </div>

    </form>
  );
};

export default OrdenForm;