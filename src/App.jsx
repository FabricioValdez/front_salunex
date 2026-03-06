import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import AuthContext from "./context/AuthContext";

import Login from "./pages/Login";
import MainLayout from "./Main/Layout";

import Inicio from "./pages/Inicio";
import Farmacias from "./pages/Farmacias";
import Ordenes from "./pages/Ordenes";
import ControlDeCalidad from "./pages/ControlDeCalidad";
import Inventario from "./pages/Inventario";
import Dashboard from "./pages/Dashboard";

/* ================= PROTEGER RUTAS ================= */

function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);

  return user ? children : <Navigate to="/login" replace />;
}

/* ================= APP ================= */

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN PUBLICO */}
        <Route path="/login" element={<Login />} />

        {/* SISTEMA PROTEGIDO */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >

          {/* HOME */}
          <Route index element={<Inicio />} />

          {/* MODULOS */}
          <Route path="inventario" element={<Inventario />} />
          <Route path="ordenes" element={<Ordenes />} />
          <Route path="farmacias" element={<Farmacias />} />
          <Route path="control" element={<ControlDeCalidad />} />
          <Route path="dashboard" element={<Dashboard />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;