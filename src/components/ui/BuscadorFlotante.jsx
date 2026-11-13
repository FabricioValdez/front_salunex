import { useState, useRef, useEffect } from "react";
import { Barcode, Search } from "lucide-react";
import api from "../../services/api";
import "./BuscadorFlotante.css";

export default function BuscadorFlotante({ onSelectProduct }) {
    const [busqueda, setBusqueda] = useState("");
    const [resultados, setResultados] = useState([]);
    const [showResultados, setShowResultados] = useState(false);
    const buscadorRef = useRef(null);

    // Cierra el menú flotante si el usuario hace clic fuera de él
    useEffect(() => {
        function handleClickOutside(event) {
            if (buscadorRef.current && !buscadorRef.current.contains(event.target)) {
                setShowResultados(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const ejecutarBusqueda = async (q) => {
        setBusqueda(q);
        if (q.trim().length < 2) {
            setResultados([]);
            setShowResultados(false);
            return;
        }

        try {
            // Asegúrate de que esta ruta existe en tu api.php de Laravel
            const res = await api.get(`/ventas/buscar?q=${encodeURIComponent(q)}`);
            setResultados(res.data);
            setShowResultados(true);
        } catch (error) {
            console.error("Error buscando productos:", error);
        }
    };

    const handleSelect = (prod) => {
        onSelectProduct(prod);
        setBusqueda("");
        setShowResultados(false);
    };

    return (
        <div className="buscador-flotante-wrapper" ref={buscadorRef}>
            <div className="buscador-input-group">
                <span className="buscador-icon"><Barcode size={20} /></span>
                <input
                    type="text"
                    className="buscador-input"
                    placeholder="Escriba el nombre o escanee el código..."
                    value={busqueda}
                    onChange={(e) => ejecutarBusqueda(e.target.value)}
                    autoFocus
                />
                <button className="buscador-btn"><Search size={18} /></button>
            </div>

            {showResultados && (
                <div className="buscador-resultados">
                    {resultados.length === 0 ? (
                        <div style={{ padding: "15px", color: "#6b7280", textAlign: "center" }}>
                            No se encontraron productos coincidentes
                        </div>
                    ) : (
                        resultados.map(prod => (
                            <div key={prod.id} className="buscador-item" onClick={() => handleSelect(prod)}>
                                <div className="buscador-item-info">
                                    <h4>{prod.nombre}</h4>
                                    <small>Cód: {prod.codigo_barras}</small>
                                </div>
                                <div>
                                    <span className={`buscador-badge ${prod.stock > 0 ? "badge-success" : "badge-danger"}`}>
                                        ${prod.precio.toFixed(2)} | Disp: {prod.stock} pz
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}