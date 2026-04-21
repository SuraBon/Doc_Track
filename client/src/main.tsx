import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { ParcelStoreProvider } from "./contexts/ParcelStoreContext";

createRoot(document.getElementById("root")!).render(
  <ParcelStoreProvider>
    <App />
  </ParcelStoreProvider>
);
