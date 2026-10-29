import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../../components/ui/PageContainer";
import DataCard from "../../components/ui/DataCard";
import Table from "../../components/ui/Table/Table";
import Button from "../../components/ui/Button";
import SearchBar from "../../components/ui/SearchBar";
import Modal from "../../components/ui/Modal";
import api from "../../services/api";

function Usuarios() {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchUsuarios = async () => {
        try {
            const res = await api.get('/usuarios');
            setUsuarios(res.data.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => { fetchUsuarios(); }, []);

    const usuariosFiltrados = usuarios.filter((u) =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.rol_nombre.toLowerCase().includes(search.toLowerCase()) ||
        (u.empleado_nombre && u.empleado_nombre.toLowerCase().includes(search.toLowerCase()))
    );

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

    return (
        <PageContainer>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#111827", marginBottom: "8px" }}>Usuarios y Empleados</h1>
                <p style={{ color: "#6b7280", margin: 0 }}>Gestione los accesos y perfiles del personal de la empresa.</p>
            </div>

            <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                <SearchBar
                    placeholder="Buscar por empleado, email o rol..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ flex: 1 }}
                />
                <Button variant="primary" icon={Plus} onClick={() => navigate("/admin/usuarios/nuevo")}>
                    Nuevo usuario
                </Button>
            </div>

            <DataCard>
                <Table
                    columns={["No. Empleado", "Empleado", "Puesto", "Teléfono", "Email", "Rol", "Ubicación", "Estatus", "Acciones"]}
                    data={usuariosFiltrados}
                    renderRow={(usuario, index) => (
                        <tr key={usuario.id}>
                            <td style={{ color: "#6b7280" }}>{usuario.numero_empleado || '-'}</td>
                            <td style={{ fontWeight: "500", color: "#111827" }}>
                                {usuario.empleado_nombre ? `${usuario.empleado_nombre} ${usuario.apellido_paterno || ''}` : <span style={{ color: "#9ca3af" }}>Sin perfil</span>}
                            </td>
                            <td style={{ color: "#4b5563" }}>{usuario.puesto || '-'}</td>
                            <td style={{ color: "#4b5563" }}>{usuario.telefono || '-'}</td>
                            <td style={{ color: "#4b5563" }}>{usuario.email}</td>
                            <td>
                                <span style={{
                                    padding: "4px 12px",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    backgroundColor: usuario.rol_nombre === 'Farmaceutico' ? "#d1fae5" : "#e0e7ff",
                                    color: usuario.rol_nombre === 'Farmaceutico' ? "#065f46" : "#3730a3"
                                }}>
                                    {usuario.rol_nombre}
                                </span>
                            </td>
                            <td style={{ color: "#4b5563" }}>{usuario.ubicacion_nombre || '-'}</td>
                            <td>
                                <span style={{
                                    padding: "4px 12px",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    backgroundColor: usuario.estatus === 'ACTIVO' ? "#dcfce7" : "#fee2e2",
                                    color: usuario.estatus === 'ACTIVO' ? "#166534" : "#991b1b"
                                }}>
                                    {usuario.estatus || 'ACTIVO'}
                                </span>
                            </td>
                            <td>
                                <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                    <button
                                        style={{ border: "none", background: "none", cursor: "pointer", color: "#3b82f6" }}
                                        onClick={() => navigate(`/admin/usuarios/${usuario.id}/editar`)}
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        style={{ border: "none", background: "none", cursor: "pointer", color: "#ef4444" }}
                                        onClick={() => { setDeleteTarget(usuario); setDeleteOpen(true); }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                />
            </DataCard>

            <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Eliminar usuario">
                <p style={{ color: "#4b5563", marginBottom: "24px" }}>
                    ¿Estás seguro de eliminar a <strong>{deleteTarget?.email}</strong>? Esta acción borrará también su perfil de empleado.
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                    <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={handleConfirmDelete} disabled={loading}>
                        {loading ? "Eliminando..." : "Eliminar"}
                    </Button>
                </div>
            </Modal>
        </PageContainer>
    );
}

export default Usuarios;