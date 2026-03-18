import PageContainer from "../components/ui/PageContainer";
import DashboardCharts from "../components/features/Dashboard/DashboardCharts";
import SummaryCard from "../components/ui/SummaryCard";

import { Package, AlertTriangle, TrendingUp, ShoppingCart } from "lucide-react";

import "../styles/Dashboard.css";

const Dashboard = () => {
  return (
    <PageContainer>

      <div className="page-title">
        <h1>Dashboard</h1>
        <p>
          Monitoreo del flujo de stock en tiempo real y la eficacia operativa.
        </p>
      </div>

      {/* CARDS DE ESTADÍSTICAS */}
      <div className="stats-grid">

        <SummaryCard
          title="Productos en inventario"
          value="1245"
          icon={<Package size={26} />}
          variant="blue"
        />

        <SummaryCard
          title="Alertas de stock"
          value="12"
          icon={<AlertTriangle size={26} />}
          variant="red"
        />

        <SummaryCard
          title="Ventas del mes"
          value="$24,300"
          icon={<TrendingUp size={26} />}
          variant="green"
        />

        <SummaryCard
          title="Pedidos hoy"
          value="38"
          icon={<ShoppingCart size={26} />}
          variant="yellow"
        />

      </div>

      {/* CHARTS */}
      <DashboardCharts />

    </PageContainer>
  );
};

export default Dashboard;