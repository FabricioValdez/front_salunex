import Table from "../../ui/Table/Table.jsx";

const OrdenList = ({ ordenes, ordenSeleccionada, onSelect }) => {
  // Ajustamos las columnas de la tabla para reflejar el flujo interno
  const columns = [
    "Orden ID",
    "Origen",
    "Destino",
    "Fecha",
    "Estatus"
  ];

  const getStatusClass = (estatus) => {
    switch (estatus?.toLowerCase()) {
      case "cerrada":
        return "status-completado"; // Equivalente a completado
      case "en camino":
        return "status-enviado"; // Azul / En tránsito
      case "pendiente":
      case "incompleta":
        return "status-pendiente"; // Amarillo / Atención requerida
      case "cancelado":
        return "status-cancelado";
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
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="orders-list">
      <Table
        columns={columns}
        data={ordenes}
        renderRow={(orden) => (
          <tr
            key={orden.id}
            className={ordenSeleccionada?.id === orden.id ? "active-row" : ""}
            onClick={() => onSelect(orden)}
            style={{ cursor: "pointer" }}
          >
            <td><strong>#{orden.id}</strong></td>
            <td>{orden.origen}</td>
            <td>{orden.destino}</td>
            <td>{formatFecha(orden.fecha)}</td>
            <td>
              <span className={`status ${getStatusClass(orden.estatus)}`}>
                {orden.estatus}
              </span>
            </td>
          </tr>
        )}
      />
    </div>
  );
};

export default OrdenList;