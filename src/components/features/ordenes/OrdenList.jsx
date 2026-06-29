import Table from "../../ui/Table/Table.jsx";

const OrdenList = ({ ordenes, ordenSeleccionada, onSelect }) => {

  const columns = [
    "Orden ID",
    "Proveedor",
    "Fecha",
    "Estatus"
  ];

  const getStatusClass = (estatus) => {
    switch (estatus) {
      case "completado":
        return "status-completado";

      case "enviado":
      case "pendiente":
        return "status-pendiente";

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
    <div className="orders-list">

      <Table
        columns={columns}
        data={ordenes}
        renderRow={(orden) => (

          <tr
            key={orden.id}
            className={
              ordenSeleccionada?.id === orden.id
                ? "active-row"
                : ""
            }
            onClick={() => onSelect(orden)}
            style={{ cursor: "pointer" }}
          >

            <td>{orden.id}</td>

            <td>{orden.proveedor}</td>

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