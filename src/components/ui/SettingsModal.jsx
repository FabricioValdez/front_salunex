import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import "./SettingsModal.css";

const sections = ["General", "Mi cuenta", "Notificaciones", "Suscripción", "Seguridad"];

function SettingsModal({ isOpen, onClose }) {
    const [active, setActive] = useState("General");

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" className="settings-modal-wide">
            <div className="settings-layout">

                {/* ── Sidebar interno ── */}
                <div className="settings-sidebar">
                    <p className="settings-title">Configuración</p>

                    {sections.map((s) => (
                        <button
                            key={s}
                            className={`settings-nav-item ${active === s ? "active" : ""}`}
                            onClick={() => setActive(s)}
                        >
                            {s}
                        </button>
                    ))}

                    <hr className="settings-divider" />

                    <button className="settings-nav-item danger">
                        Cerrar sesión
                    </button>
                </div>

                {/* ── Contenido dinámico ── */}
                <div className="settings-content">
                    {active === "General" && <SettingsGeneral />}
                    {active === "Mi cuenta" && <SettingsCuenta />}
                    {active === "Notificaciones" && <SettingsNotificaciones />}
                    {active === "Suscripción" && <SettingsSuscripcion onClose={onClose} />}
                    {active === "Seguridad" && <SettingsSeguridad />}
                </div>

            </div>
        </Modal>
    );
}

/* ══════════════════════════════════════
   SECCIONES
══════════════════════════════════════ */

function SettingsGeneral() {
    return (
        <div>
            <h3 className="settings-section-title">General</h3>

            <p className="settings-group-label">Apariencia</p>
            <div className="settings-row">
                <div className="settings-row-info">
                    <p>Tema</p>
                    <span>Cambia entre modo claro y oscuro</span>
                </div>
                <select className="settings-select">
                    <option>Sistema</option>
                    <option>Claro</option>
                    <option>Oscuro</option>
                </select>
            </div>
            <div className="settings-row">
                <div className="settings-row-info">
                    <p>Idioma</p>
                    <span>Idioma de la interfaz</span>
                </div>
                <select className="settings-select">
                    <option>Español</option>
                    <option>English</option>
                </select>
            </div>

            <p className="settings-group-label" style={{ marginTop: "20px" }}>Sistema</p>
            <div className="settings-row">
                <div className="settings-row-info">
                    <p>Zona horaria</p>
                    <span>Para registros y reportes</span>
                </div>
                <select className="settings-select">
                    <option>América/México_City</option>
                    <option>UTC</option>
                </select>
            </div>
            <div className="settings-row">
                <div className="settings-row-info">
                    <p>Formato de fecha</p>
                    <span>Cómo se muestran las fechas</span>
                </div>
                <select className="settings-select">
                    <option>DD/MM/AAAA</option>
                    <option>MM/DD/AAAA</option>
                </select>
            </div>
        </div>
    );
}

function SettingsCuenta() {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarUsuario = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch("http://localhost/api/me", {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "No se pudo cargar la información"
                    );
                }

                setUsuario(data);
            } catch (err) {
                console.error("Error cargando usuario:", err);
                setError("No se pudo cargar la información de la cuenta.");
            } finally {
                setLoading(false);
            }
        };

        cargarUsuario();
    }, []);

    if (loading) {
        return (
            <div>
                <h3 className="settings-section-title">Mi cuenta</h3>
                <p>Cargando información...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h3 className="settings-section-title">Mi cuenta</h3>
                <p className="text-danger">{error}</p>
            </div>
        );
    }

    const nombre = usuario?.nombre || "Usuario";
    const rol = usuario?.rol || "Sin rol";
    const empresa = usuario?.empresa?.nombre || "Sin empresa";

    const iniciales = nombre
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((palabra) => palabra.charAt(0).toUpperCase())
        .join("");

    return (
        <div>
            <h3 className="settings-section-title">Mi cuenta</h3>

            <div className="settings-avatar-row">
                <div className="settings-avatar">
                    {iniciales || "U"}
                </div>

                <div>
                    <p className="settings-avatar-name">
                        {nombre}
                    </p>

                    <span className="settings-avatar-role">
                        {rol}
                    </span>
                </div>
            </div>

            <p className="settings-group-label">
                Información personal
            </p>

            <label className="settings-label">
                Nombre completo
            </label>

            <input
                className="settings-input"
                value={nombre}
                disabled
            />

            <label className="settings-label">
                Correo electrónico
            </label>

            <input
                className="settings-input"
                value={usuario?.email || ""}
                disabled
            />

            <label className="settings-label">
                Rol
            </label>

            <input
                className="settings-input"
                value={rol}
                disabled
            />

            <label className="settings-label">
                Empresa
            </label>

            <input
                className="settings-input"
                value={empresa}
                disabled
            />
        </div>
    );
}

