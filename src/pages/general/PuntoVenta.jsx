import { useState, useEffect } from "react";
import { ShoppingCart, Barcode, Trash2, CheckCircle, Calculator, AlertTriangle, Info } from "lucide-react";
import PageContainer from "../../components/ui/PageContainer";
import BuscadorFlotante from "../../components/ui/BuscadorFlotante"; // Importamos el nuevo componente
import api from "../../services/api";
import "../../styles/general/PuntoVenta.css";

function PuntoVenta() {
    const [carrito, setCarrito] = useState([]);
    const [metodoPago, setMetodoPago] = useState("EFECTIVO");
    const [montoPagado, setMontoPagado] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [warningMsg, setWarningMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Autolimpiar alertas
    useEffect(() => {
        if (warningMsg) setTimeout(() => setWarningMsg(""), 4000);
        if (errorMsg) setTimeout(() => setErrorMsg(""), 4000);
        if (successMsg) setTimeout(() => setSuccessMsg(""), 6000);
    }, [warningMsg, errorMsg, successMsg]);

    // Función que recibe el producto seleccionado desde el BuscadorFlotante
    const agregarAlCarrito = (prod) => {
        setErrorMsg("");
        setWarningMsg("");

        if (prod.stock <= 0) {
            setWarningMsg(`El producto ${prod.nombre} no cuenta con existencias vigentes.`);
            return;
        }

        const existeIndex = carrito.findIndex(item => item.id === prod.id);

        if (existeIndex >= 0) {
            const nuevoCarrito = [...carrito];
            if (nuevoCarrito[existeIndex].cantidad + 1 > prod.stock) {
                setWarningMsg(`No hay suficiente stock de ${prod.nombre}. Máximo vigente: ${prod.stock} pz.`);
            } else {
                nuevoCarrito[existeIndex].cantidad += 1;
                setCarrito(nuevoCarrito);
            }
        } else {
            setCarrito([...carrito, { ...prod, cantidad: 1 }]);
        }
    };

    const actualizarCantidad = (index, val) => {
        let cant = parseFloat(val) || 1;
        const nuevoCarrito = [...carrito];
        const stockMax = nuevoCarrito[index].stock;

        if (cant > stockMax) {
            setWarningMsg(`No hay suficiente stock. Máximo vigente: ${stockMax} pz.`);
            cant = stockMax;
        }
        if (cant < 1) cant = 1;

        nuevoCarrito[index].cantidad = cant;
        setCarrito(nuevoCarrito);
    };

    const eliminarItem = (index) => {
        const nuevoCarrito = [...carrito];
        nuevoCarrito.splice(index, 1);
        setCarrito(nuevoCarrito);
    };

    const limpiarPos = () => {
        setCarrito([]);
        setMontoPagado("");
        setMetodoPago("EFECTIVO");
        setErrorMsg("");
        setWarningMsg("");
    };

    const totalVenta = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const pagadoNum = parseFloat(montoPagado) || 0;
    const cambio = pagadoNum > totalVenta ? pagadoNum - totalVenta : 0;

    const procesarVenta = async () => {
        setErrorMsg("");
        setSuccessMsg("");

        if (carrito.length === 0) {
            setErrorMsg("Agregue al menos un producto a la venta.");
            return;
        }
        if (metodoPago === "EFECTIVO" && pagadoNum < totalVenta) {
            setErrorMsg(`El monto ingresado ($${pagadoNum.toFixed(2)}) es inferior al total a pagar ($${totalVenta.toFixed(2)}).`);
            return;
        }

        setIsSubmitting(true);
        const payload = {
            metodo_pago: metodoPago,
            monto_pagado: metodoPago === "EFECTIVO" ? pagadoNum : totalVenta,
            items: carrito.map(i => ({ id_producto: i.id, cantidad: i.cantidad }))
        };

        try {
            const res = await api.post("/ventas", payload);
            setSuccessMsg(`Venta #${res.data.id_venta} registrada correctamente. Cambio a entregar: $${res.data.cambio.toFixed(2)}`);
            limpiarPos();
        } catch (error) {
            setErrorMsg(error.response?.data?.error || "Ocurrió un error al procesar la venta.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageContainer>
            {errorMsg && (
                <div style={{ background: "#fef2f2", color: "#dc2626", padding: "12px 20px", borderRadius: "8px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", fontWeight: "500", border: "1px solid #fca5a5" }}>
                    <AlertTriangle size={20} /> {errorMsg}
                </div>
            )}
            {successMsg && (
                <div style={{ background: "#d1fae5", color: "#059669", padding: "12px 20px", borderRadius: "8px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", fontWeight: "bold", border: "1px solid #6ee7b7", fontSize: "16px" }}>
                    <CheckCircle size={24} /> {successMsg}
                </div>
            )}

            <div className="pos-container">
                {/* --- COLUMNA IZQUIERDA --- */}
                <div className="pos-panel">
                    <div className="pos-panel-header">
                        <h2><ShoppingCart size={20} /> Registro de Venta - Farmacia</h2>
                    </div>
                    <div className="pos-panel-body">

                        {warningMsg && (
                            <div style={{ background: "#fffbeb", color: "#d97706", padding: "10px", borderRadius: "6px", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "500" }}>
                                <Info size={18} /> {warningMsg}
                            </div>
                        )}

                        <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px", color: "#374151" }}>Buscar / Escanear Producto</label>

                        {/* 🌟 AQUÍ INSERTAMOS EL COMPONENTE REUTILIZABLE 🌟 */}
                        <BuscadorFlotante onSelectProduct={agregarAlCarrito} />

                        <div style={{ overflowX: "auto" }}>
                            <table className="pos-table">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th style={{ textAlign: "center", width: "15%" }}>Precio</th>
                                        <th style={{ textAlign: "center", width: "20%" }}>Cantidad</th>
                                        <th style={{ textAlign: "center", width: "18%" }}>Subtotal</th>
                                        <th style={{ textAlign: "center", width: "10%" }}>Quitar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {carrito.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
                                                <Barcode size={60} style={{ opacity: 0.3, marginBottom: "15px" }} />
                                                <br />
                                                <span style={{ fontSize: "15px" }}>Escanee un producto o utilice el buscador superior para iniciar la venta.</span>
                                            </td>
                                        </tr>
                                    ) : (
                                        carrito.map((item, index) => (
                                            <tr key={`${item.id}-${index}`}>
                                                <td><strong>{item.nombre}</strong></td>
                                                <td style={{ textAlign: "center" }}>${item.precio.toFixed(2)}</td>
                                                <td style={{ textAlign: "center" }}>
                                                    <input
                                                        type="number"
                                                        className="pos-qty-input"
                                                        value={item.cantidad}
                                                        min="1"
                                                        max={item.stock}
                                                        onChange={(e) => actualizarCantidad(index, e.target.value)}
                                                    />
                                                </td>
                                                <td style={{ textAlign: "center", fontWeight: "bold", fontSize: "15px" }}>
                                                    ${(item.precio * item.cantidad).toFixed(2)}
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <button onClick={() => eliminarItem(index)} style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer" }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* --- COLUMNA DERECHA: COBRO --- */}
                <div className="pos-panel">
                    <div className="pos-panel-header-dark">
                        <h2><Calculator size={18} /> Resumen de Cobro</h2>
                    </div>
                    <div className="pos-panel-body" style={{ minHeight: "480px" }}>

                        <div className="pos-total-block">
                            <span style={{ fontSize: "13px", fontWeight: "bold", letterSpacing: "1px" }}>TOTAL A PAGAR</span>
                            <h1 className="pos-total-amount">${totalVenta.toFixed(2)}</h1>
                        </div>

                        <div className="pos-form-group">
                            <label>Método de Pago</label>
                            <select className="pos-select" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                                <option value="EFECTIVO">Efectivo</option>
                                <option value="TARJETA">Tarjeta de Débito / Crédito</option>
                                <option value="TRANSFERENCIA">Transferencia Electrónica</option>
                            </select>
                        </div>

                        {metodoPago === "EFECTIVO" && (
                            <div className="pos-form-group">
                                <label>Monto Recibido</label>
                                <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: "6px", overflow: "hidden" }}>
                                    <span style={{ padding: "12px 15px", background: "#f3f4f6", color: "#6b7280", borderRight: "1px solid #d1d5db", fontWeight: "bold" }}>$</span>
                                    <input
                                        type="number"
                                        className="pos-input-money"
                                        style={{ border: "none", borderRadius: 0 }}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.50"
                                        value={montoPagado}
                                        onChange={(e) => setMontoPagado(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="pos-cambio-alert">
                            Cambio: <strong>${metodoPago === "EFECTIVO" ? cambio.toFixed(2) : "0.00"}</strong>
                        </div>

                        <button className="btn-cobrar" onClick={procesarVenta} disabled={isSubmitting || carrito.length === 0}>
                            <CheckCircle size={20} /> {isSubmitting ? "PROCESANDO..." : "COBRAR E IMPRIMIR"}
                        </button>

                        <button className="btn-cancelar" onClick={limpiarPos}>
                            <Trash2 size={16} /> Cancelar / Limpiar Venta
                        </button>

                    </div>
                </div>
            </div>
        </PageContainer>
    );
}

export default PuntoVenta;