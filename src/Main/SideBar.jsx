import { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  House, ClipboardList, ShoppingCart, Package,
  PackageCheck, ClipboardCheck,
  LayoutDashboard, Menu, Settings, Tablets,
  Users, Building2, Pill, Tag, Layers, FlaskConical, Syringe, ArrowLeftRight,
} from "lucide-react";
import AuthContext from "../context/AuthContext";
import { logout } from "../services/authService";

const menuCompleto = [
  // --- 📦 PÁGINAS GENERALES
  { to: "/", icon: House, label: "Inicio" }, 
  { to: "/general/inventario", icon: Package, label: "Inventario", clave: "GMOV" },
  { to: "/general/control", icon: ClipboardList, label: "Control de Calidad", clave: "GCDC" }, 
  { to: "/general/ordenes", icon: ShoppingCart, label: "Órdenes de Compra", clave: "GORD" }, 
  { to: "/general/recepcion-inventario", icon: PackageCheck, label: "Recepción Inventario", clave: "RECP" }, 
  
  // --- 🛠️ PÁGINAS DE ADMINISTRACIÓN (ADMIN) ---
  { to: "/admin/usuarios", icon: Users, label: "Usuarios", clave: "GUSU" },
  { to: "/admin/empleados", icon: ArrowLeftRight, label: "Empleados", clave: "GEMP" }, 
  { to: "/admin/empresas", icon: Building2, label: "Empresas", clave: "GPER" }, 
  { to: "/admin/farmacias", icon: Pill, label: "Catálogo Farmacias", clave: "GFAR" },
  { to: "/admin/almacenes", icon: Package, label: "Catálogo Almacenes", clave: "GALM" },
  { to: "/admin/productos", icon: Tablets, label: "Productos", clave: "GPRO" },
  { to: "/admin/categorias-producto", icon: Tag, label: "Categorías", clave: "GCAT" }, 
  { to: "/admin/clasificaciones-producto", icon: Layers, label: "Clasificaciones", clave: "GCLA" }, 
  { to: "/admin/presentaciones-producto", icon: FlaskConical, label: "Presentaciones", clave: "GPRE" }, 
  { to: "/admin/vias-administracion", icon: Syringe, label: "Vías Admin.", clave: "GVIA" }, 
  { to: "/admin/tipos-movimiento-sistema", icon: ArrowLeftRight, label: "Tipos de Movimiento", clave: "GTIP" }, 

  // --- ⏳ MÓDULOS FUTUROS ---
  { to: "/general/dashboard", icon: LayoutDashboard, label: "Dashboard" }, 
  { to: "/suscripcion", icon: Tag, label: "Suscripción" } 
];

const rutasBase = ["/", "/admin", "/empresa", "/farmacia"];

const Sidebar = ({ onOpenSettings }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🌟 Única validación: Si no tiene clave, pasa. Si tiene clave, verifica en el array global.
  const menuFiltrado = menuCompleto.filter(modulo => {
    if (!modulo.clave) return true;
    return user?.permisos?.includes(modulo.clave);
  });

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

      <nav style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        maxHeight: "calc(100vh - 240px)"
      }}>
        {menuFiltrado.map(({ to, icon: IconComponent, label }) => (
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