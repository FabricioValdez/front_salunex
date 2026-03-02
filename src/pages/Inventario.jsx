import "../styles/Inventario.css";
import SearchBar from "../components/ui/SearchBar";

function Inventario() {
  return (
    <div className="page-container">
      <div className="page-content">

        {/* Header */}
        <div className="page-header">
          <h1>Mercancía e inventario diario</h1>
          <p>
            Gestione las entradas diarias de existencias, haga seguimiento
            de fechas de vencimiento y monitoree niveles en tiempo real.
          </p>
        </div>

        {/* Contenedor principal */}
        <div className="card-container">

          {/* Barra superior */}
          <div className="inventory-topbar">
            <SearchBar placeholder="Buscar medicamento, lote o farmacia..." />

            <div className="topbar-actions">
              <button className="btn-secondary">Exportar</button>
              <button className="btn-primary">+ Agregar medicamento</button>
            </div>
          </div>

          {/* Tabla */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Lote</th>
                  <th>Fecha Exp.</th>
                  <th>Cantidad</th>
                  <th>Ubicación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Penicilina 500mg</td>
                  <td>PCL-2026-001</td>
                  <td>2028-12-15</td>
                  <td>2,500</td>
                  <td>Altabrisa</td>
                  <td>
                    <button className="action-btn">✏️</button>
                    <button className="action-btn">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Inventario;
