import { Pencil, Trash2 } from "lucide-react";

function InventarioRow({ item, onEdit, onDelete }) {

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <tr>
      <td>{item.nombre}</td>
      <td>{item.lote}</td>
      <td>{formatFecha(item.fechaExp)}</td>
      <td>{item.cantidad}</td>
      <td>{item.categoria}</td> {/* Cambiamos Ubicación por Categoría */}
      <td>${item.precio.toFixed(2)}</td> {/* Agregamos Precio */}
      <td>
        <div style={{ display: "flex", gap: "10px" }}>
          <Pencil
            size={18}
            style={{ cursor: "pointer", color: "#6b7280" }}
            onClick={onEdit}
          />
          <Trash2
            size={18}
            style={{ cursor: "pointer", color: "#6b7280" }}
            onClick={onDelete}
          />
        </div>
      </td>
    </tr>
  );
}

export default InventarioRow;