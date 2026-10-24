import { Fragment, useEffect, useRef, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
  ProgressBar,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { registrarEmpresa } from "../services/registroService";

import {
  ESTADOS,
  PAISES_TELEFONO,
  CAMPOS_POR_PASO,
  MAPA_ERRORES_API,
  validarCampo,
  validarFormulario,
  requisitosPassword,
  fortalezaPassword,
  construirPayload,
} from "../utils/validacionesRegistro";

import "../styles/auth/RegistroEmpresa.css";

const INITIAL_DATA = {
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
};

const idCampo = (key) => `registro-${key.replace(".", "-")}`;

// Mantener estos componentes fuera de RegistroEmpresa conserva el foco.
function Campo({
  campo,
  etiqueta,
  valor,
  mensaje,
  onChange,
  onBlur,
  children,
  ayuda,
  ...props
}) {
  const id = idCampo(campo);

  const describedBy =
    [
      mensaje && `${id}-error`,
      ayuda && `${id}-ayuda`,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <Form.Group className="mb-3">
      <Form.Label htmlFor={id}>
        {etiqueta}
        {props.required ? " *" : ""}
      </Form.Label>

      {children ? (
        <Form.Select
          id={id}
          name={campo}
          value={valor}
          onChange={onChange}
          onBlur={onBlur}
          isInvalid={Boolean(mensaje)}
          aria-invalid={Boolean(mensaje)}
          aria-describedby={describedBy}
          {...props}
        >
          {children}
        </Form.Select>
      ) : (
        <Form.Control
          id={id}
          name={campo}
          value={valor}
          onChange={onChange}
          onBlur={onBlur}
          isInvalid={Boolean(mensaje)}
          aria-invalid={Boolean(mensaje)}
          aria-describedby={describedBy}
          {...props}
        />
      )}

      {mensaje && (
        <Form.Control.Feedback
          type="invalid"
          id={`${id}-error`}
        >
          {mensaje}
        </Form.Control.Feedback>
      )}

      {ayuda && (
        <Form.Text id={`${id}-ayuda`}>
          {ayuda}
        </Form.Text>
      )}
    </Form.Group>
  );
}

function Telefono({
  grupo,
  valor,
  pais,
  mensaje,
  onChange,
  onBlur,
  cambiarPais,
  disabled,
  required,
}) {
  const campo = `${grupo}.telefono`;
  const id = idCampo(campo);

  return (
    <Form.Group className="mb-3">
      <Form.Label htmlFor={id}>
        Teléfono{required ? " *" : " (opcional)"}
      </Form.Label>

      <div
        className={[
          "registro-telefono",
          mensaje ? "registro-telefono-error" : "",
          disabled ? "registro-telefono-disabled" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Form.Select
          id={`${id}-pais`}
          className="registro-telefono-pais"
          aria-label={`País del teléfono de ${
            grupo === "empresa"
              ? "la empresa"
              : "administrador"
          }`}
          value={pais}
          onChange={(e) => cambiarPais(grupo, e.target.value)}
          disabled={disabled}
        >
          {PAISES_TELEFONO.map((p) => (
            <option key={p.codigo} value={p.codigo}>
              {p.codigo === pais
                ? `${p.codigo} ${p.prefijo}`
                : `${p.nombre} (${p.prefijo})`}
            </option>
          ))}
        </Form.Select>

        <Form.Control
          id={id}
          className="registro-telefono-numero"
          name={campo}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={valor}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          maxLength={32}
          placeholder={
            pais === "MX"
              ? "999 123 4567"
              : "Número de teléfono"
          }
          aria-invalid={Boolean(mensaje)}
          aria-describedby={
            mensaje ? `${id}-error` : undefined
          }
        />
      </div>

      {mensaje && (
        <Form.Control.Feedback
          type="invalid"
          className="d-block"
          id={`${id}-error`}
        >
          {mensaje}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
}

function Clave({
  campo,
  etiqueta,
  valor,
  mensaje,
  visible,
  alternar,
  onChange,
  onBlur,
  loading,
}) {
  const id = idCampo(campo);

  const describedBy =
    [
      mensaje && `${id}-error`,
      campo === "administrador.password" &&
        "registro-requisitos",
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <Form.Group className="mb-3">
      <Form.Label htmlFor={id}>
        {etiqueta} *
      </Form.Label>

      <InputGroup hasValidation>
        <Form.Control
          id={id}
          name={campo}
          type={visible ? "text" : "password"}
          value={valor}
          required
          autoComplete="new-password"
          maxLength={128}
          onChange={onChange}
          onBlur={onBlur}
          disabled={loading}
          isInvalid={Boolean(mensaje)}
          aria-invalid={Boolean(mensaje)}
          aria-describedby={describedBy}
        />

        <Button
          type="button"
          variant="outline-secondary"
          aria-controls={id}
          aria-pressed={visible}
          aria-label={`${
            visible ? "Ocultar" : "Mostrar"
          } ${etiqueta.toLowerCase()}`}
          disabled={loading}
          onClick={alternar}
        >
          {visible ? "Ocultar" : "Mostrar"}
        </Button>

        {mensaje && (
          <Form.Control.Feedback
            type="invalid"
            id={`${id}-error`}
          >
            {mensaje}
          </Form.Control.Feedback>
        )}
      </InputGroup>
    </Form.Group>
  );
}

export default function RegistroEmpresa() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_DATA);

  const [paises, setPaises] = useState({
    empresa: "MX",
    administrador: "MX",
  });

  const [touched, setTouched] = useState({});
  const [erroresServidor, setErroresServidor] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [mostrarClave, setMostrarClave] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] =
    useState(false);

  const [enfocar, setEnfocar] = useState("");

  const enviando = useRef(false);
  const errorRef = useRef(null);

  const fuerza = fortalezaPassword(
    formData.administrador.password
  );

  const municipios =
    ESTADOS.find(
      (estado) => estado.nombre === formData.empresa.estado
    )?.municipios || [];

  useEffect(() => {
    if (!enfocar) return;

    document.getElementById(idCampo(enfocar))?.focus();
    setEnfocar("");
  }, [enfocar, step]);

  useEffect(() => {
    if (error) {
      errorRef.current?.focus();
    }
  }, [error]);

  const mensaje = (key) => {
    if (erroresServidor[key]) {
      return erroresServidor[key];
    }

    return touched[key]
      ? validarCampo(key, formData, paises)
      : "";
  };

  const borrarErrorServidor = (...keys) => {
    setErroresServidor((prev) => {
      const next = { ...prev };

      keys.forEach((key) => {
        delete next[key];
      });

      return next;
    });
  };

  const onChange = (e) => {
    const { name: key, value } = e.target;
    const [grupo, nombreCampo] = key.split(".");

    setError("");

    const erroresParaLimpiar = [key];

    if (nombreCampo === "password") {
      erroresParaLimpiar.push(
        "administrador.passwordConfirmation"
      );
    }

    if (nombreCampo === "estado") {
      erroresParaLimpiar.push("empresa.ciudad");
    }

    borrarErrorServidor(...erroresParaLimpiar);

    setFormData((prev) => ({
      ...prev,
      [grupo]: {
        ...prev[grupo],
        [nombreCampo]: value,
        ...(nombreCampo === "estado"
          ? { ciudad: "" }
          : {}),
      },
    }));

    if (nombreCampo === "estado") {
      setTouched((prev) => ({
        ...prev,
        "empresa.ciudad": false,
      }));
    }
  };

  const onBlur = (e) => {
    const { name } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const cambiarPais = (grupo, pais) => {
    setPaises((prev) => ({
      ...prev,
      [grupo]: pais,
    }));

    borrarErrorServidor(`${grupo}.telefono`);

    setTouched((prev) => ({
      ...prev,
      [`${grupo}.telefono`]: true,
    }));

    setError("");
  };

  const campo = (key, etiqueta, props = {}) => {
    const [grupo, nombreCampo] = key.split(".");

    return (
      <Campo
        campo={key}
        etiqueta={etiqueta}
        valor={formData[grupo][nombreCampo]}
        mensaje={mensaje(key)}
        onChange={onChange}
        onBlur={onBlur}
        required
        disabled={loading}
        {...props}
      />
    );
  };

  const telefono = (grupo, required) => (
    <Telefono
      grupo={grupo}
      valor={formData[grupo].telefono}
      pais={paises[grupo]}
      mensaje={mensaje(`${grupo}.telefono`)}
      onChange={onChange}
      onBlur={onBlur}
      cambiarPais={cambiarPais}
      disabled={loading}
      required={required}
    />
  );

  const irAlCampo = (key) => {
    const pasoDelCampo = Object.keys(
      CAMPOS_POR_PASO
    ).find((paso) =>
      CAMPOS_POR_PASO[paso].includes(key)
    );

    if (pasoDelCampo) {
      setStep(Number(pasoDelCampo));
    }

    setEnfocar(key);
  };

  const siguientePaso = () => {
    if (loading || step >= 3) return;

    const keys = CAMPOS_POR_PASO[step];

    setTouched((prev) => ({
      ...prev,
      ...Object.fromEntries(
        keys.map((key) => [key, true])
      ),
    }));

    const invalid = keys.find(
      (key) =>
        validarCampo(key, formData, paises) ||
        erroresServidor[key]
    );

    if (invalid) {
      setEnfocar(invalid);
      return;
    }

    setError("");
    setStep((prev) => Math.min(3, prev + 1));
  };

  const pasoAnterior = () => {
    if (loading) return;

    setError("");
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (enviando.current) return;

    if (step < 3) {
      siguientePaso();
      return;
    }

    const errors = {
      ...erroresServidor,
      ...validarFormulario(formData, paises),
    };

    const keys = Object.values(
      CAMPOS_POR_PASO
    ).flat();

    setTouched(
      Object.fromEntries(
        keys.map((key) => [key, true])
      )
    );

    const invalid = keys.find(
      (key) => errors[key]
    );

    if (invalid) {
      irAlCampo(invalid);
      return;
    }

    enviando.current = true;
    setLoading(true);
    setError("");
    setErroresServidor({});

    try {
      const payload = construirPayload(
        formData,
        paises
      );

      await registrarEmpresa(payload);

      navigate("/registro-exitoso", {
        replace: true,
      });
    } catch (err) {
      const response =
        err?.response?.data ||
        err?.data ||
        err ||
        {};

      const mapped = {};

      for (const [key, messages] of Object.entries(
        response.errors || {}
      )) {
        const campoFormulario =
          MAPA_ERRORES_API[key];

        if (!campoFormulario) continue;

        mapped[campoFormulario] = Array.isArray(
          messages
        )
          ? messages.join(" ")
          : String(messages);
      }

      setErroresServidor(mapped);

      const first = keys.find(
        (key) => mapped[key]
      );

      if (first) {
        irAlCampo(first);
      } else {
        setError(
          response.message ||
            "No se pudo completar el registro. Intenta nuevamente."
        );
      }
    } finally {
      enviando.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-overlay" />

      <Container
        fluid
        className="min-vh-100 d-flex align-items-center py-4"
      >
        <Row className="w-100 align-items-center">
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

          <Col
            md={7}
            className="d-flex justify-content-center"
          >
            <Card className="register-card shadow-lg border-0">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <h4 className="fw-bold mb-1">
                    Registra tu empresa
                  </h4>

                  <p className="text-muted register-subtitle">
                    Comienza tus 30 días gratis en SALUNEX
                  </p>
                </div>

                <div
                  className="register-steps"
                  aria-label={`Paso ${step} de 3`}
                >
                  {[
                    "Empresa",
                    "Ubicación",
                    "Administrador",
                  ].map((label, index) => (
                    <Fragment key={label}>
                      {index > 0 && (
                        <div
                          className={`register-step-line ${
                            step >= index + 1
                              ? "active"
                              : ""
                          }`}
                        />
                      )}

                      <div
                        className={`register-step ${
                          step >= index + 1
                            ? "active"
                            : ""
                        }`}
                        aria-current={
                          step === index + 1
                            ? "step"
                            : undefined
                        }
                      >
                        <span>{index + 1}</span>
                        <small>{label}</small>
                      </div>
                    </Fragment>
                  ))}
                </div>

                <Form
                  onSubmit={handleSubmit}
                  noValidate
                  aria-busy={loading}
                >
                  {/* PASO 1: EMPRESA */}
                  {step === 1 && (
                    <div className="register-step-content">
                      <h5 className="register-section-title">
                        Información de la empresa
                      </h5>

                      {campo(
                        "empresa.nombre",
                        "Nombre de la empresa",
                        {
                          maxLength: 150,
                          autoComplete: "organization",
                          placeholder:
                            "Ej. Farmacia San José",
                        }
                      )}

                      <Row>
                        <Col md={6}>
                          {telefono("empresa", true)}
                        </Col>

                        <Col md={6}>
                          {campo(
                            "empresa.correo",
                            "Correo empresarial",
                            {
                              type: "email",
                              maxLength: 254,
                              autoComplete: "email",
                              placeholder:
                                "empresa@correo.com",
                            }
                          )}
                        </Col>
                      </Row>
                    </div>
                  )}

                  {/* PASO 2: UBICACIÓN */}
                  {step === 2 && (
                    <div className="register-step-content">
                      <h5 className="register-section-title">
                        Ubicación de la empresa
                      </h5>

                      {campo(
                        "empresa.direccion",
                        "Dirección",
                        {
                          maxLength: 255,
                          autoComplete: "street-address",
                          placeholder:
                            "Calle, número y colonia",
                        }
                      )}

                      <Row>
                        <Col md={6}>
                          {campo(
                            "empresa.estado",
                            "Estado",
                            {
                              autoComplete:
                                "address-level1",
                              children: (
                                <>
                                  <option value="">
                                    Selecciona un estado
                                  </option>

                                  {ESTADOS.map(
                                    (estado) => (
                                      <option
                                        key={estado.id}
                                        value={
                                          estado.nombre
                                        }
                                      >
                                        {estado.nombre}
                                      </option>
                                    )
                                  )}
                                </>
                              ),
                            }
                          )}
                        </Col>

                        <Col md={6}>
                          {campo(
                            "empresa.ciudad",
                            "Ciudad / Municipio",
                            {
                              autoComplete:
                                "address-level2",
                              disabled:
                                loading ||
                                !formData.empresa.estado,
                              ayuda:
                                "Elige el municipio o alcaldía donde se ubica tu empresa.",
                              children: (
                                <>
                                  <option value="">
                                    {formData.empresa
                                      .estado
                                      ? "Selecciona un municipio"
                                      : "Primero selecciona un estado"}
                                  </option>

                                  {municipios.map(
                                    (nombre) => (
                                      <option
                                        key={nombre}
                                        value={nombre}
                                      >
                                        {nombre}
                                      </option>
                                    )
                                  )}
                                </>
                              ),
                            }
                          )}
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          {campo(
                            "empresa.codigoPostal",
                            "Código postal",
                            {
                              inputMode: "numeric",
                              maxLength: 5,
                              autoComplete:
                                "postal-code",
                              placeholder: "97000",
                              ayuda:
                                "5 dígitos. Conserva los ceros iniciales.",
                            }
                          )}
                        </Col>
                      </Row>
                    </div>
                  )}

                  {/* PASO 3: ADMINISTRADOR */}
                  {step === 3 && (
                    <div className="register-step-content">
                      <h5 className="register-section-title">
                        Crea tu cuenta de administrador
                      </h5>

                      <Row>
                        <Col md={6}>
                          {campo(
                            "administrador.nombre",
                            "Nombre",
                            {
                              maxLength: 100,
                              autoComplete:
                                "given-name",
                            }
                          )}
                        </Col>

                        <Col md={6}>
                          {campo(
                            "administrador.apellidos",
                            "Apellidos",
                            {
                              maxLength: 100,
                              autoComplete:
                                "family-name",
                            }
                          )}
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          {campo(
                            "administrador.correo",
                            "Correo electrónico",
                            {
                              type: "email",
                              maxLength: 254,
                              autoComplete: "email",
                              placeholder:
                                "administrador@correo.com",
                            }
                          )}
                        </Col>

                        <Col md={6}>
                          {telefono(
                            "administrador",
                            false
                          )}
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Clave
                            campo="administrador.password"
                            etiqueta="Contraseña"
                            valor={
                              formData.administrador
                                .password
                            }
                            mensaje={mensaje(
                              "administrador.password"
                            )}
                            visible={mostrarClave}
                            alternar={() =>
                              setMostrarClave(
                                (prev) => !prev
                              )
                            }
                            onChange={onChange}
                            onBlur={onBlur}
                            loading={loading}
                          />
                        </Col>

                        <Col md={6}>
                          <Clave
                            campo="administrador.passwordConfirmation"
                            etiqueta="Confirmar contraseña"
                            valor={
                              formData.administrador
                                .passwordConfirmation
                            }
                            mensaje={mensaje(
                              "administrador.passwordConfirmation"
                            )}
                            visible={
                              mostrarConfirmacion
                            }
                            alternar={() =>
                              setMostrarConfirmacion(
                                (prev) => !prev
                              )
                            }
                            onChange={onChange}
                            onBlur={onBlur}
                            loading={loading}
                          />
                        </Col>
                      </Row>

                      <div
                        className="mb-3"
                        id="registro-requisitos"
                      >
                        <p
                          className="small mb-1"
                          aria-live="polite"
                        >
                          Fortaleza orientativa:{" "}
                          <strong>
                            {fuerza.texto}
                          </strong>
                        </p>

                        <ProgressBar
                          variant={fuerza.color}
                          now={fuerza.porcentaje}
                          aria-label={`Fortaleza de contraseña: ${fuerza.texto}`}
                        />

                        <ul className="small mt-2 mb-1 ps-3">
                          {requisitosPassword(
                            formData.administrador
                              .password
                          ).map((requisito) => (
                            <li
                              key={requisito.texto}
                              className={
                                requisito.cumple
                                  ? "text-success"
                                  : "text-muted"
                              }
                            >
                              {requisito.cumple
                                ? "✓"
                                : "○"}{" "}
                              {requisito.texto}
                            </li>
                          ))}
                        </ul>

                        <Form.Text>
                          Sin espacios y hasta 64
                          caracteres. Una clave larga
                          y única es más segura.
                        </Form.Text>
                      </div>

                      <div className="trial-message">
                        <div className="trial-icon">
                          ✓
                        </div>

                        <div>
                          <strong>
                            Tu prueba comienza al
                            registrarte
                          </strong>

                          <p>
                            Tendrás acceso a SALUNEX
                            durante 30 días sin costo.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div
                      ref={errorRef}
                      tabIndex={-1}
                      role="alert"
                      className="alert alert-danger py-2 text-center mb-3"
                    >
                      {error}
                    </div>
                  )}

                  <div className="register-navigation">
                    {step > 1 && (
                      <Button
                        type="button"
                        className="register-back-btn"
                        disabled={loading}
                        onClick={pasoAnterior}
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