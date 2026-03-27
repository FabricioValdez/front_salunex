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

function ClasificacionForm({ form, setForm, onSubmit, onClose, loading, error }) {
    return (
        <>
            {error && <div className="alert alert-danger py-2 text-center mb-3">{error}</div>}
            <div className="mb-4">
                <label className="form-label">Clasificación</label>
                <input
                    type="text"
                    className="form-control"
                    value={form.clasificacion}
                    onChange={(e) => setForm({ ...form, clasificacion: e.target.value })}
                    placeholder="Nombre de la clasificación"
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

function DeleteModal({ isOpen, onClose, onConfirm, loading, item }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Eliminar clasificación">
            <p style={{ color: "#4b5563", marginBottom: 20 }}>
                ¿Estás seguro de eliminar la clasificación <strong>{item?.clasificacion}</strong>? Esta acción no se puede deshacer.
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

function ClasificacionProducto() {
    const { clasificacionesProducto, refreshCatalogo } = useCatalogos();
    const [search, setSearch]       = useState("");
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [isEdit, setIsEdit]       = useState(false);
    const [editId, setEditId]       = useState(null);
    const [form, setForm]           = useState({ clasificacion: "" });
    const [deleteOpen, setDeleteOpen]     = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const filtrados = clasificacionesProducto.filter((c) =>
        c.clasificacion.toLowerCase().includes(search.toLowerCase())
    );

    const handleNuevo = () => {
        setForm({ clasificacion: "" });
        setIsEdit(false);
        setEditId(null);
        setError("");
        setModalOpen(true);
    };

    const handleEditar = (item) => {
        setForm({ clasificacion: item.clasificacion });
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
                await api.put(`/clasificaciones-producto/${editId}`, form);
                const actualizados = clasificacionesProducto.map((c) =>
                    c.id === editId ? { ...c, ...form } : c
                );
                refreshCatalogo('clasificacionesProducto', actualizados);
            } else {
                const res = await api.post('/clasificaciones-producto', form);
                refreshCatalogo('clasificacionesProducto', [...clasificacionesProducto, res.data.clasificacion]);
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
            await api.delete(`/clasificaciones-producto/${deleteTarget.id}`);
            const actualizados = clasificacionesProducto.filter((c) => c.id !== deleteTarget.id);
            refreshCatalogo('clasificacionesProducto', actualizados);
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
            <div className="dashboard-header">
                <SearchBar
                    placeholder="Buscar clasificación..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Button variant="primary" icon={Plus} onClick={handleNuevo}>
                    Nueva clasificación
                </Button>
            </div>
            <div className="dashboard-title">
                <h1>Clasificaciones de Producto</h1>
                <p>Administra las clasificaciones registradas en el sistema.</p>
            </div>
            <DataCard>
                <Table
                    columns={["#", "Clasificación", "Acciones"]}
                    data={filtrados}
                    renderRow={(item, index) => (
                        <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td><strong>{item.clasificacion}</strong></td>
                            <td>
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
                    )}
                />
            </DataCard>
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? "Editar clasificación" : "Nueva clasificación"}>
                <ClasificacionForm form={form} setForm={setForm} onSubmit={handleSubmit} onClose={() => setModalOpen(false)} loading={loading} error={error} />
            </Modal>
            <DeleteModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleConfirmDelete} loading={loading} item={deleteTarget} />
        </PageContainer>
    );
}

export default ClasificacionProducto;