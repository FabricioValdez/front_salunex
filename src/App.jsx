import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "./context/AuthContext";

import Login from "./pages/Login";
import MainLayout from "./Main/Layout";
import Inicio from "./pages/Inicio";
import Inventario from "./pages/Inventario";
import Ordenes from "./pages/Ordenes";
import ControlDeCalidad from "./pages/ControlDeCalidad";
import Dashboard from "./pages/Dashboard";
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
import OrdenesDeCompra from "./pages/farmacia/OrdenesDeCompra";
import InventarioFarmacia from "./pages/farmacia/InventarioFarmacia";
import ControlCalidadFarmacia from "./pages/farmacia/ControlCalidadFarmacia";
import RecepcionAlmacen from "./pages/farmacia/RecepcionAlmacen";

// 🔒 Protege por autenticación
function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
}

// 🔒 Protege por rol específico
function RoleRoute({ children, allowedRoles }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.idrol)) return <Navigate to="/sin-permiso" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PÚBLICA */}
        <Route path="/login" element={<Login />} />
        <Route path="/sin-permiso" element={
          <div style={{ padding: 40 }}>
            <h2>🚫 Sin permiso</h2>
            <p>No tienes acceso a esta sección.</p>
          </div>
        } />

        {/* ALMACÉN (rol 1) */}
        <Route path="/" element={
          <PrivateRoute><MainLayout /></PrivateRoute>
        }>
          <Route index element={<Inicio />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="ordenes" element={<Ordenes />} />
          <Route path="control" element={<ControlDeCalidad />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="suscripcion" element={<Suscripcion />} />
        </Route>

        {/* ADMINISTRADOR (rol 2) */}
        <Route path="/admin" element={
          <RoleRoute allowedRoles={[2]}>
            <PrivateRoute><MainLayout /></PrivateRoute>
          </RoleRoute>
        }>
          <Route index element={<Usuarios />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="empresas" element={<Empresas />} />
          <Route path="farmacias" element={<Farmacias />} />
          <Route path="almacenes" element={<Almacenes />} />
          <Route path="productos" element={<Productos />} />
          <Route path="categorias-producto" element={<CategoriaProducto />} />
          <Route path="clasificaciones-producto" element={<ClasificacionProducto />} />
          <Route path="presentaciones-producto" element={<PresentacionProducto />} />
          <Route path="vias-administracion" element={<ViaAdministracion />} />
          <Route path="tipos-movimiento" element={<TipoMovimiento />} />
        </Route>

        {/* EMPRESA (rol 3) */}
        <Route path="/empresa" element={
          <RoleRoute allowedRoles={[3]}>
            <PrivateRoute><MainLayout /></PrivateRoute>
          </RoleRoute>
        }>
          <Route index element={
            <div style={{ padding: 40 }}>
              <h2>🏢 Panel Empresa</h2>
            </div>
          } />
        </Route>

        {/* FARMACIA (rol 4) */}
        <Route path="/farmacia" element={
          <RoleRoute allowedRoles={[4]}>
            <PrivateRoute><MainLayout /></PrivateRoute>
          </RoleRoute>
        }>
          <Route index element={
            <div style={{ padding: 40 }}>
              <h2>💊 Panel Farmacia</h2>
            </div>
          } />
          <Route path="ordenes" element={<OrdenesDeCompra />} />
          <Route path="inventario" element={<InventarioFarmacia />} />
          <Route path="control-calidad" element={<ControlCalidadFarmacia />} />
          <Route path="recepcion-almacen" element={<RecepcionAlmacen />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;