import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageContainer from "../../components/ui/PageContainer";
import DataCard from "../../components/ui/DataCard";
import Button from "../../components/ui/Button";
import { useCatalogos } from "../../context/CatalogosContext";
import api from "../../services/api";

function UsuarioForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const { roles, ubicaciones } = useCatalogos();

    const [modulosEmpresa, setModulosEmpresa] = useState([]);
    const [loadingData, setLoadingData] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        email: "", password: "", idrol: "",
        numero_empleado: "", nombre_empleado: "", apellido_paterno: "", apellido_materno: "",
        fecha_nacimiento: "", telefono: "", puesto: "", cedula_profesional: "",
        estatus: "ACTIVO", fecha_ingreso: "", id_ubicacion: "",
        modulos: []
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const modulosRes = await api.get('/usuarios/catalogo/modulos-empresa');
                setModulosEmpresa(modulosRes.data.data || []);

                if (isEdit) {
                    const res = await api.get(`/usuarios/${id}`);
                    const { usuario, empleado, modulosAsignados } = res.data.data;
                    setForm({
                        email: usuario.email, password: "", idrol: usuario.idrol,
                        numero_empleado: empleado?.numero_empleado || "", nombre_empleado: empleado?.nombre || "",
                        apellido_paterno: empleado?.apellido_paterno || "", apellido_materno: empleado?.apellido_materno || "",
                        fecha_nacimiento: empleado?.fecha_nacimiento || "", telefono: empleado?.telefono || "",
                        puesto: empleado?.puesto || "", cedula_profesional: empleado?.cedula_profesional || "",
                        estatus: empleado?.estatus || "ACTIVO", fecha_ingreso: empleado?.fecha_ingreso || "",
                        id_ubicacion: empleado?.id_ubicacion || "", modulos: modulosAsignados || []
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

    const handleModuloChange = (moduloId, isChecked) => {
        setForm(prev => ({
            ...prev,
            modulos: isChecked ? [...prev.modulos, moduloId] : prev.modulos.filter(m => m !== moduloId)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            if (isEdit) {
                await api.put(`/usuarios/${id}`, form);
            } else {
                await api.post('/usuarios', form);
            }
            navigate("/admin/usuarios");
        } catch (e) {
            setError(e.response?.data?.message || "Ocurrió un error al guardar.");
        } finally {
            setSaving(false);
        }
    };

    const isRolPersonalizado = roles.find(r => String(r.id) === String(form.idrol))?.nombre === 'Personalizado';

    if (loadingData) return <PageContainer><p style={{color: "#6b7280"}}>Cargando información...</p></PageContainer>;

    const inputGroupStyle = { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" };
    const labelStyle = { fontSize: "14px", fontWeight: "500", color: "#374151" };
    const inputStyle = { padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", outline: "none", fontSize: "14px", backgroundColor: "#fff" };
    const inputStyleDisabled = { ...inputStyle, backgroundColor: "#f3f4f6" }; // Fondo gris suave (como en la imagen 15)

    return (
        <PageContainer>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#111827", marginBottom: "8px" }}>
                    {isEdit ? "Editar Usuario" : "Nuevo Usuario"}
                </h1>
            </div>

            {error && <div style={{ padding: "12px", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "8px", marginBottom: "24px" }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <DataCard>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "24px", color: "#111827" }}>Datos del Empleado</h3>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                        {/* Fila 1 */}
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>No. Empleado</label>
                            <input style={inputStyle} value={form.numero_empleado} onChange={e => setForm({...form, numero_empleado: e.target.value})} placeholder="Opcional" />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Nombre(s) *</label>
                            <input style={inputStyle} value={form.nombre_empleado} onChange={e => setForm({...form, nombre_empleado: e.target.value})} required />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Apellido Paterno</label>
                            <input style={inputStyle} value={form.apellido_paterno} onChange={e => setForm({...form, apellido_paterno: e.target.value})} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Apellido Materno</label>
                            <input style={inputStyle} value={form.apellido_materno} onChange={e => setForm({...form, apellido_materno: e.target.value})} />
                        </div>
                        
                        {/* Fila 2 (Campos faltantes añadidos) */}
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Fecha de Nacimiento</label>
                            <input type="date" style={inputStyle} value={form.fecha_nacimiento} onChange={e => setForm({...form, fecha_nacimiento: e.target.value})} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Teléfono</label>
                            <input style={inputStyle} value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Cédula Profesional</label>
                            <input style={inputStyle} value={form.cedula_profesional} onChange={e => setForm({...form, cedula_profesional: e.target.value})} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Fecha de Ingreso</label>
                            <input type="date" style={inputStyle} value={form.fecha_ingreso} onChange={e => setForm({...form, fecha_ingreso: e.target.value})} />
                        </div>

                        {/* Fila 3 */}
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Ubicación / Sucursal</label>
                            <select style={inputStyle} value={form.id_ubicacion} onChange={e => setForm({...form, id_ubicacion: e.target.value})}>
                                <option value="">Sin asignar</option>
                                {ubicaciones.map(ub => <option key={ub.id} value={ub.id}>{ub.nombre}</option>)}
                            </select>
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Puesto</label>
                            <input style={inputStyle} value={form.puesto} onChange={e => setForm({...form, puesto: e.target.value})} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Estatus Laboral</label>
                            <select style={inputStyle} value={form.estatus} onChange={e => setForm({...form, estatus: e.target.value})}>
                                <option value="ACTIVO">ACTIVO</option>
                                <option value="INACTIVO">INACTIVO</option>
                                <option value="BAJA">BAJA</option>
                            </select>
                        </div>
                    </div>
                </DataCard>

                <div style={{ height: "24px" }}></div>

                <DataCard>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "24px", color: "#111827" }}>Credenciales de Acceso</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Correo Electrónico *</label>
                            <input type="email" style={isEdit ? inputStyleDisabled : inputStyle} value={form.email} onChange={e => setForm({...form, email: e.target.value})} required disabled={isEdit} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Contraseña {isEdit && '(Opcional)'}</label>
                            <input type="password" style={inputStyle} value={form.password} onChange={e => setForm({...form, password: e.target.value})} required={!isEdit} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Rol Asignado *</label>
                            <select style={inputStyle} value={form.idrol} onChange={e => setForm({...form, idrol: e.target.value})} required>
                                <option value="">Seleccione un rol</option>
                                {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                            </select>
                        </div>
                    </div>
                </DataCard>

                {isRolPersonalizado && (
                    <>
                        <div style={{ height: "24px" }}></div>
                        <DataCard>
                            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "24px", color: "#111827" }}>Módulos Permitidos</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                                {modulosEmpresa.map(modulo => (
                                    <div key={modulo.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <input 
                                            type="checkbox" 
                                            id={`mod-${modulo.id}`}
                                            checked={form.modulos.includes(modulo.id)}
                                            onChange={e => handleModuloChange(modulo.id, e.target.checked)}
                                            style={{ width: "16px", height: "16px", cursor: "pointer" }}
                                        />
                                        <label htmlFor={`mod-${modulo.id}`} style={{ fontSize: "14px", color: "#374151", cursor: "pointer" }}>
                                            {modulo.nombre}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </DataCard>
                    </>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "32px", paddingBottom: "32px" }}>
                    <Button variant="secondary" onClick={() => navigate("/admin/usuarios")} type="button">Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={saving}>
                        {saving ? "Guardando..." : "Guardar"}
                    </Button>
                </div>
            </form>
        </PageContainer>
    );
}

export default UsuarioForm;