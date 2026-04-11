import { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  House, ClipboardList, ShoppingCart, Package,
  LayoutDashboard, Menu, Settings, Tablets,
  Users, Building2, Pill, Tag, Layers, FlaskConical, Syringe, ArrowLeftRight,
} from "lucide-react";
import AuthContext from "../context/AuthContext";
import { logout } from "../services/authService";

// Menús por rol
const menuPorRol = {
  1: [ // Almacén
    { to: "/", icon: House, label: "Inicio" },
    { to: "/ordenes", icon: ShoppingCart, label: "Órdenes" },
    { to: "/inventario", icon: Package, label: "Inventario" },
    { to: "/control", icon: ClipboardList, label: "Control de calidad" },
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  ],
  2: [ // Administrador
    { to: "/admin/usuarios", icon: Users, label: "Usuarios" },
    { to: "/admin/empresas", icon: Building2, label: "Empresas" },
    { to: "/admin/farmacias", icon: Pill, label: "Farmacias" },
    { to: "/admin/almacenes", icon: Package, label: "Almacenes" },
    { to: "/admin/productos", icon: Tablets, label: "Productos" },
    { to: "/admin/categorias-producto", icon: Tag, label: "Categorías" },
    { to: "/admin/clasificaciones-producto", icon: Layers, label: "Clasificaciones" },
    { to: "/admin/presentaciones-producto", icon: FlaskConical, label: "Presentaciones" },
    { to: "/admin/vias-administracion", icon: Syringe, label: "Vías Admin." },
    { to: "/admin/tipos-movimiento", icon: ArrowLeftRight, label: "Tipos Movimiento" },
  ],
  3: [ // Empresa
    { to: "/empresa", icon: Building2, label: "Inicio" },
    { to: "/empresa/reportes", icon: LayoutDashboard, label: "Reportes" },
  ],
  4: [ // Farmacia
    { to: "/farmacia", icon: Pill, label: "Inicio" },
    { to: "/farmacia/inventario", icon: Package, label: "Mi inventario" },
    { to: "/farmacia/ordenes", icon: ShoppingCart, label: "Mis órdenes" },
  ],
};

const rutasBase = ["/", "/admin", "/empresa", "/farmacia"];

const Sidebar = ({ onOpenSettings }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const menu = menuPorRol[user?.idrol] ?? menuPorRol[1];

  const handleLogout = async () => {
    await logout();
    logoutUser();
    navigate("/login", { replace: true });
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="top-section">
        <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
          <Menu size={20} />
        </button>
        {!collapsed && <h2 className="logo">SALUNEX</h2>}
      </div>

      <nav>
        {menu.map(({ to, icon: IconComponent, label }) => (
          <NavLink
            key={to}
            to={to}
            end={rutasBase.includes(to)}
            className="sidebar-nav-item"
          >
            <IconComponent size={20} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="sidebar-nav-item" onClick={onOpenSettings}>
          <Settings size={20} />
          {!collapsed && <span>Configuración</span>}
        </button>
        <button
          className="sidebar-nav-item"
          onClick={handleLogout}
          style={{ color: "var(--danger, #e74c3c)" }}
        >
          <span>⏻</span>
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>

      <div className="profile">
        {!collapsed ? (
          <>
            <img src="https://i.pravatar.cc/40" alt="profile" />
            <div>
              <strong>{user?.email}</strong>
              <p>{user?.rol}</p>
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