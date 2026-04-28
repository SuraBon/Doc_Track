import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CreateParcel from "./pages/CreateParcel";
import ConfirmReceipt from "./pages/ConfirmReceipt";
import Track from "./pages/Track";
import { isConfigured, onConfigUpdated } from "./lib/parcelService";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isConfiguredState, setIsConfiguredState] = useState(isConfigured());

  useEffect(() => {
    const updateConfig = () => setIsConfiguredState(isConfigured());
    const unsubscribe = onConfigUpdated(updateConfig);
    updateConfig();
    return unsubscribe;
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
            {/* ใช้ hidden แทน unmount เพื่อ preserve state ของแต่ละหน้า */}
            <div className={currentPage === "dashboard" ? '' : 'hidden'}>
              <Dashboard isConfigured={isConfiguredState} />
            </div>
            <div className={currentPage === "create" ? '' : 'hidden'}>
              <CreateParcel />
            </div>
            <div className={currentPage === "confirm" ? '' : 'hidden'}>
              <ConfirmReceipt />
            </div>
            <div className={currentPage === "track" ? '' : 'hidden'}>
              <Track />
            </div>
          </Layout>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
