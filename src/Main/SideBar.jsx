import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  House,
  Building2,
  ClipboardList,
  ShoppingCart,
  Menu
} from "lucide-react";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="top-section">
        <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
          <Menu size={20} />
        </button>

        {!collapsed && <h2 className="logo">SALUNEX</h2>}
      </div>

      <nav>
        <NavLink to="/" className="nav-item">
          <House size={20} />
          {!collapsed && <span>Inicio</span>}
        </NavLink>

        <NavLink to="/farmacias" className="nav-item">
          <Building2 size={20} />
          {!collapsed && <span>Farmacias</span>}
        </NavLink>

        <NavLink to="/ordenes" className="nav-item">
          <ShoppingCart size={20} />
          {!collapsed && <span>Órdenes</span>}
        </NavLink>

        <NavLink to="/control" className="nav-item">
          <ClipboardList size={20} />
          {!collapsed && <span>Control de calidad</span>}
        </NavLink>
      </nav>

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