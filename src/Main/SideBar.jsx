import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  House,
  ClipboardList,
  ShoppingCart,
  Package,
  LayoutDashboard,
  Menu,
  Settings,
} from "lucide-react";

const Sidebar = ({ onOpenSettings }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="top-section">
        <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
          <Menu size={20} />
        </button>

        {!collapsed && <h2 className="logo">SALUNEX</h2>}
      </div>

      {/* ── Navegación principal ── */}
      <nav>
        <NavLink to="/" className="sidebar-nav-item">
          <House size={20} />
          {!collapsed && <span>Inicio</span>}
        </NavLink>

        <NavLink to="/ordenes" className="sidebar-nav-item">
          <ShoppingCart size={20} />
          {!collapsed && <span>Órdenes</span>}
        </NavLink>

        <NavLink to="/inventario" className="sidebar-nav-item">
          <Package size={20} />
          {!collapsed && <span>Inventario</span>}
        </NavLink>

        <NavLink to="/control" className="sidebar-nav-item">
          <ClipboardList size={20} />
          {!collapsed && <span>Control de calidad</span>}
        </NavLink>

        <NavLink to="/dashboard" className="sidebar-nav-item">
          <LayoutDashboard size={20} />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>
      </nav>

      {/* ── Sección inferior separada por línea ── */}
      <div className="sidebar-bottom">
        <button className="sidebar-nav-item" onClick={onOpenSettings}>
          <Settings size={20} />
          {!collapsed && <span>Configuración</span>}
        </button>
      </div>

      {/* ── Perfil de usuario ── */}
      <div className="profile">
        {!collapsed ? (
          <>
            <img src="https://i.pravatar.cc/40" alt="profile" />
            <div>
              <strong>Dra. Laura González</strong>
              <p>Gerente de almacén</p>
            </div>
          </>
        ) : (
          <img src="https://i.pravatar.cc/40" alt="profile" />
        )}
      </div>
    </div>
  );
};

export default Sidebar;