import "../../styles/general/Ordenes.css";
import { Search, Plus, Clock, AlertTriangle, ArrowUpRight } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import Modal from "../../components/ui/Modal";
import FilterButton from "../../components/ui/FilterButton";
import FilterModal from "../../components/features/ordenes/FilterModal";
import SummaryCard from "../../components/ui/SummaryCard";
import SearchBar from "../../components/ui/SearchBar";

import OrdenList from "../../components/features/ordenes/OrdenList";
import OrdenDetail from "../../components/features/ordenes/OrdenDetail";
import OrdenForm from "../../components/features/ordenes/OrdenForm";

const API_URL = "http://localhost:8000/api/movimientos";

const Ordenes = () => {
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(location.state?.openModal || false);
  const [openFilter, setOpenFilter] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  const [filtros, setFiltros] = useState({
    estatus: "todos",
    desde: "",
    hasta: ""
  });

  // Estados dinámicos provenientes del Backend
  const [ordenesPorSurtir, setOrdenesPorSurtir] = useState([]);
  const [ordenesPorRecibir, setOrdenesPorRecibir] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carga de Datos desde la API Laravel
  const fetchOrdenes = async () => {
    try {
      setLoading(true);

      const res = await api.get("/movimientos");
      const data = res.data; 

      setOrdenesPorSurtir(data.por_surtir ? data.por_surtir.map(o => ({ ...o, tipoFlujo: 'surtir' })) : []);
      setOrdenesPorRecibir(data.por_recibir ? data.por_recibir.map(o => ({ ...o, tipoFlujo: 'recibir' })) : []);
    } catch (error) {
      console.error("Error cargando los movimientos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdenes();
    if (location.state?.openModal) {
      window.history.replaceState({}, document.title);
    }
  }, []);

  // Combinación unificada para pasar al filtrado y listas tradicionales
  const todasLasOrdenes = [...ordenesPorSurtir, ...ordenesPorRecibir];

  const ordenesFiltradas = todasLasOrdenes.filter((orden) => {
    const matchSearch =
      String(orden.id).includes(search) ||
      orden.origen.toLowerCase().includes(search.toLowerCase()) ||
      orden.destino.toLowerCase().includes(search.toLowerCase());

    const matchEstatus =
      filtros.estatus === "todos" || orden.estatus.toLowerCase() === filtros.estatus.toLowerCase();

    const fechaOrden = new Date(orden.fecha);
    const matchDesde = !filtros.desde || fechaOrden >= new Date(filtros.desde);
    const matchHasta = !filtros.hasta || fechaOrden <= new Date(filtros.hasta);

    return matchSearch && matchEstatus && matchDesde && matchHasta;
  });

  // Cálculos dinámicos basados en la base de datos real
  const pendientesSurtir = ordenesPorSurtir.filter(o => o.estatus === "Pendiente").length;
  const enCamino = todasLasOrdenes.filter(o => o.estatus === "En Camino").length;
  const totalOrdenesActivas = todasLasOrdenes.length;

  const agregarOrden = async (nuevaOrden) => {
    setOpenModal(false);
    fetchOrdenes();
  };

  return (
    <>
      <Modal isOpen={openModal} onClose={() => setOpenModal(false)} title="Orden de Compra" className="orden-modal-wide">
        <OrdenForm onSubmit={agregarOrden} onClose={() => setOpenModal(false)} />
      </Modal>

      <Modal isOpen={openFilter} onClose={() => setOpenFilter(false)} title="Filtrar órdenes">
        <FilterModal filtros={filtros} setFiltros={setFiltros} onClose={() => setOpenFilter(false)} />
      </Modal>

      <PageContainer>
        {/* RENDERIZADO CONDICIONAL: Si hay orden, pantalla completa de detalle; si no, listado normal */}
        {ordenSeleccionada ? (
          <div className="ordenes-content full-screen-detail">
            <OrdenDetail
              orden={ordenSeleccionada}
              onClose={() => setOrdenSeleccionada(null)}
              onActionSuccess={() => {
                fetchOrdenes();
                setOrdenSeleccionada(null); // Opcional: cierra el detalle tras el éxito
              }}
            />
          </div>
        ) : (
          <>
            <div className="dashboard-title">
              <h1>Órdenes y Traspasos entre Sucursales</h1>
              <p>Gestionar flujos de solicitudes de medicamentos, despacho y recepciones en tiempo real.</p>
            </div>

            <div className="summary-cards">
              <SummaryCard
                title="Por Surtir (Pendientes)"
                value={pendientesSurtir}
                icon={<Clock size={26} />}
                variant="blue"
              />
              <SummaryCard
                title="En Camino"
                value={enCamino}
                icon={<AlertTriangle size={26} />}
                variant="red"
              />
              <SummaryCard
                title="Total en Gestión"
                value={totalOrdenesActivas}
                icon={<ArrowUpRight size={26} />}
                variant="green"
              />
            </div>

            <div className="actions-bar">
              <SearchBar
                placeholder="Buscar ID, Origen, Destino..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FilterButton onClick={() => setOpenFilter(true)} />
              <button className="primary-btn" onClick={() => setOpenModal(true)}>
                <Plus size={16} /> Nueva Solicitud
              </button>
            </div>

            {loading ? (
              <div className="text-center p-4">Cargando flujos de inventario...</div>
            ) : (
              <div className="ordenes-content one-column">
                <OrdenList
                  ordenes={ordenesFiltradas}
                  ordenSeleccionada={ordenSeleccionada}
                  onSelect={setOrdenSeleccionada}
                />
              </div>
            )}
          </>
        )}
      </PageContainer>
    </>
  );
};

export default Ordenes;