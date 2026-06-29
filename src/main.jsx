import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css"
import AuthProvider from "./context/AuthProvider";
import { InventoryProvider } from "./context/InventoryContext";
import { CatalogosProvider } from "./context/CatalogosContext";

import "bootstrap/dist/css/bootstrap.min.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <CatalogosProvider>
        <InventoryProvider>
          <App />
        </InventoryProvider>
      </CatalogosProvider>
    </AuthProvider>
  </StrictMode>
);