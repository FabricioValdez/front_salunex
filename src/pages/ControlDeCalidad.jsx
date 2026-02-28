import "../styles/ControlCalidad.css";
import { Trash2, AlertCircle, Clock } from "lucide-react";

const ControlCalidad = () => {
  return (
    <div className="control-container">
      <h1>Control de calidad y caducidad</h1>
      <p className="subtitle">
        Revisar los lotes marcados, gestionar la fecha de vencimiento e
        inspeccionar el estado del empaque para garantizar el cumplimiento.
      </p>

      {/* RESUMEN CARDS */}
      <div className="summary-cards">
        <div className="card danger">
          <p>Total expirados</p>
          <h2>4 artículos</h2>
        </div>

        <div className="card warning">
          <p>Pronto a expirar</p>
          <h2>10 artículos</h2>
        </div>

        <div className="card neutral">
          <p>Pérdida potencial</p>
          <h2>$12,500</h2>
        </div>
      </div>

      {/* EXPIRADOS */}
      <div className="table-section danger-section">
        <div className="section-header">
          <div className="title">
            <AlertCircle size={18} />
            <h3>Medicamentos expirados (Crítico)</h3>
          </div>
          <button className="btn danger-btn">
            <Trash2 size={16} /> Retirar y desechar
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th></th>
              <th>Nombre del medicamento</th>
              <th>Número de lote</th>
              <th>Fecha de caducidad</th>
              <th>Estatus</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><input type="checkbox" /></td>
              <td>
                <strong>Amoxicilina 500mg</strong>
                <span>antibiótico</span>
              </td>
              <td>#A102-442</td>
              <td>OCT-13-2023</td>
              <td className="expired">Expirado (-14 días)</td>
              <td><Trash2 size={16} /></td>
            </tr>

            <tr>
              <td><input type="checkbox" /></td>
              <td>
                <strong>Insulina glargina</strong>
                <span>cuidado de la diabetes</span>
              </td>
              <td>#B99-X502</td>
              <td>OCT-23-2023</td>
              <td className="expired">Expirado (-6 días)</td>
              <td><Trash2 size={16} /></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* PRÓXIMOS A EXPIRAR */}
      <div className="table-section warning-section">
        <div className="section-header">
          <div className="title">
            <Clock size={18} />
            <h3>Próximos a expirar (Sig 30-90 días)</h3>
          </div>
          <button className="btn warning-btn">
            <Trash2 size={16} /> Retirar del almacén
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th></th>
              <th>Nombre del medicamento</th>
              <th>Número de lote</th>
              <th>Días restantes</th>
              <th>Nivel de riesgo</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><input type="checkbox" /></td>
              <td>
                <strong>Amoxicilina 500mg</strong>
                <span>antibiótico</span>
              </td>
              <td>#A102-442</td>
              <td className="days warning-text">14 días restantes</td>
              <td><span className="badge high">Riesgo alto</span></td>
              <td><Trash2 size={16} /></td>
            </tr>

            <tr>
              <td><input type="checkbox" /></td>
              <td>
                <strong>Penicilina 500mg</strong>
                <span>antibiótico</span>
              </td>
              <td>#P087-406</td>
              <td className="days safe-text">70 días restantes</td>
              <td><span className="badge medium">Riesgo medio</span></td>
              <td><Trash2 size={16} /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ControlCalidad;
