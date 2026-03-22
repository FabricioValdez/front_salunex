import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar";
import SettingsModal from "../components/ui/SettingsModal";
import "../styles/layout.css";

const MainLayout = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="layout">
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />
      <main className="content">
        <Outlet />
      </main>
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
};

export default MainLayout;