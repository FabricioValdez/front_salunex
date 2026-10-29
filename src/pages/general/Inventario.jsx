import { useState } from "react";
import { Search, ArrowLeft, List, Plus, Pencil, Trash2, Settings2 } from "lucide-react";
import PageContainer from "../../components/ui/PageContainer";
import DataCard from "../../components/ui/DataCard";
import Table from "../../components/ui/Table/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import InventarioForm from "../../components/features/inventario/InventarioForm";
import UmbralesForm from "../../components/features/inventario/UmbralesForm";
import { useCatalogos } from "../../context/CatalogosContext";
import api from "../../services/api";
import "../../styles/general/Inventario.css";

function getEstado(fecha) {
  if (!fecha) return "Sin fecha";
  const diff = Math.ceil((new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "Expirado";
  if (diff <= 30) return "Por expirar";
  if (diff <= 90) return "Por revisar";
  return "Vigente";
}

function VencimientoBadge({ fecha }) {
  if (!fecha) return <span className="inv-col-texto">Sin fecha</span>;
  const estado = getEstado(fecha);
  const clases = {
    "Expirado": "expirado", "Por expirar": "por-expirar",
    "Por revisar": "por-revisar", "Vigente": "vigente",
  };
  return <span className={`badge-estatus ${clases[estado]}`}>{estado}</span>;
}

function Inventario() {
  const { inventario, refreshCatalogo } = useCatalogos();
  const [search, setSearch] = useState("");

  // Estados de navegación y modales
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [modalUmbralesOpen, setModalUmbralesOpen] = useState(false);
  const [modalLoteOpen, setModalLoteOpen] = useState(false);
  const [loteEdicion, setLoteEdicion] = useState(null); // null = Crear, objeto = Editar

  // 1. Extraemos de forma segura el arreglo, ya sea que venga con el nuevo formato de la API o vacío
  const listaInventario = Array.isArray(inventario) ? inventario : (inventario?.registros || []);

  // 2. Filtramos sobre esa lista extraída
  const filtrados = listaInventario.filter((item) => {
    const termino = search.toLowerCase();
    return (
      item.producto?.toLowerCase().includes(termino) ||
      item.codigo_interno?.toLowerCase().includes(termino) ||
      item.ubicacion_nombre?.toLowerCase().includes(termino)
    );
  });

  const handleGuardarUmbrales = async (data) => {
    try {
      await api.post('/inventario/umbrales', data);
      refreshCatalogo('inventario');
      setModalUmbralesOpen(false);
      // Actualizamos la vista de detalle si está abierta
      if (itemSeleccionado) {
        setItemSeleccionado({ ...itemSeleccionado, ...data });
      }
    } catch (e) {
      console.error("Error guardando umbrales", e);
    }
  };

  const handleGuardarLote = async (data) => {
    try {
      const payload = {
        ...data,
        id_producto: itemSeleccionado.id_producto,
        operacion: loteEdicion ? 'Modificar' : 'Agregar'
      };
      if (loteEdicion) payload.id_detalle = loteEdicion.id_detalle;

      await api.post('/inventario/lote', payload);
      refreshCatalogo('inventario');
      setModalLoteOpen(false);
      // Idealmente aquí deberías hacer un requery del item, pero refreshCatalogo lo hará globalmente
      setItemSeleccionado(null); // Obligamos a recargar la vista para ver los cambios
    } catch (e) {
      console.error("Error guardando lote", e);
    }
  };

  const handleEliminarLote = async (id_detalle) => {
    if (!window.confirm("¿Seguro que deseas eliminar este lote?")) return;
    try {
      await api.post('/inventario/lote', { operacion: 'Eliminar', id_detalle });
      refreshCatalogo('inventario');
      setItemSeleccionado(null);
    } catch (e) {
      console.error("Error eliminando lote", e);
    }
  };

  // ==========================================
  // VISTA DE DETALLE DE LOTES
  // ==========================================
  if (itemSeleccionado) {
    return (
      <PageContainer>
        <div className="inventario-detalle-container">

          <button className="inv-btn-volver" onClick={() => setItemSeleccionado(null)}>
            <ArrowLeft size={16} /> Volver al inventario general
          </button>

          <div className="inventario-detalle-header">
            <div className="inventario-detalle-title">
              <h2>Desglose de Lotes: <strong>{itemSeleccionado.producto}</strong></h2>
              <p><strong>Ubicación:</strong> {itemSeleccionado.ubicacion_nombre} | <strong>Código:</strong> {itemSeleccionado.codigo_interno}</p>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <Button variant="secondary" icon={Settings2} onClick={() => setModalUmbralesOpen(true)}>
                Configurar Umbrales
              </Button>
              {/* <Button variant="primary" icon={Plus} onClick={() => { setLoteEdicion(null); setModalLoteOpen(true); }}>
                Agregar Lote Manual
              </Button> */}
            </div>
          </div>

          <DataCard>
            <Table
              columns={["Lote", "Cantidad", "Fecha de Expiración", "Estado", "Acciones"]}
              data={itemSeleccionado.lotes || []}
              renderRow={(lote) => (
                <tr key={lote.id_detalle}>
                  <td><code style={{ color: "#4f46e5", background: "#e0e7ff", padding: "2px 6px", borderRadius: "4px" }}>{lote.lote}</code></td>
                  <td className="inv-col-bold">{lote.cantidad} pz</td>
                  <td>
                    {lote.fecha_expiracion
                      ? new Date(lote.fecha_expiracion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
                      : "—"}
                  </td>
                  <td><VencimientoBadge fecha={lote.fecha_expiracion} /></td>
                  <td>
                    <div className="inv-action-icons">
                      {/* <button className="inv-icon-btn inv-icon-edit" title="Editar Lote" onClick={() => { setLoteEdicion(lote); setModalLoteOpen(true); }}>
                        <Pencil size={18} />
                      </button> */}
                      <button className="inv-icon-btn inv-icon-delete" title="Eliminar Lote" onClick={() => handleEliminarLote(lote.id_detalle)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            />
            {(!itemSeleccionado.lotes || itemSeleccionado.lotes.length === 0) && (
              <div className="inv-empty-state">No hay lotes con stock disponible para este producto.</div>
            )}
          </DataCard>
        </div>

        {/* Modales Inyectados en el Detalle */}
        <Modal isOpen={modalUmbralesOpen} onClose={() => setModalUmbralesOpen(false)} title="Configurar Umbrales de Stock">
          <UmbralesForm item={itemSeleccionado} onSubmit={handleGuardarUmbrales} onCancel={() => setModalUmbralesOpen(false)} />
        </Modal>

        <Modal isOpen={modalLoteOpen} onClose={() => setModalLoteOpen(false)} title={loteEdicion ? "Modificar Lote" : "Nuevo Lote de Ingreso"}>
          <InventarioForm initialData={loteEdicion} itemPadre={itemSeleccionado} onSubmit={handleGuardarLote} onCancel={() => setModalLoteOpen(false)} />
        </Modal>

      </PageContainer>
    );
  }

  // ==========================================
  // VISTA PRINCIPAL (MAESTRO)
  // ==========================================
  return (
    <PageContainer>
      <div className="inventario-header">
        <h1>Inventario general por producto</h1>
        <p>Gestione las existencias globales agrupadas por sucursal y producto.</p>
      </div>

      <div className="inventario-controls">
        <div className="inventario-search-wrapper">
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Buscar por producto, código o almacén..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 35px 10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", fontSize: "14px" }}
            />
            <Search size={18} style={{ position: "absolute", right: "12px", top: "11px", color: "#9ca3af" }} />
          </div>
        </div>
      </div>

      <DataCard>
        <Table
          columns={["Ubicación", "Producto", "Código Interno", "Stock Actual", "Estado de Stock", "Acciones"]}
          data={filtrados}
          renderRow={(item) => {
            const badgeColors = { "NORMAL": "inv-badge-normal", "MEDIO": "inv-badge-medio", "BAJO": "inv-badge-bajo" };
            const stockClass = badgeColors[item.estado_stock] || badgeColors["NORMAL"];
            return (
              <tr key={`${item.id_producto}-${item.id_ubicacion}`}>
                <td className="inv-col-texto">{item.ubicacion_nombre}</td>
                <td className="inv-col-bold">{item.producto}</td>
                <td className="inv-col-texto">{item.codigo_interno}</td>
                <td>
                  <span className={`inv-badge-stock ${stockClass}`}>
                    {item.stock_total} pz
                  </span>
                </td>
                <td>
                  <span className={`inv-badge-stock ${stockClass}`} style={{ display: "block", marginBottom: "4px" }}>
                    {item.estado_stock}
                  </span>
                  <small className="inv-col-texto" style={{ fontSize: "11px", display: "block", textAlign: "center" }}>
                    (Mín: {item.stock_minimo} | Deseado: {item.stock_deseado})
                  </small>
                </td>
                <td>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button className="inv-btn-lotes" onClick={() => setItemSeleccionado(item)}>
                      <List size={14} /> Ver Lotes / Configurar
                    </button>
                  </div>
                </td>
              </tr>
            );
          }}
        />
      </DataCard>
    </PageContainer>
  );
}

export default Inventario;