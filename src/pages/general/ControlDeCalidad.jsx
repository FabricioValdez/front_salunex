import { useState, useEffect } from "react";
import { ShieldAlert, Trash2, Clock, Plus, CheckCircle, AlertTriangle } from "lucide-react";
import PageContainer from "../../components/ui/PageContainer";
import Button from "../../components/ui/Button";
import api from "../../services/api";
import "../../styles/general/ControlCalidad.css";

function ControlDeCalidad() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Datos iniciales de la API
  const [miUbicacion, setMiUbicacion] = useState(null);
  const [destinos, setDestinos] = useState([]);
  const [tiposMovimiento, setTiposMovimiento] = useState([]);
  const [esSalidaProveedor, setEsSalidaProveedor] = useState(false);
  const [productos, setProductos] = useState([]);
  const [lotesCaducados, setLotesCaducados] = useState([]);

  // Estado del formulario general
  const [idDestino, setIdDestino] = useState("");
  const [idTipoMovimiento, setIdTipoMovimiento] = useState("");
  const [motivo, setMotivo] = useState("");

  // Estado de las filas dinámicas (los lotes a dar de baja)
  const [filas, setFilas] = useState([
    { idTemp: Date.now(), id_producto: "", id_detalle_inventario: "", cantidad: "", maxCantidad: 0, opcionesLote: [] }
  ]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const res = await api.get("/control-calidad");
      const data = res.data;

      setMiUbicacion(data.mi_ubicacion);
      setDestinos(data.destinos);
      setEsSalidaProveedor(data.es_salida_proveedor);
      setTiposMovimiento(data.tipos_movimiento);
      setLotesCaducados(data.lotes_caducados); // Lotes que YA vencieron

      // Si solo hay un destino, autoseleccionarlo
      if (data.destinos.length === 1) {
        setIdDestino(data.destinos[0].id);
      }
    } catch (error) {
      setErrorMsg("Error al cargar la información del servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Al cambiar de producto en una fila, cargamos sus lotes
  const handleProductoChange = async (idTemp, idProducto) => {
    const nuevasFilas = filas.map(f => {
      if (f.idTemp === idTemp) {
        return { ...f, id_producto: idProducto, id_detalle_inventario: "", cantidad: "", maxCantidad: 0, opcionesLote: [] };
      }
      return f;
    });
    setFilas(nuevasFilas);

    if (!idProducto) return;

    try {
      // Reutilizamos el endpoint que hicimos para las órdenes (busca lotes > 0 en mi ubicación)
      const res = await api.get(`/movimientos/auto-surtido-fefo?id_producto=${idProducto}&id_origen=${miUbicacion.id}&cantidad_requerida=999999`);

      setFilas(prev => prev.map(f => {
        if (f.idTemp === idTemp) {
          return { ...f, opcionesLote: res.data.lotes || [] };
        }
        return f;
      }));
    } catch (error) {
      console.error("Error cargando lotes", error);
    }
  };

  const handleLoteChange = (idTemp, idDetalleInv) => {
    setFilas(prev => prev.map(f => {
      if (f.idTemp === idTemp) {
        const loteSelec = f.opcionesLote.find(l => String(l.id_detalle_inventario) === String(idDetalleInv));
        return {
          ...f,
          id_detalle_inventario: idDetalleInv,
          maxCantidad: loteSelec ? loteSelec.cantidad_tomada : 0, // 'cantidad_tomada' es el stock disponible devuelto por el endpoint
          cantidad: ""
        };
      }
      return f;
    }));
  };

  const handleCantidadChange = (idTemp, valor) => {
    setFilas(prev => prev.map(f => {
      if (f.idTemp === idTemp) {
        let num = parseFloat(valor) || 0;
        if (num < 0) num = 0;
        if (num > f.maxCantidad) num = f.maxCantidad;
        return { ...f, cantidad: num || "" };
      }
      return f;
    }));
  };

  const agregarFila = () => {
    setFilas([...filas, { idTemp: Date.now(), id_producto: "", id_detalle_inventario: "", cantidad: "", maxCantidad: 0, opcionesLote: [] }]);
  };

  const eliminarFila = (idTemp) => {
    if (filas.length > 1) {
      setFilas(filas.filter(f => f.idTemp !== idTemp));
    }
  };

  // BOTÓN MÁGICO: AUTO-RELLENO DE CADUCADOS
  const cargarLotesCaducadosAutomáticamente = () => {
    if (!lotesCaducados || lotesCaducados.length === 0) {
      alert("El sistema no detecta ningún lote caducado en tu ubicación en este momento.");
      return;
    }

    // 1. Poner texto por defecto
    setMotivo("Baja / Devolución automática de productos caducados");

    // 2. Intentar autoseleccionar el motivo "Caducidad"
    const tipoCad = tiposMovimiento.find(t => t.nombre.toLowerCase().includes("caducidad"));
    if (tipoCad) setIdTipoMovimiento(tipoCad.id);

    // 3. Crear las filas
    const nuevasFilas = lotesCaducados.map(lote => ({
      idTemp: Math.random(),
      id_producto: lote.id_producto,
      id_detalle_inventario: lote.id_detalle_inventario,
      cantidad: lote.cantidad,
      maxCantidad: lote.cantidad,
      opcionesLote: [{ // Simulamos la opción del select para que se dibuje
        id_detalle_inventario: lote.id_detalle_inventario,
        lote: lote.lote,
        fecha_expiracion: lote.fecha_expiracion,
        cantidad_tomada: lote.cantidad
      }]
    }));

    setFilas(nuevasFilas);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar filas
    const filasValidas = filas.filter(f => f.id_detalle_inventario && f.cantidad > 0);
    if (filasValidas.length === 0) {
      setErrorMsg("Debes especificar al menos un lote con cantidad válida para dar de baja.");
      return;
    }

    const payload = {
      id_tipo_movimiento: idTipoMovimiento,
      id_destino: esSalidaProveedor ? null : idDestino,
      motivo: motivo,
      lotes_salida: filasValidas.map(f => ({
        id_detalle_inventario: f.id_detalle_inventario,
        cantidad: f.cantidad
      }))
    };

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      await api.post("/control-calidad", payload);
      setSuccessMsg("Proceso de calidad aplicado correctamente.");
      setFilas([{ idTemp: Date.now(), id_producto: "", id_detalle_inventario: "", cantidad: "", maxCantidad: 0, opcionesLote: [] }]);
      setMotivo("");
      cargarDatos(); // Recargar para actualizar los lotes caducados

      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Error al procesar la salida.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <PageContainer><div className="text-center p-4">Cargando módulo de calidad...</div></PageContainer>;

  return (
    <PageContainer>
      <div className="control-calidad-container">
        <div className="control-calidad-header">
          <h2><ShieldAlert size={24} color="#ef4444" /> Registro de Salida por Control de Calidad / Devolución</h2>
        </div>

        {errorMsg && (
          <div className="alert-roja">
            <AlertTriangle size={18} /> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ background: "#d1fae5", color: "#059669", padding: "12px", borderRadius: "8px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 500 }}>
            <CheckCircle size={18} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* --- CABECERA --- */}
          <div className="control-calidad-grid">
            <div className="form-group-calidad">
              <label>Ubicación Emisora (Origen)</label>
              <input type="text" className="form-control-calidad" value={miUbicacion ? `${miUbicacion.nombre} [${miUbicacion.tipo}]` : ''} disabled />
            </div>

            <div className="form-group-calidad">
              <label>Destino / Operación</label>
              {esSalidaProveedor ? (
                <div>
                  <input type="text" className="form-control-calidad input-baja-definitiva" value="PROVEEDOR / BAJA DEFINITIVA DEL SISTEMA" disabled />
                  <small style={{ color: "#6b7280", marginTop: "4px", display: "block" }}>El producto se eliminará de las existencias del almacén.</small>
                </div>
              ) : (
                <select className="form-control-calidad" value={idDestino} onChange={e => setIdDestino(e.target.value)} required>
                  <option value="">-- Seleccione el Almacén Destino --</option>
                  {destinos.map(d => (
                    <option key={d.id} value={d.id}>{d.nombre} [{d.tipo}]</option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group-calidad">
              <label>Motivo de Salida</label>
              <select className="form-control-calidad" value={idTipoMovimiento} onChange={e => setIdTipoMovimiento(e.target.value)} required>
                <option value="">-- Seleccione un motivo --</option>
                {tiposMovimiento.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group-calidad" style={{ marginBottom: "25px" }}>
            <label>Observaciones / Detalle de la falla o defecto</label>
            <input
              type="text"
              className="form-control-calidad"
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Ej. Devolución automática por productos caducados"
              required
            />
          </div>

          <hr style={{ borderColor: "#e5e7eb", marginBottom: "20px" }} />

          {/* --- ZONA DE LOTES --- */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h4 style={{ margin: 0, fontSize: "16px", color: "#1f2937" }}>Selección de Lotes Dañados o Vencidos</h4>

            {/* BOTÓN MÁGICO */}
            <button type="button" className="btn-cargar-caducados" onClick={cargarLotesCaducadosAutomáticamente}>
              <Clock size={16} /> Cargar Lotes Caducados Automáticamente
              {lotesCaducados.length > 0 && (
                <span style={{ background: "white", color: "#f59e0b", padding: "2px 6px", borderRadius: "10px", fontSize: "11px", marginLeft: "4px" }}>
                  {lotesCaducados.length}
                </span>
              )}
            </button>
          </div>

          <div id="contenedor-filas">
            {filas.map((fila, index) => (
              <div key={fila.idTemp} className="fila-lote-calidad">

                {/* 1. SELECCIONAR PRODUCTO (SIMULADO PARA EFECTOS VISUALES, EN LA REALIDAD SE BUSCARÍA POR NOMBRE/CODIGO) */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "#4b5563", marginBottom: "4px" }}>Producto</label>
                  <select
                    className="form-control-calidad"
                    value={fila.id_producto}
                    onChange={(e) => handleProductoChange(fila.idTemp, e.target.value)}
                    required
                  >
                    <option value="">-- Seleccione Producto --</option>
                    {/* Para este demo usamos los caducados para poblar opciones rápido, 
                                            en un sistema real aquí se listaría todo tu catálogo de `productos` */}
                    {[...new Map(lotesCaducados.map(item => [item.id_producto, item])).values()].map(prod => (
                      <option key={prod.id_producto} value={prod.id_producto}>{prod.nombre_producto}</option>
                    ))}
                  </select>
                </div>

                {/* 2. SELECCIONAR LOTE */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "#4b5563", marginBottom: "4px" }}>Lote Específico a Dar de Baja</label>
                  <select
                    className="form-control-calidad"
                    value={fila.id_detalle_inventario}
                    onChange={(e) => handleLoteChange(fila.idTemp, e.target.value)}
                    required
                    disabled={!fila.id_producto || fila.opcionesLote.length === 0}
                  >
                    <option value="">{fila.id_producto ? "-- Seleccione el lote --" : "-- Seleccione primero un producto --"}</option>
                    {fila.opcionesLote.map(opt => {
                      const fecha = new Date(opt.fecha_expiracion).toLocaleDateString('es-MX');
                      const isVencido = new Date(opt.fecha_expiracion) < new Date();
                      return (
                        <option key={opt.id_detalle_inventario} value={opt.id_detalle_inventario}>
                          Lote: {opt.lote} (Disp: {opt.cantidad_tomada} pz) {isVencido ? `[VENCIDO: ${fecha}]` : `[Vence: ${fecha}]`}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 3. CANTIDAD */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "#4b5563", marginBottom: "4px" }}>Cantidad Mal / Dañada</label>
                  <input
                    type="number"
                    className="form-control-calidad"
                    min="1"
                    max={fila.maxCantidad}
                    value={fila.cantidad}
                    onChange={e => handleCantidadChange(fila.idTemp, e.target.value)}
                    disabled={!fila.id_detalle_inventario}
                    required
                    placeholder="0"
                  />
                </div>

                {/* 4. ELIMINAR FILA */}
                <button type="button" onClick={() => eliminarFila(fila.idTemp)} disabled={filas.length === 1} style={{ background: "none", border: "none", color: filas.length === 1 ? "#d1d5db" : "#ef4444", cursor: "pointer", paddingBottom: "10px" }}>
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <button type="button" className="btn-agregar-lote" onClick={agregarFila}>
            <Plus size={16} /> Agregar otro lote
          </button>

          <hr style={{ borderColor: "#e5e7eb", margin: "25px 0" }} />

          <div style={{ display: "flex", gap: "10px" }}>
            <Button type="submit" variant="danger" disabled={isSubmitting} icon={CheckCircle}>
              {isSubmitting ? "Procesando..." : "Confirmar y Aplicar Salida por Control de Calidad"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => window.history.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}

export default ControlDeCalidad;