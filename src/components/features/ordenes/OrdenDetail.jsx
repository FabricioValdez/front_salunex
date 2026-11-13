import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, Truck, AlertTriangle, Wand2, Package, CheckSquare } from "lucide-react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import api from "../../../services/api";
import "./OrdenDetail.css";

// --- COMPONENTE MODAL INTERNO PARA ASIGNAR LOTES ---
const ModalLotes = ({ isOpen, onClose, detalle, envios, setEnvios }) => {
  const [fefoWarning, setFefoWarning] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setFefoWarning("");
    }
  }, [isOpen]);

  if (!isOpen || !detalle) return null;

  const lotesOrdenados = [...(detalle.lotes_disponibles || [])].sort((a, b) =>
    new Date(a.fecha_expiracion) - new Date(b.fecha_expiracion)
  );

  const maxFaltante = parseFloat(detalle.cantidad_pendiente_enviar) || 0;

  const handleInputChange = (idLote, valStr, maxEnLote) => {
    let value = parseFloat(valStr) || 0;
    if (value < 0) value = 0;
    if (value > maxEnLote) value = maxEnLote;

    setEnvios(prev => {
      const loteActual = prev[detalle.id] || {};
      let asignadoAOtros = 0;

      Object.entries(loteActual).forEach(([lID, qty]) => {
        if (lID !== String(idLote)) asignadoAOtros += qty;
      });

      if (asignadoAOtros + value > maxFaltante) {
        value = maxFaltante - asignadoAOtros;
      }

      return {
        ...prev,
        [detalle.id]: {
          ...loteActual,
          [idLote]: value
        }
      };
    });
  };

  const handleAutoFEFO = () => {
    let faltaSurtir = maxFaltante;
    const nuevaAsignacion = {};

    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 60);

    lotesOrdenados.forEach(lote => {
      const fechaLote = new Date(lote.fecha_expiracion);

      if (faltaSurtir > 0 && lote.cantidad > 0 && fechaLote >= fechaLimite) {
        const tomar = Math.min(faltaSurtir, lote.cantidad);
        nuevaAsignacion[lote.id] = tomar;
        faltaSurtir -= tomar;
      }
    });

    if (faltaSurtir > 0) {
      setFefoWarning(`Auto FEFO asignó lo posible. Faltan ${faltaSurtir} pz porque los demás lotes caducan en menos de 60 días.`);
    } else {
      setFefoWarning("");
    }

    setEnvios(prev => ({
      ...prev,
      [detalle.id]: nuevaAsignacion
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Seleccionar Lotes para Surtir">
      <div className="modal-lotes-header">
        <div>
          <h3 className="modal-lotes-title">{detalle.nombre_producto}</h3>
          <p className="modal-lotes-subtitle">Máximo faltante a enviar: {maxFaltante} pz</p>
        </div>
        <button type="button" onClick={handleAutoFEFO} className="btn-auto-fefo">
          <Wand2 size={14} /> Auto FEFO
        </button>
      </div>

      {fefoWarning && (
        <div style={{ background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a", padding: "10px 12px", borderRadius: "8px", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500" }}>
          <AlertTriangle size={16} /> {fefoWarning}
        </div>
      )}

      <table className="modal-lotes-table">
        <thead>
          <tr>
            <th className="text-left">Lote</th>
            <th className="text-left">Expiración</th>
            <th className="text-center">Stock Disp.</th>
            <th className="text-center" style={{ width: "100px" }}>A Enviar</th>
          </tr>
        </thead>
        <tbody>
          {lotesOrdenados.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center" style={{ color: "#ef4444", padding: "20px" }}>
                No hay stock disponible para este producto.
              </td>
            </tr>
          ) : (
            lotesOrdenados.map(lote => {
              const isWarning = lote.lote.includes("-VENC") || lote.lote.includes("-PROX");

              return (
                <tr key={lote.id} className={isWarning ? "lote-warning-row" : ""}>
                  <td className="lote-name">
                    {lote.lote}
                  </td>
                  <td style={{ color: "#64748b" }}>
                    {new Date(lote.fecha_expiracion).toLocaleDateString('es-MX')}
                  </td>
                  <td className="text-center">
                    <strong>{lote.cantidad} pz</strong>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max={Math.min(lote.cantidad, maxFaltante)}
                      value={envios[detalle.id]?.[lote.id] || ""}
                      onChange={(e) => handleInputChange(lote.id, e.target.value, lote.cantidad)}
                      className="lote-input"
                      placeholder="0"
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <div className="modal-footer">
        <Button variant="primary" onClick={onClose}>Confirmar Selección</Button>
      </div>
    </Modal>
  );
};


const OrdenDetail = ({ orden, onClose, onActionSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [envios, setEnvios] = useState({});
  const [recepciones, setRecepciones] = useState({});
  const [detalleActivo, setDetalleActivo] = useState(null);

  if (!orden) return null;

  const estatusNormalizado = orden.estatus?.toLowerCase() || "";
  const esActiva = ["pendiente", "en camino", "incompleta"].includes(estatusNormalizado);

  const esParaSurtir = orden.tipoFlujo === "surtir" && esActiva;
  const esParaRecibir = orden.tipoFlujo === "recibir" && esActiva;
  const soloLectura = !esParaSurtir && !esParaRecibir;

  const totalEnCamino = orden.detalles?.reduce((acc, curr) => acc + (parseFloat(curr.cantidad_en_camino) || 0), 0) || 0;
  const puedeRecibir = esParaRecibir && totalEnCamino > 0;

  const getStatusClass = (estatus) => {
    switch (estatus?.toLowerCase()) {
      case "cerrada": return "status-completado";
      case "en camino": return "status-enviado";
      case "pendiente":
      case "incompleta": return "status-pendiente";
      case "cancelado": return "status-cancelado";
      default: return "";
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  // --- FUNCIÓN PARA AUTO LLENAR RECEPCIÓN ---
  const handleAutoLlenarRecepcion = () => {
    const nuevasRecepciones = {};
    orden.detalles?.forEach((detalle) => {
      const enCamino = parseFloat(detalle.cantidad_en_camino) || 0;
      if (enCamino > 0) {
        nuevasRecepciones[detalle.id] = enCamino; // Asigna lo que viene en camino al input
      }
    });
    setRecepciones(nuevasRecepciones);
  };

  const submitSurtir = async () => {
    const payloadEnvios = Object.entries(envios).map(([idDetalle, lotesObj]) => ({
      id_movimiento_detalle: parseInt(idDetalle),
      lotes: lotesObj
    })).filter(envio => Object.values(envio.lotes).some(q => q > 0));

    if (payloadEnvios.length === 0) {
      setErrorMsg("Debes asignar al menos un lote con cantidad mayor a cero para despachar.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      await api.post("/movimientos/surtir", { envios: payloadEnvios });
      onActionSuccess();
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Ocurrió un error al despachar la orden.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecepcionChange = (idDetalle, valStr, maxEnCamino) => {
    let value = parseFloat(valStr) || 0;
    if (value < 0) value = 0;
    if (value > maxEnCamino) value = maxEnCamino;
    setRecepciones(prev => ({ ...prev, [idDetalle]: value }));
  };

  const submitRecibir = async () => {
    const payloadRecepciones = Object.entries(recepciones).map(([idDetalle, qty]) => ({
      id_movimiento_detalle: parseInt(idDetalle),
      cantidad_a_recibir: qty
    })).filter(rec => rec.cantidad_a_recibir > 0);

    if (payloadRecepciones.length === 0) {
      setErrorMsg("Debes ingresar al menos una cantidad válida para recibir.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      await api.post("/movimientos/recibir", { recepciones: payloadRecepciones });
      onActionSuccess();
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Ocurrió un error al recibir la mercancía.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="orden-detail-container">
      <button className="btn-volver" onClick={onClose}>
        <ArrowLeft size={16} /> Volver al listado de órdenes
      </button>

      <div className="orden-detail-header">
        <div>
          <h2 className="orden-title">
            Orden #{orden.id} <span className={`status orden-status-badge ${getStatusClass(orden.estatus)}`}>{orden.estatus}</span>
          </h2>
          <p className="provider-info">
            <strong>Origen (Surtidor):</strong> {orden.origen} &nbsp;|&nbsp; <strong>Destino (Recibidor):</strong> {orden.destino}
          </p>
        </div>
        <div className="orden-date-info">
          Generada el: {formatFecha(orden.fecha)}
        </div>
      </div>

      {errorMsg && (
        <div className="alert-error">
          <AlertTriangle size={18} /> {errorMsg}
        </div>
      )}

      {/* --- ENCABEZADO DE TABLA CON BOTÓN MÁGICO DE RECEPCIÓN --- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", marginBottom: "15px" }}>
        <h3 className="orden-section-title" style={{ margin: 0 }}>Detalle de Medicamentos</h3>

        {esParaRecibir && (
          <button
            type="button"
            onClick={handleAutoLlenarRecepcion}
            style={{
              background: "#0ea5e9", // Azul distintivo para recepción
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
            }}
          >
            <CheckSquare size={16} /> Recibir Todo (Auto Llenar)
          </button>
        )}
      </div>

      <div className="orden-table-wrapper">
        <table className="orden-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th className="text-center">Solicitado</th>
              {esParaSurtir && <th className="text-center">Ya Enviado</th>}
              {esParaSurtir && <th className="text-center text-warning">Falta Enviar</th>}
              {esParaSurtir && <th className="text-center">Asignación de Lotes</th>}

              {esParaRecibir && <th className="text-center text-info">En Camino</th>}
              {esParaRecibir && <th className="text-center">Ya Recibido</th>}
              {esParaRecibir && <th className="text-center">Cant. a Recibir</th>}

              {soloLectura && <th className="text-center">Enviado</th>}
              {soloLectura && <th className="text-center">Recibido</th>}
            </tr>
          </thead>
          <tbody>
            {orden.detalles?.map((detalle) => {
              const asignadoTotalEnVio = envios[detalle.id] ? Object.values(envios[detalle.id]).reduce((a, b) => a + b, 0) : 0;
              const pendienteNum = parseFloat(detalle.cantidad_pendiente_enviar) || 0;
              const yaEnviado = detalle.cantidad_enviada || "0.00";

              const isCompletado = asignadoTotalEnVio > 0 && asignadoTotalEnVio === pendienteNum;

              return (
                <tr key={detalle.id}>
                  <td>
                    <strong>{detalle.nombre_producto}</strong>
                  </td>
                  <td className="text-center">{detalle.cantidad_solicitada}</td>

                  {/* VISTA DE SURTIDO */}
                  {esParaSurtir && (
                    <>
                      <td className="text-center">{yaEnviado}</td>
                      <td className="text-center text-warning">
                        {detalle.cantidad_pendiente_enviar}
                      </td>
                      <td className="text-center">
                        {pendienteNum === 0 ? (
                          <span className="text-success">
                            <CheckCircle size={14} style={{ verticalAlign: "middle", marginRight: "4px" }} /> Surtido
                          </span>
                        ) : (
                          <div>
                            <button
                              type="button"
                              onClick={() => setDetalleActivo(detalle)}
                              className={`btn-assign-lotes ${isCompletado ? 'btn-assign-lotes-completed' : ''}`}
                            >
                              {isCompletado ? <CheckCircle size={14} /> : <Package size={14} />}
                              {isCompletado ? "Lotes Asignados" : "Asignar Lotes"}
                            </button>

                            <small className={`lotes-status-text ${isCompletado ? 'status-assigned' : (asignadoTotalEnVio > 0 ? 'status-partial' : 'status-pending')}`}>
                              {isCompletado
                                ? `Listo: ${asignadoTotalEnVio} pz`
                                : (asignadoTotalEnVio > 0 ? `Parcial: ${asignadoTotalEnVio} / ${pendienteNum} pz` : "Pendiente de seleccionar")}
                            </small>
                          </div>
                        )}
                      </td>
                    </>
                  )}

                  {/* VISTA DE RECEPCIÓN */}
                  {esParaRecibir && (
                    <>
                      <td className="text-center text-info">{detalle.cantidad_en_camino}</td>
                      <td className="text-center">{detalle.cantidad_recibida}</td>
                      <td>
                        {detalle.cantidad_en_camino > 0 ? (
                          <input
                            type="number"
                            min="0"
                            max={detalle.cantidad_en_camino}
                            value={recepciones[detalle.id] || ""}
                            onChange={(e) => handleRecepcionChange(detalle.id, e.target.value, detalle.cantidad_en_camino)}
                            className="input-recepcion"
                            placeholder="0"
                          />
                        ) : (
                          <span className="status-pending" style={{ display: "block", textAlign: "center" }}>Esperando despacho</span>
                        )}
                      </td>
                    </>
                  )}

                  {/* VISTA SOLO LECTURA */}
                  {soloLectura && (
                    <>
                      <td className="text-center">{detalle.cantidad_enviada}</td>
                      <td className="text-center">{detalle.cantidad_recibida}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ModalLotes
        isOpen={!!detalleActivo}
        onClose={() => setDetalleActivo(null)}
        detalle={detalleActivo}
        envios={envios}
        setEnvios={setEnvios}
      />

      {(esParaSurtir || esParaRecibir) && (
        <div className="actions-footer">
          {esParaSurtir && (
            <button className="primary-btn btn-despachar" onClick={submitSurtir} disabled={loading}>
              <Truck size={18} /> {loading ? "Procesando..." : "Despachar Orden"}
            </button>
          )}

          {puedeRecibir && (
            <button className="primary-btn btn-recibir" onClick={submitRecibir} disabled={loading}>
              <CheckCircle size={18} /> {loading ? "Procesando..." : "Registrar Recepción"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdenDetail;