import { X } from "lucide-react";

const OrdenDetail = ({ orden, onClose }) => {
    if (!orden) return null;
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

            <p>{orden.proveedor} • {orden.fecha}</p>

            <p>Total: ${orden.total.toLocaleString()}</p>
        </div>
    );
};

export default OrdenDetail;