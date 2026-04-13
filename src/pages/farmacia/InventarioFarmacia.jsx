import { useState } from "react";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import PageContainer from "../../components/ui/PageContainer";
import DataCard from "../../components/ui/DataCard";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { useCatalogos } from "../../context/CatalogosContext";
import api from "../../services/api";

// ── Badge de estado de vencimiento ──
function VencimientoBadge({ fecha }) {
    if (!fecha) return <span style={{ color: "#9ca3af" }}>Sin fecha</span>;

    const hoy = new Date();
    const expira = new Date(fecha);
    const diff = Math.ceil((expira - hoy) / (1000 * 60 * 60 * 24));

    if (diff < 0) return (
        <span style={{ background: "#fef2f2", color: "#ef4444", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
            Expirado
        </span>
    );
    if (diff <= 30) return (
        <span style={{ background: "#fffbeb", color: "#f59e0b", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
            Vence en {diff} días
        </span>
    );
    if (diff <= 90) return (
        <span style={{ background: "#eff6ff", color: "#3b82f6", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
            Por revisar
        </span>
    );
    return (
        <span style={{ background: "#f0fdf4", color: "#22c55e", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
            Vigente
        </span>
    );
}

// ── Formulario ──
function InventarioForm({ form, setForm, productos, almacenes, onSubmit, onClose, loading, error }) {
    return (
        <>
            {error && <div className="alert alert-danger py-2 text-center mb-3">{error}</div>}

            <div className="mb-3">
                <label className="form-label">Producto</label>
                <select
                    className="form-select"
                    value={form.id_producto}
                    onChange={(e) => setForm({ ...form, id_producto: e.target.value })}
                >
                    <option value="">Selecciona un producto</option>
                    {productos.map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Almacén</label>
                <select
                    className="form-select"
                    value={form.id_almacen}
                    onChange={(e) => setForm({ ...form, id_almacen: e.target.value })}
                >
                    <option value="">Selecciona un almacén</option>
                    {almacenes.map((a) => (
                        <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Lote</label>
                <input
                    type="text"
                    className="form-control"
                    value={form.lote}
                    onChange={(e) => setForm({ ...form, lote: e.target.value })}
                    placeholder="Ej. LOTE001"
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Cantidad</label>
                <input
                    type="number"
                    className="form-control"
                    value={form.cantidad}
                    onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                    placeholder="0"
                />
            </div>

            <div className="mb-4">
                <label className="form-label">Fecha de expiración</label>
                <input
                    type="date"
                    className="form-control"
                    value={form.fecha_expiracion}
                    onChange={(e) => setForm({ ...form, fecha_expiracion: e.target.value })}
                />
            </div>

            <div className="d-flex gap-2 justify-content-end">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button variant="primary" onClick={onSubmit} disabled={loading}>
                    {loading ? "Guardando..." : "Guardar"}
                </Button>
            </div>
        </>
    );
}

// ── Modal eliminar ──
function DeleteModal({ isOpen, onClose, onConfirm, loading, item }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Eliminar registro">
            <p style={{ color: "#4b5563", marginBottom: 20 }}>
                ¿Estás seguro de eliminar el registro de <strong>{item?.producto}</strong> con lote <strong>{item?.lote}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="d-flex gap-2 justify-content-end">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button variant="danger" onClick={onConfirm} disabled={loading}>
                    {loading ? "Eliminando..." : "Eliminar"}
                </Button>
            </div>
        </Modal>
    );
}

const formVacio = {
    id_producto: "",
    id_almacen: "",
    lote: "",
    cantidad: "",
    fecha_expiracion: "",
};

// ── Filtros ──
const FILTROS = ["Todos", "Vigente", "Por revisar", "Por expirar", "Expirado"];

function getEstado(fecha) {
    if (!fecha) return "Sin fecha";
    const diff = Math.ceil((new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Expirado";
    if (diff <= 30) return "Por expirar";
    if (diff <= 90) return "Por revisar";
    return "Vigente";
}

function InventarioFarmacia() {
    const { inventario, productos, almacenes, refreshCatalogo } = useCatalogos();

    const [search, setSearch] = useState("");
    const [filtro, setFiltro] = useState("Todos");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(formVacio);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const filtrados = inventario.filter((item) => {
        const coincideBusqueda =
            item.producto?.toLowerCase().includes(search.toLowerCase()) ||
            item.lote?.toLowerCase().includes(search.toLowerCase()) ||
            item.almacen?.toLowerCase().includes(search.toLowerCase());

        const estado = getEstado(item.fecha_expiracion);
        const coincideFiltro = filtro === "Todos" || estado === filtro;

        return coincideBusqueda && coincideFiltro;
    });

    const handleNuevo = () => {
        setForm(formVacio);
        setIsEdit(false);
        setEditId(null);
        setError("");
        setModalOpen(true);
    };

    const handleEditar = (item) => {
        setForm({
            id_producto: item.id_producto,
            id_almacen: item.id_almacen,
            lote: item.lote,
            cantidad: item.cantidad,
            fecha_expiracion: item.fecha_expiracion ?? "",
        });
        setIsEdit(true);
        setEditId(item.id);
        setError("");
        setModalOpen(true);
    };

    const handleEliminar = (item) => {
        setDeleteTarget(item);
        setDeleteOpen(true);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        try {
            if (isEdit) {
                await api.put(`/inventario/${editId}`, { ...form, id_farmacia: form.id_farmacia });
                const actualizados = inventario.map((i) =>
                    i.id === editId ? { ...i, ...form } : i
                );
                refreshCatalogo('inventario', actualizados);
            } else {
                const res = await api.post('/inventario', form);
                refreshCatalogo('inventario', [...inventario, res.data.inventario]);
            }
            setModalOpen(false);
        } catch (e) {
            setError(e.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            await api.delete(`/inventario/${deleteTarget.id}`);
            const actualizados = inventario.filter((i) => i.id !== deleteTarget.id);
            refreshCatalogo('inventario', actualizados);
            setDeleteOpen(false);
            setDeleteTarget(null);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <div className="dashboard-title">
                <h1>Mercancía e inventario diario</h1>
                <p>Gestiona las entradas diarias de existencias, haz seguimiento de fechas de vencimiento y monitorea los niveles de inventario.</p>
            </div>

            {/* ── Buscador y botón ── */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
                <div style={{ flex: 1, position: "relative" }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar medicamento, lote o almacén..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingRight: 36 }}
                    />
                    <Search size={16} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                </div>
                <Button variant="primary" icon={Plus} onClick={handleNuevo}>
                    Agregar medicamento
                </Button>
            </div>

            {/* ── Filtros ── */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {FILTROS.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFiltro(f)}
                        style={{
                            padding: "6px 16px",
                            borderRadius: 20,
                            border: "1px solid #e5e7eb",
                            background: filtro === f ? "#3b82f6" : "white",
                            color: filtro === f ? "white" : "#6b7280",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: filtro === f ? 600 : 400,
                            transition: "all 0.15s",
                        }}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* ── Tabla ── */}
            <DataCard>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                            {["Nombre Medicamento", "Número de lote", "Fecha expiración", "Cantidad", "Ubicación", "Estado", "Acciones"].map((col) => (
                                <th key={col} style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtrados.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>
                                    No hay registros
                                </td>
                            </tr>
                        ) : filtrados.map((item) => (
                            <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                <td style={{ padding: "14px 16px" }}>
                                    <p style={{ margin: 0, fontWeight: 600 }}>{item.producto}</p>
                                    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{item.categoria}</p>
                                </td>
                                <td style={{ padding: "14px 16px", color: "#6b7280" }}>{item.lote}</td>
                                <td style={{ padding: "14px 16px", color: "#6b7280" }}>
                                    {item.fecha_expiracion
                                        ? new Date(item.fecha_expiracion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                                        : "—"
                                    }
                                </td>
                                <td style={{ padding: "14px 16px" }}>
                                    <strong>{item.cantidad}</strong>
                                    <span style={{ color: "#6b7280", fontSize: 12, marginLeft: 4 }}>Unidades</span>
                                </td>
                                <td style={{ padding: "14px 16px", color: "#6b7280" }}>{item.almacen}</td>
                                <td style={{ padding: "14px 16px" }}>
                                    <VencimientoBadge fecha={item.fecha_expiracion} />
                                </td>
                                <td style={{ padding: "14px 16px" }}>
                                    <div className="table-actions">
                                        <button className="action-btn" onClick={() => handleEditar(item)}>
                                            <Pencil size={16} color="#3b82f6" />
                                        </button>
                                        <button className="action-btn" onClick={() => handleEliminar(item)}>
                                            <Trash2 size={16} color="#ef4444" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </DataCard>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={isEdit ? "Editar registro" : "Agregar medicamento"}
            >
                <InventarioForm
                    form={form}
                    setForm={setForm}
                    productos={productos}
                    almacenes={almacenes}
                    onSubmit={handleSubmit}
                    onClose={() => setModalOpen(false)}
                    loading={loading}
                    error={error}
                />
            </Modal>

            <DeleteModal
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                loading={loading}
                item={deleteTarget}
            />
        </PageContainer>
    );
}

export default InventarioFarmacia;