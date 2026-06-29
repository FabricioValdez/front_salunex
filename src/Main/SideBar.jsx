import { useState, useContext, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  House, ClipboardList, ShoppingCart, Package,
  PackageCheck, ClipboardCheck,
  LayoutDashboard, Menu, Settings, Tablets,
  Users, Building2, Pill, Tag, Layers, FlaskConical, Syringe, ArrowLeftRight,
} from "lucide-react";
import AuthContext from "../context/AuthContext";
import { logout } from "../services/authService";
import api from "../services/api";

const menuCompleto = [
  // ==========================================
  // --- 📦 PÁGINAS GENERALES
  // ==========================================
  { to: "/", icon: House, label: "Inicio" }, // Página de aterrizaje común libre
  { to: "/general/inventario", icon: Package, label: "Inventario", clave: "GMOV" },
  { to: "/general/control", icon: ClipboardList, label: "Control de Calidad", clave: "GCDC" }, // Clave: Gestión de Control de calidad
  { to: "/general/ordenes", icon: ShoppingCart, label: "Órdenes de Compra", clave: "GORD" }, // Clave: Gestión de Órdenes
  { to: "/general/recepcion-inventario", icon: PackageCheck, label: "Recepción Inventario", clave: "RECP" }, // Clave: Recepcion de Inventario
  
  // ==========================================
  // --- 🛠️ PÁGINAS DE ADMINISTRACIÓN (ADMIN) ---
  // ==========================================
  
  // --- Gestión de Personal y Cuentas ---
  { to: "/admin/usuarios", icon: Users, label: "Usuarios", clave: "GUSU" },
  { to: "/admin/empleados", icon: ArrowLeftRight, label: "Empleados", clave: "GEMP" }, // Vinculado a Gestión de Empleados

  // --- Entidades del Sistema ---
  { to: "/admin/empresas", icon: Building2, label: "Empresas", clave: "GPER" }, // Control de Permisos / Parámetros
  { to: "/admin/farmacias", icon: Pill, label: "Catálogo Farmacias", clave: "GFAR" },
  { to: "/admin/almacenes", icon: Package, label: "Catálogo Almacenes", clave: "GALM" },

  // --- Catálogos Finos de Productos (Módulo GPRO original desglosado en sub-claves) ---
  { to: "/admin/productos", icon: Tablets, label: "Productos", clave: "GPRO" },
  { to: "/admin/categorias-producto", icon: Tag, label: "Categorías", clave: "GCAT" }, // Clave: Gestión de Categoría Producto
  { to: "/admin/clasificaciones-producto", icon: Layers, label: "Clasificaciones", clave: "GCLA" }, // Clave: Gestión de Clasificación Prod
  { to: "/admin/presentaciones-producto", icon: FlaskConical, label: "Presentaciones", clave: "GPRE" }, // Clave: Gestión de Presentación Pro
  { to: "/admin/vias-administracion", icon: Syringe, label: "Vías Admin.", clave: "GVIA" }, // Clave: Gestión de Vía Administración
  { to: "/admin/tipos-movimiento-sistema", icon: ArrowLeftRight, label: "Tipos de Movimiento", clave: "GTIP" }, // Clave: Gestión de Tipo movimiento

  // ==========================================
  // --- ⏳ MÓDULOS FUTUROS (FALTAN AGREGAR) ---
  // ==========================================
  // { to: "/admin/permisos", icon: Settings, label: "Permisos", clave: "GPER" }, // Futuro módulo en BD
  // { to: "/admin/roles", icon: ArrowLeftRight, label: "Roles", clave: "GROL" },
  // { to: "/admin/modulos", icon: Layers, label: "Módulos Sistema", clave: "" },
  { to: "/general/dashboard", icon: LayoutDashboard, label: "Dashboard" }, // Palomeada = Sin clave por ahora
  { to: "/suscripcion", icon: Tag, label: "Suscripción" } // Palomeada = Sin clave por ahora
];

const rutasBase = ["/", "/admin", "/empresa", "/farmacia"];

const Sidebar = ({ onOpenSettings }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [misPermisos, setMisPermisos] = useState([]);
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarPermisosDelUsuario = async () => {
      try {
        const res = await api.get('/usuario/permisos');
        setMisPermisos(res.data.permisos);
      } catch (error) {
        console.error("Error cargando los permisos desde el controlador:", error);
      }
    };

    if (user) cargarPermisosDelUsuario();
  }, [user]);

  const menuFiltrado = menuCompleto.filter(modulo => {
    if (!modulo.clave) return true;
    return misPermisos.includes(modulo.clave);
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

      {/* 🌟 SCROLL VERTICAL INTELIGENTE: Se adapta a cualquier pantalla y oculta el desborde */}
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