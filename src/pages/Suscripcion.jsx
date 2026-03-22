import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import PlanesTab from "../components/features/suscripcion/PlanesTab";
import ModulosTab from "../components/features/suscripcion/ModulosTab";
import "../styles/Suscripcion.css";

const Suscripcion = () => {
  const [tabActiva, setTabActiva] = useState("paquetes");
  const navigate = useNavigate();

  return (
    <PageContainer>

      <div className="suscripcion-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Volver
        </button>
        <div className="suscripcion-titulo">
          <h1>Elige tu plan</h1>
          <p>Opciones flexibles para distintos tipos de uso</p>
        </div>
      </div>

      {/* ── Selector de pestaña ── */}
      <div className="tab-selector">
        <button
          className={`tab-btn ${tabActiva === "paquetes" ? "active" : ""}`}
          onClick={() => setTabActiva("paquetes")}
        >
          Paquetes
        </button>
        <button
          className={`tab-btn ${tabActiva === "modulos" ? "active" : ""}`}
          onClick={() => setTabActiva("modulos")}
        >
          Arma tu paquete
        </button>
      </div>

      {/* ── Contenido de la pestaña ── */}
      {tabActiva === "paquetes" && <PlanesTab />}
      {tabActiva === "modulos" && <ModulosTab />}

    </PageContainer>
  );
};

export default Suscripcion;