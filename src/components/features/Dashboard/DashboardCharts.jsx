import Chart from "react-apexcharts";
import DataCard from "../ui/DataCard";
import "./DashboardCharts.css";

const DashboardCharts = () => {

  const areaOptions = {
    chart: { toolbar: { show: false } },
    stroke: { curve: "smooth" },
    xaxis: {
      categories: ["Ene","Feb","Mar","Abr","May","Jun"]
    }
  };

  const areaSeries = [
    {
      name: "Órdenes",
      data: [30, 40, 35, 50, 49, 60]
    }
  ];

  const barOptions = {
    chart: { toolbar: { show: false } },
    xaxis: {
      categories: ["Paracetamol","Ibuprofeno","Amoxicilina","Aspirina"]
    }
  };

  const barSeries = [
    {
      name: "Ventas",
      data: [44, 55, 41, 37]
    }
  ];

  const radialOptions = {
    chart: { type: "radialBar" },
    labels: ["Inventario"]
  };

  const radialSeries = [75];

  const lineOptions = {
    chart: { toolbar: { show: false } },
    stroke: { curve: "smooth" },
    xaxis: {
      categories: ["Lun","Mar","Mie","Jue","Vie","Sab","Dom"]
    }
  };

  const lineSeries = [
    {
      name: "Ingresos",
      data: [10, 41, 35, 51, 49, 62, 69]
    }
  ];

  return (
    <div className="dashboard-grid">

      <DataCard>
        <div className="data-card-header">
          <h3>Órdenes por mes</h3>
        </div>

        <Chart
          options={areaOptions}
          series={areaSeries}
          type="area"
          height={250}
        />
      </DataCard>

      <DataCard>
        <div className="data-card-header">
          <h3>Medicamentos más vendidos</h3>
        </div>

        <Chart
          options={barOptions}
          series={barSeries}
          type="bar"
          height={250}
        />
      </DataCard>

      <DataCard>
        <div className="data-card-header">
          <h3>Inventario disponible</h3>
        </div>

        <Chart
          options={radialOptions}
          series={radialSeries}
          type="radialBar"
          height={250}
        />
      </DataCard>

      <DataCard>
        <div className="data-card-header">
          <h3>Ingresos semanales</h3>
        </div>

        <Chart
          options={lineOptions}
          series={lineSeries}
          type="line"
          height={250}
        />
      </DataCard>

    </div>
  );
};

export default DashboardCharts;
