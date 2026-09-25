import { Check, Loader2, Users, Sparkles } from "lucide-react";
import "./PlanCard.css";

// Metadatos por defecto para complementar cada plan si la BD no los incluye
const PLAN_INFO = {
  oro: {
    badgeCapacidad: "Hasta 4 usuarios",
    descripcion:
      "Ideal para farmacias y empresas en desarrollo que buscan centralizar inventario y ventas en equipo.",
    features: [
      "Capacidad para hasta 4 usuarios conectados",
      "Control de inventario y almacenes básicos",
      "Gestión de órdenes de compra",
      "Reportes de movimientos diarios",
      "Soporte estándar por correo",
    ],
  },
  diamante: {
    badgeCapacidad: "Hasta 10 usuarios activos",
    descripcion:
      "La solución integral para empresas medianas o grandes con múltiples sucursales y alto flujo operativo.",
    features: [
      "Capacidad para hasta 10 usuarios activos",
      "Acceso ilimitado a todos los módulos actuales",
      "Gestión de traspasos entre sucursales",
      "Control de calidad y recepción avanzada",
      "Soporte prioritario 24/7",
    ],
  },
  personalizado: {
    badgeCapacidad: "A tu medida (1+ usuarios)",
    descripcion:
      "Perfecto si estás comenzando a administrar tu negocio en solitario y solo requieres herramientas clave.",
    features: [
      "Selecciona únicamente los módulos que necesitas",
      "Ideal para administración unipersonal o arranque",
      "Mínimo 3 módulos a tu elección",
      "Costo mensual ajustado a tus operaciones",
      "Posibilidad de agregar más módulos en cualquier momento",
    ],
  },
};

const PlanCard = ({
  plan,
  esActual = false,
  onSeleccionar,
  cargando = false,
}) => {
  const nombreLower = plan.nombre?.toLowerCase() || "";

  // Detección del tipo de plan
  const esPersonalizado =
    plan.id === 4 ||
    nombreLower.includes("personalizado") ||
    plan.es_personalizado;

  const esDiamante = nombreLower.includes("diamante");
  const esOro = nombreLower.includes("oro");

  // Asignar información predeterminada según el tipo
  const infoFallback = esDiamante
    ? PLAN_INFO.diamante
    : esPersonalizado
    ? PLAN_INFO.personalizado
    : PLAN_INFO.oro;

  // Descripción final (prioriza la base de datos si existe, o el fallback personalizado)
  const descripcionFinal = plan.descripcion || infoFallback.descripcion;

  // Features finales (convierte de string si viene de BD o usa la lista de beneficios)
  let features = [];
  if (plan.features) {
    features = Array.isArray(plan.features)
      ? plan.features
      : JSON.parse(plan.features);
  }
  if (!features || features.length === 0) {
    features = infoFallback.features;
  }

  const mostrarRecomendado = esDiamante && !esActual;

  return (
    <div
      className={`plan-card notranslate ${mostrarRecomendado ? "recomendado" : ""} ${
        esActual ? "plan-actual-card" : ""
      }`}
      translate="no"
    >
      {/* Insignias superiores */}
      {mostrarRecomendado && <span className="plan-badge">Recomendado</span>}
      {esActual && <span className="plan-badge-actual">Plan actual</span>}

      <div className="plan-header">
        <h2 className="plan-nombre">{plan.nombre}</h2>

        {/* Etiqueta de capacidad similar a la imagen de referencia */}
        <div className="plan-capacidad-tag">
          <Users size={14} />
          <span>{infoFallback.badgeCapacidad}</span>
        </div>

        {/* Precio */}
        <div className="plan-precio">
          {esPersonalizado ? (
            <span className="precio-monto">A tu medida</span>
          ) : Number(plan.precio) === 0 ? (
            <span className="precio-gratis">Gratis</span>
          ) : (
            <>
              <span className="precio-monto">
                ${Number(plan.precio).toLocaleString()}
              </span>
              <span className="precio-periodo"> MXN / mes</span>
            </>
          )}
        </div>

        <p className="plan-descripcion">{descripcionFinal}</p>
      </div>

      {/* Botón de acción */}
      <button
        className={`plan-btn ${
          esActual
            ? "plan-btn-actual"
            : mostrarRecomendado
            ? "plan-btn-recomendado"
            : "plan-btn-default"
        }`}
        disabled={esActual || cargando}
        onClick={onSeleccionar}
      >
        {cargando ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={16} /> Redirigiendo...
          </span>
        ) : esActual ? (
          "Tu plan actual"
        ) : esPersonalizado ? (
          "Configurar módulos →"
        ) : (
          `Elegir ${plan.nombre}`
        )}
      </button>

      {/* Lista de beneficios con icono check estilo Google */}
      <div className="plan-features-container">
        <div className="plan-features-titulo">
          <Sparkles size={14} className="text-blue-600" />
          <span>Lo que incluye:</span>
        </div>
        <ul className="plan-features">
          {features.map((feature, i) => (
            <li key={i}>
              <Check size={16} className="check-icon" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlanCard;