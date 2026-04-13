import { useState } from "react";
import { Plus, X, Search, Clock, AlertTriangle, DollarSign } from "lucide-react";
import PageContainer from "../../components/ui/PageContainer";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { useCatalogos } from "../../context/CatalogosContext";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import api from "../../services/api";

// ── Badge de estatus ──
function EstatusBadge({ estatus }) {
    const colores = {
        Enviado:    { background: "#eff6ff", color: "#3b82f6" },
        Completado: { background: "#f0fdf4", color: "#22c55e" },
        Cancelado:  { background: "#fef2f2", color: "#ef4444" },
    };
    const estilo = colores[estatus] || { background: "#f3f4f6", color: "#6b7280" };
    return (
        <span style={{
            ...estilo,
            padding: "4px 12px",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 500,
        }}>
            {estatus}
        </span>
    );
}

// ── Panel detalle de orden ──
function DetalleOrden({ orden, detalle, onClose }) {
    const total = detalle.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    return (
        <div style={{
            background: "white",
            borderRadius: 12,
            padding: 24,
            border: "1px solid #e5e7eb",
            height: "100%",
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>ORD-{String(orden.id).padStart(3, '0')}</h2>
                        <EstatusBadge estatus={orden.estatus} />
                    </div>
                    <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 14 }}>
                        {orden.farmacia} • {new Date(orden.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                </div>
                <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#6b7280" }}>
                    <X size={20} />
                </button>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Medicamentos</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {detalle.length === 0 ? (
                    <p style={{ color: "#9ca3af", textAlign: "center", padding: 20 }}>Sin productos</p>
                ) : detalle.map((item) => (
                    <div key={item.id} style={{
                        padding: "12px 16px",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}>
                        <div>
                            <p style={{ margin: 0, fontWeight: 600 }}>{item.producto}</p>
                            <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>Cantidad: {item.cantidad}</p>
                        </div>
                        <span style={{ fontWeight: 600 }}>${(item.precio * item.cantidad).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            {detalle.length > 0 && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 700 }}>
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Modal nueva orden ──
function NuevaOrdenModal({ isOpen, onClose, almacenes, productos, onSubmit, loading }) {
    const [busqueda, setBusqueda] = useState("");
    const [carrito, setCarrito]  = useState([]);
    const [idAlmacen, setIdAlmacen] = useState("");

    const productosFiltrados = productos.filter((p) =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    const agregarProducto = (producto) => {
        const existe = carrito.find((c) => c.id_producto === producto.id);
        if (existe) {
            setCarrito(carrito.map((c) =>
                c.id_producto === producto.id ? { ...c, cantidad: c.cantidad + 1 } : c
            ));
        } else {
            setCarrito([...carrito, {
                id_producto: producto.id,
                nombre:      producto.nombre,
                precio:      producto.precio,
                cantidad:    1,
            }]);
        }
        setBusqueda("");
    };

    const cambiarCantidad = (id_producto, cantidad) => {
        if (cantidad < 1) {
            setCarrito(carrito.filter((c) => c.id_producto !== id_producto));
        } else {
            setCarrito(carrito.map((c) =>
                c.id_producto === id_producto ? { ...c, cantidad } : c
            ));
        }
    };

    const total = carrito.reduce((acc, c) => acc + c.precio * c.cantidad, 0);

    const handleGuardar = () => {
        onSubmit({ id_almacen: idAlmacen, detalle: carrito });
        setCarrito([]);
        setIdAlmacen("");
        setBusqueda("");
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Orden de Compra" className="modal-lg">
            <div className="row">
                {/* ── Izquierda ── */}
                <div className="col-6">
                    <div className="mb-3">
                        <label className="form-label">Almacén proveedor</label>
                        <select
                            className="form-select"
                            value={idAlmacen}
                            onChange={(e) => setIdAlmacen(e.target.value)}
                        >
                            <option value="">Selecciona un almacén</option>
                            {almacenes.map((a) => (
                                <option key={a.id} value={a.id}>{a.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Buscar medicamento</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar medicamento..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                style={{ paddingRight: 36 }}
                            />
                            <Search size={16} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                        </div>

                        {busqueda && (
                            <div style={{
                                border: "1px solid #e5e7eb",
                                borderRadius: 8,
                                marginTop: 4,
                                maxHeight: 180,
                                overflowY: "auto",
                                background: "white",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            }}>
                                {productosFiltrados.length === 0 ? (
                                    <p style={{ padding: "10px 14px", color: "#9ca3af", margin: 0 }}>Sin resultados</p>
                                ) : productosFiltrados.map((p) => (
                                    <div
                                        key={p.id}
                                        onClick={() => agregarProducto(p)}
                                        style={{
                                            padding: "10px 14px",
                                            cursor: "pointer",
                                            borderBottom: "1px solid #f3f4f6",
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                                        onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                                    >
                                        <p style={{ margin: 0, fontWeight: 500 }}>{p.nombre}</p>
                                        <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>${p.precio}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Derecha ── */}
                <div className="col-6">
                    <p style={{ fontWeight: 600, marginBottom: 8 }}>Productos seleccionados</p>
                    <div style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        minHeight: 180,
                        padding: 8,
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                    }}>
                        {carrito.length === 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 160, color: "#9ca3af" }}>
                                <p style={{ margin: 0, fontWeight: 500 }}>Busca y agrega medicamentos</p>
                                <p style={{ margin: 0, fontSize: 13 }}>Los productos aparecerán aquí</p>
                            </div>
                        ) : carrito.map((item) => (
                            <div key={item.id_producto} style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "8px 10px",
                                background: "#f9fafb",
                                borderRadius: 6,
                            }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{item.nombre}</p>
                                    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>${item.precio}</p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <button onClick={() => cambiarCantidad(item.id_producto, item.cantidad - 1)}
                                        style={{ width: 24, height: 24, borderRadius: 4, border: "1px solid #d1d5db", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                                    <span style={{ fontSize: 13, minWidth: 20, textAlign: "center" }}>{item.cantidad}</span>
                                    <button onClick={() => cambiarCantidad(item.id_producto, item.cantidad + 1)}
                                        style={{ width: 24, height: 24, borderRadius: 4, border: "1px solid #d1d5db", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontWeight: 600, fontSize: 15 }}>
                        <span>Total</span>
                        <span>${total.toFixed(2)} MXN</span>
                    </div>
                </div>
            </div>

            <div className="d-flex gap-2 justify-content-end mt-3">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button variant="primary" onClick={handleGuardar} disabled={loading || carrito.length === 0 || !idAlmacen}>
                    {loading ? "Guardando..." : "Guardar Orden"}
                </Button>
            </div>
        </Modal>
    );
}

// ── Página principal ──
function OrdenesDeCompra() {
    const { movimientos, almacenes, productos, refreshCatalogo } = useCatalogos();
    const { user } = useContext(AuthContext);

    const [search, setSearch]             = useState("");
    const [loading, setLoading]           = useState(false);
    const [modalOpen, setModalOpen]       = useState(false);
    const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
    const [detalleOrden, setDetalleOrden] = useState([]);
    const [loadingDetalle, setLoadingDetalle] = useState(false);

    // Filtrar solo órdenes de compra (tipo 4) de la farmacia del usuario
    const ordenes = movimientos.filter((m) => m.id_tipo_movimiento === 4);

    const ordenesFiltradas = ordenes.filter((o) =>
        String(o.id).includes(search) ||
        o.farmacia?.toLowerCase().includes(search.toLowerCase()) ||
        o.almacen?.toLowerCase().includes(search.toLowerCase())
    );

    // Stats
    const pendientes = ordenes.filter((o) => o.estatus === 'Enviado').length;
    const canceladas = ordenes.filter((o) => o.estatus === 'Cancelado').length;
    const valorTotal = ordenes.reduce((acc, o) => acc + (o.total || 0), 0);

    const handleVerDetalle = async (orden) => {
        setOrdenSeleccionada(orden);
        setLoadingDetalle(true);
        try {
            const res = await api.get(`/movimientos/${orden.id}`);
            setDetalleOrden(res.data.detalle);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingDetalle(false);
        }
    };

    const handleSubmitOrden = async ({ id_almacen, detalle }) => {
        setLoading(true);
        try {
            const res = await api.post('/movimientos', {
                id_farmacia:        user.id_farmacia,
                id_almacen:         id_almacen,
                id_usuario:         user.id,
                id_tipo_movimiento: 4,
                detalle:            detalle,
            });
            refreshCatalogo('movimientos', [...movimientos, res.data.movimiento]);
            setModalOpen(false);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <div className="dashboard-title">
                <h1>Órdenes de compra</h1>
                <p>Gestionar los flujos de trabajo de reposición y adquisición de proveedores.</p>
            </div>

            {/* ── Stats ── */}
            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                <div style={{ flex: 1, background: "white", borderRadius: 12, padding: "16px 20px", border: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>Órdenes pendientes</p>
                        <p style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>{pendientes}</p>
                    </div>
                    <div style={{ background: "#eff6ff", borderRadius: 10, padding: 10 }}>
                        <Clock size={22} color="#3b82f6" />
                    </div>
                </div>
                <div style={{ flex: 1, background: "white", borderRadius: 12, padding: "16px 20px", border: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>Canceladas</p>
                        <p style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>{canceladas}</p>
                    </div>
                    <div style={{ background: "#fef2f2", borderRadius: 10, padding: 10 }}>
                        <AlertTriangle size={22} color="#ef4444" />
                    </div>
                </div>
                <div style={{ flex: 1, background: "white", borderRadius: 12, padding: "16px 20px", border: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>Valor total</p>
                        <p style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>${valorTotal.toFixed(2)}</p>
                    </div>
                    <div style={{ background: "#f0fdf4", borderRadius: 10, padding: 10 }}>
                        <DollarSign size={22} color="#22c55e" />
                    </div>
                </div>
            </div>

            {/* ── Buscador y botón ── */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
                <div style={{ flex: 1, position: "relative" }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar Order ID, Proveedor..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingRight: 36 }}
                    />
                    <Search size={16} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                </div>
                <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>
                    Nueva Orden
                </Button>
            </div>

            {/* ── Layout tabla + detalle ── */}
            <div style={{ display: "flex", gap: 16 }}>
                {/* Tabla */}
                <div style={{
                    flex: ordenSeleccionada ? "0 0 55%" : 1,
                    background: "white",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    overflow: "hidden",
                    transition: "flex 0.2s ease",
                }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                                {["Orden ID", "Almacén", "Fecha", "Estatus"].map((col) => (
                                    <th key={col} style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {ordenesFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>
                                        No hay órdenes registradas
                                    </td>
                                </tr>
                            ) : ordenesFiltradas.map((orden) => (
                                <tr
                                    key={orden.id}
                                    onClick={() => handleVerDetalle(orden)}
                                    style={{
                                        borderBottom: "1px solid #f3f4f6",
                                        cursor: "pointer",
                                        background: ordenSeleccionada?.id === orden.id ? "#f0f7ff" : "white",
                                        transition: "background 0.15s",
                                    }}
                                    onMouseEnter={(e) => { if (ordenSeleccionada?.id !== orden.id) e.currentTarget.style.background = "#f9fafb"; }}
                                    onMouseLeave={(e) => { if (ordenSeleccionada?.id !== orden.id) e.currentTarget.style.background = "white"; }}
                                >
                                    <td style={{ padding: "14px 16px", color: "#3b82f6", fontWeight: 500 }}>
                                        ORD-{String(orden.id).padStart(3, '0')}
                                    </td>
                                    <td style={{ padding: "14px 16px" }}>{orden.almacen}</td>
                                    <td style={{ padding: "14px 16px", color: "#6b7280", fontSize: 14 }}>
                                        {new Date(orden.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td style={{ padding: "14px 16px" }}>
                                        <EstatusBadge estatus={orden.estatus} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Panel detalle */}
                {ordenSeleccionada && (
                    <div style={{ flex: "0 0 43%" }}>
                        {loadingDetalle ? (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
                                <p style={{ color: "#9ca3af" }}>Cargando detalle...</p>
                            </div>
                        ) : (
                            <DetalleOrden
                                orden={ordenSeleccionada}
                                detalle={detalleOrden}
                                onClose={() => setOrdenSeleccionada(null)}
                            />
                        )}
                    </div>
                )}
            </div>

            <NuevaOrdenModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                almacenes={almacenes}
                productos={productos}
                onSubmit={handleSubmitOrden}
                loading={loading}
            />
        </PageContainer>
    );
}

export default OrdenesDeCompra;