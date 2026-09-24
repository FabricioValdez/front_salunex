import { Container, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import "../styles/auth/RegistroExitoso.css";

function RegistroExitoso() {
  const navigate = useNavigate();

  return (
    <div className="registro-exitoso-page">
      <div className="registro-exitoso-overlay"></div>

      <Container className="min-vh-100 d-flex justify-content-center align-items-center py-4">
        <Card className="registro-exitoso-card shadow-lg border-0">
          <Card.Body className="text-center p-4 p-md-5">

            <div className="registro-exitoso-icon">
              ✓
            </div>

            <h2 className="registro-exitoso-title">
              ¡Cuenta creada correctamente!
            </h2>

            <p className="registro-exitoso-text">
              Tu empresa y tu cuenta de administrador han sido
              registradas correctamente en SALUNEX.
            </p>

            <div className="registro-exitoso-trial">
              <strong>¡Bienvenido a SALUNEX!</strong>

              <p>
                Ya puedes iniciar sesión y comenzar tus 30 días
                de prueba gratuita.
              </p>
            </div>

            <Button
              className="registro-exitoso-btn"
              onClick={() => navigate("/login", { replace: true })}
            >
              Iniciar sesión
            </Button>

          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default RegistroExitoso;