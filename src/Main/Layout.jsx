import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar";
import "../styles/layout.css";

const MainLayout = () => {
  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;