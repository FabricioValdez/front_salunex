import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "./context/AuthContext";

import Login from "./pages/Login";
import MainLayout from "./Main/Layout";
import Inicio from "./pages/Inicio";
import Farmacias from "./pages/Farmacias";
import Ordenes from "./pages/Ordenes";
import ControlDeCalidad from "./pages/ControlDeCalidad";

function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
}

import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./Main/Layout";
import Inicio from "./pages/Inicio";
import Farmacias from "./pages/Farmacias";
import Ordenes from "./pages/Ordenes";
import ControlDeCalidad from "./pages/ControlDeCalidad";

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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;