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

function AlmacenForm({ form, setForm, farmacias, onSubmit, onClose, loading, error }) {
    return (
        <>
            {error && <div className="alert alert-danger py-2 text-center mb-3">{error}</div>}
            <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input type="text" className="form-control" value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Nombre del almacén" />
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
                    placeholder="correo@almacen.com" />
            </div>
            <div className="mb-4">
                <label className="form-label">Farmacia</label>
                <select className="form-select" value={form.id_farmacia}
                    onChange={(e) => setForm({ ...form, id_farmacia: e.target.value })}>
                    <option value="">Selecciona una farmacia</option>
                    {farmacias.map((f) => (
                        <option key={f.id} value={f.id}>{f.nombre} — {f.empresa}</option>
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
        <Modal isOpen={isOpen} onClose={onClose} title="Eliminar almacén">
            <p style={{ color: "#4b5563", marginBottom: 20 }}>
                ¿Estás seguro de eliminar el almacén <strong>{item?.nombre}</strong>? Esta acción no se puede deshacer.
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

function Almacenes() {
    const { almacenes, farmacias, refreshCatalogo } = useCatalogos();
    const [search, setSearch]             = useState("");
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState("");
    const [modalOpen, setModalOpen]       = useState(false);
    const [isEdit, setIsEdit]             = useState(false);
    const [editId, setEditId]             = useState(null);
    const [form, setForm]                 = useState({ nombre: "", direccion: "", telefono: "", email: "", id_farmacia: "" });
    const [deleteOpen, setDeleteOpen]     = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const filtrados = almacenes.filter((a) =>
        a.nombre.toLowerCase().includes(search.toLowerCase()) ||
        a.farmacia?.toLowerCase().includes(search.toLowerCase()) ||
        a.empresa?.toLowerCase().includes(search.toLowerCase())
    );

    const handleNuevo = () => {
        setForm({ nombre: "", direccion: "", telefono: "", email: "", id_farmacia: "" });
        setIsEdit(false);
        setEditId(null);
        setError("");
        setModalOpen(true);
    };

    const handleEditar = (item) => {
        setForm({ nombre: item.nombre, direccion: item.direccion, telefono: item.telefono, email: item.email, id_farmacia: item.id_farmacia });
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
                await api.put(`/almacenes/${editId}`, form);
                refreshCatalogo('almacenes', almacenes.map((a) =>
                    a.id === editId ? { ...a, ...form } : a
                ));
            } else {
                const res = await api.post('/almacenes', form);
                refreshCatalogo('almacenes', [...almacenes, res.data.almacen]);
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
            await api.delete(`/almacenes/${deleteTarget.id}`);
            refreshCatalogo('almacenes', almacenes.filter((a) => a.id !== deleteTarget.id));
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
                <SearchBar placeholder="Buscar por nombre, farmacia o empresa..." value={search}
                    onChange={(e) => setSearch(e.target.value)} />
                <Button variant="primary" icon={Plus} onClick={handleNuevo}>
                    Nuevo almacén
                </Button>
            </div>

            <div className="dashboard-title">
                <h1>Gestión de Almacenes</h1>
                <p>Administra los almacenes registrados en el sistema.</p>
            </div>

            <DataCard>
                <Table
                    columns={["#", "Nombre", "Farmacia", "Empresa", "Teléfono", "Email", "Acciones"]}
                    data={filtrados}
                    renderRow={(item, index) => (
                        <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td><strong>{item.nombre}</strong></td>
                            <td>{item.farmacia}</td>
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
                title={isEdit ? "Editar almacén" : "Nuevo almacén"}>
                <AlmacenForm form={form} setForm={setForm} farmacias={farmacias}
                    onSubmit={handleSubmit} onClose={() => setModalOpen(false)}
                    loading={loading} error={error} />
            </Modal>

            <DeleteModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)}
                onConfirm={handleConfirmDelete} loading={loading} item={deleteTarget} />
        </PageContainer>
    );
}

export default Almacenes;