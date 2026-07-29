import { useState } from "react";
import { Search, ArrowLeft, List, Plus, Pencil, Trash2, Calendar } from "lucide-react";
import PageContainer from "../../components/ui/PageContainer";
import DataCard from "../../components/ui/DataCard";
import Table from "../../components/ui/Table/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { useCatalogos } from "../../context/CatalogosContext";
import "../../styles/general/Inventario.css";

// Badge para la fecha de expiración en la vista de detalle
function getEstado(fecha) {
  if (!fecha) return "Sin fecha";
  const diff = Math.ceil((new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "Expirado";
  if (diff <= 30) return "Por expirar";
  if (diff <= 90) return "Por revisar";
  return "Vigente";
}

function VencimientoBadge({ fecha }) {
  if (!fecha) return <span style={{ color: "#9ca3af" }}>Sin fecha</span>;
  const estado = getEstado(fecha);
  const clases = {
    "Expirado": "expirado",
    "Por expirar": "por-expirar",
    "Por revisar": "por-revisar",
    "Vigente": "vigente",
  };
  return <span className={`badge-estatus ${clases[estado] || ""}`}>{estado}</span>;
}

function Inventario() {
  const { inventario } = useCatalogos();
  const [search, setSearch] = useState("");
  
  // Estado para controlar la vista de detalle
  const [itemSeleccionado, setItemSeleccionado] = useState(null);

  // Filtrado de la vista principal (Maestro)
  const filtrados = inventario.filter((item) => {
    const termino = search.toLowerCase();
    return (
      item.producto?.toLowerCase().includes(termino) ||
      item.codigo_interno?.toLowerCase().includes(termino) ||
      item.ubicacion_nombre?.toLowerCase().includes(termino)
    );
  });

  // ==========================================
  // VISTA DE DETALLE DE LOTES (Pantalla Completa)
  // ==========================================
  if (itemSeleccionado) {
    return (
      <PageContainer>
        <div style={{ padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
          
          <button className="btn-volver" onClick={() => setItemSeleccionado(null)} style={{ background: "none", border: "none", color: "#6b7280", display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", marginBottom: "20px", fontWeight: 500 }}>
            <ArrowLeft size={16} /> Volver al inventario general
          </button>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "15px", borderBottom: "1px solid #eee" }}>
            <div>
              <h2 style={{ margin: "0 0 5px 0", fontSize: "22px" }}>
                Desglose de Lotes para: <strong>{itemSeleccionado.producto}</strong>
              </h2>
              <p style={{ color: "#6b7280", margin: 0 }}>
                <strong>Ubicación:</strong> {itemSeleccionado.ubicacion_nombre} [{itemSeleccionado.ubicacion_tipo}]
              </p>
            </div>
            <button className="primary-btn" style={{ background: "#3b82f6", color: "white", border: "none", padding: "8px 15px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
              <Plus size={16} /> Agregar Lote Manual
            </button>
          </div>

          <DataCard>
            <Table
              columns={["ID Lote", "Número de Lote", "Cantidad", "Fecha de Expiración", "Estado", "Acciones"]}
              data={itemSeleccionado.lotes || []}
              renderRow={(lote) => (
                <tr key={lote.id_detalle}>
                  <td style={{ color: "#6b7280" }}>{lote.id_detalle}</td>
                  <td><code>{lote.lote}</code></td>
                  <td><strong>{lote.cantidad} pz</strong></td>
                  <td>
                    {lote.fecha_expiracion
                      ? new Date(lote.fecha_expiracion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
                      : "—"}
                  </td>
                  <td><VencimientoBadge fecha={lote.fecha_expiracion} /></td>
                  <td>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button style={{ background: "none", border: "none", color: "#f59e0b", cursor: "pointer" }} title="Editar Lote">
                        <Pencil size={18} />
                      </button>
                      <button style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }} title="Eliminar Lote">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            />
            {(!itemSeleccionado.lotes || itemSeleccionado.lotes.length === 0) && (
              <div style={{ textAlign: "center", padding: "30px", color: "#9ca3af" }}>
                No hay lotes con stock disponible para este producto.
              </div>
            )}
          </DataCard>
        </div>
      </PageContainer>
    );
  }

  // ==========================================
  // VISTA PRINCIPAL (MAESTRO)
  // ==========================================
  return (
    <PageContainer>
      <div className="dashboard-title">
        <h1>Inventario general por producto</h1>
        <p>Gestione las existencias globales agrupadas por sucursal y producto.</p>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
        <div className="search-box" style={{ flex: "1", position: "relative" }}>
          <input 
            type="text" 
            placeholder="Buscar por producto, código o almacén..."
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            style={{ width: "100%", padding: "10px 35px 10px 12px", borderRadius: "8px", border: "1px solid #ddd" }}
          />
          <Search size={18} style={{ position: "absolute", right: "12px", top: "12px", color: "#6b7280" }} />
        </div>
      </div>

      <DataCard>
        <Table
          columns={["Ubicación", "Producto", "Código interno", "Categoría", "Stock Total", "Acciones"]}
          data={filtrados}
          renderRow={(item) => (
            <tr key={item.id}>
              <td>{item.ubicacion_nombre}</td>
              <td><strong>{item.producto}</strong></td>
              <td style={{ color: "#6b7280" }}>{item.codigo_interno}</td>
              <td><span style={{ background: "#f3f4f6", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", color: "#4b5563" }}>{item.categoria}</span></td>
              <td>
                <span style={{ background: "#d1f7e0", color: "#0f9d58", padding: "4px 10px", borderRadius: "12px", fontWeight: "bold", fontSize: "13px" }}>
                  {item.stock_total} pz
                </span>
              </td>
              <td>
                <button 
                  onClick={() => setItemSeleccionado(item)}
                  style={{ background: "#0ea5e9", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}
                >
                  <List size={14} /> Ver Lotes / Desglose
                </button>
              </td>
            </tr>
          )}
        />
      </DataCard>
    </PageContainer>
  );
}

export default Inventario;