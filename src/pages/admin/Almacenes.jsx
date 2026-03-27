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

// ── Formulario ──
function AlmacenForm({ form, setForm, farmacias, onSubmit, onClose, loading, error }) {
    return (
        <>
            {error && (
                <div className="alert alert-danger py-2 text-center mb-3">
                    {error}
                </div>
            )}
            <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                    type="text"
                    className="form-control"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Nombre del almacén"
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Dirección</label>
                <input
                    type="text"
                    className="form-control"
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                    placeholder="Dirección"
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Teléfono</label>
                <input
                    type="text"
                    className="form-control"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    placeholder="Teléfono"
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="correo@almacen.com"
                />
            </div>
            <div className="mb-4">
                <label className="form-label">Farmacia</label>
                <select
                    className="form-select"
                    value={form.id_farmacia}
                    onChange={(e) => setForm({ ...form, id_farmacia: e.target.value })}
                >
                    <option value="">Selecciona una farmacia</option>
                    {farmacias.map((f) => (
                        <option key={f.id} value={f.id}>
                            {f.nombre} — {f.empresa}
                        </option>
                    ))}
                </select>
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
function DeleteModal({ isOpen, onClose, onConfirm, loading, almacen }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Eliminar almacén">
            <p style={{ color: "#4b5563", marginBottom: 20 }}>
                ¿Estás seguro de eliminar el almacén <strong>{almacen?.nombre}</strong>? Esta acción no se puede deshacer.
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

// ── Página principal ──
function Almacenes() {
    const { almacenes, farmacias, refreshCatalogo } = useCatalogos(); // 👈 Del context
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({
        nombre: "", direccion: "", telefono: "", email: "", id_farmacia: ""
    });

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const almacenesFiltrados = almacenes.filter((a) =>
        a.nombre.toLowerCase().includes(search.toLowerCase()) ||
        a.farmacia.toLowerCase().includes(search.toLowerCase()) ||
        a.empresa.toLowerCase().includes(search.toLowerCase())
    );

    const handleNuevo = () => {
        setForm({ nombre: "", direccion: "", telefono: "", email: "", id_farmacia: "" });
        setIsEdit(false);
        setEditId(null);
        setError("");
        setModalOpen(true);
    };

    const handleEditar = (almacen) => {
        setForm({
            nombre: almacen.nombre,
            direccion: almacen.direccion,
            telefono: almacen.telefono,
            email: almacen.email,
            id_farmacia: almacen.id_farmacia,
        });
        setIsEdit(true);
        setEditId(almacen.id);
        setError("");
        setModalOpen(true);
    };

    const handleEliminar = (almacen) => {
        setDeleteTarget(almacen);
        setDeleteOpen(true);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        try {
            if (isEdit) {
                await api.put(`/almacenes/${editId}`, form);
                // Actualiza localmente sin esperar otra petición
                const actualizados = almacenes.map((a) =>
                    a.id === editId ? { ...a, ...form } : a
                );
                refreshCatalogo('almacenes', actualizados);
            } else {
                const res = await api.post('/almacenes', form);
                // Agrega el nuevo al estado local
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
            // Elimina del estado local
            const actualizados = almacenes.filter((a) => a.id !== deleteTarget.id);
            refreshCatalogo('almacenes', actualizados);
            setDeleteOpen(false);
            setDeleteTarget(null);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const columns = ["#", "Nombre", "Farmacia", "Empresa", "Teléfono", "Email", "Acciones"];

    return (
        <PageContainer>
            <div className="dashboard-header">
                <SearchBar
                    placeholder="Buscar por nombre, farmacia o empresa..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
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
                    columns={columns}
                    data={almacenesFiltrados}
                    renderRow={(almacen, index) => (
                        <tr key={almacen.id}>
                            <td>{index + 1}</td>
                            <td><strong>{almacen.nombre}</strong></td>
                            <td>{almacen.farmacia}</td>
                            <td>{almacen.empresa}</td>
                            <td>{almacen.telefono}</td>
                            <td>{almacen.email}</td>
                            <td>
                                <div className="table-actions">
                                    <button className="action-btn" onClick={() => handleEditar(almacen)}>
                                        <Pencil size={16} color="#3b82f6" />
                                    </button>
                                    <button className="action-btn" onClick={() => handleEliminar(almacen)}>
                                        <Trash2 size={16} color="#ef4444" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                />
            </DataCard>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={isEdit ? "Editar almacén" : "Nuevo almacén"}
            >
                <AlmacenForm
                    form={form}
                    setForm={setForm}
                    farmacias={farmacias}
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
                almacen={deleteTarget}
            />
        </PageContainer>
    );
}

export default Almacenes;