import { Check } from "lucide-react";
import "./PlanCard.css";

const PlanCard = ({ plan, recomendado = false, esActual = false }) => {
  return (
    <div className={`plan-card ${recomendado ? "recomendado" : ""} ${esActual ? "actual" : ""}`}>

      {recomendado && (
        <span className="plan-badge">Recomendado</span>
      )}

      <div className="plan-header">
        <h2 className="plan-nombre">{plan.nombre}</h2>
        <div className="plan-precio">
          {plan.precio === 0 ? (
            <span className="precio-gratis">Gratis</span>
          ) : (
            <>
              <span className="precio-monto">${plan.precio.toLocaleString()}</span>
              <span className="precio-periodo"> MXN / mes</span>
            </>
          )}
        </div>
        <p className="plan-descripcion">{plan.descripcion}</p>
      </div>

      <button
        className={`plan-btn ${esActual ? "plan-btn-actual" : recomendado ? "plan-btn-recomendado" : "plan-btn-default"}`}
        disabled={esActual}
      >
        {esActual ? "Tu plan actual" : `Elegir ${plan.nombre}`}
      </button>

      <ul className="plan-features">
        {plan.features.map((f, i) => (
          <li key={i}>
            <Check size={14} className="check-icon" />
            {f}
          </li>
        ))}
      </ul>

    </div>
  );
};

export default PlanCard;