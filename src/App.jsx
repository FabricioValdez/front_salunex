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