import React from "react";
import Chart from "react-apexcharts";

const DashboardChart = () => {

  const options = {
    chart: {
      id: "ordenes-chart",
      toolbar: { show: false }
    },
    stroke: {
      curve: "smooth"
    },
    xaxis: {
      categories: [
        "Ene","Feb","Mar","Abr","May","Jun","Jul"
      ]
    }
  };

  const series = [
    {
      name: "Órdenes",
      data: [10, 25, 18, 40, 32, 50, 45]
    }
  ];

  return (
    <div className="chart-card">
      <Chart
        options={options}
        series={series}
        type="line"
        height={300}
      />
    </div>
  );
};

export default DashboardChart;