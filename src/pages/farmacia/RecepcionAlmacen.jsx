import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import PageContainer from "../../components/ui/PageContainer";
import { useCatalogos } from "../../context/CatalogosContext";
import api from "../../services/api";

// ── Badge de estatus ──
function EstatusBadge({ estatus }) {
    const estilos = {
        Enviado:     { background: "#eff6ff", color: "#3b82f6" },
        Completado:  { background: "#f0fdf4", color: "#22c55e" },
        Cancelado:   { background: "#fef2f2", color: "#ef4444" },
    };
    const estilo = estilos[estatus] || { background: "#f3f4f6", color: "#6b7280" };
    return (
        <span style={{
            ...estilo,
            padding: "3px 12px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 500,
        }}>
            {estatus}
        </span>
    );
}

// ── Badge estatus detalle ──
function EstatusDetalleBadge({ estatus }) {
    const estilos = {
        Pendiente:        { background: "#f3f4f6", color: "#6b7280" },
        Confirmado:       { background: "#f0fdf4", color: "#22c55e" },
        "Con diferencias": { background: "#fffbeb", color: "#f59e0b" },
    };
    const estilo = estilos[estatus] || { background: "#f3f4f6", color: "#6b7280" };
    return (
        <span style={{
            ...estilo,
            padding: "2px 10px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 500,
        }}>
            {estatus}
        </span>
    );
}

