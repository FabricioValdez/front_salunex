import { useState } from "react";
import { ArrowLeft, CheckCircle, Truck, AlertTriangle } from "lucide-react";
import api from "../../../services/api";

const OrdenDetail = ({ orden, onClose, onActionSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Estados para capturar la interacción del usuario
  // envios: { [id_movimiento_detalle]: { [id_lote]: cantidad_a_enviar } }
  const [envios, setEnvios] = useState({});
  // recepciones: { [id_movimiento_detalle]: cantidad_a_recibir }
  const [recepciones, setRecepciones] = useState({});

  if (!orden) return null;

  // Variables de control de flujo
  const estatusNormalizado = orden.estatus?.toLowerCase() || "";
  const esActiva = ["pendiente", "en camino", "incompleta"].includes(estatusNormalizado);

  const esParaSurtir = orden.tipoFlujo === "surtir" && esActiva;
  const esParaRecibir = orden.tipoFlujo === "recibir" && esActiva;
  const soloLectura = !esParaSurtir && !esParaRecibir;

  // Calculamos si realmente hay mercancía en tránsito para habilitar la recepción
  const totalEnCamino = orden.detalles?.reduce((acc, curr) => acc + (parseFloat(curr.cantidad_en_camino) || 0), 0) || 0;

  // Nueva variable para proteger el botón
  const puedeRecibir = esParaRecibir && totalEnCamino > 0;

  // Helpers visuales
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

  // --- LÓGICA PARA SURTIR (CON LOTES) ---
  const handleLoteChange = (idDetalle, idLote, valStr, maxFaltante, maxEnLote) => {
    let value = parseFloat(valStr) || 0;
    if (value < 0) value = 0;
    if (value > maxEnLote) value = maxEnLote; // No sacar más de lo que tiene el lote físico

    setEnvios(prev => {
      const loteActual = prev[idDetalle] || {};

      // Calcular cuánto ya se asignó a otros lotes de este mismo producto
      let asignadoAOtros = 0;
      Object.entries(loteActual).forEach(([lID, qty]) => {
        if (lID !== String(idLote)) asignadoAOtros += qty;
      });

      // Bloqueo: No permitir enviar más del total solicitado por la farmacia
      if (asignadoAOtros + value > maxFaltante) {
        value = maxFaltante - asignadoAOtros;
      }

      return {
        ...prev,
        [idDetalle]: {
          ...loteActual,
          [idLote]: value
        }
      };
    });
  };

  const submitSurtir = async () => {
    // Transformamos el objeto de estado al payload que espera Laravel
    const payloadEnvios = Object.entries(envios).map(([idDetalle, lotesObj]) => ({
      id_movimiento_detalle: parseInt(idDetalle),
      lotes: lotesObj
    })).filter(envio => Object.values(envio.lotes).some(q => q > 0)); // Solo mandar si hay cantidades > 0

    if (payloadEnvios.length === 0) {
      setErrorMsg("Debes asignar al menos un lote con cantidad mayor a cero para despachar.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      // Hacemos POST a la ruta de surtir (ajusta si tu ruta backend usa un prefijo distinto)
      await api.post("/movimientos/surtir", { envios: payloadEnvios });
      onActionSuccess();
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Ocurrió un error al despachar la orden.");
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA PARA RECIBIR ---
  const handleRecepcionChange = (idDetalle, valStr, maxEnCamino) => {
    let value = parseFloat(valStr) || 0;
    if (value < 0) value = 0;
    if (value > maxEnCamino) value = maxEnCamino; // No puede recibir más de lo que viene en camino

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
    <div style={{ padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
      {/* Botón de Regreso para la pantalla completa */}
      <button className="btn-volver" onClick={onClose}>
        <ArrowLeft size={16} /> Volver al listado de órdenes
      </button>

      <div className="detail-header" style={{ marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
        <div>
          <h2 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>
            Orden #{orden.id} <span className={`status ${getStatusClass(orden.estatus)}`} style={{ fontSize: "14px", verticalAlign: "middle", marginLeft: "10px" }}>{orden.estatus}</span>
          </h2>
          <p className="provider-info" style={{ margin: 0 }}>
            <strong>Origen (Surtidor):</strong> {orden.origen} &nbsp;|&nbsp; <strong>Destino (Recibidor):</strong> {orden.destino}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <small className="text-muted">Generada el: {formatFecha(orden.fecha)}</small>
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px", borderRadius: "8px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <AlertTriangle size={18} /> {errorMsg}
        </div>
      )}

      <h3 style={{ fontSize: "18px", marginBottom: "15px" }}>Detalle de Medicamentos</h3>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
            <tr>
              <th style={{ padding: "12px" }}>Producto</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Solicitado</th>

              {esParaSurtir && <th style={{ padding: "12px", textAlign: "center" }}>Falta Enviar</th>}
              {esParaSurtir && <th style={{ padding: "12px", width: "40%" }}>Despacho por Lotes</th>}

              {esParaRecibir && <th style={{ padding: "12px", textAlign: "center", color: "#3b82f6" }}>En Camino</th>}
              {esParaRecibir && <th style={{ padding: "12px", textAlign: "center" }}>Ya Recibido</th>}
              {esParaRecibir && <th style={{ padding: "12px", width: "20%" }}>Cant. a Recibir</th>}

              {soloLectura && <th style={{ padding: "12px", textAlign: "center" }}>Enviado</th>}
              {soloLectura && <th style={{ padding: "12px", textAlign: "center" }}>Recibido</th>}
            </tr>
          </thead>
          <tbody>
            {orden.detalles?.map((detalle) => {
              // Cálculos reactivos para la UI
              const asignadoTotalEnVio = envios[detalle.id] ? Object.values(envios[detalle.id]).reduce((a, b) => a + b, 0) : 0;
              const faltaAsignar = detalle.cantidad_pendiente_enviar - asignadoTotalEnVio;

              return (
                <tr key={detalle.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "15px 12px" }}>
                    <strong>{detalle.nombre_producto}</strong>
                  </td>
                  <td style={{ padding: "15px 12px", textAlign: "center" }}>{detalle.cantidad_solicitada}</td>

                  {/* VISTA DE SURTIDO (ALMACÉN ORIGEN) */}
                  {esParaSurtir && (
                    <>
                      <td style={{ padding: "15px 12px", textAlign: "center", color: "#f59e0b", fontWeight: "bold" }}>
                        {detalle.cantidad_pendiente_enviar}
                      </td>
                      <td style={{ padding: "15px 12px" }}>
                        {detalle.cantidad_pendiente_enviar === 0 ? (
                          <span style={{ color: "#10b981", fontSize: "13px" }}><CheckCircle size={14} style={{ verticalAlign: "middle" }} /> Surtido completo</span>
                        ) : (
                          <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            {detalle.lotes_disponibles?.length > 0 ? (
                              <table style={{ width: "100%", fontSize: "13px" }}>
                                <tbody>
                                  {detalle.lotes_disponibles.map(lote => (
                                    <tr key={lote.id}>
                                      <td style={{ paddingBottom: "5px" }}>
                                        <code>{lote.lote}</code><br />
                                        <small className="text-muted">Cad: {new Date(lote.fecha_expiracion).toLocaleDateString()}</small>
                                      </td>
                                      <td style={{ paddingBottom: "5px", textAlign: "right", paddingRight: "10px" }}>
                                        Disp: {lote.cantidad}
                                      </td>
                                      <td style={{ paddingBottom: "5px", width: "80px" }}>
                                        <input
                                          type="number"
                                          min="0"
                                          max={Math.min(lote.cantidad, detalle.cantidad_pendiente_enviar)}
                                          value={envios[detalle.id]?.[lote.id] || ""}
                                          onChange={(e) => handleLoteChange(detalle.id, lote.id, e.target.value, detalle.cantidad_pendiente_enviar, lote.cantidad)}
                                          style={{ width: "100%", padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                                          placeholder="0"
                                        />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <span style={{ color: "#ef4444", fontSize: "12px" }}>Sin stock físico disponible</span>
                            )}

                            {/* Resumen dinámico de la asignación */}
                            <div style={{ marginTop: "10px", fontSize: "12px", display: "flex", justifyContent: "space-between", color: faltaAsignar === 0 ? "#10b981" : "#64748b" }}>
                              <span>Total asignado: <strong>{asignadoTotalEnVio}</strong></span>
                              {faltaAsignar > 0 && <span>Falta: {faltaAsignar}</span>}
                            </div>
                          </div>
                        )}
                      </td>
                    </>
                  )}

                  {/* VISTA DE RECEPCIÓN (FARMACIA DESTINO) */}
                  {esParaRecibir && (
                    <>
                      <td style={{ padding: "15px 12px", textAlign: "center", color: "#3b82f6", fontWeight: "bold" }}>
                        {detalle.cantidad_en_camino}
                      </td>
                      <td style={{ padding: "15px 12px", textAlign: "center" }}>{detalle.cantidad_recibida}</td>
                      <td style={{ padding: "15px 12px" }}>
                        {detalle.cantidad_en_camino > 0 ? (
                          <input
                            type="number"
                            min="0"
                            max={detalle.cantidad_en_camino}
                            value={recepciones[detalle.id] || ""}
                            onChange={(e) => handleRecepcionChange(detalle.id, e.target.value, detalle.cantidad_en_camino)}
                            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                            placeholder="Piezas OK"
                          />
                        ) : (
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>Esperando despacho</span>
                        )}
                      </td>
                    </>
                  )}

                  {/* VISTA DE SOLO LECTURA (ÓRDENES CERRADAS O CANCELADAS) */}
                  {soloLectura && (
                    <>
                      <td style={{ padding: "15px 12px", textAlign: "center" }}>{detalle.cantidad_enviada}</td>
                      <td style={{ padding: "15px 12px", textAlign: "center" }}>{detalle.cantidad_recibida}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* BOTONES DE ACCIÓN FLOTANTES */}
      {(esParaSurtir || esParaRecibir) && (
        <div style={{ marginTop: "25px", display: "flex", justifyContent: "flex-end", gap: "15px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
          <button className="secondary-btn" onClick={onClose} disabled={loading}>
            Cancelar
          </button>

          {esParaSurtir && (
            <button className="primary-btn" onClick={submitSurtir} disabled={loading} style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f59e0b" }}>
              <Truck size={16} /> {loading ? "Procesando..." : "Despachar Lotes Asignados"}
            </button>
          )}

          {/* Aquí cambiamos esParaRecibir por puedeRecibir */}
          {puedeRecibir && (
            <button className="primary-btn" onClick={submitRecibir} disabled={loading} style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#3b82f6" }}>
              <CheckCircle size={16} /> {loading ? "Procesando..." : "Registrar Recepción"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdenDetail;