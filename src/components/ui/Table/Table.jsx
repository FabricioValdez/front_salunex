import { useState } from "react";
import "./Table.css";

function Table({ columns = [], data = [], renderRow }) {

  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 7;

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = data.slice(startIndex, startIndex + rowsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="table-wrapper">

      <table className="salunex-table">

        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {currentData.length > 0 ? (
            currentData.map((item, index) =>
              renderRow(item, index)
            )
          ) : (
            <tr>
              <td colSpan={columns.length} className="no-data">
                Sin resultados
              </td>
            </tr>
          )}
        </tbody>

      </table>

      {/* PAGINACIÓN */}
      <div className="table-pagination">

        <button
          onClick={prevPage}
          disabled={currentPage === 1}
        >
          Anterior
        </button>

        <span>
          Página {currentPage} de {totalPages || 1}
        </span>

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>

      </div>

    </div>
  );
}

export default Table;