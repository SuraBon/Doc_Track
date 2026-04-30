import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { ParcelStoreProvider } from "./contexts/ParcelStoreContext";
import { AuthProvider } from "./contexts/AuthContext";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ParcelStoreProvider>
      <App />
    </ParcelStoreProvider>
  </AuthProvider>
);
