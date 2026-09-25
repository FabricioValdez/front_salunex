import { useState, useEffect } from "react";
import PlanCard from "./PlanCard";
import clienteAxios from "../../../services/api";

const PlanesTab = ({ onIrAModulos, refreshKey }) => {
  const [planes, setPlanes] = useState([]);
  const [planActualId, setPlanActualId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState(null);
  const [error, setError] = useState(null);

  const obtenerPlanes = async () => {
    try {
      setCargando(true);
      const { data } = await clienteAxios.get("/suscripciones/planes");
      if (data.success) {
        setPlanes(data.data.planes);
        setPlanActualId(data.data.plan_actual_id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar los planes.");
    } finally {
      setCargando(false);
    }
  };

  // Se ejecuta al montar y cada vez que cambie refreshKey tras un pago
  useEffect(() => {
    obtenerPlanes();
  }, [refreshKey]);

  const handleSeleccionarPlan = async (plan) => {
    const esPersonalizado =
      plan.id === 4 ||
      plan.nombre?.toLowerCase().includes("personalizado") ||
      plan.es_personalizado;

    if (esPersonalizado) {
      if (onIrAModulos) onIrAModulos();
      return;
    }

    try {
      setProcesandoId(plan.id);
      const origenActual = window.location.origin;

      const { data } = await clienteAxios.post("/suscripciones/checkout", {
        plan_id: plan.id,
        success_url: `${origenActual}/suscripcion`,
        cancel_url: `${origenActual}/suscripcion`,
      });

      if (data.success && data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      alert(err.response?.data?.message || "No se pudo iniciar el pago.");
      setProcesandoId(null);
    }
  };

  if (cargando) return <p className="text-center py-6">Cargando planes disponibles...</p>;
  if (error) return <p className="text-center text-red-500 py-6">{error}</p>;

  return (
    <div className="planes-grid">
      {planes.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          esActual={plan.id === planActualId}
          onSeleccionar={() => handleSeleccionarPlan(plan)}
          cargando={procesandoId === plan.id}
        />
      ))}
    </div>
  );
};

export default PlanesTab;