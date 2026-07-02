// import { useState } from "react";
// import "./Table.css";

// function Table({ columns = [], data = [], renderRow }) {

//   const [currentPage, setCurrentPage] = useState(1);

//   const rowsPerPage = 7;

//   const totalPages = Math.ceil(data.length / rowsPerPage);

//   const startIndex = (currentPage - 1) * rowsPerPage;
//   const currentData = data.slice(startIndex, startIndex + rowsPerPage);

//   const nextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const prevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   return (
//     <div className="table-wrapper">

//       <table className="salunex-table">

//         <thead>
//           <tr>
//             {columns.map((col, index) => (
//               <th key={index}>{col}</th>
//             ))}
//           </tr>
//         </thead>

//         <tbody>
//           {currentData.length > 0 ? (
//             currentData.map((item, index) =>
//               renderRow(item, index)
//             )
//           ) : (
//             <tr>
//               <td colSpan={columns.length} className="no-data">
//                 Sin resultados
//               </td>
//             </tr>
//           )}
//         </tbody>

//       </table>

//       {/* PAGINACIÓN */}
//       <div className="table-pagination">

//         <button
//           onClick={prevPage}
//           disabled={currentPage === 1}
//         >
//           Anterior
//         </button>

//         <span>
//           Página {currentPage} de {totalPages || 1}
//         </span>

//         <button
//           onClick={nextPage}
//           disabled={currentPage === totalPages}
//         >
//           Siguiente
//         </button>

//       </div>

//     </div>
//   );
// }

// export default Table;


// import { useState } from "react";
// import "./Table.css";

// function Table({ columns = [], data = [], renderRow }) {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [inputPage, setInputPage] = useState("1"); // Estado para controlar lo que escribes

//   const rowsPerPage = 7;
//   const totalPages = Math.ceil(data.length / rowsPerPage) || 1;

//   const startIndex = (currentPage - 1) * rowsPerPage;
//   const currentData = data.slice(startIndex, startIndex + rowsPerPage);

//   // Función auxiliar para cambiar de página de forma segura
//   const changePage = (pageNumber) => {
//     let targetPage = pageNumber;
    
//     // Validamos que no se salga de los límites
//     if (targetPage < 1) targetPage = 1;
//     if (targetPage > totalPages) targetPage = totalPages;

//     setCurrentPage(targetPage);
//     setInputPage(targetPage.toString()); // Sincroniza el input de texto
//   };

//   const nextPage = () => {
//     if (currentPage < totalPages) {
//       changePage(currentPage + 1);
//     }
//   };

//   const prevPage = () => {
//     if (currentPage > 1) {
//       changePage(currentPage - 1);
//     }
//   };

//   // Maneja el cambio manual cuando escribes en el input
//   const handleInputChange = (e) => {
//     const value = e.target.value;
//     setInputPage(value); // Permite escribir libremente

//     const pageNumber = parseInt(value, 10);
//     // Si es un número válido, cambiamos la página automáticamente
//     if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
//       setCurrentPage(pageNumber);
//     }
//   };

//   // Por si el usuario borra todo o deja el input a medias, lo reiniciamos al perder el foco (blur)
//   const handleInputBlur = () => {
//     const pageNumber = parseInt(inputPage, 10);
//     if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > totalPages) {
//       setInputPage(currentPage.toString());
//     }
//   };

//   return (
//     <div className="table-wrapper">
//       <table className="salunex-table">
//         <thead>
//           <tr>
//             {columns.map((col, index) => (
//               <th key={index}>{col}</th>
//             ))}
//           </tr>
//         </thead>

//         <tbody>
//           {currentData.length > 0 ? (
//             currentData.map((item, index) => renderRow(item, index))
//           ) : (
//             <tr>
//               <td colSpan={columns.length} className="no-data">
//                 Sin resultados
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       {/* PAGINACIÓN CON INPUT CORREGIDA */}
//       <div className="table-pagination">
//         <button onClick={prevPage} disabled={currentPage === 1}>
//           Anterior
//         </button>

