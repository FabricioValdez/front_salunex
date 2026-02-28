import "../styles/inicio.css";
import { Search, Plus, Bell } from "lucide-react";

const Inicio = () => {
  return (
    <div className="dashboard">

      {/* HEADER SUPERIOR */}
      <div className="dashboard-header">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search Order ID, Pharmacies or ..."
          />
        </div>

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

        <div className="chart-placeholder">
          {/* Aquí después podemos poner Chart.js */}
          <div className="bars">
            <div className="bar-group">
              <div className="bar blue"></div>
              <div className="bar gray"></div>
              <span>Lunes</span>
            </div>

            <div className="bar-group">
              <div className="bar blue tall"></div>
              <div className="bar gray mid"></div>
              <span>Martes</span>
            </div>

            <div className="bar-group">
              <div className="bar blue small"></div>
              <div className="bar gray tall"></div>
              <span>Miércoles</span>
            </div>

            <div className="bar-group">
              <div className="bar blue mid"></div>
              <div className="bar gray small"></div>
              <span>Jueves</span>
            </div>

            <div className="bar-group">
              <div className="bar blue very-tall"></div>
              <div className="bar gray mid"></div>
              <span>Viernes</span>
            </div>
          </div>
        </div>
      </div>

      {/* ALERTAS */}
      <div className="card">
        <div className="card-header">
          <h3><Bell size={16}/> Alertas Críticas</h3>
          <span className="badge">3</span>
        </div>

        <div className="alert-item">
          <div>
            <strong>Paracetamol 500mg</strong>
            <p>Folio: 26071</p>
          </div>
          <span className="danger">Por expirar</span>
        </div>

        <div className="alert-item">
          <div>
            <strong>Difenhidramina 500mg</strong>
            <p>Folio: 67194</p>
          </div>
          <span className="warning">Poca existencia</span>
        </div>

        <div className="alert-item">
          <div>
            <strong>Penicilina 500mg</strong>
            <p>Folio: 94030</p>
          </div>
          <span className="danger">Por expirar</span>
        </div>

        <div className="view-all">
          Ver todas las alertas
        </div>
      </div>

    </div>
  );
};

export default Inicio;
