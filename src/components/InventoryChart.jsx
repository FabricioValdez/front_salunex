import React from "react";
import ReactApexChart from "react-apexcharts";

const InventoryChart = ({ periodo }) => {

  const seriesSemana = [
    {
      name: "Entradas",
      data: [44, 55, 57, 56, 61, 58, 63]
    },
    {
      name: "Salidas",
      data: [35, 41, 36, 26, 45, 48, 52]
    }
  ];

  const seriesMes = [
    {
      name: "Entradas",
      data: [300, 400, 250, 380]
    },
    {
      name: "Salidas",
      data: [200, 320, 300, 280]
    }
  ];

  const categoriesSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const categoriesMes = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];

  const series = periodo === "mes" ? seriesMes : seriesSemana;
  const categories = periodo === "mes" ? categoriesMes : categoriesSemana;

  const options = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif"
    },
    colors: ["#3b82f6", "#cbd5e1"], // Azul + gris moderno
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 6,
        borderRadiusApplication: "end"
      }
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"]
    },
    xaxis: {
      categories: categories
    },
    yaxis: {
      title: {
        text: "Unidades"
      }
    },
    fill: { opacity: 1 },
    legend: {
      position: "top"
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " unidades";
        }
      }
    }
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="bar"
      height={320}
    />
  );
};

export default InventoryChart;
