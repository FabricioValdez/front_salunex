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
import "../../styles/admin/Catalogos.css";

function FarmaciaForm({ form, setForm, empresas, onSubmit, onClose, loading, error }) {
    return (
        <>
            {error && <div className="alert alert-danger py-2 text-center mb-3">{error}</div>}
            <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input type="text" className="form-control" value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Nombre de la farmacia" />
            </div>
            <div className="mb-3">
                <label className="form-label">Dirección</label>
                <input type="text" className="form-control" value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                    placeholder="Dirección" />
            </div>
            <div className="mb-3">
                <label className="form-label">Teléfono</label>
                <input type="text" className="form-control" value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    placeholder="Teléfono" />
            </div>
            <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="correo@farmacia.com" />
            </div>
            <div className="mb-4">
                <label className="form-label">Empresa</label>
                <select className="form-select" value={form.id_empresa}
                    onChange={(e) => setForm({ ...form, id_empresa: e.target.value })}>
                    <option value="">Selecciona una empresa</option>
                    {empresas.map((e) => (
                        <option key={e.id} value={e.id}>{e.nombre}</option>
                    ))}
                </select>
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
        <Modal isOpen={isOpen} onClose={onClose} title="Eliminar farmacia">
            <p style={{ color: "#4b5563", marginBottom: 20 }}>
                ¿Estás seguro de eliminar la farmacia <strong>{item?.nombre}</strong>? Esta acción no se puede deshacer.
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

function Farmacias() {
    const { farmacias, empresas, refreshCatalogo } = useCatalogos();
    const [search, setSearch]             = useState("");
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState("");
    const [modalOpen, setModalOpen]       = useState(false);
    const [isEdit, setIsEdit]             = useState(false);
    const [editId, setEditId]             = useState(null);
    const [form, setForm]                 = useState({ nombre: "", direccion: "", telefono: "", email: "", id_empresa: "" });
    const [deleteOpen, setDeleteOpen]     = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const filtrados = farmacias.filter((f) =>
        f.nombre.toLowerCase().includes(search.toLowerCase()) ||
        f.empresa?.toLowerCase().includes(search.toLowerCase())
    );

    const handleNuevo = () => {
        setForm({ nombre: "", direccion: "", telefono: "", email: "", id_empresa: "" });
        setIsEdit(false);
        setEditId(null);
        setError("");
        setModalOpen(true);
    };

    const handleEditar = (item) => {
        setForm({ nombre: item.nombre, direccion: item.direccion, telefono: item.telefono, email: item.email, id_empresa: item.id_empresa });
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
                await api.put(`/farmacias/${editId}`, form);
                refreshCatalogo('farmacias', farmacias.map((f) =>
                    f.id === editId ? { ...f, ...form } : f
                ));
            } else {
                const res = await api.post('/farmacias', form);
                refreshCatalogo('farmacias', [...farmacias, res.data.farmacia]);
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
            await api.delete(`/farmacias/${deleteTarget.id}`);
            refreshCatalogo('farmacias', farmacias.filter((f) => f.id !== deleteTarget.id));
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
                <SearchBar placeholder="Buscar farmacia o empresa..." value={search}
                    onChange={(e) => setSearch(e.target.value)} />
                <Button variant="primary" icon={Plus} onClick={handleNuevo}>
                    Nueva farmacia
                </Button>
            </div>

            <div className="dashboard-title">
                <h1>Gestión de Farmacias</h1>
                <p>Administra las farmacias registradas en el sistema.</p>
            </div>

            <DataCard>
                <Table
                    columns={["#", "Nombre", "Empresa", "Teléfono", "Email", "Acciones"]}
                    data={filtrados}
                    renderRow={(item, index) => (
                        <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td><strong>{item.nombre}</strong></td>
                            <td>{item.empresa}</td>
                            <td>{item.telefono}</td>
                            <td>{item.email}</td>
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

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
                title={isEdit ? "Editar farmacia" : "Nueva farmacia"}>
                <FarmaciaForm form={form} setForm={setForm} empresas={empresas}
                    onSubmit={handleSubmit} onClose={() => setModalOpen(false)}
                    loading={loading} error={error} />
            </Modal>

            <DeleteModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)}
                onConfirm={handleConfirmDelete} loading={loading} item={deleteTarget} />
        </PageContainer>
    );
}

export default Farmacias;