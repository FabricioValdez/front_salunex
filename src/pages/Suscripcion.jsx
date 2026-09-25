import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import PageContainer from "../components/ui/PageContainer";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import PlanesTab from "../components/features/suscripcion/PlanesTab";
import ModulosTab from "../components/features/suscripcion/ModulosTab";
import clienteAxios from "../services/api";
import "../styles/Suscripcion.css";

const Suscripcion = () => {
  const [tabActiva, setTabActiva] = useState("paquetes");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados del Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [estadoPago, setEstadoPago] = useState("verificando"); // 'verificando' | 'exito' | 'error'
  const [datosPago, setDatosPago] = useState(null);
  const [mensajeError, setMensajeError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) return;

    setModalAbierto(true);
    setEstadoPago("verificando");

    const validarPagoStripe = async () => {
      try {
        const { data } = await clienteAxios.get(
          `/suscripciones/verificar-sesion?session_id=${sessionId}`
        );

        if (data.success) {
          setDatosPago(data.data);
          setEstadoPago("exito");
        } else {
          setEstadoPago("error");
          setMensajeError(data.message || "No se pudo validar el pago.");
        }
      } catch (err) {
        setEstadoPago("error");
        setMensajeError(
          err.response?.data?.message || "Ocurrió un error al registrar tu suscripción."
        );
      } finally {
        searchParams.delete("session_id");
        setSearchParams(searchParams, { replace: true });
      }
    };

    validarPagoStripe();
  }, [sessionId]);

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setRefreshKey((prev) => prev + 1);
  };

  const getModalTitle = () => {
    if (estadoPago === "verificando") return "Procesando pago";
    if (estadoPago === "exito") return "Suscripción confirmada";
    return "Aviso de suscripción";
  };

  return (
    <PageContainer>
      <div className="suscripcion-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Volver
        </button>
        <div className="suscripcion-titulo">
          <h1>Elige tu plan</h1>
          <p>Opciones flexibles para distintos tipos de uso</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-selector">
        <button
          className={`tab-btn ${tabActiva === "paquetes" ? "active" : ""}`}
          onClick={() => setTabActiva("paquetes")}
        >
          Paquetes
        </button>
        <button
          className={`tab-btn ${tabActiva === "modulos" ? "active" : ""}`}
          onClick={() => setTabActiva("modulos")}
        >
          Arma tu paquete
        </button>
      </div>

      {/* Vistas según la pestaña activa */}
      {tabActiva === "paquetes" && (
        <PlanesTab
          onIrAModulos={() => setTabActiva("modulos")}
          refreshKey={refreshKey}
        />
      )}
      {tabActiva === "modulos" && <ModulosTab />}

      {/* Modal oficial de la aplicación */}
      <Modal
        isOpen={modalAbierto}
        onClose={handleCerrarModal}
        title={getModalTitle()}
      >
        <div className="suscripcion-modal-body">
          {estadoPago === "verificando" && (
            <>
              <Loader2 className="animate-spin suscripcion-modal-icono loading" size={48} />
              <h3 className="suscripcion-modal-titulo">Confirmando con Stripe</h3>
              <p className="suscripcion-modal-mensaje">
                Estamos validando tu pago y activando tus módulos en el sistema...
              </p>
            </>
          )}

          {estadoPago === "exito" && (
            <>
              <CheckCircle className="suscripcion-modal-icono success" size={54} />
              <h3 className="suscripcion-modal-titulo">¡Pago realizado con éxito!</h3>
              <p className="suscripcion-modal-mensaje">
                Tu suscripción se ha actualizado correctamente y tus accesos ya están activos.
              </p>

              {datosPago && (
                <div className="suscripcion-modal-folio-box">
                  <div>
                    <span>Folio de suscripción: </span>
                    <strong>#{datosPago.suscripcion_id}</strong>
                  </div>
                  <div>
                    <span>Vigencia hasta: </span>
                    <strong>{datosPago.fecha_fin}</strong>
                  </div>
                </div>
              )}

              <Button
                variant="primary"
                onClick={handleCerrarModal}
                className="suscripcion-modal-btn"
              >
                Entendido
              </Button>
            </>
          )}

          {estadoPago === "error" && (
            <>
              <AlertTriangle className="suscripcion-modal-icono error" size={54} />
              <h3 className="suscripcion-modal-titulo">No se pudo confirmar</h3>
              <p className="suscripcion-modal-mensaje">{mensajeError}</p>

              <Button
                variant="secondary"
                onClick={() => setModalAbierto(false)}
                className="suscripcion-modal-btn"
              >
                Cerrar
              </Button>
            </>
          )}
        </div>
      </Modal>
    </PageContainer>
  );
};

export default Suscripcion; 