function SettingsNotificaciones() {
    return (
        <div>
            <h3 className="settings-section-title">Notificaciones</h3>

            <p className="settings-group-label">Farmacia</p>
            <div className="settings-row">
                <div className="settings-row-info">
                    <p>Stock bajo</p>
                    <span>Alerta cuando un producto esté por agotarse</span>
                </div>
                <input type="checkbox" className="settings-toggle" defaultChecked />
            </div>
            <div className="settings-row">
                <div className="settings-row-info">
                    <p>Medicamentos por vencer</p>
                    <span>Aviso 30 días antes del vencimiento</span>
                </div>
                <input type="checkbox" className="settings-toggle" defaultChecked />
            </div>
            <div className="settings-row">
                <div className="settings-row-info">
                    <p>Nuevas órdenes de compra</p>
                    <span>Cuando almacén envíe una orden</span>
                </div>
                <input type="checkbox" className="settings-toggle" />
            </div>

            <p className="settings-group-label" style={{ marginTop: "20px" }}>Almacén</p>
            <div className="settings-row">
                <div className="settings-row-info">
                    <p>Recepción de mercancía</p>
                    <span>Confirmación de entradas al almacén</span>
                </div>
                <input type="checkbox" className="settings-toggle" defaultChecked />
            </div>
            <div className="settings-row">
                <div className="settings-row-info">
                    <p>Control de calidad</p>
                    <span>Productos que requieren revisión</span>
                </div>
                <input type="checkbox" className="settings-toggle" defaultChecked />
            </div>
        </div>
    );
}

function SettingsSuscripcion({ onClose }) {
    const navigate = useNavigate();
    const handleVerPlanes = () => {
        onClose();           // cierra el modal
        navigate("/suscripcion");  // navega a la vista
    };

    return (
        <div>
            <h3 className="settings-section-title">Suscripción</h3>

            <div className="settings-plan-card">
                <div>
                    <p className="settings-plan-name">Plan Standard</p>
                    <span className="settings-plan-detail">$79 / mes · Próxima renovación: 20 abr 2026</span>
                </div>
                <span className="settings-plan-badge">Activo</span>
            </div>

            <p className="settings-group-label">Opciones</p>
            <div className="settings-row">
                <div className="settings-row-info">
                    <p>Mejorar mi plan</p>
                    <span>Accede a funciones Platinum</span>
                </div>
                <button className="settings-btn-primary" onClick={handleVerPlanes}>
                    Ver planes
                </button>
            </div>
            <div className="settings-row">
                <div className="settings-row-info">
                    <p>Historial de pagos</p>
                    <span>Facturas y comprobantes</span>
                </div>
                <button className="settings-btn-secondary">Ver historial</button>
            </div>
            <div className="settings-row">
                <div className="settings-row-info">
                    <p>Cancelar suscripción</p>
                    <span>Se desactivará al finalizar el periodo</span>
                </div>
                <button className="settings-btn-danger">Cancelar</button>
            </div>
        </div>
    );
}

function SettingsSeguridad() {
    return (
        <div>
            <h3 className="settings-section-title">Seguridad</h3>

            <p className="settings-group-label">Contraseña</p>
            <label className="settings-label">Contraseña actual</label>
            <input className="settings-input" type="password" placeholder="••••••••" />

            <label className="settings-label">Nueva contraseña</label>
            <input className="settings-input" type="password" placeholder="••••••••" />

            <label className="settings-label">Confirmar nueva contraseña</label>
            <input className="settings-input" type="password" placeholder="••••••••" />

            <button className="settings-btn-save">Actualizar contraseña</button>

            <p className="settings-group-label" style={{ marginTop: "24px" }}>Sesiones activas</p>
            <div className="settings-row">
                <div className="settings-row-info">
                    <p>Este dispositivo</p>
                    <span>Chrome · Mérida, MX · Ahora mismo</span>
                </div>
                <span className="settings-session-active">● Activa</span>
            </div>
        </div>
    );
}

export default SettingsModal;