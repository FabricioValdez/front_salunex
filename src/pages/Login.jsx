import { useState, useContext, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { login } from "../services/authService";
import "../styles/auth/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { loginUser, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🔥 Si ya está logueado, lo redirige de forma segura
  useEffect(() => {
    if (user) {
      // 🌟 Si el usuario tiene permisos de farmacia, va directo; si no, a la raíz pública
      if (user.permisos?.includes("GFAR")) {
        navigate("/farmacia", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(email, password);
      console.log("Respuesta del backend:", data);
      
      // El loginUser guarda token, datos base y el array de permisos en el contexto global
      loginUser(data.token, data.user);

      // 🌟 Redirección dinámica según los permisos que devolvió Laravel
      if (data.user.permisos?.includes("GFAR")) {
        navigate("/farmacia", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-overlay"></div>

      <Container fluid className="vh-100 d-flex align-items-center">
        <Row className="w-100 align-items-center">

          {/* LADO IZQUIERDO */}
          <Col md={6} className="text-center text-md-start text-white ps-md-5">
            <div className="brand-container">
              <div className="brand-icon">👤</div>
              <div>
                <h1 className="brand-title">SALUNEX</h1>
                <p className="brand-subtitle">
                  Sistema de gestión de almacén
                </p>
              </div>
            </div>
          </Col>

          {/* LADO DERECHO */}
          <Col md={6} className="d-flex justify-content-center">
            <Card className="login-card shadow-lg border-0">
              <Card.Body className="p-4">

                <h4 className="text-center mb-4 fw-bold">
                  Iniciar sesión
                </h4>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Usuario o email</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ingresa tu usuario o email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Form.Group>

                  {error && (
                    <div className="alert alert-danger py-2 text-center mb-3">
                      {error}
                    </div>
                  )}

                  <div className="login-buttons">
                    <Button
                      type="submit"
                      className="login-btn w-100"
                      disabled={loading}
                    >
                      {loading ? <span className="loader"></span> : "Iniciar Sesión"}
                    </Button>

                    <Button
                      type="button"
                      className="register-btn w-100"
                      onClick={() => navigate("/register")}
                    >
                      Registrarse
                    </Button>
                  </div>
                </Form>

              </Card.Body>
            </Card>
          </Col>

        </Row>
      </Container>
    </div>
  );
}

export default Login;