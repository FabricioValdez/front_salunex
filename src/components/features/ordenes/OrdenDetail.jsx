import { X } from "lucide-react";

const OrdenDetail = ({ orden, onClose, onActionSuccess }) => {
  if (!orden) return null;

  const getStatusClass = (estatus) => {
    switch (estatus?.toLowerCase()) {
      case "cerrada":
        return "status-completado";
      case "en camino":
        return "status-enviado";
      case "pendiente":
      case "incompleta":
        return "status-pendiente";
      default:
        return "";
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="order-detail">
      <div className="detail-header">
        <h2>
          Orden #{orden.id}
          <span className={`status ${getStatusClass(orden.estatus)}`}>
            {orden.estatus}
          </span>
        </h2>
        <X size={18} onClick={onClose} style={{ cursor: "pointer" }} />
      </div>

      <p className="provider-info" style={{ marginBottom: "15px" }}>
        <strong>De:</strong> {orden.origen} <br />
        <strong>Hacia:</strong> {orden.destino} <br />
        <small className="text-muted">Fecha: {formatFecha(orden.fecha)}</small>
      </p>

      <h3>Medicamentos y Control de Cantidades</h3>

      {orden.detalles?.length > 0 ? (
        orden.detalles.map((detalle) => (
          <div key={detalle.id} className="product-card" style={{ padding: "12px", marginBottom: "10px", border: "1px solid #eee" }}>
            <div style={{ flex: 1 }}>
              <strong>{detalle.nombre_producto}</strong>
              <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                <span>Solicitados: <strong>{detalle.cantidad_solicitada}</strong></span> |{" "}
                <span className="text-info">En Camino: <strong>{detalle.cantidad_en_camino}</strong></span> |{" "}
                <span className="text-success">Recibidos: <strong>{detalle.cantidad_recibida}</strong></span>
              </div>
            </div>

            <div style={{ textAlign: "right", minWidth: "100px" }}>
              {detalle.cantidad_pendiente_enviar > 0 && (
                <div style={{ fontSize: "11px", color: "#f8ac59" }}>
                  Falta enviar: {detalle.cantidad_pendiente_enviar}
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <p>No hay productos registrados en este movimiento.</p>
      )}
    </div>
  );
};

export default OrdenDetail;