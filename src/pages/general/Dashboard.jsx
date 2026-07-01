import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import "../../styles/dashboard.css";

const API_URL = "http://localhost/api";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/dashboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Error al cargar el dashboard");
        }

        setDashboardData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });
  };

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString("es-MX");
  };

  const getBadgeClass = (value) => {
    return String(value || "pendiente")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase();
  };

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-loader-container">
          <span className="loader2"></span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-wrapper">
          <article className="large-card">
            <h3>Error al cargar el dashboard</h3>
            <p>{error}</p>
          </article>
        </section>
      </main>
    );
  }

  const resumen = dashboardData?.resumen || {};
  const graficas = dashboardData?.graficas || {};
  const alertas = dashboardData?.alertas || [];
  const recepciones = dashboardData?.recepciones_recientes || [];

  const areaBaseOptions = (color) => ({
    chart: {
      type: "area",
      sparkline: {
        enabled: true,
      },
      toolbar: {
        show: false,
      },
      parentHeightOffset: 0,
    },
    stroke: {
      curve: "straight",
      width: 4,
    },
    fill: {
      opacity: 0.18,
      type: "solid",
    },
    colors: [color],
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
    },
  });

  const monthlyOptions = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: {
        show: false,
      },
      parentHeightOffset: 0,
    },
    colors: ["#22d3bb", "#2196f3", "#775dd0"],
    plotOptions: {
      bar: {
        columnWidth: "45%",
        borderRadius: 2,
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
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#64748b",
          fontSize: "12px",
        },
      },
    },
    grid: {
      borderColor: "#e5e7eb",
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (value) => formatCurrency(value),
      },
    },
  };

  const productosSolicitadosOptions = {
    chart: {
      type: "bar",
      toolbar: {
        show: false,
      },
      parentHeightOffset: 0,
    },
    colors: ["#007395"],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: graficas.productos_solicitados_labels || [],
      labels: {
        style: {
          colors: "#64748b",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#263442",
        },
      },
    },
    grid: {
      borderColor: "#e5e7eb",
    },
    tooltip: {
      y: {
        formatter: (value) => `${formatNumber(value)} unidades`,
      },
    },
  };

  const donutSeries =
    graficas.categorias_series && graficas.categorias_series.length > 0
      ? graficas.categorias_series
      : [1];

  const donutLabels =
    graficas.categorias_labels && graficas.categorias_labels.length > 0
      ? graficas.categorias_labels
      : ["Sin datos"];

  const donutOptions = {
    chart: {
      type: "donut",
      parentHeightOffset: 0,
    },
    labels: donutLabels,
    colors: ["#22d3bb", "#2196f3", "#ffb020", "#ff4560", "#775dd0", "#10b981", "#f97316", "#64748b"],
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "left",
      fontSize: "14px",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
        },
      },
    },
    responsive: [
      {
        breakpoint: 900,
        options: {
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const kpiSeries = (value) => [
    {
      name: "Indicador",
      data: [3, 6, 4, 8, 5, 9, 7, Number(value || 0)],
    },
  ];

  return (
    <main className="dashboard-page">

      <section className="dashboard-wrapper">
        <div className="top-cards dashboard-kpi-grid">
          <article className="dashboard-card">
            <h2>{formatNumber(resumen.inventario_total)}</h2>
            <p>Inventario total</p>

            <ReactApexChart
              options={areaBaseOptions("#007395")}
              series={kpiSeries(resumen.inventario_total)}
              type="area"
              height={95}
              width="100%"
            />
          </article>

          <article className="dashboard-card">
            <h2>{formatNumber(resumen.productos_por_caducar)}</h2>
            <p>Próximos a vencer</p>

            <ReactApexChart
              options={areaBaseOptions("#f59e0b")}
              series={kpiSeries(resumen.productos_por_caducar)}
              type="area"
              height={95}
              width="100%"
            />
          </article>

          <article className="dashboard-card">
            <h2>{formatNumber(resumen.productos_expirados)}</h2>
            <p>Medicamentos expirados</p>

            <ReactApexChart
              options={areaBaseOptions("#ef4444")}
              series={kpiSeries(resumen.productos_expirados)}
              type="area"
              height={95}
              width="100%"
            />
          </article>

          <article className="dashboard-card">
            <h2>{formatNumber(resumen.ordenes_pendientes)}</h2>
            <p>Órdenes pendientes</p>

            <ReactApexChart
              options={areaBaseOptions("#775dd0")}
              series={kpiSeries(resumen.ordenes_pendientes)}
              type="area"
              height={95}
              width="100%"
            />
          </article>

          <article className="dashboard-card">
            <h2>{formatNumber(resumen.ordenes_recibidas)}</h2>
            <p>Órdenes recibidas</p>

            <ReactApexChart
              options={areaBaseOptions("#22c55e")}
              series={kpiSeries(resumen.ordenes_recibidas)}
              type="area"
              height={95}
              width="100%"
            />
          </article>

          <article className="dashboard-card sales-card">
            <h2>{formatCurrency(resumen.ventas_mes)}</h2>
            <p>Ventas del mes</p>

            <ReactApexChart
              options={areaBaseOptions("#2196f3")}
              series={kpiSeries(resumen.ventas_mes)}
              type="area"
              height={95}
              width="100%"
            />
          </article>
        </div>

        <div className="charts-row">
          <article className="large-card">
            <div className="card-header">
              <h3>Movimientos de inventario</h3>
              <span>☰</span>
            </div>

            <ReactApexChart
              options={monthlyOptions}
              series={graficas.movimiento_mensual || []}
              type="bar"
              height={330}
              width="100%"
            />
          </article>

          <article className="large-card">
            <div className="card-header">
              <h3>Productos más solicitados</h3>
              <span>☰</span>
            </div>

            <ReactApexChart
              options={productosSolicitadosOptions}
              series={[
                {
                  name: "Solicitudes",
                  data: graficas.productos_solicitados_series || [],
                },
              ]}
              type="bar"
              height={330}
              width="100%"
            />
          </article>
        </div>

        <div className="charts-row dashboard-second-row">
          <article className="large-card">
            <div className="card-header">
              <h3>Categorías de inventario</h3>
            </div>

            <ReactApexChart
              options={donutOptions}
              series={donutSeries}
              type="donut"
              height={330}
              width="100%"
            />
          </article>

          <article className="large-card alerts-card no-margin">
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
                    <th>Expiración</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {alertas.length === 0 ? (
                    <tr>
                      <td colSpan="5">No hay alertas críticas.</td>
                    </tr>
                  ) : (
                    alertas.map((alerta, index) => (
                      <tr key={index}>
                        <td>{alerta.producto || "Sin producto"}</td>
                        <td>{alerta.categoria || "Sin categoría"}</td>
                        <td>{formatNumber(alerta.cantidad)}</td>
                        <td>{alerta.fecha_expiracion || "Sin fecha"}</td>
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
        </div>

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
                  <tr>
                    <td colSpan="8">No hay recepciones recientes.</td>
                  </tr>
                ) : (
                  recepciones.map((recepcion) => (
                    <tr key={recepcion.id}>
                      <td>{recepcion.farmacia || "Sin farmacia"}</td>
                      <td>{recepcion.fecha || "Sin fecha"}</td>
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
      </section>
    </main>
  );
};

export default Dashboard;