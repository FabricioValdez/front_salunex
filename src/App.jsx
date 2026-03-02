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

function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login público */}
        <Route path="/login" element={<Login />} />

        {/* Todo el sistema protegido */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          {/* Ruta principal */}
          <Route index element={<Inicio />} />

          {/* Rutas internas */}
          <Route path="farmacias" element={<Farmacias />} />
          <Route path="ordenes" element={<Ordenes />} />
          <Route path="control" element={<ControlDeCalidad />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/farmacias" element={<Farmacias />} />
          <Route path="/ordenes" element={<Ordenes />} />
          <Route path="/control" element={<ControlDeCalidad />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;