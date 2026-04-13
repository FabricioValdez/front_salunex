import { useState } from "react";
import { CheckCircle, RotateCcw } from "lucide-react";
import PageContainer from "../../components/ui/PageContainer";
import { useCatalogos } from "../../context/CatalogosContext";
import api from "../../services/api";

// ── Badge de estado ──
function EstadoBadge({ estado }) {
    const estilos = {
        "Expirado":    { background: "#fef2f2", color: "#ef4444" },
        "Por expirar": { background: "#fffbeb", color: "#f59e0b" },
        "Por revisar": { background: "#eff6ff", color: "#3b82f6" },
    };
    const estilo = estilos[estado] || { background: "#f3f4f6", color: "#6b7280" };
    return (
        <span style={{
            ...estilo,
            padding: "3px 12px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 500,
        }}>
            {estado}
        </span>
    );
}

function getEstado(fecha) {
    if (!fecha) return null;
    const diff = Math.ceil((new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0)   return "Expirado";
    if (diff <= 30) return "Por expirar";
    if (diff <= 90) return "Por revisar";
    return null; // Vigente no aparece en control de calidad
}

function ControlCalidadFarmacia() {
    const { inventario, refreshCatalogo } = useCatalogos();
    const [seleccionado, setSeleccionado] = useState(null);
    const [notas, setNotas]               = useState("");
    const [loading, setLoading]           = useState(false);

    // Solo mostrar items que necesitan revisión
    const pendientes = inventario.filter((item) => {
        const estado = getEstado(item.fecha_expiracion);
        return estado !== null;
    });

    const handleSeleccionar = (item) => {
        setSeleccionado(item);
        setNotas("");
    };

    const handleAprobar = async () => {
        if (!seleccionado) return;
        setLoading(true);
        try {
            // Marcar como aprobado actualizando la cantidad o algún flag
            // Por ahora actualizamos el registro y lo quitamos de la lista
            await api.put(`/inventario/${seleccionado.id}`, {
                id_producto:      seleccionado.id_producto,
                id_almacen:       seleccionado.id_almacen,
                id_farmacia:      seleccionado.id_farmacia,
                cantidad:         seleccionado.cantidad,
                lote:             seleccionado.lote,
                fecha_expiracion: null, // Limpiar fecha para que salga de la lista
            });
            const actualizados = inventario.map((i) =>
                i.id === seleccionado.id ? { ...i, fecha_expiracion: null } : i
            );
            refreshCatalogo('inventario', actualizados);
            setSeleccionado(null);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDevolucion = async () => {
        if (!seleccionado) return;
        setLoading(true);
        try {
            await api.delete(`/inventario/${seleccionado.id}`);
            const actualizados = inventario.filter((i) => i.id !== seleccionado.id);
            refreshCatalogo('inventario', actualizados);
            setSeleccionado(null);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <div className="dashboard-title">
                <h1>Control de calidad y caducidad</h1>
                <p>Revisar los lotes marcados, gestionar la fecha de vencimiento e inspeccionar el estado del empaque.</p>
            </div>

            <div style={{ display: "flex", gap: 16 }}>
                {/* ── Panel izquierdo — Lista ── */}
                <div style={{
                    flex: "0 0 45%",
                    background: "white",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    overflow: "hidden",
                }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Artículos pendientes de revisión</h3>
                    </div>

                    <div>
                        {pendientes.length === 0 ? (
                            <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
                                <p>No hay artículos pendientes</p>
                            </div>
                        ) : pendientes.map((item) => {
                            const estado = getEstado(item.fecha_expiracion);
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => handleSeleccionar(item)}
                                    style={{
                                        padding: "14px 20px",
                                        borderBottom: "1px solid #f3f4f6",
                                        cursor: "pointer",
                                        background: seleccionado?.id === item.id ? "#eff6ff" : "white",
                                        borderLeft: seleccionado?.id === item.id ? "3px solid #3b82f6" : "3px solid transparent",
                                        transition: "all 0.15s",
                                    }}
                                    onMouseEnter={(e) => { if (seleccionado?.id !== item.id) e.currentTarget.style.background = "#f9fafb"; }}
                                    onMouseLeave={(e) => { if (seleccionado?.id !== item.id) e.currentTarget.style.background = "white"; }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.producto}</p>
                                            <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{item.lote}</p>
                                        </div>
                                        <EstadoBadge estado={estado} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Panel derecho — Detalle ── */}
                <div style={{ flex: 1 }}>
                    {!seleccionado ? (
                        <div style={{
                            background: "white",
                            borderRadius: 12,
                            border: "1px solid #e5e7eb",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: 300,
                        }}>
                            <p style={{ color: "#9ca3af" }}>Selecciona un artículo para ver el detalle</p>
                        </div>
                    ) : (
                        <div style={{
                            background: "white",
                            borderRadius: 12,
                            border: "1px solid #e5e7eb",
                            padding: 24,
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Detalle de inspección</h3>
                                <span style={{ fontSize: 12, color: "#6b7280" }}>Revisando Lote #{seleccionado.lote}</span>
                            </div>

                            {/* Grid de datos */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>Nombre del medicamento</p>
                                    <p style={{ margin: 0, fontWeight: 600 }}>{seleccionado.producto}</p>
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>Número de lote</p>
                                    <p style={{ margin: 0, fontWeight: 600 }}>{seleccionado.lote}</p>
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>Fecha de expiración</p>
                                    <p style={{ margin: 0, fontWeight: 600 }}>
                                        {seleccionado.fecha_expiracion
                                            ? new Date(seleccionado.fecha_expiracion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                                            : "—"
                                        }
                                    </p>
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>Cantidad</p>
                                    <p style={{ margin: 0, fontWeight: 600 }}>{seleccionado.cantidad} Unidades</p>
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>Almacén</p>
                                    <p style={{ margin: 0, fontWeight: 600 }}>{seleccionado.almacen}</p>
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>Categoría</p>
                                    <p style={{ margin: 0, fontWeight: 600 }}>{seleccionado.categoria}</p>
                                </div>
                            </div>

                            {/* Notas */}
                            <div style={{ marginBottom: 20 }}>
                                <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 500 }}>Notas de inspección</p>
                                <textarea
                                    className="form-control"
                                    rows={4}
                                    value={notas}
                                    onChange={(e) => setNotas(e.target.value)}
                                    placeholder="Ingresa hallazgos, estado físico del embalaje o resultados de verificación..."
                                />
                            </div>

                            {/* Botones */}
                            <div style={{ display: "flex", gap: 12 }}>
                                <button
                                    onClick={handleAprobar}
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        padding: "10px 16px",
                                        background: "#22c55e",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 8,
                                        cursor: "pointer",
                                        fontWeight: 600,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 8,
                                    }}
                                >
                                    <CheckCircle size={16} />
                                    Aprobar inventario
                                </button>
                                <button
                                    onClick={handleDevolucion}
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        padding: "10px 16px",
                                        background: "#f59e0b",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 8,
                                        cursor: "pointer",
                                        fontWeight: 600,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 8,
                                    }}
                                >
                                    <RotateCcw size={16} />
                                    Marcar para devolución
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
}

export default ControlCalidadFarmacia;