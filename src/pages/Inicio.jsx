import "../styles/inicio.css";
import { Plus, Bell } from "lucide-react";
import InventoryChart from "../components/InventoryChart";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PageContainer from "../components/ui/PageContainer";
import SearchBar from "../components/ui/SearchBar";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import DataCard from "../components/ui/DataCard";

const Inicio = () => {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState("semana");
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      {/* MODAL */}
      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        title="Selecciona la acción que deseas realizar"
      >
        <div className="modal-description">
          <p>
            Selecciona una opción para continuar con el registro en el sistema.
          </p>
        </div>

        <div className="modal-options">
          <Button
            variant="secondary"
            onClick={() =>
              navigate("/ordenes", { state: { openModal: true } })
            }
          >
            Crear Orden de Compra
          </Button>

          <Button
            variant="secondary"
            onClick={() =>
              navigate("/inventario", { state: { openModal: true } })
            }
          >
            Agregar Medicamento
          </Button>

          <Button
            variant="secondary"
            onClick={() =>
              navigate("/farmacias", { state: { openModal: true } })
            }
          >
            Registrar Farmacia
          </Button>
        </div>
      </Modal>

      <PageContainer>

        {/* HEADER SUPERIOR */}
        <div className="dashboard-header">
          <SearchBar placeholder="Search Order ID, Pharmacies or ..." />

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setOpenModal(true)}
          >
            Nueva Entrada
          </Button>
        </div>

        {/* DESCRIPCIÓN */}
        <div className="dashboard-title">
          <h1>Descripción general</h1>
          <p>
            Actualizaciones logísticas y métricas de inventario en tiempo real.
          </p>
        </div>

        {/* CARD GRÁFICA */}
        <DataCard>
          <div className="card-header">
            <h3>Movimiento de inventario</h3>

            <div className="tabs">
              <Button
                variant="tab"
                active={periodo === "semana"}
                onClick={() => setPeriodo("semana")}
              >
                Semana
              </Button>

              <Button
                variant="tab"
                active={periodo === "mes"}
                onClick={() => setPeriodo("mes")}
              >
                Mes
              </Button>
            </div>
          </div>

          <div>
            <InventoryChart periodo={periodo} />
          </div>
        </DataCard>

        {/* ALERTAS */}
        <DataCard>
          <div className="card-header">
            <h3 className="card-title">
              <Bell size={20} className="bell-icon" />
              Alertas Críticas
            </h3>
            <span className="badge">3</span>
          </div>

          <div className="alert-item">
            <div className="alert-left">
              <strong>Paracetamol 500mg</strong>
              <p>Folio: 26071</p>
            </div>

            <div className="alert-right">
              <span className="danger">Por expirar</span>
              <span className="expiration-days">3 días restantes</span>
            </div>
          </div>

          <div className="alert-item">
            <div className="alert-left">
              <strong>Difenhidramina 500mg</strong>
              <p>Folio: 67194</p>
            </div>
            <div className="alert-right">
              <span className="warning">Poca existencia</span>
              <span className="expiration-days">3 Unidades</span>
            </div>
          </div>

          <div className="alert-item">
            <div className="alert-left">
              <strong>Penicilina 500mg</strong>
              <p>Folio: 94030</p>
            </div>

            <div className="alert-right">
              <span className="danger">Por expirar</span>
              <span className="expiration-days">12 días restantes</span>
            </div>
          </div>

          <div
            className="view-all"
            onClick={() => navigate("/control")}
            style={{ cursor: "pointer" }}
          >
            Ver todas las alertas
          </div>
        </DataCard>
      </PageContainer>
    </>
  );
};

export default Inicio;
