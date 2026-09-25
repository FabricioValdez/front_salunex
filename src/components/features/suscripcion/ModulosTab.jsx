import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import clienteAxios from "../../../services/api";
import "./ModulosTab.css";

const ModulosTab = () => {
  const [modulos, setModulos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [cargandoModulos, setCargandoModulos] = useState(true);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarModulos = async () => {
      try {
        const { data } = await clienteAxios.get("/suscripciones/modulos");
        if (data.success) {
          setModulos(data.data);
        }
      } catch (err) {
        setError("Error al cargar los módulos disponibles.");
      } finally {
        setCargandoModulos(false);
      }
    };

    cargarModulos();
  }, []);

  const toggleModulo = (rawId) => {
    const id = Number(rawId);
    setSeleccionados((prev) => {
      const existe = prev.some((item) => Number(item) === id);
      return existe
        ? prev.filter((item) => Number(item) !== id)
        : [...prev, id];
    });
  };

  // Filtrado directo de módulos activos
  const modulosActivos = modulos.filter((m) =>
    seleccionados.some((selId) => Number(selId) === Number(m.id))
  );

  // Suma evaluada de forma síncrona en cada render
  const sumaTotal = modulosActivos.reduce(
    (acc, m) => acc + (parseFloat(m.precio) || 0),
    0
  );

  const handleContratarModulos = async () => {
    if (seleccionados.length < 3) {
      alert("Debes seleccionar al menos 3 módulos.");
      return;
    }

    try {
      setProcesandoPago(true);
      const origenActual = window.location.origin;

      const { data } = await clienteAxios.post(
        "/suscripciones/checkout-personalizado",
        {
          modulos: seleccionados,
          success_url: `${origenActual}/suscripcion`,
          cancel_url: `${origenActual}/suscripcion`,
        }
      );

      if (data.success && data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error al procesar la solicitud.");
      setProcesandoPago(false);
    }
  };

  if (cargandoModulos) {
    return <p className="text-center py-6">Cargando módulos...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 py-6">{error}</p>;
  }

  return (
    <div className="modulos-layout notranslate" translate="no">
      {/* Lista de selección */}
      <div className="modulos-lista">
        {modulos.map((modulo) => {
          const activo = seleccionados.some(
            (s) => Number(s) === Number(modulo.id)
          );

          return (
            <div
              key={modulo.id}
              className={`modulo-card ${activo ? "seleccionado" : ""}`}
              onClick={() => toggleModulo(modulo.id)}
            >
              <div className="modulo-check">
                {activo && <Check size={14} />}
              </div>
              <div className="modulo-info">
                <p className="modulo-nombre">{modulo.nombre}</p>
                <span className="modulo-descripcion">
                  Código: {modulo.clave}
                </span>
              </div>
              <span className="modulo-precio notranslate" translate="no">
                ${parseFloat(modulo.precio).toLocaleString()} <small>MXN/mes</small>
              </span>
            </div>
          );
        })}
      </div>

      {/* Resumen lateral */}
      <div className="modulos-resumen notranslate" translate="no">
        <h3>Resumen</h3>

        {modulosActivos.length === 0 ? (
          <p className="resumen-vacio">Selecciona los módulos que necesitas</p>
        ) : (
          <ul className="resumen-lista">
            {modulosActivos.map((m) => (
              <li key={m.id}>
                <span>{m.nombre}</span>
                <span>${parseFloat(m.precio).toLocaleString()} MXN</span>
              </li>
            ))}
          </ul>
        )}

        <div className="resumen-total">
          <span>Total mensual</span>
          <strong>${sumaTotal.toLocaleString()} MXN</strong>
        </div>

        {seleccionados.length > 0 && seleccionados.length < 3 && (
          <p className="text-xs text-amber-600 mb-2">
            Selecciona al menos {3 - seleccionados.length} módulo(s) más.
          </p>
        )}

        <button
          className="primary-btn"
          disabled={seleccionados.length < 3 || procesandoPago}
          onClick={handleContratarModulos}
        >
          {procesandoPago ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={16} /> Conectando con Stripe...
            </span>
          ) : (
            "Contratar módulos"
          )}
        </button>
      </div>
    </div>
  );
};

export default ModulosTab;