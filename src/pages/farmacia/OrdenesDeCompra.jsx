import { useState, useContext } from "react";
import { Plus, X, Search, Clock, AlertTriangle, DollarSign } from "lucide-react";
import PageContainer from "../../components/ui/PageContainer";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { useCatalogos } from "../../context/CatalogosContext";
import AuthContext from "../../context/AuthContext";
import api from "../../services/api";
import Table from "../../components/ui/Table/Table";
import "../../styles/farmacia/OrdenesDeCompra.css";

function EstatusBadge({ estatus }) {
    const clase = {
        Enviado: "enviado",
        Completado: "completado",
        Cancelado: "cancelado",
    }[estatus] || "";
    return <span className={`badge-estatus ${clase}`}>{estatus}</span>;
}

function DetalleOrden({ orden, detalle, onClose }) {
    const total = detalle.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    return (
        <div className="orden-detalle">
            <div className="orden-detalle-header">
                <div>
                    <div className="orden-detalle-titulo">
                        <h2>ORD-{String(orden.id).padStart(3, '0')}</h2>
                        <EstatusBadge estatus={orden.estatus} />
                    </div>
                    <p className="orden-detalle-sub">
                        {orden.farmacia} • {new Date(orden.fecha).toLocaleDateString('es-MX', {
                            day: '2-digit', month: 'short', year: 'numeric'
                        })}
                    </p>
                </div>
                <button className="orden-detalle-close" onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Medicamentos</h3>

            <div className="orden-productos">
                {detalle.length === 0 ? (
                    <p style={{ color: "#9ca3af", textAlign: "center", padding: 20 }}>Sin productos</p>
                ) : detalle.map((item) => (
                    <div key={item.id} className="orden-producto-item">
                        <div>
                            <p>{item.producto}</p>
                            <span>Cantidad: {item.cantidad}</span>
                        </div>
                        <span style={{ fontWeight: 600 }}>${(item.precio * item.cantidad).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            {detalle.length > 0 && (
                <div className="orden-total">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            )}
        </div>
    );
}

function NuevaOrdenModal({ isOpen, onClose, almacenes, productos, onSubmit, loading }) {
    const [busqueda, setBusqueda] = useState("");
    const [carrito, setCarrito] = useState([]);
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
            setCarrito([...carrito, { id_producto: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 }]);
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
        setCarrito([]); setIdAlmacen(""); setBusqueda("");
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Orden de Compra" className="modal-lg">
            <div className="row">
                <div className="col-6">
                    <div className="mb-3">
                        <label className="form-label">Almacén proveedor</label>
                        <select className="form-select" value={idAlmacen}
                            onChange={(e) => setIdAlmacen(e.target.value)}>
                            <option value="">Selecciona un almacén</option>
                            {almacenes.map((a) => (
                                <option key={a.id} value={a.id}>{a.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Buscar medicamento</label>
                        <div className="nueva-orden-busqueda">
                            <input type="text" className="form-control" placeholder="Buscar medicamento..."
                                value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                        </div>
                        {busqueda && (
                            <div className="nueva-orden-resultados">
                                {productosFiltrados.length === 0 ? (
                                    <p style={{ padding: "10px 14px", color: "#9ca3af", margin: 0 }}>Sin resultados</p>
                                ) : productosFiltrados.map((p) => (
                                    <div key={p.id} className="nueva-orden-resultado-item" onClick={() => agregarProducto(p)}>
                                        <p>{p.nombre}</p>
                                        <small>${p.precio}</small>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="col-6">
                    <p style={{ fontWeight: 600, marginBottom: 8 }}>Productos seleccionados</p>
                    <div className="carrito-wrapper">
                        {carrito.length === 0 ? (
                            <div className="carrito-vacio">
                                <p>Busca y agrega medicamentos</p>
                                <span>Los productos aparecerán aquí</span>
                            </div>
                        ) : carrito.map((item) => (
                            <div key={item.id_producto} className="carrito-item">
                                <div>
                                    <p>{item.nombre}</p>
                                    <small>${item.precio}</small>
                                </div>
                                <div className="carrito-controles">
                                    <button className="carrito-btn" onClick={() => cambiarCantidad(item.id_producto, item.cantidad - 1)}>−</button>
                                    <span className="carrito-cantidad">{item.cantidad}</span>
                                    <button className="carrito-btn" onClick={() => cambiarCantidad(item.id_producto, item.cantidad + 1)}>+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="carrito-total">
                        <span>Total</span>
                        <span>${total.toFixed(2)} MXN</span>
                    </div>
                </div>
            </div>
            <div className="form-actions mt-3">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button variant="primary" onClick={handleGuardar}
                    disabled={loading || carrito.length === 0 || !idAlmacen}>
                    {loading ? "Guardando..." : "Guardar Orden"}
                </Button>
            </div>
        </Modal>
    );
}

function OrdenesDeCompra() {
    const { movimientos, almacenes, productos, refreshCatalogo } = useCatalogos();
    const { user } = useContext(AuthContext);

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
    const [detalleOrden, setDetalleOrden] = useState([]);
    const [loadingDetalle, setLoadingDetalle] = useState(false);

    const ordenes = movimientos.filter((m) => m.id_tipo_movimiento === 4);
    const ordenesFiltradas = ordenes.filter((o) =>
        String(o.id).includes(search) ||
        o.farmacia?.toLowerCase().includes(search.toLowerCase()) ||
        o.almacen?.toLowerCase().includes(search.toLowerCase())
    );

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
                id_farmacia: user.id_farmacia,
                id_almacen,
                id_usuario: user.id,
                id_tipo_movimiento: 4,
                detalle,
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

            {/* Stats */}
            <div className="ordenes-stats">
                <div className="ordenes-stat-card">
                    <div>
                        <p>Órdenes pendientes</p>
                        <h2>{pendientes}</h2>
                    </div>
                    <div className="stat-icon blue"><Clock size={22} color="#3b82f6" /></div>
                </div>
                <div className="ordenes-stat-card">
                    <div>
                        <p>Canceladas</p>
                        <h2>{canceladas}</h2>
                    </div>
                    <div className="stat-icon red"><AlertTriangle size={22} color="#ef4444" /></div>
                </div>
                <div className="ordenes-stat-card">
                    <div>
                        <p>Valor total</p>
                        <h2>${valorTotal.toFixed(2)}</h2>
                    </div>
                    <div className="stat-icon green"><DollarSign size={22} color="#22c55e" /></div>
                </div>
            </div>

            {/* Buscador */}
            <div className="ordenes-actions">
                <div className="ordenes-search">
                    <input type="text" placeholder="Buscar Order ID, Proveedor..."
                        value={search} onChange={(e) => setSearch(e.target.value)} />
                    <Search size={16} className="ordenes-search-icon" />
                </div>
                <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>
                    Nueva Orden
                </Button>
            </div>

            {/* Layout */}
            <div className="ordenes-layout">
                <div className="ordenes-tabla-wrapper" style={{ flex: ordenSeleccionada ? "0 0 55%" : 1 }}>
                    <Table
                        columns={["Orden ID", "Almacén", "Fecha", "Estatus"]}
                        data={ordenesFiltradas}
                        renderRow={(orden) => (
                            <tr key={orden.id}
                                className={ordenSeleccionada?.id === orden.id ? "seleccionada" : ""}
                                onClick={() => handleVerDetalle(orden)}
                                style={{ cursor: "pointer" }}>
                                <td className="orden-id">ORD-{String(orden.id).padStart(3, '0')}</td>
                                <td>{orden.almacen}</td>
                                <td>{new Date(orden.fecha).toLocaleDateString('es-MX', {
                                    day: '2-digit', month: 'short', year: 'numeric'
                                })}</td>
                                <td><EstatusBadge estatus={orden.estatus} /></td>
                            </tr>
                        )}
                    />
                </div>

                {ordenSeleccionada && (
                    loadingDetalle ? (
                        <div className="panel-vacio" style={{ flex: "0 0 43%" }}>
                            <p>Cargando detalle...</p>
                        </div>
                    ) : (
                        <DetalleOrden orden={ordenSeleccionada} detalle={detalleOrden}
                            onClose={() => setOrdenSeleccionada(null)} />
                    )
                )}
            </div>

            <NuevaOrdenModal isOpen={modalOpen} onClose={() => setModalOpen(false)}
                almacenes={almacenes} productos={productos}
                onSubmit={handleSubmitOrden} loading={loading} />
        </PageContainer>
    );
}

export default OrdenesDeCompra;