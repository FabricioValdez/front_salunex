import "../styles/Ordenes.css";
import { Search, Plus, Clock, AlertTriangle, DollarSign } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";


import PageContainer from "../components/ui/PageContainer";
import Modal from "../components/ui/Modal";
import FilterButton from "../components/ui/FilterButton";
import FilterModal from "../components/features/ordenes/FilterModal";
import SummaryCard from "../components/ui/SummaryCard";
import SearchBar from "../components/ui/SearchBar";

import OrdenList from "../components/features/ordenes/OrdenList";
import OrdenDetail from "../components/features/ordenes/OrdenDetail";
import OrdenForm from "../components/features/ordenes/OrdenForm";

const Ordenes = () => {

  const location = useLocation();
  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] = useState(
    location.state?.openModal || false
  );

  const [openFilter, setOpenFilter] = useState(false);

  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  const [filtros, setFiltros] = useState({
    estatus: "todos",
    desde: "",
    hasta: ""
  });

  const [ordenes, setOrdenes] = useState([
    {
      id: "OC-2026-001",
      proveedor: "AstraZeneca Pharma",
      fecha: "2026-10-12",
      estatus: "completado",
      total: 50000,
    },
    {
      id: "OC-2026-002",
      proveedor: "Pfizer Labs",
      fecha: "2026-10-28",
      estatus: "enviado",
      total: 46784,
    },
    {
      id: "OC-2026-003",
      proveedor: "Bayer México",
      fecha: "2026-11-10",
      estatus: "cancelado",
      total: 50000,
    },
  ]);

  const ordenesFiltradas = ordenes.filter((orden) => {

    const matchSearch =
      orden.id.toLowerCase().includes(search.toLowerCase()) ||
      orden.proveedor.toLowerCase().includes(search.toLowerCase());

    const matchEstatus =
      filtros.estatus === "todos" || orden.estatus === filtros.estatus;

    const fechaOrden = new Date(orden.fecha);

    const matchDesde =
      !filtros.desde || fechaOrden >= new Date(filtros.desde);

    const matchHasta =
      !filtros.hasta || fechaOrden <= new Date(filtros.hasta);

    return matchSearch && matchEstatus && matchDesde && matchHasta;

  });


  const generarIdOrden = () => {

    const year = new Date().getFullYear();
    const numeroOrden = ordenes.length + 1;
    const numeroFormateado = String(numeroOrden).padStart(3, "0");

    return `OC-${year}-${numeroFormateado}`;
  };

  const agregarOrden = (nuevaOrden) => {

    const nueva = {
      ...nuevaOrden,
      id: generarIdOrden(),
      fecha: new Date().toISOString().split("T")[0],
    };

    setOrdenes((prev) => [...prev, nueva]);
  };

  const hoy = new Date();

  const pendientes = ordenes.filter(o => o.estatus === "enviado").length;

  const vencidas = ordenes.filter(o => {
    const fechaOrden = new Date(o.fecha);

    return (
      o.estatus !== "completado" &&
      fechaOrden < hoy
    );
  }).length;

  const valorTotal = ordenes
    .filter(o => o.estatus === "completado")
    .reduce((acc, o) => acc + o.total, 0);

  useEffect(() => {
    if (location.state?.openModal) {
      window.history.replaceState({}, document.title);
    }
  }, []);

  return (
    <>
      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        title="Registrar nueva Orden de Compra"
      >
        <OrdenForm
          onSubmit={agregarOrden}
          onClose={() => setOpenModal(false)}
        />
      </Modal>

      <Modal
        isOpen={openFilter}
        onClose={() => setOpenFilter(false)}
        title="Filtrar órdenes"
      >
        <FilterModal
          filtros={filtros}
          setFiltros={setFiltros}
          onClose={() => setOpenFilter(false)}
        />
      </Modal>

      <PageContainer>

        <div className="dashboard-title">
          <h1>Órdenes</h1>
          <p>
            Gestionar los flujos de trabajo de reposición y adquisición de proveedores.
          </p>
        </div>

        <div className="summary-cards">

          <SummaryCard
            title="Órdenes pendientes"
            value={pendientes}
            icon={<Clock size={26} />}
            variant="blue"
          />

          <SummaryCard
            title="Entregas vencidas"
            value={vencidas}
            icon={<AlertTriangle size={26} />}
            variant="red"
          />

          <SummaryCard
            title="Valor total"
            value={`$${valorTotal.toLocaleString()}`}
            icon={<DollarSign size={26} />}
            variant="green"
          />

        </div>

        <div className="actions-bar">

          <SearchBar
            placeholder="Buscar Order ID, Proveedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />


          <FilterButton onClick={() => setOpenFilter(true)} />

          <button
            className="primary-btn"
            onClick={() => setOpenModal(true)}
          >
            <Plus size={16} /> Nueva Orden
          </button>

        </div>

        <div className={`ordenes-content ${ordenSeleccionada ? "two-columns" : "one-column"}`}>

          <OrdenList
            ordenes={ordenesFiltradas}
            ordenSeleccionada={ordenSeleccionada}
            onSelect={setOrdenSeleccionada}
          />

          {ordenSeleccionada && (
            <OrdenDetail
              orden={ordenSeleccionada}
              onClose={() => setOrdenSeleccionada(null)}
            />
          )}

        </div>

      </PageContainer>
    </>
  );
};

export default Ordenes;
