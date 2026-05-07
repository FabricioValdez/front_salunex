import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import PageContainer from "../../components/ui/PageContainer";
import DataCard from "../../components/ui/DataCard";
import Table from "../../components/ui/Table/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import SearchBar from "../../components/ui/SearchBar";
import { useCatalogos } from "../../context/CatalogosContext";
import api from "../../services/api";

function CatalogoForm({ label, campo, form, setForm, onSubmit, onClose, loading, error }) {
    return (
        <>
            {error && <div className="alert alert-danger py-2 text-center mb-3">{error}</div>}
            <div className="mb-4">
                <label className="form-label">{label}</label>
                <input type="text" className="form-control" value={form[campo]}
                    onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
                    placeholder={`Nombre de la ${label.toLowerCase()}`} />
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

function DeleteModal({ isOpen, onClose, onConfirm, loading, nombre }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Eliminar registro">
            <p style={{ color: "#4b5563", marginBottom: 20 }}>
                ¿Estás seguro de eliminar <strong>{nombre}</strong>? Esta acción no se puede deshacer.
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

function PresentacionProducto() {
    const { presentacionesProducto, refreshCatalogo } = useCatalogos();
    const [search, setSearch]             = useState("");
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState("");
    const [modalOpen, setModalOpen]       = useState(false);
    const [isEdit, setIsEdit]             = useState(false);
    const [editId, setEditId]             = useState(null);
    const [form, setForm]                 = useState({ presentacion: "" });
    const [deleteOpen, setDeleteOpen]     = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const filtrados = presentacionesProducto.filter((p) =>
        p.presentacion.toLowerCase().includes(search.toLowerCase())
    );

    const handleNuevo = () => {
        setForm({ presentacion: "" });
        setIsEdit(false); setEditId(null); setError(""); setModalOpen(true);
    };

    const handleEditar = (item) => {
        setForm({ presentacion: item.presentacion });
        setIsEdit(true); setEditId(item.id); setError(""); setModalOpen(true);
    };

    const handleSubmit = async () => {
        setLoading(true); setError("");
        try {
            if (isEdit) {
                await api.put(`/presentaciones-producto/${editId}`, form);
                refreshCatalogo('presentacionesProducto', presentacionesProducto.map((p) =>
                    p.id === editId ? { ...p, ...form } : p));
            } else {
                const res = await api.post('/presentaciones-producto', form);
                refreshCatalogo('presentacionesProducto', [...presentacionesProducto, res.data.presentacion]);
            }
            setModalOpen(false);
        } catch (e) {
            setError(e.response?.data?.message || e.message);
        } finally { setLoading(false); }
    };

    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            await api.delete(`/presentaciones-producto/${deleteTarget.id}`);
            refreshCatalogo('presentacionesProducto', presentacionesProducto.filter((p) => p.id !== deleteTarget.id));
            setDeleteOpen(false); setDeleteTarget(null);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    return (
        <PageContainer>
            <div className="dashboard-header">
                <SearchBar placeholder="Buscar presentación..." value={search}
                    onChange={(e) => setSearch(e.target.value)} />
                <Button variant="primary" icon={Plus} onClick={handleNuevo}>Nueva presentación</Button>
            </div>
            <div className="dashboard-title">
                <h1>Presentaciones de Producto</h1>
                <p>Administra las presentaciones registradas en el sistema.</p>
            </div>
            <DataCard>
                <Table columns={["#", "Presentación", "Acciones"]} data={filtrados}
                    renderRow={(item, index) => (
                        <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td><strong>{item.presentacion}</strong></td>
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
                    )} />
            </DataCard>
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
                title={isEdit ? "Editar presentación" : "Nueva presentación"}>
                <CatalogoForm label="Presentación" campo="presentacion" form={form} setForm={setForm}
                    onSubmit={handleSubmit} onClose={() => setModalOpen(false)} loading={loading} error={error} />
            </Modal>
            <DeleteModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)}
                onConfirm={handleConfirmDelete} loading={loading} nombre={deleteTarget?.presentacion} />
        </PageContainer>
    );
}

export default PresentacionProducto;