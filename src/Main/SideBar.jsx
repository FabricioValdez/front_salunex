import { NavLink } from "react-router-dom";
import {
  House,
  Building2,
  ClipboardList,
  ShoppingCart
} from "lucide-react";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="top-section">
        <h2 className="logo">SALUNEX</h2>
      </div>

      <nav>
        <NavLink to="/" className="nav-item">
          <House size={20} />
          <span>Inicio</span>
        </NavLink>

        <NavLink to="/farmacias" className="nav-item">
          <Building2 size={20} />
          <span>Farmacias</span>
        </NavLink>

        <NavLink to="/ordenes" className="nav-item">
          <ShoppingCart size={20} />
          <span>Órdenes</span>
        </NavLink>

        <NavLink to="/control" className="nav-item">
          <ClipboardList size={20} />
          <span>Control de calidad</span>
        </NavLink>
      </nav>

      <div className="profile">
        <img src="https://i.pravatar.cc/40" alt="profile" />
        <div>
          <strong>Dra. Laura González</strong>
          <p>Gerente de almacén</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
