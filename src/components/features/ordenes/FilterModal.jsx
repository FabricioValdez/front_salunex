import { useState } from "react";
import "./FilterModal.css";

const FilterModal = ({ filtros, setFiltros, onClose }) => {

  const [tempFiltros, setTempFiltros] = useState(filtros);

  const aplicarFiltros = () => {
    setFiltros(tempFiltros);
    onClose();
  };

  const limpiarFiltros = () => {
    setTempFiltros({
      estatus: "todos",
      desde: "",
      hasta: ""
    });
  };

  return (
    <div className="filter-modal">

      <h3 className="filter-title">Filtrar para seleccionar órdenes</h3>

      <div className="form-group">
        <label>Estatus</label>

        <select
          value={tempFiltros.estatus}
          onChange={(e) =>
            setTempFiltros({
              ...tempFiltros,
              estatus: e.target.value
            })
          }
        >
          <option value="todos">Todos</option>
          <option value="completado">Completado</option>
          <option value="enviado">Pendiente</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div className="form-group">
        <label>Desde</label>

        <input
          type="date"
          value={tempFiltros.desde}
          onChange={(e) =>
            setTempFiltros({
              ...tempFiltros,
              desde: e.target.value
            })
          }
        />
      </div>

      <div className="form-group">
        <label>Hasta</label>

        <input
          type="date"
          value={tempFiltros.hasta}
          onChange={(e) =>
            setTempFiltros({
              ...tempFiltros,
              hasta: e.target.value
            })
          }
        />
      </div>

      <div className="modal-actions">

        <button className="secondary-btn" onClick={limpiarFiltros}>
          Limpiar
        </button>

        <button className="primary-btn" onClick={aplicarFiltros}>
          Aplicar filtros
        </button>

      </div>

    </div>
  );
};

export default FilterModal;