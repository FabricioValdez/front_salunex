import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { registrarEmpresa } from "../services/registroService";

import "../styles/auth/RegistroEmpresa.css";

function RegistroEmpresa() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    empresa: {
      nombre: "",
      telefono: "",
      correo: "",
      direccion: "",
      estado: "",
      ciudad: "",
      codigoPostal: "",
    },

    administrador: {
      nombre: "",
      apellidos: "",
      correo: "",
      telefono: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  // ==============================
  // CAMBIOS EN DATOS DE LA EMPRESA
  // ==============================

  const handleEmpresaChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      empresa: {
        ...prev.empresa,
        [name]: value,
      },
    }));
  };

  // ====================================
  // CAMBIOS EN DATOS DEL ADMINISTRADOR
  // ====================================

  const handleAdministradorChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      administrador: {
        ...prev.administrador,
        [name]: value,
      },
    }));
  };

  // ==============================
  // VALIDACIONES
  // ==============================

  const validarPaso = () => {
    setError("");

    // PASO 1
    if (step === 1) {
      const { nombre, telefono, correo } = formData.empresa;

      if (!nombre || !telefono || !correo) {
        setError("Completa todos los campos obligatorios.");
        return false;
      }
    }

    // PASO 2
    if (step === 2) {
      const {
        direccion,
        estado,
        ciudad,
        codigoPostal,
      } = formData.empresa;

      if (
        !direccion ||
        !estado ||
        !ciudad ||
        !codigoPostal
      ) {
        setError("Completa todos los campos obligatorios.");
        return false;
      }
    }

    // PASO 3
    if (step === 3) {
      const {
        nombre,
        apellidos,
        correo,
        password,
        passwordConfirmation,
      } = formData.administrador;

      if (
        !nombre ||
        !apellidos ||
        !correo ||
        !password ||
        !passwordConfirmation
      ) {
        setError("Completa todos los campos obligatorios.");
        return false;
      }

      if (password.length < 8) {
        setError(
          "La contraseña debe tener al menos 8 caracteres."
        );
        return false;
      }

      if (password !== passwordConfirmation) {
        setError("Las contraseñas no coinciden.");
        return false;
      }
    }

    return true;
  };

  // ==============================
  // NAVEGACIÓN ENTRE PASOS
  // ==============================

  const siguientePaso = () => {
    if (!validarPaso()) return;

    setError("");
    setStep((prev) => prev + 1);
  };

  const pasoAnterior = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  // ==============================
  // REGISTRO
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarPaso()) return;

    setError("");
    setLoading(true);

    try {
      const datosRegistro = {
        nombre_empresa: formData.empresa.nombre,
        correo_empresa: formData.empresa.correo,
        telefono_empresa: formData.empresa.telefono,

        direccion: formData.empresa.direccion,
        estado: formData.empresa.estado,
        ciudad: formData.empresa.ciudad,
        codigo_postal: formData.empresa.codigoPostal,

        nombre_administrador:
          `${formData.administrador.nombre} ${formData.administrador.apellidos}`.trim(),

        telefono_administrador:
          formData.administrador.telefono,

        email: formData.administrador.correo,
        password: formData.administrador.password,
      };

      console.log(
        "Datos enviados al backend:",
        datosRegistro
      );

      await registrarEmpresa(datosRegistro);

      // Registro terminado correctamente.
      // No iniciamos sesión automáticamente.
      navigate("/registro-exitoso", {
        replace: true,
      });
    } catch (err) {
      console.error(
        "Error al registrar la empresa:",
        err
      );

      setError(
        err.message ||
          "Ocurrió un error al registrar la empresa."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-overlay"></div>

      <Container
        fluid
        className="min-vh-100 d-flex align-items-center py-4"
      >
        <Row className="w-100 align-items-center">

          {/* ==============================
              LADO IZQUIERDO
          ============================== */}

          <Col
            md={5}
            className="text-center text-md-start text-white ps-md-5"
          >
            <div className="register-brand-container">
              <div className="register-brand-icon">
                <img
                  src="/logo_2.png"
                  alt="SALUNEX"
                />
              </div>
            </div>
          </Col>

          {/* ==============================
              LADO DERECHO
          ============================== */}

          <Col
            md={7}
            className="d-flex justify-content-center"
          >
            <Card className="register-card shadow-lg border-0">
              <Card.Body className="p-4 p-md-5">

                {/* ENCABEZADO */}

                <div className="text-center mb-4">
                  <h4 className="fw-bold mb-1">
                    Registra tu empresa
                  </h4>

                  <p className="text-muted register-subtitle">
                    Comienza tus 30 días gratis en SALUNEX
                  </p>
                </div>

                {/* ==============================
                    INDICADOR DE PASOS
                ============================== */}

                <div className="register-steps">

                  <div
                    className={`register-step ${
                      step >= 1 ? "active" : ""
                    }`}
                  >
                    <span>1</span>
                    <small>Empresa</small>
                  </div>

                  <div
                    className={`register-step-line ${
                      step >= 2 ? "active" : ""
                    }`}
                  ></div>

                  <div
                    className={`register-step ${
                      step >= 2 ? "active" : ""
                    }`}
                  >
                    <span>2</span>
                    <small>Ubicación</small>
                  </div>

                  <div
                    className={`register-step-line ${
                      step >= 3 ? "active" : ""
                    }`}
                  ></div>

                  <div
                    className={`register-step ${
                      step >= 3 ? "active" : ""
                    }`}
                  >
                    <span>3</span>
                    <small>Administrador</small>
                  </div>

                </div>

                <Form onSubmit={handleSubmit}>

                  {/* ==============================
                      PASO 1 - EMPRESA
                  ============================== */}

                  {step === 1 && (
                    <div className="register-step-content">

                      <h5 className="register-section-title">
                        Información de la empresa
                      </h5>

                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Nombre de la empresa *
                            </Form.Label>

                            <Form.Control
                              type="text"
                              name="nombre"
                              placeholder="Ej. Farmacia San José"
                              value={formData.empresa.nombre}
                              onChange={handleEmpresaChange}
                              disabled={loading}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Teléfono *
                            </Form.Label>

                            <Form.Control
                              type="tel"
                              name="telefono"
                              placeholder="999 123 4567"
                              value={formData.empresa.telefono}
                              onChange={handleEmpresaChange}
                              disabled={loading}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Correo empresarial *
                            </Form.Label>

                            <Form.Control
                              type="email"
                              name="correo"
                              placeholder="empresa@correo.com"
                              value={formData.empresa.correo}
                              onChange={handleEmpresaChange}
                              disabled={loading}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                    </div>
                  )}

                  {/* ==============================
                      PASO 2 - UBICACIÓN
                  ============================== */}

                  {step === 2 && (
                    <div className="register-step-content">

                      <h5 className="register-section-title">
                        Ubicación de la empresa
                      </h5>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          Dirección *
                        </Form.Label>

                        <Form.Control
                          type="text"
                          name="direccion"
                          placeholder="Calle, número y colonia"
                          value={formData.empresa.direccion}
                          onChange={handleEmpresaChange}
                          disabled={loading}
                        />
                      </Form.Group>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Estado *
                            </Form.Label>

                            <Form.Control
                              type="text"
                              name="estado"
                              placeholder="Ej. Yucatán"
                              value={formData.empresa.estado}
                              onChange={handleEmpresaChange}
                              disabled={loading}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Ciudad / Municipio *
                            </Form.Label>

                            <Form.Control
                              type="text"
                              name="ciudad"
                              placeholder="Ej. Mérida"
                              value={formData.empresa.ciudad}
                              onChange={handleEmpresaChange}
                              disabled={loading}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Código postal *
                            </Form.Label>

                            <Form.Control
                              type="text"
                              name="codigoPostal"
                              placeholder="97000"
                              value={
                                formData.empresa.codigoPostal
                              }
                              onChange={handleEmpresaChange}
                              disabled={loading}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                    </div>
                  )}

                  {/* ==============================
                      PASO 3 - ADMINISTRADOR
                  ============================== */}

                  {step === 3 && (
                    <div className="register-step-content">

                      <h5 className="register-section-title">
                        Crea tu cuenta de administrador
                      </h5>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Nombre *
                            </Form.Label>

                            <Form.Control
                              type="text"
                              name="nombre"
                              placeholder="Nombre"
                              value={
                                formData.administrador.nombre
                              }
                              onChange={
                                handleAdministradorChange
                              }
                              disabled={loading}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Apellidos *
                            </Form.Label>

                            <Form.Control
                              type="text"
                              name="apellidos"
                              placeholder="Apellidos"
                              value={
                                formData.administrador.apellidos
                              }
                              onChange={
                                handleAdministradorChange
                              }
                              disabled={loading}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Correo electrónico *
                            </Form.Label>

                            <Form.Control
                              type="email"
                              name="correo"
                              placeholder="administrador@correo.com"
                              value={
                                formData.administrador.correo
                              }
                              onChange={
                                handleAdministradorChange
                              }
                              disabled={loading}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Teléfono
                            </Form.Label>

                            <Form.Control
                              type="tel"
                              name="telefono"
                              placeholder="999 123 4567"
                              value={
                                formData.administrador.telefono
                              }
                              onChange={
                                handleAdministradorChange
                              }
                              disabled={loading}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Contraseña *
                            </Form.Label>

                            <Form.Control
                              type="password"
                              name="password"
                              placeholder="Mínimo 8 caracteres"
                              value={
                                formData.administrador.password
                              }
                              onChange={
                                handleAdministradorChange
                              }
                              disabled={loading}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Confirmar contraseña *
                            </Form.Label>

                            <Form.Control
                              type="password"
                              name="passwordConfirmation"
                              placeholder="Repite tu contraseña"
                              value={
                                formData.administrador
                                  .passwordConfirmation
                              }
                              onChange={
                                handleAdministradorChange
                              }
                              disabled={loading}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      {/* PRUEBA GRATUITA */}

                      <div className="trial-message">
                        <div className="trial-icon">
                          ✓
                        </div>

                        <div>
                          <strong>
                            Tu prueba comienza al registrarte
                          </strong>

                          <p>
                            Tendrás acceso a SALUNEX durante
                            30 días sin costo.
                          </p>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ==============================
                      ERRORES
                  ============================== */}

                  {error && (
                    <div className="alert alert-danger py-2 text-center mb-3">
                      {error}
                    </div>
                  )}

                  {/* ==============================
                      BOTONES
                  ============================== */}

                  <div className="register-navigation">

                    {step > 1 && (
                      <Button
                        type="button"
                        className="register-back-btn"
                        onClick={pasoAnterior}
                        disabled={loading}
                      >
                        Anterior
                      </Button>
                    )}

                    {step < 3 ? (
                      <Button
                        type="button"
                        className="register-next-btn"
                        onClick={siguientePaso}
                        disabled={loading}
                      >
                        Siguiente
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="register-next-btn"
                        disabled={loading}
                      >
                        {loading
                          ? "Creando empresa..."
                          : "Crear mi empresa"}
                      </Button>
                    )}

                  </div>

                </Form>

                {/* LOGIN */}

                <div className="register-login-link">
                  ¿Ya tienes una cuenta?{" "}

                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    disabled={loading}
                  >
                    Iniciar sesión
                  </button>
                </div>

              </Card.Body>
            </Card>
          </Col>

        </Row>
      </Container>
    </div>
  );
}

export default RegistroEmpresa;