import { useState, useEffect, useContext } from "react";
import SearchBar from "../../ui/SearchBar";
import { Trash2 } from "lucide-react";
import api from "../../../services/api";
import AuthContext from "../../../context/AuthContext"; // 🌟 Importamos tu contexto global
import "./OrdenForm.css";

const OrdenForm = ({ onSubmit, onClose }) => {
  // 🌟 Extraemos al usuario del contexto global
  const { user } = useContext(AuthContext);

  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [puntoOrigen, setPuntoOrigen] = useState(null);
  const [puntosInventarioDestino, setPuntosInventarioDestino] = useState([]);
  const [loading, setLoading] = useState(true);

  const [idOrigen, setIdOrigen] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);

  useEffect(() => {
    const cargarDatosFormulario = async () => {
      try {
        const res = await api.get("/movimientos/datos-formulario");
        const data = res.data;

        setProductosDisponibles(data.productos || []);

        // 🌟 1. Asignamos la ubicación directamente desde el usuario global (o backend como respaldo)
        const miUbicacion = user?.ubicacion || data.punto_origen || null;
        setPuntoOrigen(miUbicacion);

        // 🌟 2. Filtramos la lista de proveedores para excluir la propia farmacia del usuario
        const proveedores = data.puntos_inventario || [];
        if (miUbicacion) {
          setPuntosInventarioDestino(proveedores.filter(p => p.id !== miUbicacion.id));
        } else {
          setPuntosInventarioDestino(proveedores);
        }

      } catch (error) {
        console.error("Error al obtener la estructura para el formulario:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatosFormulario();
  }, [user]);

  const medicamentosFiltrados = productosDisponibles.filter((prod) =>
    prod.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarProducto = (prod) => {
    const existe = productosSeleccionados.find((p) => p.id === prod.id);
    if (existe) {
      setProductosSeleccionados(
        productosSeleccionados.map((p) =>
          p.id === prod.id ? { ...p, cantidad: p.cantidad + 1 } : p
        )
      );
    } else {
      setProductosSeleccionados([
        ...productosSeleccionados,
        { id: prod.id, nombre: prod.nombre, precio: prod.precio || 0, cantidad: 1 }
      ]);
    }
  };

  const cambiarCantidad = (id, cantidad) => {
    const valor = Number(cantidad);
    setProductosSeleccionados(
      productosSeleccionados.map((p) =>
        p.id === id ? { ...p, cantidad: valor > 0 ? valor : 1 } : p
      )
    );
  };

  const eliminarProducto = (id) => {
    setProductosSeleccionados(productosSeleccionados.filter((p) => p.id !== id));
  };

  const total = productosSeleccionados.reduce(
    (acc, p) => acc + (p.precio * p.cantidad), 0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idOrigen) {
      alert("Por favor seleccione un punto proveedor (Origen).");
      return;
    }
    if (!puntoOrigen) {
      alert("No se detectó tu ubicación destino (Recibidor).");
      return;
    }
    if (productosSeleccionados.length === 0) {
      alert("Debe agregar al menos un producto.");
      return;
    }

    const payload = {
      id_origen: parseInt(idOrigen),
      id_destino: puntoOrigen.id,
      id_tipo_movimiento: 1,
      productos: productosSeleccionados.map(p => p.id),
      cantidades: productosSeleccionados.map(p => p.cantidad)
    };

    try {
      const res = await api.post("/movimientos", payload);

      if (res.status === 200 || res.status === 201) {
        onSubmit();
        onClose();
      }
    } catch (error) {
      console.error("Error al enviar la orden:", error);
      const errorMsg = error.response?.data?.error || "No se pudo procesar la orden";
      alert("Error: " + errorMsg);
    }
  };

  if (loading) return <div className="text-center p-4">Cargando catálogo...</div>;

  return (
    <form onSubmit={handleSubmit} className="orden-form">
      <div className="orden-form-grid">

        <div className="orden-col orden-col-left">

          <div className="form-group">
            <label>Punto que va a Proveer / Surtir (Origen)</label>
            <select
              value={idOrigen}
              onChange={(e) => setIdOrigen(e.target.value)}
              required
            >
              <option value="">-- Seleccione el punto proveedor --</option>
              {puntosInventarioDestino.map((punto) => (
                <option key={punto.id} value={punto.id}>
                  {punto.nombre} [{punto.tipo}]
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Farmacia / Almacén Recibidor (Destino - Tú)</label>
            <input
              type="text"
              value={puntoOrigen ? `${puntoOrigen.nombre} [${puntoOrigen.tipo}]` : "Sin ubicación asignada"}
              disabled
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Buscar medicamentos de la empresa</label>
            <SearchBar
              placeholder="Escribe el nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

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

        <div className="orden-col orden-col-right">
          <div className="productos-header">
            <h4>Productos seleccionados</h4>
            {productosSeleccionados.length > 0 && (
              <span className="productos-count">
                {productosSeleccionados.length} ítem{productosSeleccionados.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="productos-lista">
            {productosSeleccionados.length === 0 ? (
              <div className="productos-empty">
                <p>Busca y agrega medicamentos</p>
                <span>Aparecerán listados aquí</span>
              </div>
            ) : (
              productosSeleccionados.map((p) => (
                <div key={p.id} className="producto-row">
                  <div className="producto-info">
                    <span className="producto-nombre">{p.nombre}</span>
                    <small>${p.precio} MXN c/u</small>
                  </div>

                  <div className="producto-controles">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
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

          <div className="orden-total-row">
            <span>Total Estimado</span>
            <strong>${total.toLocaleString()} MXN</strong>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="secondary-btn">
              Cancelar
            </button>
            <button type="submit" className="primary-btn">
              Generar e Iniciar Solicitud
            </button>
          </div>
        </div>

      </div>
    </form>
  );
};

export default OrdenForm;