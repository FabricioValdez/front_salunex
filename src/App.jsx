import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "./context/AuthContext";

import Login from "./pages/Login";
import RegistroEmpresa from "./pages/RegistroEmpresa"
import MainLayout from "./Main/Layout";
import Inicio from "./pages/general/Inicio";
import Inventario from "./pages/general/Inventario";
import Ordenes from "./pages/general/Ordenes";
import ControlDeCalidad from "./pages/general/ControlDeCalidad";
import RecepcionAlmacen from "./pages/general/RecepcionInventario";
import Dashboard from "./pages/general/Dashboard";
import Suscripcion from "./pages/Suscripcion";
import Usuarios from "./pages/admin/Usuarios";
import Empresas from "./pages/admin/Empresas";
import Farmacias from "./pages/admin/Farmacias";
import Almacenes from "./pages/admin/Almacenes";
import Productos from "./pages/admin/Productos";
import CategoriaProducto from "./pages/admin/CategoriaProducto";
import ClasificacionProducto from "./pages/admin/ClasificacionProducto";
import PresentacionProducto from "./pages/admin/PresentacionProducto";
import ViaAdministracion from "./pages/admin/ViaAdministracion";
import TipoMovimiento from "./pages/admin/TipoMovimiento";
import EditarUsuario from "./pages/admin/EditarUsuario";
import RegistroExitoso from "./pages/RegistroExitoso";

// 🔒 Protege por autenticación (Se mantiene activa)
function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
}

// 🔓 APAGADO TEMPORAL: Deja pasar a cualquier usuario autenticado sin importar su idrol
function RoleRoute({ children, requiredPermission }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;

  // 🔓 COMENTA ESTO TEMPORALMENTE para que no te rebote a ningún lado mientras prueban:
  // if (!user.permisos || !user.permisos.includes(requiredPermission)) {
  //   return <Navigate to="/sin-permiso" replace />;
  // }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PÚBLICA */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegistroEmpresa />} />
        <Route
          path="/registro-exitoso"
          element={<RegistroExitoso />}
        />
        <Route path="/sin-permiso" element={
          <div style={{ padding: 40 }}>
            <h2>🚫 Sin permiso</h2>
            <p>No tienes acceso a esta sección.</p>
          </div>
        } />

        {/* GENERAL */}
        <Route path="/" element={
          <PrivateRoute><MainLayout /></PrivateRoute>
        }>
          <Route index element={<Inicio />} />
          <Route path="suscripcion" element={<Suscripcion />} />

          {/* Sub-rutas bajo el prefijo /general/... asignado en tu Sidebar */}
          <Route path="general">
            <Route path="dashboard" element={<Dashboard />} /> {/* Público por ahora */}
            <Route path="inventario" element={<RoleRoute requiredPermission="GALM"><Inventario /></RoleRoute>} />
            <Route path="control" element={<RoleRoute requiredPermission="GCDC"><ControlDeCalidad /></RoleRoute>} />
            <Route path="ordenes" element={<RoleRoute requiredPermission="GORD"><Ordenes /></RoleRoute>} />
            <Route path="recepcion-inventario" element={<RoleRoute requiredPermission="RECP"><RecepcionAlmacen /></RoleRoute>} />
          </Route>
        </Route>

        {/* ADMINISTRADOR */}
        <Route path="/admin" element={
          <PrivateRoute><MainLayout /></PrivateRoute>
        }>
          {/* Cada sub-ruta valida quirúrgicamente su propio permiso asignado */}
          <Route index element={<Navigate to="usuarios" replace />} />

          {/* Cuentas y Personal */}
          <Route path="usuarios" element={<RoleRoute requiredPermission="GUSU"><Usuarios /></RoleRoute>} />
          <Route path="usuarios/:id/editar" element={<RoleRoute requiredPermission="GUSU"><EditarUsuario /></RoleRoute>} />
          <Route path="tipos-movimiento" element={<RoleRoute requiredPermission="GEMP"><TipoMovimiento /></RoleRoute>} /> {/* Vistas Empleados */}

          {/* Entidades corporativas */}
          <Route path="empresas" element={<RoleRoute requiredPermission="GPER"><Empresas /></RoleRoute>} />
          <Route path="farmacias" element={<RoleRoute requiredPermission="GFAR"><Farmacias /></RoleRoute>} />
          <Route path="almacenes" element={<RoleRoute requiredPermission="GALM"><Almacenes /></RoleRoute>} />

          {/* Catálogos de Productos desglosados */}
          <Route path="productos" element={<RoleRoute requiredPermission="GPRO"><Productos /></RoleRoute>} />
          <Route path="categorias-producto" element={<RoleRoute requiredPermission="GCAT"><CategoriaProducto /></RoleRoute>} />
          <Route path="clasificaciones-producto" element={<RoleRoute requiredPermission="GCLA"><ClasificacionProducto /></RoleRoute>} />
          <Route path="presentaciones-producto" element={<RoleRoute requiredPermission="GPRE"><PresentacionProducto /></RoleRoute>} />
          <Route path="vias-administracion" element={<RoleRoute requiredPermission="GVIA"><ViaAdministracion /></RoleRoute>} />
          <Route path="tipos-movimiento-sistema" element={<RoleRoute requiredPermission="GTIP"><TipoMovimiento /></RoleRoute>} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
