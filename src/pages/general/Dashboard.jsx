import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import "../../styles/dashboard.css";

const API_URL = "http://localhost/api";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  /*
  |--------------------------------------------------------------------------
  | CARGAR DASHBOARD
  |--------------------------------------------------------------------------
  */

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No existe un token de autenticación.");
      }

      const response = await fetch(`${API_URL}/dashboard`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "No se pudo cargar el dashboard."
        );
      }

      setDashboardData(data);
    } catch (err) {
      console.error("Error dashboard:", err);

      setError(
        err.message || "Ocurrió un error al cargar el dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDashboard();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FORMATOS
  |--------------------------------------------------------------------------
  */

  const formatNumber = (value) => {
    return new Intl.NumberFormat("es-MX").format(
      Number(value || 0)
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  const formatDate = (value) => {
    if (!value) return "Sin fecha";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const getBadgeClass = (estado = "") => {
    return estado
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="dashboard-loader-container">
        <span className="loader2"></span>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-error">
          <h2>No se pudo cargar el dashboard</h2>

          <p>{error}</p>

          <button onClick={cargarDashboard}>
            Intentar nuevamente
          </button>
        </section>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | DATOS
  |--------------------------------------------------------------------------
  */

  const resumen = dashboardData?.resumen || {};
  const graficas = dashboardData?.graficas || {};
  const alertas = dashboardData?.alertas || [];
  const recepciones =
    dashboardData?.recepciones_recientes || [];

  /*
  |--------------------------------------------------------------------------
  | VENTAS POR MES
  |--------------------------------------------------------------------------
  */

  const ventasMensuales =
    Array.isArray(graficas.ventas_mensuales) &&
    graficas.ventas_mensuales.length > 0
      ? graficas.ventas_mensuales
      : [
          {
            name: "Ventas",
            data: Array(12).fill(0),
          },
        ];

  const ventasOptions = {
    chart: {
      type: "line",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      parentHeightOffset: 0,
    },

    colors: ["#007395"],

    stroke: {
      curve: "smooth",
      width: 4,
    },

    markers: {
      size: 4,
      strokeWidth: 0,
      hover: {
        size: 7,
      },
    },

    dataLabels: {
      enabled: false,
    },

    xaxis: {
      categories: meses,

      labels: {
        style: {
          colors: "#64748b",
        },
      },
    },

    yaxis: {
      min: 0,

      labels: {
        formatter: (value) => formatCurrency(value),

        style: {
          colors: "#64748b",
        },
      },
    },

    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
    },

    tooltip: {
      y: {
        formatter: (value) => formatCurrency(value),
      },
    },
  };

  /*
  |--------------------------------------------------------------------------
  | PRODUCTOS MÁS SOLICITADOS
  |--------------------------------------------------------------------------
  */

  const productosSeries = [
    {
      name: "Unidades solicitadas",

      data: Array.isArray(
        graficas.productos_solicitados_series
      )
        ? graficas.productos_solicitados_series.map(
            (item) => Number(item || 0)
          )
        : [],
    },
  ];

  const productosOptions = {
    chart: {
      type: "bar",
      toolbar: {
        show: false,
      },
      parentHeightOffset: 0,
    },

    colors: ["#2196f3"],

    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 5,
        barHeight: "55%",
      },
    },

    dataLabels: {
      enabled: false,
    },

    xaxis: {
      min: 0,

      categories:
        graficas.productos_solicitados_labels || [],

      labels: {
        formatter: (value) => formatNumber(value),
      },
    },

    grid: {
      borderColor: "#e5e7eb",
    },

    tooltip: {
      y: {
        formatter: (value) =>
          `${formatNumber(value)} unidades`,
      },
    },
  };

  /*
  |--------------------------------------------------------------------------
  | INVENTARIO POR CATEGORÍA
  |--------------------------------------------------------------------------
  */

  const categoriasTieneDatos =
    Array.isArray(graficas.categorias_series) &&
    graficas.categorias_series.length > 0 &&
    graficas.categorias_series.some(
      (item) => Number(item || 0) > 0
    );

  const categoriasSeries = categoriasTieneDatos
    ? graficas.categorias_series.map((item) =>
        Number(item || 0)
      )
    : [1];

  const categoriasLabels = categoriasTieneDatos
    ? graficas.categorias_labels
    : ["Sin inventario"];

  const categoriasOptions = {
    chart: {
      type: "donut",
      parentHeightOffset: 0,
    },

    labels: categoriasLabels,

    colors: [
      "#22d3bb",
      "#2196f3",
      "#ffb020",
      "#ff4560",
      "#775dd0",
      "#10b981",
      "#f97316",
      "#64748b",
    ],

    dataLabels: {
      enabled: false,
    },

    legend: {
      position: "bottom",
      fontSize: "13px",
    },

    plotOptions: {
      pie: {
        donut: {
          size: "68%",
        },
      },
    },

    tooltip: {
      enabled: categoriasTieneDatos,

      y: {
        formatter: (value) =>
          `${formatNumber(value)} unidades`,
      },
    },
  };

  /*
  |--------------------------------------------------------------------------
  | ESTADO DEL INVENTARIO
  |--------------------------------------------------------------------------
  */

  const estadoSeries = [
    {
      name: "Lotes",

      data: Array.isArray(
        graficas.estado_inventario_series
      )
        ? graficas.estado_inventario_series.map(
            (item) => Number(item || 0)
          )
        : [0, 0, 0, 0],
    },
  ];

  const estadoOptions = {
    chart: {
      type: "bar",
      toolbar: {
        show: false,
      },
      parentHeightOffset: 0,
    },

    colors: [
      "#22c55e",
      "#f97316",
      "#f59e0b",
      "#ef4444",
    ],

    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        borderRadius: 6,
        barHeight: "55%",
      },
    },

    dataLabels: {
      enabled: true,

      formatter: (value) => formatNumber(value),

      style: {
        fontSize: "12px",
        fontWeight: 700,
      },
    },

    legend: {
      show: false,
    },

    xaxis: {
      min: 0,

      categories:
        graficas.estado_inventario_labels || [
          "Normal",
          "Stock bajo",
          "Por caducar",
          "Caducados",
        ],

      labels: {
        formatter: (value) => formatNumber(value),
      },
    },

    grid: {
      borderColor: "#e5e7eb",
    },

    tooltip: {
      y: {
        formatter: (value) =>
          `${formatNumber(value)} lotes`,
      },
    },
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <main className="dashboard-page">
      <section className="dashboard-wrapper">

        {/* =====================================================
            KPI
        ===================================================== */}

        <div className="top-cards dashboard-kpi-grid">

          <article className="dashboard-card kpi-card">
            <div className="kpi-content">
              <h2 className="kpi-value">
                {formatNumber(
                  resumen.inventario_total
                )}
              </h2>

              <p className="kpi-label">
                Inventario total
              </p>
            </div>
          </article>

          <article className="dashboard-card kpi-card">
            <div className="kpi-content">
              <h2 className="kpi-value">
                {formatNumber(
                  resumen.productos_por_caducar
                )}
              </h2>

              <p className="kpi-label">
                Próximos a vencer
              </p>
            </div>
          </article>

          <article className="dashboard-card kpi-card">
            <div className="kpi-content">
              <h2 className="kpi-value">
                {formatNumber(
                  resumen.productos_expirados
                )}
              </h2>

              <p className="kpi-label">
                Medicamentos expirados
              </p>
            </div>
          </article>

          <article className="dashboard-card kpi-card">
            <div className="kpi-content">
              <h2 className="kpi-value">
                {formatNumber(
                  resumen.ordenes_pendientes
                )}
              </h2>

              <p className="kpi-label">
                Órdenes pendientes
              </p>
            </div>
          </article>

          <article className="dashboard-card kpi-card">
            <div className="kpi-content">
              <h2 className="kpi-value">
                {formatNumber(
                  resumen.ordenes_recibidas
                )}
              </h2>

              <p className="kpi-label">
                Órdenes recibidas
              </p>
            </div>
          </article>

          <article className="dashboard-card kpi-card sales-card">
            <div className="kpi-content">
              <h2 className="kpi-value">
                {formatCurrency(
                  resumen.ventas_mes
                )}
              </h2>

              <p className="kpi-label">
                Ventas del mes
              </p>
            </div>
          </article>

        </div>

        {/* =====================================================
            VENTAS POR MES
        ===================================================== */}

        <article className="large-card dashboard-main-chart">

          <div className="card-header">
            <div>
              <h3>Ventas por mes</h3>

              <p className="chart-description">
                Evolución de las ventas durante{" "}
                {anioFromReferencia(
                  resumen.mes_referencia
                )}
              </p>
            </div>
          </div>

          <ReactApexChart
            options={ventasOptions}
            series={ventasMensuales}
            type="line"
            height={350}
            width="100%"
          />

        </article>

        {/* =====================================================
            PRODUCTOS + CATEGORÍAS
        ===================================================== */}

        <div className="charts-row dashboard-chart-section">

          {/* PRODUCTOS MÁS SOLICITADOS */}

          <article className="large-card">

            <div className="card-header">
              <div>
                <h3>
                  Productos más solicitados
                </h3>

                <p className="chart-description">
                  Productos con mayor demanda
                </p>
              </div>
            </div>

            {productosSeries[0].data.length > 0 ? (
              <ReactApexChart
                options={productosOptions}
                series={productosSeries}
                type="bar"
                height={330}
                width="100%"
              />
            ) : (
              <div className="dashboard-empty">
                No hay solicitudes registradas.
              </div>
            )}

          </article>

          {/* INVENTARIO POR CATEGORÍA */}

          <article className="large-card">

            <div className="card-header">
              <div>
                <h3>
                  Inventario por categoría
                </h3>

                <p className="chart-description">
                  Distribución actual del stock
                </p>
              </div>
            </div>

            {categoriasTieneDatos ? (
              <ReactApexChart
                options={categoriasOptions}
                series={categoriasSeries}
                type="donut"
                height={330}
                width="100%"
              />
            ) : (
              <div className="dashboard-empty">
                No hay inventario registrado.
              </div>
            )}

          </article>

        </div>

        {/* =====================================================
            ESTADO DEL INVENTARIO
        ===================================================== */}

        <article className="large-card dashboard-inventory-status">

          <div className="card-header">
            <div>
              <h3>
                Estado del inventario
              </h3>

              <p className="chart-description">
                Lotes normales, con stock bajo,
                próximos a vencer y caducados
              </p>
            </div>
          </div>

          <ReactApexChart
            options={estadoOptions}
            series={estadoSeries}
            type="bar"
            height={310}
            width="100%"
          />

        </article>

        {/* =====================================================
            ALERTAS CRÍTICAS
        ===================================================== */}

        <article className="large-card alerts-card dashboard-table-section">

          <div className="card-header">

            <h3>Alertas críticas</h3>

            <span>
              {resumen.mes_referencia ||
                "Sin fecha"}
            </span>

          </div>

          <div className="alerts-table-wrapper">

            <table className="alerts-table">

              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Cantidad</th>
                  <th>Lote</th>
                  <th>Expiración</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>

                {alertas.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      No hay alertas críticas.
                    </td>
                  </tr>
                ) : (
                  alertas.map(
                    (alerta, index) => (
                      <tr
                        key={`${alerta.producto}-${alerta.lote}-${index}`}
                      >

                        <td>
                          {alerta.producto ||
                            "Sin producto"}
                        </td>

                        <td>
                          {alerta.categoria ||
                            "Sin categoría"}
                        </td>

                        <td>
                          {formatNumber(
                            alerta.cantidad
                          )}
                        </td>

                        <td>
                          {alerta.lote ||
                            "Sin lote"}
                        </td>

                        <td>
                          {formatDate(
                            alerta.fecha_expiracion
                          )}
                        </td>

                        <td>
                          <span
                            className={`alert-badge ${getBadgeClass(
                              alerta.estado
                            )}`}
                          >
                            {alerta.estado ||
                              "Revisar"}
                          </span>
                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>

        </article>

        {/* =====================================================
            RECEPCIONES RECIENTES
        ===================================================== */}

        <article className="large-card recepciones-card">

          <div className="card-header">

            <h3>
              Recepciones recientes
            </h3>

            <span>
              Últimos movimientos
            </span>

          </div>

          <div className="alerts-table-wrapper">

            <table className="alerts-table">

              <thead>
                <tr>
                  <th>Farmacia</th>
                  <th>Fecha</th>
                  <th>Almacén</th>
                  <th>Tipo</th>
                  <th>Productos</th>
                  <th>Total estimado</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>

                {recepciones.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      No hay recepciones recientes.
                    </td>
                  </tr>
                ) : (
                  recepciones.map(
                    (recepcion) => (
                      <tr key={recepcion.id}>

                        <td>
                          {recepcion.farmacia ||
                            "Sin farmacia"}
                        </td>

                        <td>
                          {formatDate(
                            recepcion.fecha?.split(
                              " "
                            )[0]
                          )}
                        </td>

                        <td>
                          {recepcion.almacen ||
                            "Sin almacén"}
                        </td>

                        <td>
                          {recepcion.tipo_movimiento ||
                            "Sin tipo"}
                        </td>

                        <td>
                          {formatNumber(
                            recepcion.total_productos
                          )}
                        </td>

                        <td>
                          {formatCurrency(
                            recepcion.total_estimado
                          )}
                        </td>

                        <td>
                          <span
                            className={`order-badge ${getBadgeClass(
                              recepcion.estatus
                            )}`}
                          >
                            {recepcion.estatus ||
                              "Pendiente"}
                          </span>
                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>

        </article>

      </section>
    </main>
  );
};

/*
|--------------------------------------------------------------------------
| AÑO DEL MES DE REFERENCIA
|--------------------------------------------------------------------------
*/

const anioFromReferencia = (referencia) => {
  if (!referencia) {
    return new Date().getFullYear();
  }

  return referencia.split("-")[0];
};

export default Dashboard;