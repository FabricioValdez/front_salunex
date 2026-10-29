import { useState, useEffect, useContext } from "react";
import { ArrowLeft, Trash2, Wand2, Plus } from "lucide-react";
import api from "../../../services/api";
import AuthContext from "../../../context/AuthContext";
import Button from "../../ui/Button";

const OrdenForm = ({ onSubmit, onClose }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [isAutoLoading, setIsAutoLoading] = useState(false);

  const [puntoOrigen, setPuntoOrigen] = useState(null); // Mi sucursal (Destino)
  const [puntosInventarioDestino, setPuntosInventarioDestino] = useState([]); // Almacenes (Origen)
  const [idOrigen, setIdOrigen] = useState(""); // Almacén seleccionado

  const [productosDisponibles, setProductosDisponibles] = useState([]);

  // Estructura de fila: { id_temp, id_producto, precio, cantidad, info_stock }
  const [filas, setFilas] = useState([]);

  useEffect(() => {
    const cargarDatosFormulario = async () => {
      try {
        const res = await api.get("/movimientos/datos-formulario");
        const miUbicacion = user?.ubicacion || res.data.punto_origen || null;
        setPuntoOrigen(miUbicacion);

        const proveedores = res.data.puntos_inventario || [];
        if (miUbicacion) {
          setPuntosInventarioDestino(proveedores.filter(p => p.id !== miUbicacion.id));
        } else {
          setPuntosInventarioDestino(proveedores);
        }
      } catch (error) {
        console.error("Error cargando estructura", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatosFormulario();
  }, [user]);

  // Cuando cambia el almacén proveedor, cargamos sus productos con stock
  useEffect(() => {
    if (!idOrigen) {
      setProductosDisponibles([]);
      return;
    }
    api.get(`/movimientos/productos-por-origen?id_origen=${idOrigen}`)
      .then(res => setProductosDisponibles(res.data))
      .catch(err => console.error(err));
  }, [idOrigen]);

  const agregarFilaManual = () => {
    setFilas([...filas, { id_temp: Date.now(), id_producto: "", precio: 0, cantidad: 1, info_stock: null }]);
  };

  const eliminarFila = (idTemp) => {
    setFilas(filas.filter(f => f.id_temp !== idTemp));
  };

  const actualizarFila = (idTemp, campo, valor) => {
    setFilas(filas.map(f => {
      if (f.id_temp === idTemp) {
        let actualizacion = { [campo]: valor };
        if (campo === "id_producto") {
          const prod = productosDisponibles.find(p => String(p.id) === valor);
          actualizacion.precio = prod ? prod.precio : 0;
        }
        return { ...f, ...actualizacion };
      }
      return f;
    }));
  };

  // BOTÓN MÁGICO: Auto-llenar con Stock Bajo/Medio
  const handleAutollenado = async () => {
    if (!idOrigen) {
      alert("Por favor, selecciona primero el Almacén Proveedor.");
      return;
    }
    setIsAutoLoading(true);
    try {
      const res = await api.get(`/movimientos/productos-stock-bajo?id_origen=${idOrigen}`);
      const criticos = res.data;

      if (criticos.length === 0) {
        alert("No hay productos con stock bajo o medio que requieran reabastecimiento.");
        return;
      }

      const nuevasFilas = criticos.map(c => ({
        id_temp: Math.random(),
        id_producto: String(c.id),
        precio: c.precio,
        cantidad: c.cantidad_sugerida,
        info_stock: { actual: c.stock_actual, estado: c.estado_stock }
      }));

      // Reemplazamos las filas actuales por las generadas
      setFilas(nuevasFilas);
    } catch (error) {
      console.error(error);
      alert("Error al consultar el stock bajo.");
    } finally {
      setIsAutoLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const filasValidas = filas.filter(f => f.id_producto && f.cantidad > 0);
    if (filasValidas.length === 0) {
      alert("Debe agregar al menos un producto válido.");
      return;
    }

    const payload = {
      id_origen: parseInt(idOrigen),
      id_destino: puntoOrigen.id,
      id_tipo_movimiento: 1,
      productos: filasValidas.map(f => parseInt(f.id_producto)),
      cantidades: filasValidas.map(f => parseFloat(f.cantidad))
    };

    try {
      await api.post("/movimientos", payload);
      onSubmit();
    } catch (error) {
      alert("Error: " + (error.response?.data?.error || "No se pudo procesar la orden"));
    }
  };

  const totalEstimado = filas.reduce((acc, f) => acc + (f.precio * (f.cantidad || 0)), 0);

  if (loading) return <div className="text-center p-4">Cargando formulario...</div>;

  return (
    <div className="orden-full-container">
      <div className="orden-full-header">
        <div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#6b7280", display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", marginBottom: "8px", fontWeight: 500, padding: 0 }}>
            <ArrowLeft size={16} /> Volver al listado
          </button>
          <h2>Crear Nueva Orden / Solicitud Multi-Producto</h2>
          <p>Selecciona el almacén proveedor y agrega los medicamentos que requieres.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="orden-grid-origen">
          <div>
            <label className="orden-fila-label">Punto que va a Proveer / Surtir (Origen) *</label>
            <select className="orden-input" value={idOrigen} onChange={(e) => setIdOrigen(e.target.value)} required>
              <option value="">-- Seleccione el punto proveedor --</option>
              {puntosInventarioDestino.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre} [{p.tipo}]</option>
              ))}
            </select>
          </div>
          <div>
            <label className="orden-fila-label">Farmacia / Almacén Recibidor (Destino - Tú)</label>
            <input className="orden-input" type="text" value={puntoOrigen ? `${puntoOrigen.nombre} [${puntoOrigen.tipo}]` : "Sin ubicación asignada"} disabled readOnly />
          </div>
        </div>

        <div className="orden-productos-section">
          <div className="orden-productos-header">
            <h3>Productos a Solicitar</h3>
            <button type="button" className="btn-magia" onClick={handleAutollenado} disabled={!idOrigen || isAutoLoading}>
              <Wand2 size={16} /> {isAutoLoading ? "Calculando..." : "Auto-llenar con Stock Bajo / Medio"}
            </button>
          </div>

          {filas.map((fila, index) => (
            <div key={fila.id_temp} className="orden-fila-producto">
              <div>
                <label className="orden-fila-label">Medicamento</label>
                <select
                  className="orden-input"
                  value={fila.id_producto}
                  onChange={(e) => actualizarFila(fila.id_temp, "id_producto", e.target.value)}
                  required
                  disabled={!idOrigen}
                >
                  <option value="">{idOrigen ? "-- Seleccione un medicamento --" : "-- Seleccione un proveedor primero --"}</option>
                  {productosDisponibles.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} (Precio: ${p.precio})</option>
                  ))}
                </select>
                {fila.info_stock && (
                  <small style={{ color: "#6b7280", display: "block", marginTop: "4px" }}>
                    Stock en tu farmacia: <strong>{fila.info_stock.actual} pz</strong>
                    <span className={`badge-alerta-stock ${fila.info_stock.estado}`}>{fila.info_stock.estado}</span>
                  </small>
                )}
              </div>

              <div>
                <label className="orden-fila-label">Cantidad</label>
                <input
                  className="orden-input"
                  type="number"
                  min="0.01" step="0.01"
                  value={fila.cantidad}
                  onChange={(e) => actualizarFila(fila.id_temp, "cantidad", e.target.value)}
                  required
                />
              </div>

              <div style={{ textAlign: "right" }}>
                <label className="orden-fila-label">Subtotal</label>
                <strong>${(fila.precio * (fila.cantidad || 0)).toLocaleString()}</strong>
              </div>

              <div style={{ textAlign: "right", paddingBottom: "10px" }}>
                <button type="button" onClick={() => eliminarFila(fila.id_temp)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", opacity: filas.length === 1 ? 0.3 : 1 }} disabled={filas.length === 1}>
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          <button type="button" onClick={agregarFilaManual} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: 500, padding: "10px 0" }}>
            <Plus size={16} /> Agregar otra fila manualmente
          </button>
        </div>

        <div className="orden-totales">
          <span className="orden-total-texto">Total Estimado:</span>
          <span className="orden-total-monto">${totalEstimado.toLocaleString()} MXN</span>
          <div style={{ marginLeft: "24px", display: "flex", gap: "12px" }}>
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary">Generar e Iniciar Solicitud</Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OrdenForm;