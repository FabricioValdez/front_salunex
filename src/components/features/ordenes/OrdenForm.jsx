import { useState, useContext } from "react";
import InventoryContext from "../../../context/InventoryContext";
import SearchBar from "../../ui/SearchBar";
import { Trash2 } from "lucide-react";
import "./OrdenForm.css";

const OrdenForm = ({ onSubmit, onClose }) => {

  const { inventario } = useContext(InventoryContext);

  const [proveedor, setProveedor] = useState("");
  const [estatus, setEstatus] = useState("enviado");
  const [busqueda, setBusqueda] = useState("");
  const [productos, setProductos] = useState([]);

  const medicamentosFiltrados = inventario.filter((med) =>
    med.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

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
        { id: med.id, nombre: med.nombre, precio: med.precio, cantidad: 1 }
      ]);
    }
  };

  const cambiarCantidad = (id, cantidad) => {
    setProductos(
      productos.map(p =>
        p.id === id ? { ...p, cantidad: Number(cantidad) } : p
      )
    );
  };

  const eliminarProducto = (id) => {
    setProductos(productos.filter(p => p.id !== id));
  };

  const total = productos.reduce(
    (acc, p) => acc + p.precio * p.cantidad, 0
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ proveedor, fecha: new Date().toISOString().split("T")[0], estatus, productos, total });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="orden-form">

      <div className="orden-form-grid">

        {/* ── Columna izquierda: datos generales ── */}
        <div className="orden-col orden-col-left">

          <div className="form-group">
            <label>Farmacia</label>
            <input
              type="text"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              placeholder="Nombre del proveedor"
              required
            />
          </div>

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

          <div className="form-group">
            <label>Buscar medicamento</label>
            <SearchBar
              placeholder="Buscar medicamento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Lista de resultados de búsqueda */}
          {busqueda && (
            <div className="med-list">
              {medicamentosFiltrados.length === 0 ? (
                <p className="med-empty">Sin resultados para "{busqueda}"</p>
              ) : (
                medicamentosFiltrados.slice(0, 6).map((med) => (
                  <div key={med.id} className="med-item">
                    <div className="med-item-info">
                      <span className="med-nombre">{med.nombre}</span>
                      <small className="med-precio">${med.precio} MXN</small>
                    </div>
                    <button
                      type="button"
                      className="add-btn"
                      onClick={() => agregarProducto(med)}
                    >
                      + Agregar
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* ── Columna derecha: productos seleccionados ── */}
        <div className="orden-col orden-col-right">

          <div className="productos-header">
            <h4>Productos seleccionados</h4>
            {productos.length > 0 && (
              <span className="productos-count">{productos.length} ítem{productos.length > 1 ? "s" : ""}</span>
            )}
          </div>

          <div className="productos-lista">
            {productos.length === 0 ? (
              <div className="productos-empty">
                <p>Busca y agrega medicamentos</p>
                <span>Los productos aparecerán aquí</span>
              </div>
            ) : (
              productos.map((p) => (
                <div key={p.id} className="producto-row">

                  <div className="producto-info">
                    <span className="producto-nombre">{p.nombre}</span>
                    <small>${p.precio} MXN c/u</small>
                  </div>

                  <div className="producto-controles">
                    <input
                      type="number"
                      min="1"
                      value={p.cantidad}
                      onChange={(e) => cambiarCantidad(p.id, e.target.value)}
                      className="cantidad-input"
                    />
                    <span className="producto-subtotal">
                      ${(p.precio * p.cantidad).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => eliminarProducto(p.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Total */}
          <div className="orden-total-row">
            <span>Total</span>
            <strong>${total.toLocaleString()} MXN</strong>
          </div>

          {/* Acciones */}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="secondary-btn">
              Cancelar
            </button>
            <button type="submit" className="primary-btn">
              Guardar Orden
            </button>
          </div>

        </div>
      </div>

    </form>
  );
};

export default OrdenForm;