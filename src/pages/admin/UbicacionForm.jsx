import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageContainer from "../../components/ui/PageContainer";
import DataCard from "../../components/ui/DataCard";
import Button from "../../components/ui/Button";
import api from "../../services/api";
import "../../styles/admin/UbicacionForm.css";

function UbicacionForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [farmaciasPadre, setFarmaciasPadre] = useState([]);
    const [loadingData, setLoadingData] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        nombre: "", tipo: "FARMACIA", id_farmacia_padre: "",
        direccion: "", telefono: "", email: ""
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Cargar catálogo filtrado
                const url = isEdit ? `/ubicaciones/farmacias-padre?exclude_id=${id}` : '/ubicaciones/farmacias-padre';
                const catRes = await api.get(url);
                setFarmaciasPadre(catRes.data.data || []);

                if (isEdit) {
                    const res = await api.get(`/ubicaciones/${id}`);
                    const u = res.data.data;
                    setForm({
                        nombre: u.nombre, tipo: u.tipo, id_farmacia_padre: u.id_farmacia_padre || "",
                        direccion: u.direccion || "", telefono: u.telefono || "", email: u.email || ""
                    });
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingData(false);
            }
        };
        fetchInitialData();
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        // Limpiamos id_farmacia_padre si es Farmacia principal u Oficina
        const payload = { ...form };
        if (payload.tipo !== 'ALMACEN') payload.id_farmacia_padre = null;

        try {
            if (isEdit) {
                await api.put(`/ubicaciones/${id}`, payload);
            } else {
                await api.post('/ubicaciones', payload);
            }
            navigate("/admin/ubicaciones");
        } catch (e) {
            setError(e.response?.data?.message || "Ocurrió un error al guardar.");
        } finally {
            setSaving(false);
        }
    };

    if (loadingData) {
        return (
            <PageContainer>
                <p className="text-muted">Cargando información...</p>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="ubicacion-header">
                <h1 className="ubicacion-title">
                    {isEdit ? "Editar Ubicación" : "Nueva Ubicación"}
                </h1>
            </div>

            {error && <div className="ubicacion-alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <DataCard>
                    <h3 className="ubicacion-card-title">Datos de la Ubicación</h3>

                    {/* Fila 1: 2 Columnas (Nombre y Tipo) */}
                    <div className="ubicacion-grid-2">
                        <div className="ubicacion-form-group">
                            <label className="ubicacion-label">Nombre de la Ubicación *</label>
                            <input
                                className="ubicacion-input"
                                value={form.nombre}
                                onChange={e => setForm({ ...form, nombre: e.target.value })}
                                required
                                placeholder="Ej. Farmacia FBM"
                            />
                        </div>
                        <div className="ubicacion-form-group">
                            <label className="ubicacion-label">Tipo de Ubicación *</label>
                            <select
                                className="ubicacion-input"
                                value={form.tipo}
                                onChange={e => setForm({ ...form, tipo: e.target.value })}
                                required
                            >
                                <option value="FARMACIA">FARMACIA (Principal)</option>
                                <option value="ALMACEN">ALMACÉN (Dependiente)</option>
                                <option value="OFICINA">OFICINA ADMINISTRATIVA</option>
                            </select>
                        </div>
                    </div>

                    {/* Fila 2: 1 Columna (Solo visible si es Almacén) */}
                    {form.tipo === 'ALMACEN' && (
                        <div className="ubicacion-grid-1">
                            <div className="ubicacion-form-group">
                                <label className="ubicacion-label">Depende de (Farmacia Padre) *</label>
                                <select
                                    className="ubicacion-input"
                                    value={form.id_farmacia_padre}
                                    onChange={e => setForm({ ...form, id_farmacia_padre: e.target.value })}
                                    required
                                >
                                    <option value="">-- Seleccionar Farmacia --</option>
                                    {farmaciasPadre.map(f => (
                                        <option key={f.id} value={f.id}>{f.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Fila 3: 3 Columnas (Teléfono, Email y Dirección) */}
                    <div className="ubicacion-grid-3">
                        <div className="ubicacion-form-group">
                            <label className="ubicacion-label">Teléfono</label>
                            <input
                                className="ubicacion-input"
                                value={form.telefono}
                                onChange={e => setForm({ ...form, telefono: e.target.value })}
                                placeholder="Ej. 9999123456"
                            />
                        </div>
                        <div className="ubicacion-form-group">
                            <label className="ubicacion-label">Email de Contacto</label>
                            <input
                                type="email"
                                className="ubicacion-input"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                placeholder="contacto@empresa.com"
                            />
                        </div>
                        <div className="ubicacion-form-group">
                            <label className="ubicacion-label">Dirección Física</label>
                            <input
                                className="ubicacion-input"
                                value={form.direccion}
                                onChange={e => setForm({ ...form, direccion: e.target.value })}
                                placeholder="Calle 60 #450 x 53 y 55..."
                            />
                        </div>
                    </div>
                </DataCard>

                <div className="ubicacion-actions">
                    <Button variant="secondary" onClick={() => navigate("/admin/ubicaciones")} type="button">
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={saving}>
                        {saving ? "Guardando..." : (isEdit ? "Modificar" : "Guardar")}
                    </Button>
                </div>
            </form>
        </PageContainer>
    );
}

export default UbicacionForm;