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
    <Container
      fluid
      className="vh-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "#e1e3e6" }}
    >
      <Row className="w-100 justify-content-center">
        <Col xs={11} sm={7} md={4} lg={3}>
          <div className="text-center mb-4">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: "#5c7cfa",
                borderRadius: "20px",
                color: "white",
                fontSize: "35px",
              }}
            >
              👤
            </div>
            <h3 className="fw-bold">SALUNEX</h3>
            <p className="text-muted">Sistema de gestión de almacén</p>
          </div>

          <Card className="p-4 shadow-sm border-0 rounded-4">
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

              <Button
                type="submit"
                variant="primary"
                className="w-100 d-flex justify-content-center align-items-center"
                disabled={loading}
              >
                {loading ? <span className="loader"></span> : "Iniciar Sesión"}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;