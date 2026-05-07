import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageContainer from "../../components/ui/PageContainer";
import UsuarioInfoCard from "../../components/features/usuarios/UsuarioInfoCard";
import PermisosTabla from "../../components/features/usuarios/PermisosTabla";
import { useCatalogos } from "../../context/CatalogosContext";
import api from "../../services/api";
import "../../styles/admin/EditarUsuario.css";

const MODULOS = [
    "usuarios", "empresas", "farmacias", "almacenes",
    "productos", "inventario", "ordenes", "recepcion",
    "control", "dashboard"
];

const permisosVacios = () =>
    MODULOS.reduce((acc, m) => ({
        ...acc,
        [m]: { lectura: false, escritura: false, eliminacion: false }
    }), {});

function EditarUsuario() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { roles } = useCatalogos();

    const [form, setForm]           = useState({ email: "", password: "", idrol: "" });
    const [permisos, setPermisos]   = useState(permisosVacios());
    const [loading, setLoading]     = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError]         = useState("");
    const [success, setSuccess]     = useState(false);

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                const res = await api.get(`/usuarios/${id}`);
                setForm({ email: res.data.email, password: "", idrol: res.data.idrol });
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingData(false);
            }
        };
        fetchUsuario();
    }, [id]);

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        try {
            await api.put(`/usuarios/${id}`, form);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (e) {
            setError(e.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) return (
        <PageContainer>
            <p style={{ color: "#9ca3af", padding: 40 }}>Cargando usuario...</p>
        </PageContainer>
    );

    return (
        <PageContainer>
            <div className="editar-usuario-header">
                <button className="editar-usuario-back" onClick={() => navigate("/admin/usuarios")}>
                    <ArrowLeft size={16} />
                    Volver a usuarios
                </button>
                <h1>Editar usuario</h1>
                <p>Modifica la información y permisos del usuario.</p>
            </div>

            <div className="editar-usuario-grid">
                <UsuarioInfoCard
                    form={form}
                    setForm={setForm}
                    roles={roles}
                    onSubmit={handleSubmit}
                    loading={loading}
                    error={error}
                    success={success}
                />
                <PermisosTabla
                    permisos={permisos}
                    onChange={setPermisos}
                />
            </div>
        </PageContainer>
    );
}

export default EditarUsuario;