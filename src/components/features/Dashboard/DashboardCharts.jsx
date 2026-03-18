import Chart from "react-apexcharts";
import DataCard from "../../ui/DataCard";

import "./DashboardCharts.css";

const DashboardCharts = () => {

  const areaChart = {
    options: {
      chart: { toolbar: { show: false } },
      stroke: { curve: "smooth" },
      xaxis: {
        categories: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"]
      }
    },
    series: [
      {
        name: "Ventas",
        data: [120, 150, 180, 200, 170, 220, 260]
      }
    ]
  };

  const barChart = {
    options: {
      chart: { toolbar: { show: false } },
      xaxis: {
        categories: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]
      }
    },
    series: [
      {
        name: "Pedidos",
        data: [12, 19, 10, 15, 18, 9, 14]
      }
    ]
  };

  const donutChart = {
    options: {
      labels: ["Farmacia A", "Farmacia B", "Farmacia C"]
    },
    series: [44, 55, 41]
  };

  const categoryChart = {
    options: {
      chart: {
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: true
        }
      },
      xaxis: {
        categories: [
          "Antibióticos",
          "Analgésicos",
          "Antiinflamatorios",
          "Antihistamínicos",
          "Vitaminas"
        ]
      }
    },
    series: [
      {
        name: "Productos",
        data: [120, 95, 80, 60, 40]
      }
    ]
  };

  return (
    <div className="charts-grid">

      <DataCard>
        <h3>Ventas Mensuales</h3>
        <Chart
          options={areaChart.options}
          series={areaChart.series}
          type="area"
          height={300}
        />
      </DataCard>

      <DataCard>
        <h3>Pedidos por Día</h3>
        <Chart
          options={barChart.options}
          series={barChart.series}
          type="bar"
          height={300}
        />
      </DataCard>

      <DataCard>
        <h3>Distribución</h3>
        <Chart
          options={donutChart.options}
          series={donutChart.series}
          type="donut"
          height={300}
        />
      </DataCard>

      <DataCard>
        <h3>Productos por categoría</h3>
        <Chart
          options={categoryChart.options}
          series={categoryChart.series}
          type="bar"
          height={300}
        />
      </DataCard>

    </div>
  );
};

export default DashboardCharts;
