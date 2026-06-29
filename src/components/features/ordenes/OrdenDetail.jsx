import { X } from "lucide-react";

const OrdenDetail = ({ orden, onClose }) => {

  if (!orden) return null;

  const getStatusClass = (estatus) => {
    switch (estatus) {
      case "completado":
        return "status-completado";

      case "enviado":
        return "status-enviado";

      case "cancelado":
        return "status-cancelado";

      default:
        return "";
    }
  };

  const formatFecha = (fecha) => {
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
          {orden.id}
          <span className={`status ${getStatusClass(orden.estatus)}`}>
            {orden.estatus}
          </span>
        </h2>

        <X size={18} onClick={onClose} style={{ cursor: "pointer" }} />
      </div>

      <p className="provider-info">
        {orden.proveedor} • {formatFecha(orden.fecha)}
      </p>

      <h3>Medicamentos</h3>

      {orden.productos?.length > 0 ? (

        orden.productos.map((producto) => (
          <div key={producto.id} className="product-card">

            <div>
              <strong>{producto.nombre}</strong>
              <p>Cantidad: {producto.cantidad}</p>
            </div>

            <div>
              ${(producto.precio * producto.cantidad).toFixed(2)}
            </div>

          </div>
        ))

      ) : (
        <p>No hay productos en esta orden</p>
      )}

      <hr />

      <h3>
        Total: ${orden.total.toLocaleString()}
      </h3>

    </div>
  );
};

export default OrdenDetail;