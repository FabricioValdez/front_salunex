import { useState, useContext, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  House, ClipboardList, Package, LayoutDashboard, Menu, Settings, Tablets,
  Users, Building2, Tag, Layers, FlaskConical, Syringe, ArrowLeftRight,
  MapPin, ChevronDown, ChevronRight
} from "lucide-react";
import AuthContext from "../context/AuthContext";
import { logout } from "../services/authService";
import "./SideBar.css";

const menuCompleto = [
  // --- 📦 PÁGINAS GENERALES
  { to: "/", icon: House, label: "Inicio" },
  { to: "/general/inventario", icon: Package, label: "Inventario", clave: "GMOV" },
  { to: "/general/ordenes", icon: ArrowLeftRight, label: "Movimientos", claves_or: ["GMOV", "RECP", "GORD", "GCDC"] },

  // --- 🛠️ PÁGINAS DE ADMINISTRACIÓN (ADMIN) ---
  { to: "/admin/usuarios", icon: Users, label: "Usuarios y Empleados", clave: "GUSU" },
  { to: "/admin/empresas", icon: Building2, label: "Empresas", clave: "GPER" },
  { to: "/admin/ubicaciones", icon: MapPin, label: "Catálogo Ubicaciones", clave: "GUBI" },

  // 🌟 CAMBIO: Convertimos "Productos" en una categoría con submenús
  {
    icon: Tablets,
    label: "Productos",
    claves_or: ["GPRO", "GCAT", "GCLA", "GPRE", "GVIA"], // Si tiene al menos uno, ve la carpeta
    subrutas: [
      { to: "/admin/productos", icon: Tablets, label: "Catálogo de Productos", clave: "GPRO" },
      { to: "/admin/categorias-producto", icon: Tag, label: "Categorías", clave: "GCAT" },
      { to: "/admin/clasificaciones-producto", icon: Layers, label: "Clasificaciones", clave: "GCLA" },
      { to: "/admin/presentaciones-producto", icon: FlaskConical, label: "Presentaciones", clave: "GPRE" },
      { to: "/admin/vias-administracion", icon: Syringe, label: "Vías Admin.", clave: "GVIA" },
    ]
  },

  // --- ⏳ MÓDULOS FUTUROS ---
  { to: "/general/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/suscripcion", icon: Tag, label: "Suscripción" }
];

const rutasBase = ["/", "/admin", "/empresa", "/farmacia"];

const Sidebar = ({ onOpenSettings }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({}); // Controla qué acordeones están abiertos
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Mantenemos abierto el menú si estamos dentro de alguna de sus subrutas
  useEffect(() => {
    menuCompleto.forEach(modulo => {
      if (modulo.subrutas && modulo.subrutas.some(sub => location.pathname.includes(sub.to))) {
        setOpenMenus(prev => ({ ...prev, [modulo.label]: true }));
      }
    });
  }, [location.pathname]);

  const toggleSubmenu = (label) => {
    // Si el menú lateral está colapsado, no dejamos abrir submenús (se rompería el diseño)
    if (collapsed) {
      setCollapsed(false);
      setOpenMenus({ [label]: true });
    } else {
      setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
    }
  };

  // Filtrado que soporta tanto rutas normales como carpetas de subrutas
  const menuFiltrado = menuCompleto.map(modulo => {
    // Si es una carpeta con subrutas
    if (modulo.subrutas) {
      const subrutasFiltradas = modulo.subrutas.filter(sub =>
        !sub.clave || user?.permisos?.includes(sub.clave)
      );
      // Solo devolvemos la carpeta si tiene al menos un submenú permitido
      if (subrutasFiltradas.length > 0) {
        return { ...modulo, subrutas: subrutasFiltradas };
      }
      return null;
    }

    // Lógica para rutas directas
    if (!modulo.clave && !modulo.claves_or) return modulo;
    if (modulo.claves_or && modulo.claves_or.some(c => user?.permisos?.includes(c))) return modulo;
    if (user?.permisos?.includes(modulo.clave)) return modulo;

    return null;
  }).filter(Boolean); // Eliminamos los nulos

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

      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", maxHeight: "calc(100vh - 240px)" }}>
        {menuFiltrado.map((modulo) => {
          const IconComponent = modulo.icon;

          // RENDERIZADO DE CARPETA (Acordeón)
          if (modulo.subrutas) {
            const isOpen = openMenus[modulo.label];
            return (
              <div key={modulo.label} className="submenu-wrapper">
                <button
                  className={`sidebar-nav-item submenu-toggle ${isOpen ? "active-submenu" : ""}`}
                  onClick={() => toggleSubmenu(modulo.label)}
                >
                  <div className="submenu-toggle-left">
                    <IconComponent size={20} />
                    {!collapsed && <span>{modulo.label}</span>}
                  </div>
                  {!collapsed && (
                    isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                  )}
                </button>

                {/* Opciones hijas */}
                {isOpen && !collapsed && (
                  <div className="submenu-container">
                    {modulo.subrutas.map(sub => (
                      <NavLink
                        key={sub.to}
                        to={sub.to}
                        className={({ isActive }) => `sidebar-nav-item sub-item ${isActive ? "active" : ""}`}
                      >
                        {!collapsed && <span>{sub.label}</span>}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // RENDERIZADO DE RUTA NORMAL
          return (
            <NavLink
              key={modulo.to}
              to={modulo.to}
              end={rutasBase.includes(modulo.to)}
              className="sidebar-nav-item"
            >
              <IconComponent size={20} />
              {!collapsed && <span>{modulo.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <button className="sidebar-nav-item" onClick={onOpenSettings}>
          <Settings size={20} />
          {!collapsed && <span>Configuración</span>}
        </button>
        <button className="sidebar-nav-item" onClick={handleLogout} style={{ color: "var(--danger, #e74c3c)" }}>
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