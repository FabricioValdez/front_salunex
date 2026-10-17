import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import api from "../../services/api";
import "../../styles/dashboard.css";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estado para el token de Metabase
  const [metabaseToken, setMetabaseToken] = useState("");
  const [metabaseTokenMio, setMetabaseTokenMio] = useState("");
  const [metabaseTokenTercero, setMetabaseTokenTercero] = useState("");

  const meses = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];

  /*
  |--------------------------------------------------------------------------
  | CARGAR DASHBOARD (LARAVEL + METABASE TOKEN)
  |--------------------------------------------------------------------------
  */

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Cargar el script de Metabase dinámicamente si no existe
      if (!document.getElementById("metabase-embed-script")) {
        const script = document.createElement("script");
        script.id = "metabase-embed-script";
        script.src = "http://localhost:3000/app/embed.js";
        script.defer = true;
        document.body.appendChild(script);

        script.onload = () => {
          if (window.defineMetabaseConfig) {
            window.defineMetabaseConfig({
              theme: { preset: "light" },
              isGuest: true,
              instanceUrl: "http://localhost:3000",
            });
          }
        };
      }

      // 2. Peticiones simultáneas: Datos del dashboard y Token de Metabase
      const [dashResponse, tokenResponse] = await Promise.all([
        api.get("/dashboard"),
        api.get("/metabase-token"),
      ]);

      setDashboardData(dashResponse.data);

      // --- MODIFICACIÓN AQUÍ ---
      // Guardamos ambos tokens usando las nuevas llaves que devuelve tu backend
      setMetabaseToken(tokenResponse.data.token_companero);
      setMetabaseTokenMio(tokenResponse.data.token_mio);
      setMetabaseTokenTercero(tokenResponse.data.token_tercero);
      // -------------------------

    } catch (err) {
      console.error("Error dashboard:", err);
      setError(
        err.response?.data?.message || err.message || "Ocurrió un error al cargar el dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Cargar el script y configurar Metabase correctamente
    if (!document.getElementById("metabase-embed-script")) {
      const script = document.createElement("script");
      script.id = "metabase-embed-script";
      script.src = "http://localhost:3000/app/embed.js";
      script.defer = true;

      script.onload = () => {
        // Aseguramos que la configuración global se inyecte en el objeto window
        window.defineMetabaseConfig = function (config) {
          window.metabaseConfig = config;
        };

        if (window.defineMetabaseConfig) {
          window.defineMetabaseConfig({
            theme: { preset: "light" },
            isGuest: true,
            instanceUrl: "http://localhost:3000",
          });
        }
      };

      document.body.appendChild(script);
    } else {
      // Si ya estaba cargado, aseguramos la configuración
      if (window.defineMetabaseConfig) {
        window.defineMetabaseConfig({
          theme: { preset: "light" },
          isGuest: true,
          instanceUrl: "http://localhost:3000",
        });
      }
    }

    // 2. Cargar datos del dashboard y el token de Metabase de tu backend
    cargarDashboard();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FORMATOS
  |--------------------------------------------------------------------------
  */

  const formatNumber = (value) => {
    return new Intl.NumberFormat("es-MX").format(Number(value || 0));
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
    if (Number.isNaN(date.getTime())) return value;
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

  if (loading) {
    return (
      <div className="dashboard-loader-container">
        <span className="loader2"></span>
      </div>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-error">
          <h2>No se pudo cargar el dashboard</h2>
          <p>{error}</p>
          <button onClick={cargarDashboard}>Intentar nuevamente</button>
        </section>
      </main>
    );
  }

  const resumen = dashboardData?.resumen || {};
  const graficas = dashboardData?.graficas || {};
  const alertas = dashboardData?.alertas || [];
  const recepciones = dashboardData?.recepciones_recientes || [];

  const ventasMensuales =
    Array.isArray(graficas.ventas_mensuales) && graficas.ventas_mensuales.length > 0
      ? graficas.ventas_mensuales
      : [{ name: "Ventas", data: Array(12).fill(0) }];

  const ventasOptions = {
    chart: { type: "line", toolbar: { show: false }, zoom: { enabled: false }, parentHeightOffset: 0 },
    colors: ["#007395"],
    stroke: { curve: "smooth", width: 4 },
    markers: { size: 4, strokeWidth: 0, hover: { size: 7 } },
    dataLabels: { enabled: false },
    xaxis: { categories: meses, labels: { style: { colors: "#64748b" } } },
    yaxis: { min: 0, labels: { formatter: (value) => formatCurrency(value), style: { colors: "#64748b" } } },
    grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
    tooltip: { y: { formatter: (value) => formatCurrency(value) } },
  };

  const productosSeries = [
    {
      name: "Unidades solicitadas",
      data: Array.isArray(graficas.productos_solicitados_series)
        ? graficas.productos_solicitados_series.map((item) => Number(item || 0))
        : [],
    },
  ];

  const productosOptions = {
    chart: { type: "bar", toolbar: { show: false }, parentHeightOffset: 0 },
    colors: ["#2196f3"],
    plotOptions: { bar: { horizontal: true, borderRadius: 5, barHeight: "55%" } },
    dataLabels: { enabled: false },
    xaxis: { min: 0, categories: graficas.productos_solicitados_labels || [], labels: { formatter: (value) => formatNumber(value) } },
    grid: { borderColor: "#e5e7eb" },
    tooltip: { y: { formatter: (value) => `${formatNumber(value)} unidades` } },
  };

  const categoriasTieneDatos =
    Array.isArray(graficas.categorias_series) &&
    graficas.categorias_series.length > 0 &&
    graficas.categorias_series.some((item) => Number(item || 0) > 0);

  const categoriasSeries = categoriasTieneDatos ? graficas.categorias_series.map((item) => Number(item || 0)) : [1];
  const categoriasLabels = categoriasTieneDatos ? graficas.categorias_labels : ["Sin inventario"];

  const categoriasOptions = {
    chart: { type: "donut", parentHeightOffset: 0 },
    labels: categoriasLabels,
    colors: ["#22d3bb", "#2196f3", "#ffb020", "#ff4560", "#775dd0", "#10b981", "#f97316", "#64748b"],
    dataLabels: { enabled: false },
    legend: { position: "bottom", fontSize: "13px" },
    plotOptions: { pie: { donut: { size: "68%" } } },
    tooltip: { enabled: categoriasTieneDatos, y: { formatter: (value) => `${formatNumber(value)} unidades` } },
  };

  const estadoSeries = [
    {
      name: "Lotes",
      data: Array.isArray(graficas.estado_inventario_series)
        ? graficas.estado_inventario_series.map((item) => Number(item || 0))
        : [0, 0, 0, 0],
    },
  ];

  const estadoOptions = {
    chart: { type: "bar", toolbar: { show: false }, parentHeightOffset: 0 },
    colors: ["#22c55e", "#f97316", "#f59e0b", "#ef4444"],
    plotOptions: { bar: { horizontal: true, distributed: true, borderRadius: 6, barHeight: "55%" } },
    dataLabels: { enabled: true, formatter: (value) => formatNumber(value), style: { fontSize: "12px", fontWeight: 700 } },
    legend: { show: false },
    xaxis: { min: 0, categories: graficas.estado_inventario_labels || ["Normal", "Stock bajo", "Por caducar", "Caducados"], labels: { formatter: (value) => formatNumber(value) } },
    grid: { borderColor: "#e5e7eb" },
    tooltip: { y: { formatter: (value) => `${formatNumber(value)} lotes` } },
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-wrapper">

        {/* KPI */}
        <div className="top-cards dashboard-kpi-grid">
          <article className="dashboard-card kpi-card">
            <div className="kpi-content">
              <h2 className="kpi-value">{formatNumber(resumen.inventario_total)}</h2>
              <p className="kpi-label">Inventario total</p>
            </div>
          </article>
          <article className="dashboard-card kpi-card">
            <div className="kpi-content">
              <h2 className="kpi-value">{formatNumber(resumen.productos_por_caducar)}</h2>
              <p className="kpi-label">Próximos a vencer</p>
            </div>
          </article>
          <article className="dashboard-card kpi-card">
            <div className="kpi-content">
              <h2 className="kpi-value">{formatNumber(resumen.productos_expirados)}</h2>
              <p className="kpi-label">Medicamentos expirados</p>
            </div>
          </article>
          <article className="dashboard-card kpi-card">
            <div className="kpi-content">
              <h2 className="kpi-value">{formatNumber(resumen.ordenes_pendientes)}</h2>
              <p className="kpi-label">Órdenes pendientes</p>
            </div>
          </article>
          <article className="dashboard-card kpi-card">
            <div className="kpi-content">
              <h2 className="kpi-value">{formatNumber(resumen.ordenes_recibidas)}</h2>
              <p className="kpi-label">Órdenes recibidas</p>
            </div>
          </article>
          <article className="dashboard-card kpi-card sales-card">
            <div className="kpi-content">
              <h2 className="kpi-value">{formatCurrency(resumen.ventas_mes)}</h2>
              <p className="kpi-label">Ventas del mes</p>
            </div>
          </article>
        </div>

        {/* VENTAS POR MES */}
        <article className="large-card dashboard-main-chart">
          <div className="card-header">
            <div>
              <h3>Ventas por mes</h3>
              <p className="chart-description">Evolución de las ventas durante {anioFromReferencia(resumen.mes_referencia)}</p>
            </div>
          </div>
          <ReactApexChart options={ventasOptions} series={ventasMensuales} type="line" height={350} width="100%" />
        </article>

        {/* PRODUCTOS + CATEGORÍAS */}
        <div className="charts-row dashboard-chart-section">
          <article className="large-card">
            <div className="card-header">
              <div>
                <h3>Productos más solicitados</h3>
                <p className="chart-description">Productos con mayor demanda</p>
              </div>
            </div>
            {productosSeries[0].data.length > 0 ? (
              <ReactApexChart options={productosOptions} series={productosSeries} type="bar" height={330} width="100%" />
            ) : (
              <div className="dashboard-empty">No hay solicitudes registradas.</div>
            )}
          </article>

          <article className="large-card">
            <div className="card-header">
              <div>
                <h3>Inventario por categoría</h3>
                <p className="chart-description">Distribución actual del stock</p>
              </div>
            </div>
            {categoriasTieneDatos ? (
              <ReactApexChart options={categoriasOptions} series={categoriasSeries} type="donut" height={330} width="100%" />
            ) : (
              <div className="dashboard-empty">No hay inventario registrado.</div>
            )}
          </article>
        </div>

        {/* ESTADO DEL INVENTARIO */}
        <article className="large-card dashboard-inventory-status">
          <div className="card-header">
            <div>
              <h3>Estado del inventario</h3>
              <p className="chart-description">Lotes normales, con stock bajo, próximos a vencer y caducados</p>
            </div>
          </div>
          <ReactApexChart options={estadoOptions} series={estadoSeries} type="bar" height={310} width="100%" />
        </article>

        {/* ALERTAS CRÍTICAS */}
        <article className="large-card alerts-card dashboard-table-section">
          <div className="card-header">
            <h3>Alertas críticas</h3>
            <span>{resumen.mes_referencia || "Sin fecha"}</span>
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
                  <tr><td colSpan="6">No hay alertas críticas.</td></tr>
                ) : (
                  alertas.map((alerta, index) => (
                    <tr key={`${alerta.producto}-${alerta.lote}-${index}`}>
                      <td>{alerta.producto || "Sin producto"}</td>
                      <td>{alerta.categoria || "Sin categoría"}</td>
                      <td>{formatNumber(alerta.cantidad)}</td>
                      <td>{alerta.lote || "Sin lote"}</td>
                      <td>{formatDate(alerta.fecha_expiracion)}</td>
                      <td>
                        <span className={`alert-badge ${getBadgeClass(alerta.estado)}`}>
                          {alerta.estado || "Revisar"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        {/* RECEPCIONES RECIENTES */}
        <article className="large-card recepciones-card">
          <div className="card-header">
            <h3>Recepciones recientes</h3>
            <span>Últimos movimientos</span>
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
                  <tr><td colSpan="7">No hay recepciones recientes.</td></tr>
                ) : (
                  recepciones.map((recepcion) => (
                    <tr key={recepcion.id}>
                      <td>{recepcion.farmacia || "Sin farmacia"}</td>
                      <td>{formatDate(recepcion.fecha?.split(" ")[0])}</td>
                      <td>{recepcion.almacen || "Sin almacén"}</td>
                      <td>{recepcion.tipo_movimiento || "Sin tipo"}</td>
                      <td>{formatNumber(recepcion.total_productos)}</td>
                      <td>{formatCurrency(recepcion.total_estimado)}</td>
                      <td>
                        <span className={`order-badge ${getBadgeClass(recepcion.estatus)}`}>
                          {recepcion.estatus || "Pendiente"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        {/* =====================================================
            DASHBOARD DE METABASE (AGREGADO ABAJO DEL TODO)
        ===================================================== */}
        <article className="large-card" style={{ width: "100%", minHeight: "750px", padding: "20px", marginTop: "20px" }}>
          <div className="card-header" style={{ marginBottom: "20px" }}>
            <div>
              <h3>Panel Analítico (Metabase)</h3>
              <p className="chart-description">Reportes avanzados e indicadores de inventario y ventas</p>
            </div>
          </div>

          <div style={{ width: "100%", height: "700px" }}>
            {metabaseToken && (
              <metabase-dashboard
                token={metabaseToken}
                with-title="true"
                with-downloads="true"
              ></metabase-dashboard>
            )}
          </div>
        </article>

        {/* =====================================================
            DASHBOARD DE METABASE (TUYO)
        ===================================================== */}
        <article className="large-card" style={{ width: "100%", minHeight: "750px", padding: "20px", marginTop: "20px" }}>
          <div className="card-header" style={{ marginBottom: "20px" }}>
            <div>
              <h3>Métricas de Inventario y Solicitudes</h3>
              <p className="chart-description">Estado de lotes y productos más solicitados</p>
            </div>
          </div>

          <div style={{ width: "100%", height: "700px" }}>
            {metabaseTokenMio && (
              <metabase-dashboard
                token={metabaseTokenMio}
                with-title="true"
                with-downloads="true"
              ></metabase-dashboard>
            )}
          </div>
        </article>

        {/* METABASE: DASHBOARD 36 */}
        <article className="large-card" style={{ width: "100%", minHeight: "750px", padding: "20px", marginTop: "20px" }}>
          <div className="card-header" style={{ marginBottom: "20px" }}>
            <div>
              <h3>Ventas e inventario por categoría</h3>
            </div>
          </div>
          <div style={{ width: "100%", height: "700px" }}>
            {/* Token temporal de ejemplo: reemplazar por uno generado por Laravel. */}
            {metabaseTokenTercero && (
              <metabase-dashboard
                token={metabaseTokenTercero}
                with-title="true"
                with-downloads="true"
              ></metabase-dashboard>
            )}
          </div>
        </article>

      </section>
    </main>
  );
};

const anioFromReferencia = (referencia) => {
  if (!referencia) return new Date().getFullYear();
  return referencia.split("-")[0];
};

export default Dashboard;