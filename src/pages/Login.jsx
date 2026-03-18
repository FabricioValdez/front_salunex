import { useState, useContext, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { login } from "../services/authService";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { loginUser, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🔥 Si ya está logueado, no puede volver al login
  useEffect(() => {
    if (user) {
     navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login(email, password);
      console.log("DATA:", data);

      loginUser(data.user);

      console.log("DESPUÉS DE loginUser");

      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
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