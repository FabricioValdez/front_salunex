import { useState } from "react";
import { Check } from "lucide-react";
import "./ModulosTab.css";

const modulos = [
  {
    id: "inventario",
    nombre: "Inventario",
    descripcion: "Control de stock, entradas y salidas de medicamentos",
    precio: 199,
  },
  {
    id: "ordenes",
    nombre: "Órdenes de compra",
    descripcion: "Gestión de pedidos a proveedores y seguimiento",
    precio: 199,
  },
  {
    id: "control",
    nombre: "Control de calidad",
    descripcion: "Revisión y validación de productos recibidos",
    precio: 149,
  },
  {
    id: "dashboard",
    nombre: "Dashboard / Reportes",
    descripcion: "Métricas, gráficas y reportes de tu operación",
    precio: 249,
  },
];

const ModulosTab = () => {
  const [seleccionados, setSeleccionados] = useState([]);

  const toggleModulo = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id)
        ? prev.filter((m) => m !== id)
        : [...prev, id]
    );
  };

  const total = modulos
    .filter((m) => seleccionados.includes(m.id))
    .reduce((acc, m) => acc + m.precio, 0);

  return (
    <div className="modulos-layout">

      <div className="modulos-lista">
        {modulos.map((modulo) => {
          const activo = seleccionados.includes(modulo.id);
          return (
            <div
              key={modulo.id}
              className={`modulo-card ${activo ? "seleccionado" : ""}`}
              onClick={() => toggleModulo(modulo.id)}
            >
              <div className="modulo-check">
                {activo && <Check size={14} />}
              </div>
              <div className="modulo-info">
                <p className="modulo-nombre">{modulo.nombre}</p>
                <span className="modulo-descripcion">{modulo.descripcion}</span>
              </div>
              <span className="modulo-precio">
                ${modulo.precio} <small>MXN/mes</small>
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Resumen ── */}
      <div className="modulos-resumen">
        <h3>Resumen</h3>

        {seleccionados.length === 0 ? (
          <p className="resumen-vacio">Selecciona los módulos que necesitas</p>
        ) : (
          <ul className="resumen-lista">
            {modulos
              .filter((m) => seleccionados.includes(m.id))
              .map((m) => (
                <li key={m.id}>
                  <span>{m.nombre}</span>
                  <span>${m.precio} MXN</span>
                </li>
              ))}
          </ul>
        )}

        <div className="resumen-total">
          <span>Total mensual</span>
          <strong>${total.toLocaleString()} MXN</strong>
        </div>

        <button
          className="primary-btn"
          disabled={seleccionados.length === 0}
        >
          Contratar módulos
        </button>
      </div>

    </div>
  );
};

export default ModulosTab;