import "../styles/inicio.css";
import { Plus, Bell } from "lucide-react";
import InventoryChart from "../components/InventoryChart";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/ui/SearchBar";

const Inicio = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">

      {/* HEADER SUPERIOR */}
      <div className="dashboard-header">
        <SearchBar placeholder="Search Order ID, Pharmacies or ..." />

        <button className="primary-btn">
          <Plus size={18} />
          Nueva Entrada
        </button>
      </div>

      {/* DESCRIPCIÓN */}
      <div className="dashboard-title">
        <h1>Descripción general</h1>
        <p>Actualizaciones logísticas y métricas de inventario en tiempo real.</p>
      </div>

      {/* CARD GRÁFICA */}
      <div className="card">
        <div className="card-header">
          <h3>Movimiento de inventario</h3>

          <div className="tabs">
            <button className="active">Semana</button>
            <button>Mes</button>
          </div>
        </div>

        <div>
          <InventoryChart />
        </div>

      </div>

      {/* ALERTAS */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Bell size={20} className="bell-icon" />
            Alertas Críticas
          </h3>
          <span className="badge">3</span>
        </div>

        <div className="alert-item">
          <div className="alert-left">
            <strong>Paracetamol 500mg</strong>
            <p>Folio: 26071</p>
          </div>

          <div className="alert-right">
            <span className="danger">Por expirar</span>
            <span className="expiration-days">3 días restantes</span>
          </div>
        </div>

        <div className="alert-item">
          <div className="alert-left">
            <strong>Difenhidramina 500mg</strong>
            <p>Folio: 67194</p>
          </div>
          <div className="alert-right">
            <span className="warning">Poca existencia</span>
            <span className="expiration-days">3 Unidades</span>
          </div>
        </div>

        <div className="alert-item">
          <div className="alert-left">
            <strong>Penicilina 500mg</strong>
            <p>Folio: 94030</p>
          </div>

          <div className="alert-right">
            <span className="danger">Por expirar</span>
            <span className="expiration-days">12 días restantes</span>
          </div>
        </div>

        <div 
          className="view-all"
          onClick={() => navigate("/control")}
          style={{ cursor: "pointer" }}
        >
        Ver todas las alertas
        </div>
      </div>

    </div>
  );
};

export default Inicio;
