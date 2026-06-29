import { useState } from "react";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import PageContainer from "../../components/ui/PageContainer";
import DataCard from "../../components/ui/DataCard";
import Table from "../../components/ui/Table/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { useCatalogos } from "../../context/CatalogosContext";
import api from "../../services/api";
import "../../styles/general/Inventario.css";

const FILTROS = ["Todos", "Vigente", "Por revisar", "Por expirar", "Expirado"];

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

function InventarioForm({ form, setForm, productos, almacenes, farmacias, onSubmit, onClose, loading, error }) {
    return (
        <>
            {error && <div className="alert alert-danger py-2 text-center mb-3">{error}</div>}
            <div className="mb-3">
                <label className="form-label">Producto</label>
                <select className="form-select" value={form.id_producto}
                    onChange={(e) => setForm({ ...form, id_producto: e.target.value })}>
                    <option value="">Selecciona un producto</option>
                    {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Almacén</label>
                <select className="form-select" value={form.id_almacen}
                    onChange={(e) => setForm({ ...form, id_almacen: e.target.value })}>
                    <option value="">Selecciona un almacén</option>
                    {almacenes.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Farmacia</label>
                <select className="form-select" value={form.id_farmacia}
                    onChange={(e) => setForm({ ...form, id_farmacia: e.target.value })}>
                    <option value="">Selecciona una farmacia</option>
                    {farmacias.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Lote</label>
                <input type="text" className="form-control" value={form.lote}
                    onChange={(e) => setForm({ ...form, lote: e.target.value })}
                    placeholder="Ej. LOTE001" />
            </div>
            <div className="mb-3">
                <label className="form-label">Cantidad</label>
                <input type="number" className="form-control" value={form.cantidad}
                    onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                    placeholder="0" />
            </div>
            <div className="mb-4">
                <label className="form-label">Fecha de expiración</label>
                <input type="date" className="form-control" value={form.fecha_expiracion}
                    onChange={(e) => setForm({ ...form, fecha_expiracion: e.target.value })} />
            </div>
            <div className="form-actions">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button variant="primary" onClick={onSubmit} disabled={loading}>
                    {loading ? "Guardando..." : "Guardar"}
                </Button>
            </div>
        </>
    );
}

function DeleteModal({ isOpen, onClose, onConfirm, loading, item }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Eliminar registro">
            <p style={{ color: "#4b5563", marginBottom: 20 }}>
                ¿Estás seguro de eliminar el registro de <strong>{item?.producto}</strong> con lote <strong>{item?.lote}</strong>?
            </p>
            <div className="form-actions">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button variant="danger" onClick={onConfirm} disabled={loading}>
                    {loading ? "Eliminando..." : "Eliminar"}
                </Button>
            </div>
        </Modal>
    );
}

const formVacio = {
    id_producto: "", id_almacen: "", id_farmacia: "",
    lote: "", cantidad: "", fecha_expiracion: ""
};

function Inventario() {
    const { inventario, productos, almacenes, farmacias, refreshCatalogo } = useCatalogos();

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
            item.almacen?.toLowerCase().includes(search.toLowerCase()) ||
            item.farmacia?.toLowerCase().includes(search.toLowerCase());
        const estado = getEstado(item.fecha_expiracion);
        const coincideFiltro = filtro === "Todos" || estado === filtro;
        return coincideBusqueda && coincideFiltro;
    });

    const handleNuevo = () => {
        setForm(formVacio); setIsEdit(false);
        setEditId(null); setError(""); setModalOpen(true);
    };

    const handleEditar = (item) => {
        setForm({
            id_producto: item.id_producto,
            id_almacen: item.id_almacen,
            id_farmacia: item.id_farmacia,
            lote: item.lote,
            cantidad: item.cantidad,
            fecha_expiracion: item.fecha_expiracion ?? "",
        });
        setIsEdit(true); setEditId(item.id); setError(""); setModalOpen(true);
    };

    const handleSubmit = async () => {
        setLoading(true); setError("");
        try {
            if (isEdit) {
                await api.put(`/inventario/${editId}`, form);
                refreshCatalogo('inventario', inventario.map((i) =>
                    i.id === editId ? { ...i, ...form } : i));
            } else {
                const res = await api.post('/inventario', form);
                refreshCatalogo('inventario', [...inventario, res.data.inventario]);
            }
            setModalOpen(false);
        } catch (e) {
            setError(e.response?.data?.message || e.message);
        } finally { setLoading(false); }
    };

    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            await api.delete(`/inventario/${deleteTarget.id}`);
            refreshCatalogo('inventario', inventario.filter((i) => i.id !== deleteTarget.id));
            setDeleteOpen(false); setDeleteTarget(null);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    return (
        <PageContainer>
            <div className="dashboard-title">
                <h1>Mercancía e inventario diario</h1>
                <p>Gestione las entradas diarias de existencias, haga seguimiento de fechas de vencimiento y monitoree niveles en tiempo real.</p>
            </div>

            <div className="inventario-actions">
                <div className="inventario-search">
                    <input type="text" placeholder="Buscar medicamento, lote, almacén o farmacia..."
                        value={search} onChange={(e) => setSearch(e.target.value)} />
                    <Search size={16} className="inventario-search-icon" />
                </div>
                <Button variant="secondary">Exportar</Button>
                <Button variant="primary" icon={Plus} onClick={handleNuevo}>
                    Agregar medicamento
                </Button>
            </div>

            <div className="filtros-bar">
                {FILTROS.map((f) => (
                    <button key={f} className={`filtro-btn ${filtro === f ? "active" : ""}`}
                        onClick={() => setFiltro(f)}>{f}</button>
                ))}
            </div>

            <DataCard>
                <Table
                    columns={["Nombre Medicamento", "Lote", "Fecha Exp.", "Cantidad", "Almacén", "Farmacia", "Estado", "Acciones"]}
                    data={filtrados}
                    renderRow={(item) => (
                        <tr key={item.id}>
                            <td>
                                <div className="inventario-nombre">
                                    <p>{item.producto}</p>
                                    <span>{item.categoria}</span>
                                </div>
                            </td>
                            <td style={{ color: "#6b7280" }}>{item.lote}</td>
                            <td style={{ color: "#6b7280" }}>
                                {item.fecha_expiracion
                                    ? new Date(item.fecha_expiracion).toLocaleDateString('es-MX', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                    })
                                    : "—"}
                            </td>
                            <td>
                                <div className="inventario-cantidad">
                                    <strong>{item.cantidad}</strong>
                                    <span>Unidades</span>
                                </div>
                            </td>
                            <td style={{ color: "#6b7280" }}>{item.almacen}</td>
                            <td style={{ color: "#6b7280" }}>{item.farmacia}</td>
                            <td><VencimientoBadge fecha={item.fecha_expiracion} /></td>
                            <td>
                                <div className="table-actions">
                                    <button className="action-btn" onClick={() => handleEditar(item)}>
                                        <Pencil size={16} color="#3b82f6" />
                                    </button>
                                    <button className="action-btn" onClick={() => { setDeleteTarget(item); setDeleteOpen(true); }}>
                                        <Trash2 size={16} color="#ef4444" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                />
            </DataCard>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
                title={isEdit ? "Editar registro" : "Agregar medicamento"}>
                <InventarioForm form={form} setForm={setForm}
                    productos={productos} almacenes={almacenes} farmacias={farmacias}
                    onSubmit={handleSubmit} onClose={() => setModalOpen(false)}
                    loading={loading} error={error} />
            </Modal>

            <DeleteModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)}
                onConfirm={handleConfirmDelete} loading={loading} item={deleteTarget} />
        </PageContainer>
    );
}

export default Inventario;