import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import clienteAxios from "../../../services/api";

const SuscripcionExito = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();

  const [estado, setEstado] = useState("verificando"); // 'verificando' | 'exito' | 'error'
  const [datosSuscripcion, setDatosSuscripcion] = useState(null);
  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setEstado("error");
      setMensajeError("No se detectó un identificador de pago válido.");
      return;
    }

    const confirmarPago = async () => {
      try {
        const { data } = await clienteAxios.get(
          `/suscripciones/verificar-sesion?session_id=${sessionId}`
        );

        if (data.success) {
          setDatosSuscripcion(data.data);
          setEstado("exito");
        }
      } catch (err) {
        setEstado("error");
        setMensajeError(
          err.response?.data?.message || "No se pudo confirmar el pago de la suscripción."
        );
      }
    };

    confirmarPago();
  }, [sessionId]);

  if (estado === "verificando") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-gray-600">Verificando tu pago con Stripe...</p>
      </div>
    );
  }

  if (estado === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <AlertTriangle className="text-red-500 mb-3" size={54} />
        <h2 className="text-2xl font-bold mb-2">Error en la confirmación</h2>
        <p className="text-gray-600 mb-6">{mensajeError}</p>
        <button className="primary-btn" onClick={() => navigate("/suscripcion")}>
          Volver a planes
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <CheckCircle className="text-green-500 mb-3" size={54} />
      <h2 className="text-2xl font-bold mb-1">¡Gracias por tu suscripción!</h2>
      <p className="text-gray-600 mb-6">Tu pago se procesó con éxito y tu cuenta ya está activa.</p>

      {datosSuscripcion && (
        <div className="bg-gray-50 border rounded-lg p-4 text-left w-full max-w-sm mb-6 space-y-1 text-sm text-gray-700">
          <p><strong>Folio:</strong> #{datosSuscripcion.suscripcion_id}</p>
          <p><strong>Fecha de inicio:</strong> {datosSuscripcion.fecha_inicio}</p>
          <p><strong>Vigencia hasta:</strong> {datosSuscripcion.fecha_fin}</p>
        </div>
      )}

      <button
        className="primary-btn"
        onClick={() => { window.location.href = "/general/dashboard"; }}
      >
        Ir al Panel Principal
      </button>
    </div>
  );
};

export default SuscripcionExito;