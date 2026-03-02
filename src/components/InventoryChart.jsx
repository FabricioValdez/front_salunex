import React from "react";
import ReactApexChart from "react-apexcharts";

const InventoryChart = () => {

  const series = [
    {
      name: "Entradas",
      data: [44, 55, 57, 56, 61, 58, 63]
    },
    {
      name: "Salidas",
      data: [35, 41, 36, 26, 45, 48, 52]
    }
  ];

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
      categories: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
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