//         <div className="pagination-input-container">
//           <span>Página</span>
//           <input
//             type="number"
//             value={inputPage}
//             onChange={handleInputChange}
//             onBlur={handleInputBlur}
//             min="1"
//             max={totalPages}
//             className="pagination-input"
//           />
//           <span>de {totalPages}</span>
//         </div>

//         <button onClick={nextPage} disabled={currentPage === totalPages}>
//           Siguiente
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Table;

import { useState, useEffect } from "react";
import "./Table.css";

function Table({ columns = [], data = [], renderRow }) {
  // 3. Estado dinámico para filas por página (por defecto 10 como en tu imagen)
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState("");

  const totalResults = data.length;
  const totalPages = Math.ceil(totalResults / rowsPerPage) || 1;

  // Si cambian los datos o las filas por página, nos aseguramos de no quedar en una página fantasma
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [data, rowsPerPage, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = data.slice(startIndex, startIndex + rowsPerPage);

  // Navegación segura
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setInputPage(""); // Limpiamos el input "Ir a" tras navegar
    }
  };

  // 4. Manejador para el input "Ir a" al presionar Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const pageNumber = parseInt(inputPage, 10);
      if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
        goToPage(pageNumber);
      } else {
        setInputPage(""); // Si es inválido, lo limpia
      }
    }
  };

  // 5. Lógica inteligente para generar los números con elipsis (...)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 2; // Cuántas páginas mostrar a los lados de la actual

    if (totalPages <= 7) {
      // Si son pocas páginas, las mostramos todas
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1); // Siempre mostramos la primera

      if (currentPage > maxVisible + 2) {
        pages.push("..."); // Elipsis izquierda
      }

      // Páginas intermedias alrededor de la página actual
      const start = Math.max(2, currentPage - maxVisible);
      const end = Math.min(totalPages - 1, currentPage + maxVisible);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - maxVisible - 1) {
        pages.push("..."); // Elipsis derecha
      }

      pages.push(totalPages); // Siempre mostramos la última
    }
    return pages;
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
            currentData.map((item, index) => renderRow(item, index))
          ) : (
            <tr>
              <td colSpan={columns.length} className="no-data">
                Sin resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* NUEVA PAGINACIÓN COMPLETA */}
      <div className="table-pagination-container">
        
        {/* Fila Superior: Indicadores y Controles */}
        <div className="pagination-top-row">
          <div className="pagination-info">
            {/* 1 */} <span>Total {totalResults} resultados</span>
            {/* 2 */} <span>Pag. {currentPage}/{totalPages}</span>
          </div>

          <div className="pagination-controls">
            {/* 3 Selector de filas */}
            <div className="rows-select-wrapper">
              <select 
                value={rowsPerPage} 
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5 / pag.</option>
                <option value={10}>10 / pag.</option>
                <option value={20}>20 / pag.</option>
                <option value={50}>50 / pag.</option>
              </select>
            </div>

            {/* 4 Input "Ir a" */}
            <div className="goto-wrapper">
              <span>Ir a</span>
              <input
                type="number"
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder=""
                min="1"
                max={totalPages}
              />
            </div>
          </div>
        </div>

        {/* Fila Inferior: Botonera de Navegación (5 y 6) */}
        <div className="pagination-bottom-row">
          {/* Ir al principio */}
          <button onClick={() => goToPage(1)} disabled={currentPage === 1}>
            {"|<"}
          </button>
          
          {/* Anterior */}
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            {"<"}
          </button>

          {/* Bloque central de números */}
          <div className="pagination-nav-numbers">
            {getPageNumbers().map((item, index) => {
              if (item === "...") {
                return <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>;
              }
              return (
                <button
                  key={`page-${item}`}
                  onClick={() => goToPage(item)}
                  className={currentPage === item ? "active-page" : ""}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* Siguiente */}
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
            {">"}
          </button>

          {/* Ir al final */}
          <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}>
            {">|"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Table;