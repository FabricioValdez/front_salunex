import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import PageContainer from "../../components/ui/PageContainer";
import Table from "../../components/ui/Table/Table";
import { useCatalogos } from "../../context/CatalogosContext";
import api from "../../services/api";
import "../../styles/farmacia/RecepcionAlmacen.css";

function EstatusBadge({ estatus }) {
    const clase = {
        Enviado:    "enviado",
        Completado: "completado",
        Cancelado:  "cancelado",
    }[estatus] || "";
    return <span className={`badge-estatus ${clase}`}>{estatus}</span>;
}

function EstatusDetalleBadge({ estatus }) {
    const clase = {
        Pendiente:          "por-revisar",
        Confirmado:         "vigente",
        "Con diferencias":  "por-expirar",
    }[estatus] || "";
    return <span className={`badge-estatus ${clase}`}>{estatus}</span>;
}

function RecepcionAlmacen() {
    const { movimientos, refreshCatalogo }          = useCatalogos();
    const [seleccionado, setSeleccionado]           = useState(null);
    const [detalle, setDetalle]                     = useState([]);
    const [loadingDetalle, setLoadingDetalle]       = useState(false);
    const [loading, setLoading]                     = useState(false);

    const ordenes = movimientos.filter((m) => m.id_tipo_movimiento === 4);

    const handleSeleccionar = async (orden) => {
        setSeleccionado(orden);
        setLoadingDetalle(true);
        try {
            const res = await api.get(`/movimientos/${orden.id}`);
            setDetalle(res.data.detalle.map((item) => ({
                ...item,
                cantidad_recibida: item.cantidad_recibida || item.cantidad,
                notas: item.notas || "",
            })));
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
                    id: item.id,
                    cantidad_recibida: item.cantidad_recibida,
                    notas: item.notas,
                })),
            });
            const nuevoEstatus = cancelar ? 'Cancelado' : 'Completado';
            refreshCatalogo('movimientos', movimientos.map((m) =>
                m.id === seleccionado.id ? { ...m, estatus: nuevoEstatus } : m
            ));
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

            <div className="recepcion-layout">
                {/* ── Panel izquierdo ── */}
                <div className="panel-lista" style={{ flex: "0 0 45%" }}>
                    <Table
                        columns={["Orden ID", "Fecha recibida", "Artículos", "Estatus", "Acción"]}
                        data={ordenes}
                        renderRow={(orden) => (
                            <tr key={orden.id} style={{
                                background: seleccionado?.id === orden.id ? "#f0f7ff" : "white",
                                borderLeft: seleccionado?.id === orden.id ? "3px solid #3b82f6" : "3px solid transparent",
                            }}>
                                <td style={{ color: "#3b82f6", fontWeight: 500 }}>
                                    OC-{String(orden.id).padStart(4, '0')}
                                </td>
                                <td style={{ fontSize: 13, color: "#6b7280" }}>
                                    {new Date(orden.fecha).toLocaleDateString('es-MX', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                    })}
                                </td>
                                <td style={{ fontSize: 13 }}>{orden.total_articulos ?? "—"}</td>
                                <td><EstatusBadge estatus={orden.estatus} /></td>
                                <td>
                                    {orden.estatus === 'Enviado' ? (
                                        <button onClick={() => handleSeleccionar(orden)}
                                            style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontWeight: 500, fontSize: 13 }}>
                                            Revisar
                                        </button>
                                    ) : orden.estatus === 'Completado' ? (
                                        <button onClick={() => handleSeleccionar(orden)}
                                            style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 13 }}>
                                            Ver detalle
                                        </button>
                                    ) : (
                                        <span style={{ color: "#9ca3af", fontSize: 13 }}>Cancelado</span>
                                    )}
                                </td>
                            </tr>
                        )}
                    />
                </div>

                {/* ── Panel derecho ── */}
                {!seleccionado ? (
                    <div className="panel-vacio" style={{ flex: 1 }}>
                        <p>Selecciona una orden para ver el detalle</p>
                    </div>
                ) : loadingDetalle ? (
                    <div className="panel-vacio" style={{ flex: 1 }}>
                        <p>Cargando detalle...</p>
                    </div>
                ) : (
                    <div className="recepcion-detalle">
                        <div className="recepcion-detalle-header">
                            <div className="recepcion-detalle-titulo">
                                <h3>OC-{String(seleccionado.id).padStart(4, '0')}</h3>
                                <EstatusBadge estatus={seleccionado.estatus} />
                            </div>
                            <p className="recepcion-detalle-sub">
                                {seleccionado.almacen} • {new Date(seleccionado.fecha).toLocaleDateString('es-MX', {
                                    day: '2-digit', month: 'short', year: 'numeric'
                                })}
                            </p>
                        </div>

                        <Table
                            columns={["Medicamento", "Lote", "Esperados", "Recibidos", "Notas", "Estatus"]}
                            data={detalle}
                            renderRow={(item) => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: 500, fontSize: 13 }}>{item.producto}</td>
                                    <td style={{ color: "#6b7280", fontSize: 12 }}>{item.codigo_interno}</td>
                                    <td style={{ fontSize: 13 }}>{item.cantidad}</td>
                                    <td>
                                        {seleccionado.estatus === 'Enviado' ? (
                                            <input type="number" className="recepcion-input"
                                                value={item.cantidad_recibida}
                                                onChange={(e) => handleCantidadRecibida(item.id, e.target.value)} />
                                        ) : (
                                            <span style={{ fontSize: 13 }}>{item.cantidad_recibida}</span>
                                        )}
                                    </td>
                                    <td>
                                        {seleccionado.estatus === 'Enviado' ? (
                                            <input type="text" className="recepcion-input-notas"
                                                value={item.notas}
                                                onChange={(e) => handleNotas(item.id, e.target.value)}
                                                placeholder="Notas..." />
                                        ) : (
                                            <span style={{ fontSize: 12, color: "#6b7280" }}>{item.notas || "—"}</span>
                                        )}
                                    </td>
                                    <td><EstatusDetalleBadge estatus={item.estatus || "Pendiente"} /></td>
                                </tr>
                            )}
                        />

                        {seleccionado.estatus === 'Enviado' && (
                            <div className="recepcion-acciones">
                                <button className="recepcion-btn-cancelar"
                                    onClick={() => handleConfirmar(true)} disabled={loading}>
                                    <XCircle size={16} />
                                    Cancelar orden
                                </button>
                                <button className="recepcion-btn-confirmar"
                                    onClick={() => handleConfirmar(false)} disabled={loading}>
                                    <CheckCircle size={16} />
                                    Confirmar recepción
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PageContainer>
    );
}

export default RecepcionAlmacen;