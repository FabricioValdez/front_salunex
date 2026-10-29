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
import "../../styles/admin/Ubicaciones.css";

function Ubicaciones() {
    const navigate = useNavigate();
    const [ubicaciones, setUbicaciones] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchUbicaciones = async () => {
        try {
            const res = await api.get('/ubicaciones');
            setUbicaciones(res.data.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => { fetchUbicaciones(); }, []);

    // Lógica de filtrado para el buscador
    const ubicacionesFiltradas = ubicaciones.filter(u =>
        u.nombre.toLowerCase().includes(search.toLowerCase()) ||
        u.tipo.toLowerCase().includes(search.toLowerCase())
    );

    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            await api.delete(`/ubicaciones/${deleteTarget.id}`);
            setDeleteOpen(false);
            setDeleteTarget(null);
            fetchUbicaciones();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <div className="ubicaciones-page-header">
                <h1>Catálogo de Ubicaciones</h1>
                <p>Gestione las sucursales, farmacias y almacenes de la empresa.</p>
            </div>

            {/* Controles: Buscador y Botón en la misma fila */}
            <div className="ubicaciones-controls">
                <div className="ubicaciones-search-wrapper">
                    <SearchBar
                        placeholder="Buscar por nombre o tipo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="primary" icon={Plus} onClick={() => navigate("/admin/ubicaciones/nuevo")}>
                    Nueva ubicación
                </Button>
            </div>

            <DataCard>
                <Table
                    columns={["ID", "Nombre", "Tipo", "Depende de", "Dirección", "Teléfono", "Acciones"]}
                    data={ubicacionesFiltradas}
                    renderRow={(item, index) => (
                        <tr key={item.id}>
                            <td className="ub-col-id">{item.id}</td>
                            <td className="ub-col-nombre">{item.nombre}</td>

                            {/* Uso dinámico de clases para el color pastel del badge */}
                            <td>
                                <span className={`ub-badge ub-badge-${item.tipo.toLowerCase()}`}>
                                    {item.tipo}
                                </span>
                            </td>

                            <td className="ub-col-texto">
                                {item.nombre_farmacia_padre || '-'}
                            </td>
                            <td className="ub-col-texto">{item.direccion || '-'}</td>
                            <td className="ub-col-texto">{item.telefono || '-'}</td>

                            {/* Botones de acción solo iconos sin fondo */}
                            <td>
                                <div className="ub-actions">
                                    <button
                                        className="ub-btn-icon ub-btn-edit"
                                        onClick={() => navigate(`/admin/ubicaciones/${item.id}/editar`)}
                                        title="Editar"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        className="ub-btn-icon ub-btn-delete"
                                        onClick={() => { setDeleteTarget(item); setDeleteOpen(true); }}
                                        title="Eliminar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                />
            </DataCard>

            <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Eliminar ubicación">
                <p className="ub-modal-text">
                    ¿Estás seguro de eliminar <strong>{deleteTarget?.nombre}</strong>?
                </p>
                <div className="ub-modal-actions">
                    <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={handleConfirmDelete} disabled={loading}>
                        {loading ? "Eliminando..." : "Eliminar"}
                    </Button>
                </div>
            </Modal>
        </PageContainer>
    );
}

export default Ubicaciones;