function RecepcionAlmacen() {
    const { movimientos, refreshCatalogo } = useCatalogos();
    const [seleccionado, setSeleccionado]   = useState(null);
    const [detalle, setDetalle]             = useState([]);
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    const [loading, setLoading]             = useState(false);

    // Solo órdenes de compra
    const ordenes = movimientos.filter((m) => m.id_tipo_movimiento === 4);

    const handleSeleccionar = async (orden) => {
        setSeleccionado(orden);
        setLoadingDetalle(true);
        try {
            const res = await api.get(`/movimientos/${orden.id}`);
            // Inicializar cantidad_recibida con la cantidad pedida
            const detalleInicial = res.data.detalle.map((item) => ({
                ...item,
                cantidad_recibida: item.cantidad_recibida || item.cantidad,
                notas: item.notas || "",
            }));
            setDetalle(detalleInicial);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingDetalle(false);
        }
    };

    const handleCantidadRecibida = (id, valor) => {
        setDetalle(detalle.map((item) =>
            item.id === id ? { ...item, cantidad_recibida: Number(valor) } : item
        ));
    };

    const handleNotas = (id, valor) => {
        setDetalle(detalle.map((item) =>
            item.id === id ? { ...item, notas: valor } : item
        ));
    };

    const handleConfirmar = async (cancelar = false) => {
        setLoading(true);
        try {
            await api.put(`/movimientos/${seleccionado.id}/recepcion`, {
                cancelar,
                detalle: detalle.map((item) => ({
                    id:                item.id,
                    cantidad_recibida: item.cantidad_recibida,
                    notas:             item.notas,
                })),
            });

            // Actualizar estatus en el contexto
            const nuevoEstatus = cancelar ? 'Cancelado' : 'Completado';
            const actualizados = movimientos.map((m) =>
                m.id === seleccionado.id ? { ...m, estatus: nuevoEstatus } : m
            );
            refreshCatalogo('movimientos', actualizados);
            setSeleccionado({ ...seleccionado, estatus: nuevoEstatus });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <div className="dashboard-title">
                <h1>Recepción de almacén</h1>
                <p>Gestiona los flujos de trabajo de reposición y adquisición de proveedores.</p>
            </div>

            <div style={{ display: "flex", gap: 16 }}>
                {/* ── Panel izquierdo — Lista órdenes ── */}
                <div style={{
                    flex: "0 0 45%",
                    background: "white",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    overflow: "hidden",
                }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                                {["Orden ID", "Fecha recibida", "Artículos", "Estatus", "Acción"].map((col) => (
                                    <th key={col} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {ordenes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>
                                        No hay órdenes registradas
                                    </td>
                                </tr>
                            ) : ordenes.map((orden) => (
                                <tr
                                    key={orden.id}
                                    style={{
                                        borderBottom: "1px solid #f3f4f6",
                                        background: seleccionado?.id === orden.id ? "#f0f7ff" : "white",
                                        borderLeft: seleccionado?.id === orden.id ? "3px solid #3b82f6" : "3px solid transparent",
                                    }}
                                >
                                    <td style={{ padding: "14px 16px", color: "#3b82f6", fontWeight: 500 }}>
                                        OC-{String(orden.id).padStart(4, '0')}
                                    </td>
                                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#6b7280" }}>
                                        {new Date(orden.fecha).toLocaleDateString('es-MX', {
                                            day: '2-digit', month: 'short', year: 'numeric'
                                        })}
                                    </td>
                                    <td style={{ padding: "14px 16px", fontSize: 13 }}>
                                        {orden.total_articulos ?? "—"}
                                    </td>
                                    <td style={{ padding: "14px 16px" }}>
                                        <EstatusBadge estatus={orden.estatus} />
                                    </td>
                                    <td style={{ padding: "14px 16px" }}>
                                        {orden.estatus === 'Enviado' ? (
                                            <button
                                                onClick={() => handleSeleccionar(orden)}
                                                style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontWeight: 500, fontSize: 13 }}
                                            >
                                                Revisar
                                            </button>
                                        ) : orden.estatus === 'Completado' ? (
                                            <button
                                                onClick={() => handleSeleccionar(orden)}
                                                style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 13 }}
                                            >
                                                Ver detalle
                                            </button>
                                        ) : (
                                            <span style={{ color: "#9ca3af", fontSize: 13 }}>Cancelado</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Panel derecho — Detalle ── */}
                <div style={{ flex: 1 }}>
                    {!seleccionado ? (
                        <div style={{
                            background: "white",
                            borderRadius: 12,
                            border: "1px solid #e5e7eb",
                            height: "100%",
                            minHeight: 300,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            <p style={{ color: "#9ca3af" }}>Selecciona una orden para ver el detalle</p>
                        </div>
                    ) : loadingDetalle ? (
                        <div style={{
                            background: "white",
                            borderRadius: 12,
                            border: "1px solid #e5e7eb",
                            height: "100%",
                            minHeight: 300,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            <p style={{ color: "#9ca3af" }}>Cargando detalle...</p>
                        </div>
                    ) : (
                        <div style={{
                            background: "white",
                            borderRadius: 12,
                            border: "1px solid #e5e7eb",
                            padding: 24,
                        }}>
                            {/* Header */}
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                                        OC-{String(seleccionado.id).padStart(4, '0')}
                                    </h3>
                                    <EstatusBadge estatus={seleccionado.estatus} />
                                </div>
                                <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>
                                    {seleccionado.almacen} • {new Date(seleccionado.fecha).toLocaleDateString('es-MX', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                    })}
                                </p>
                            </div>

                            {/* Tabla detalle */}
                            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                                        {["Medicamento", "Lote", "Esperados", "Recibidos", "Notas", "Estatus"].map((col) => (
                                            <th key={col} style={{ padding: "10px 12px", textAlign: "left", fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {detalle.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                            <td style={{ padding: "12px", fontWeight: 500, fontSize: 13 }}>{item.producto}</td>
                                            <td style={{ padding: "12px", color: "#6b7280", fontSize: 12 }}>{item.codigo_interno}</td>
                                            <td style={{ padding: "12px", fontSize: 13 }}>{item.cantidad}</td>
                                            <td style={{ padding: "12px" }}>
                                                {seleccionado.estatus === 'Enviado' ? (
                                                    <input
                                                        type="number"
                                                        value={item.cantidad_recibida}
                                                        onChange={(e) => handleCantidadRecibida(item.id, e.target.value)}
                                                        style={{
                                                            width: 70,
                                                            padding: "4px 8px",
                                                            border: "1px solid #d1d5db",
                                                            borderRadius: 6,
                                                            fontSize: 13,
                                                        }}
                                                    />
                                                ) : (
                                                    <span style={{ fontSize: 13 }}>{item.cantidad_recibida}</span>
                                                )}
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                {seleccionado.estatus === 'Enviado' ? (
                                                    <input
                                                        type="text"
                                                        value={item.notas}
                                                        onChange={(e) => handleNotas(item.id, e.target.value)}
                                                        placeholder="Notas..."
                                                        style={{
                                                            width: "100%",
                                                            padding: "4px 8px",
                                                            border: "1px solid #d1d5db",
                                                            borderRadius: 6,
                                                            fontSize: 12,
                                                        }}
                                                    />
                                                ) : (
                                                    <span style={{ fontSize: 12, color: "#6b7280" }}>{item.notas || "—"}</span>
                                                )}
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                <EstatusDetalleBadge estatus={item.estatus || "Pendiente"} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Botones — solo si está Enviado */}
                            {seleccionado.estatus === 'Enviado' && (
                                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                                    <button
                                        onClick={() => handleConfirmar(true)}
                                        disabled={loading}
                                        style={{
                                            padding: "10px 20px",
                                            background: "#fef2f2",
                                            color: "#ef4444",
                                            border: "1px solid #fecaca",
                                            borderRadius: 8,
                                            cursor: "pointer",
                                            fontWeight: 600,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                        }}
                                    >
                                        <XCircle size={16} />
                                        Cancelar orden
                                    </button>
                                    <button
                                        onClick={() => handleConfirmar(false)}
                                        disabled={loading}
                                        style={{
                                            padding: "10px 20px",
                                            background: "#22c55e",
                                            color: "white",
                                            border: "none",
                                            borderRadius: 8,
                                            cursor: "pointer",
                                            fontWeight: 600,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                        }}
                                    >
                                        <CheckCircle size={16} />
                                        Confirmar recepción
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
}

export default RecepcionAlmacen;