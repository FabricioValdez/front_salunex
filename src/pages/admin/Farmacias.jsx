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
function FarmaciaForm({ form, setForm, empresas, onSubmit, onClose, loading, error }) {
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
                    placeholder="Nombre de la farmacia"
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
                    placeholder="correo@farmacia.com"
                />
            </div>
            <div className="mb-4">
                <label className="form-label">Empresa</label>
                <select
                    className="form-select"
                    value={form.id_empresa}
                    onChange={(e) => setForm({ ...form, id_empresa: e.target.value })}
                >
                    <option value="">Selecciona una empresa</option>
                    {empresas.map((e) => (
                        <option key={e.id} value={e.id}>{e.nombre}</option>
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
function DeleteModal({ isOpen, onClose, onConfirm, loading, farmacia }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Eliminar farmacia">
            <p style={{ color: "#4b5563", marginBottom: 20 }}>
                ¿Estás seguro de eliminar la farmacia <strong>{farmacia?.nombre}</strong>? Esta acción no se puede deshacer.
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
function Farmacias() {
    const { farmacias, empresas, refreshCatalogo } = useCatalogos(); // 👈 Del context
    const [search, setSearch]             = useState("");
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState("");

    const [modalOpen, setModalOpen]       = useState(false);
    const [isEdit, setIsEdit]             = useState(false);
    const [editId, setEditId]             = useState(null);
    const [form, setForm]                 = useState({
        nombre: "", direccion: "", telefono: "", email: "", id_empresa: ""
    });

    const [deleteOpen, setDeleteOpen]     = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const farmaciasFiltradas = farmacias.filter((f) =>
        f.nombre.toLowerCase().includes(search.toLowerCase()) ||
        f.empresa.toLowerCase().includes(search.toLowerCase())
    );

    const handleNuevo = () => {
        setForm({ nombre: "", direccion: "", telefono: "", email: "", id_empresa: "" });
        setIsEdit(false);
        setEditId(null);
        setError("");
        setModalOpen(true);
    };

    const handleEditar = (farmacia) => {
        setForm({
            nombre:     farmacia.nombre,
            direccion:  farmacia.direccion,
            telefono:   farmacia.telefono,
            email:      farmacia.email,
            id_empresa: farmacia.id_empresa,
        });
        setIsEdit(true);
        setEditId(farmacia.id);
        setError("");
        setModalOpen(true);
    };

    const handleEliminar = (farmacia) => {
        setDeleteTarget(farmacia);
        setDeleteOpen(true);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        try {
            if (isEdit) {
                await api.put(`/farmacias/${editId}`, form);
            } else {
                await api.post('/farmacias', form);
            }
            setModalOpen(false);
            refreshCatalogo('farmacias'); // 👈 Refresca el context
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
            setDeleteOpen(false);
            setDeleteTarget(null);
            refreshCatalogo('farmacias'); // 👈 Refresca el context
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const columns = ["#", "Nombre", "Empresa", "Teléfono", "Email", "Acciones"];

    return (
        <PageContainer>
            <div className="dashboard-header">
                <SearchBar
                    placeholder="Buscar por nombre o empresa..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
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
                    columns={columns}
                    data={farmaciasFiltradas}
                    renderRow={(farmacia, index) => (
                        <tr key={farmacia.id}>
                            <td>{index + 1}</td>
                            <td><strong>{farmacia.nombre}</strong></td>
                            <td>{farmacia.empresa}</td>
                            <td>{farmacia.telefono}</td>
                            <td>{farmacia.email}</td>
                            <td>
                                <div className="table-actions">
                                    <button className="action-btn" onClick={() => handleEditar(farmacia)}>
                                        <Pencil size={16} color="#3b82f6" />
                                    </button>
                                    <button className="action-btn" onClick={() => handleEliminar(farmacia)}>
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
                title={isEdit ? "Editar farmacia" : "Nueva farmacia"}
            >
                <FarmaciaForm
                    form={form}
                    setForm={setForm}
                    empresas={empresas}
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
                farmacia={deleteTarget}
            />
        </PageContainer>
    );
}

export default Farmacias;