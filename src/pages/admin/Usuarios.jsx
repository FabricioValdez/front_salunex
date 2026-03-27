import { useState, useEffect } from "react";
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
function UsuarioForm({ form, setForm, roles, onSubmit, onClose, loading, error, isEdit }) {
    return (
        <>
            {error && (
                <div className="alert alert-danger py-2 text-center mb-3">
                    {error}
                </div>
            )}
            <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                />
            </div>
            <div className="mb-3">
                <label className="form-label">
                    Contraseña {isEdit && <span className="text-muted" style={{ fontSize: 12 }}>(dejar vacío para no cambiar)</span>}
                </label>
                <input
                    type="password"
                    className="form-control"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                />
            </div>
            <div className="mb-4">
                <label className="form-label">Rol</label>
                <select
                    className="form-select"
                    value={form.idrol}
                    onChange={(e) => setForm({ ...form, idrol: e.target.value })}
                >
                    <option value="">Selecciona un rol</option>
                    {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.nombre}</option>
                    ))}
                </select>
            </div>
            <div className="d-flex gap-2 justify-content-end">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button variant="primary" onClick={onSubmit} disabled={loading}>
                    {loading ? "Guardando..." : isEdit ? "Actualizar" : "Crear usuario"}
                </Button>
            </div>
        </>
    );
}

// ── Modal eliminar ──
function DeleteModal({ isOpen, onClose, onConfirm, loading, usuario }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Eliminar usuario">
            <p style={{ color: "#4b5563", marginBottom: 20 }}>
                ¿Estás seguro de eliminar al usuario <strong>{usuario?.email}</strong>? Esta acción no se puede deshacer.
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
function Usuarios() {
    const { roles } = useCatalogos(); // 👈 Roles del context
    const [usuarios, setUsuarios] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ email: "", password: "", idrol: "" });

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // 👇 Cargar usuarios con Axios
    const fetchUsuarios = async () => {
        try {
            const res = await api.get('/usuarios');
            setUsuarios(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const usuariosFiltrados = usuarios.filter((u) =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.rol.toLowerCase().includes(search.toLowerCase())
    );

    const handleNuevo = () => {
        setForm({ email: "", password: "", idrol: "" });
        setIsEdit(false);
        setEditId(null);
        setError("");
        setModalOpen(true);
    };

    const handleEditar = (usuario) => {
        setForm({ email: usuario.email, password: "", idrol: usuario.idrol });
        setIsEdit(true);
        setEditId(usuario.id);
        setError("");
        setModalOpen(true);
    };

    const handleEliminar = (usuario) => {
        setDeleteTarget(usuario);
        setDeleteOpen(true);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        try {
            if (isEdit) {
                await api.put(`/usuarios/${editId}`, form);
            } else {
                await api.post('/usuarios', form);
            }
            setModalOpen(false);
            fetchUsuarios();
        } catch (e) {
            setError(e.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            await api.delete(`/usuarios/${deleteTarget.id}`);
            setDeleteOpen(false);
            setDeleteTarget(null);
            fetchUsuarios();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const columns = ["#", "Email", "Rol", "Acciones"];

    return (
        <PageContainer>
            <div className="dashboard-header">
                <SearchBar
                    placeholder="Buscar por email o rol..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Button variant="primary" icon={Plus} onClick={handleNuevo}>
                    Nuevo usuario
                </Button>
            </div>

            <div className="dashboard-title">
                <h1>Gestión de Usuarios</h1>
                <p>Administra los usuarios y sus roles en el sistema.</p>
            </div>

            <DataCard>
                <Table
                    columns={columns}
                    data={usuariosFiltrados}
                    renderRow={(usuario, index) => (
                        <tr key={usuario.id}>
                            <td>{index + 1}</td>
                            <td>{usuario.email}</td>
                            <td>
                                <span style={{
                                    padding: "3px 10px",
                                    borderRadius: 20,
                                    fontSize: 12,
                                    fontWeight: 500,
                                    background: usuario.idrol === 2 ? "#dbeafe" : "#f3f4f6",
                                    color: usuario.idrol === 2 ? "#1d4ed8" : "#374151",
                                }}>
                                    {usuario.rol}
                                </span>
                            </td>
                            <td>
                                <div className="table-actions">
                                    <button className="action-btn" onClick={() => handleEditar(usuario)}>
                                        <Pencil size={16} color="#3b82f6" />
                                    </button>
                                    <button className="action-btn" onClick={() => handleEliminar(usuario)}>
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
                title={isEdit ? "Editar usuario" : "Nuevo usuario"}
            >
                <UsuarioForm
                    form={form}
                    setForm={setForm}
                    roles={roles}
                    onSubmit={handleSubmit}
                    onClose={() => setModalOpen(false)}
                    loading={loading}
                    error={error}
                    isEdit={isEdit}
                />
            </Modal>

            <DeleteModal
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                loading={loading}
                usuario={deleteTarget}
            />
        </PageContainer>
    );
}

export default Usuarios;