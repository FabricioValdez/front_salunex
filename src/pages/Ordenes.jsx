import "../styles/Ordenes.css";
import { Search, Plus, X } from "lucide-react";

const Ordenes = () => {
  return (
    <div className="ordenes-container">
      <h1>Órdenes de compra</h1>
      <p className="subtitle">
        Gestionar los flujos de trabajo de reposición y adquisición de proveedores
      </p>

      {/* RESUMEN */}
      <div className="summary-cards">
        <div className="card">
          <p>Órdenes pendientes</p>
          <h2>12</h2>
        </div>

        <div className="card">
          <p>Entregas vencidas</p>
          <h2>3</h2>
        </div>

        <div className="card">
          <p>Valor de orden de compra</p>
          <h2>$146,784</h2>
        </div>
      </div>

      {/* SEARCH + ACTIONS */}
      <div className="actions-bar">
        <div className="search-box">
          <input placeholder="Buscar Order ID, Proveedor..." />
          <Search size={18} />
        </div>

        <button className="filter-btn">+ Filtrar: Estatus</button>
        <button className="primary-btn">
          <Plus size={16} /> Nueva Orden
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="ordenes-content">
        
        {/* LISTA */}
        <div className="orders-list">
          <table>
            <thead>
              <tr>
                <th>Orden ID</th>
                <th>Proveedor</th>
                <th>Fecha creación</th>
                <th>Estatus</th>
              </tr>
            </thead>

            <tbody>
              <tr className="active-row">
                <td>OC-2026-001</td>
                <td>AstraZeneca Pharma</td>
                <td>Oct 12, 2026</td>
                <td><span className="badge completed">Completado</span></td>
              </tr>

              <tr>
                <td>OC-2026-002</td>
                <td>AstraZeneca Pharma</td>
                <td>Oct 28, 2026</td>
                <td><span className="badge sent">Enviado</span></td>
              </tr>

              <tr>
                <td>OC-2026-003</td>
                <td>AstraZeneca Pharma</td>
                <td>Nov 10, 2026</td>
                <td><span className="badge sent">Enviado</span></td>
              </tr>

              <tr>
                <td>OC-2026-004</td>
                <td>AstraZeneca Pharma</td>
                <td>Dic 31, 2026</td>
                <td><span className="badge cancelled">Cancelado</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* DETALLE */}
        <div className="order-detail">
          <div className="detail-header">
            <h2>OC-2026-001 <span className="badge completed">Completado</span></h2>
            <X size={18} />
          </div>

          <p className="provider-info">
            AstraZeneca Pharma • Oct 12
          </p>

          <h4>Historial de seguimiento</h4>

          <ul className="timeline">
            <li>Orden creada - Oct 12, 9:15 AM</li>
            <li>Orden enviada al proveedor - Oct 12, 10:30 AM</li>
            <li>Entrega realizada - Oct 12, 12:48 PM</li>
          </ul>

          <h4>Lista de pedidos</h4>

          <div className="product-card">
            <div>
              <strong>Amoxicilina 500mg</strong>
              <p>Lote: BN-2023-089</p>
            </div>
            <span className="badge completed">Carga completa</span>
          </div>

          <div className="detail-actions">
            <button className="secondary-btn">Imprimir</button>
            <button className="primary-btn">Visualizar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ordenes;
