import { useState } from "react";
import { CheckCircle, RotateCcw } from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import Table from "../components/ui/Table/Table";
import SummaryCard from "../components/ui/SummaryCard";
import { useCatalogos } from "../context/CatalogosContext";
import { AlertCircle, Clock, DollarSign } from "lucide-react";
import api from "../services/api";
import "../styles/almacen/ControlCalidad.css";

function EstadoBadge({ estado }) {
  const clase = {
    "Expirado": "expirado",
    "Por expirar": "por-expirar",
    "Por revisar": "por-revisar",
  }[estado] || "";
  return <span className={`badge-estatus ${clase}`}>{estado}</span>;
}

function getEstado(fecha) {
  if (!fecha) return null;
  const diff = Math.ceil((new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "Expirado";
  if (diff <= 30) return "Por expirar";
  if (diff <= 90) return "Por revisar";
  return null;
}

function ControlDeCalidad() {
  const { inventario, refreshCatalogo } = useCatalogos();
  const [seleccionado, setSeleccionado] = useState(null);
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);

  const pendientes = inventario.filter((item) => getEstado(item.fecha_expiracion) === "Por expirar" || getEstado(item.fecha_expiracion) === "Expirado");
  const expirados = inventario.filter((item) => getEstado(item.fecha_expiracion) === "Expirado");
  const porExpirar = inventario.filter((item) => getEstado(item.fecha_expiracion) === "Por expirar");
  const porRevisar = inventario.filter((item) => getEstado(item.fecha_expiracion) === "Por revisar");

  const handleSeleccionar = (item) => {
    setSeleccionado(item);
    setNotas("");
  };

  const handleAprobar = async () => {
    if (!seleccionado) return;
    setLoading(true);
    try {
      await api.put(`/inventario/${seleccionado.id}`, {
        id_producto: seleccionado.id_producto,
        id_almacen: seleccionado.id_almacen,
        id_farmacia: seleccionado.id_farmacia,
        cantidad: seleccionado.cantidad,
        lote: seleccionado.lote,
        fecha_expiracion: null,
      });
      refreshCatalogo('inventario', inventario.map((i) =>
        i.id === seleccionado.id ? { ...i, fecha_expiracion: null } : i
      ));
      setSeleccionado(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDevolucion = async () => {
    if (!seleccionado) return;
    setLoading(true);
    try {
      await api.delete(`/inventario/${seleccionado.id}`);
      refreshCatalogo('inventario', inventario.filter((i) => i.id !== seleccionado.id));
      setSeleccionado(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="dashboard-title">
        <h1>Control de calidad y caducidad</h1>
        <p>Revisar los lotes marcados, gestionar la fecha de vencimiento e inspeccionar el estado del empaque.</p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="summary-cards">
        <SummaryCard
          title="Expirados"
          value={`${expirados.length} artículos`}
          icon={<AlertCircle size={26} />}
          variant="red"
        />
        <SummaryCard
          title="Por expirar"
          value={`${porExpirar.length} artículos`}
          icon={<Clock size={26} />}
          variant="yellow"
        />
        <SummaryCard
          title="Por revisar"
          value={`${porRevisar.length} artículos`}
          icon={<DollarSign size={26} />}
          variant="blue"
        />
      </div>

      <div className="control-layout">
        {/* ── Panel izquierdo ── */}
        <div className="panel-lista" style={{ flex: "0 0 45%" }}>
          <div className="control-lista-header">
            <h3>Artículos pendientes de revisión</h3>
          </div>
          <Table
            columns={[]}
            data={pendientes}
            renderRow={(item) => {
              const estado = getEstado(item.fecha_expiracion);
              return (
                <tr key={item.id}
                  onClick={() => handleSeleccionar(item)}
                  style={{
                    cursor: "pointer",
                    background: seleccionado?.id === item.id ? "#eff6ff" : "white",
                    borderLeft: seleccionado?.id === item.id ? "3px solid #3b82f6" : "3px solid transparent",
                  }}>
                  <td>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.producto}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{item.lote} — {item.farmacia}</p>
                      </div>
                      <EstadoBadge estado={estado} />
                    </div>
                  </td>
                </tr>
              );
            }}
          />
        </div>

        {/* ── Panel derecho ── */}
        {!seleccionado ? (
          <div className="panel-vacio" style={{ flex: 1 }}>
            <p>Selecciona un artículo para ver el detalle</p>
          </div>
        ) : (
          <div className="control-detalle">
            <div className="control-detalle-header">
              <h3>Detalle de inspección</h3>
              <span className="control-detalle-sub">Revisando Lote #{seleccionado.lote}</span>
            </div>

            <div className="control-grid">
              <div className="control-grid-item">
                <p>Nombre del medicamento</p>
                <strong>{seleccionado.producto}</strong>
              </div>
              <div className="control-grid-item">
                <p>Número de lote</p>
                <strong>{seleccionado.lote}</strong>
              </div>
              <div className="control-grid-item">
                <p>Fecha de expiración</p>
                <strong>
                  {seleccionado.fecha_expiracion
                    ? new Date(seleccionado.fecha_expiracion).toLocaleDateString('es-MX', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })
                    : "—"}
                </strong>
              </div>
              <div className="control-grid-item">
                <p>Cantidad</p>
                <strong>{seleccionado.cantidad} Unidades</strong>
              </div>
              <div className="control-grid-item">
                <p>Almacén</p>
                <strong>{seleccionado.almacen}</strong>
              </div>
              <div className="control-grid-item">
                <p>Farmacia</p>
                <strong>{seleccionado.farmacia}</strong>
              </div>
              <div className="control-grid-item">
                <p>Categoría</p>
                <strong>{seleccionado.categoria}</strong>
              </div>
            </div>

            <p className="control-notas-label">Notas de inspección</p>
            <textarea className="form-control" rows={4} value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ingresa hallazgos, estado físico del embalaje o resultados de verificación..." />

            <div className="control-acciones">
              <button className="control-btn-aprobar"
                onClick={handleAprobar} disabled={loading}>
                <CheckCircle size={16} />
                Aprobar inventario
              </button>
              <button className="control-btn-devolucion"
                onClick={handleDevolucion} disabled={loading}>
                <RotateCcw size={16} />
                Marcar para devolución
              </button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

export default ControlDeCalidad;