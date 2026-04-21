import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import CreateParcel from "./pages/CreateParcel";
import ConfirmReceipt from "./pages/ConfirmReceipt";
import Track from "./pages/Track";
import { Button } from "@/components/ui/button";
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

  const navItems = [
    { id: "dashboard", label: "📊 มอนิเตอร์", icon: "📊" },
    { id: "create", label: "➕ สร้างรายการ", icon: "➕" },
    { id: "confirm", label: "📷 ยืนยันรับ", icon: "📷" },
    { id: "track", label: "🔍 ติดตาม", icon: "🔍" },
  ];

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          
          <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
              <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📦</span>
                  <h1 className="text-lg md:text-xl font-bold text-foreground">Messenger Tracker</h1>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 md:flex-wrap md:justify-end">
                  {navItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={currentPage === item.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(item.id)}
                      className="gap-2 text-xs md:text-sm shrink-0"
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
            </nav>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
              {currentPage === "dashboard" && (
                <Dashboard isConfigured={isConfiguredState} />
              )}
              {currentPage === "create" && <CreateParcel />}
              {currentPage === "confirm" && <ConfirmReceipt />}
              {currentPage === "track" && <Track />}
            </main>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
