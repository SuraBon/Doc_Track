import React, { useState } from "react";
import { useParcelStore } from '@/hooks/useParcelStore';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage }) => {
  const { parcels } = useParcelStore();
  const hasNotifications = parcels && parcels.length > 0;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "ภาพรวมระบบ", icon: "dashboard", badge: null },
    { id: "create",    label: "สร้างรายการใหม่", icon: "add_box", badge: null },
    { id: "confirm",   label: "ยืนยันรับพัสดุ", icon: "photo_camera", badge: null },
    { id: "track",     label: "ติดตามสถานะ", icon: "location_searching", badge: null },
  ];

  const handleNav = (id: string) => {
    setCurrentPage(id);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen font-body text-on-background">
      {/* ── Sidebar ── */}
      <aside
        className={`
          h-screen fixed left-0 top-0 z-50
          flex flex-col
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'w-64 px-4 translate-x-0' : 'w-16 px-2 -translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'linear-gradient(180deg, #0d1f3c 0%, #091426 60%, #060e1a 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
        }}
      >
        {/* Logo */}
        <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'} px-2 pt-2 pb-6 mb-2`}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0"
            style={{ background: 'linear-gradient(135deg, #fea619 0%, #ff8c00 100%)' }}>
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_shipping
            </span>
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col min-w-0">
              <span className="text-white font-black text-lg font-display leading-none">DocTrack</span>
              <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider mt-0.5">ระบบจัดการพัสดุ</span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex ml-auto p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-lg">
              {isSidebarOpen ? 'chevron_left' : 'chevron_right'}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 mx-2 mb-4" />

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = currentPage === item.id;
            return (
              <a
                key={item.id}
                onClick={() => handleNav(item.id)}
                title={isSidebarOpen ? undefined : item.label}
                className={`
                  flex items-center ${isSidebarOpen ? 'gap-3 px-3' : 'justify-center px-0'}
                  py-2.5 rounded-xl font-display text-sm font-semibold cursor-pointer
                  transition-all duration-200 relative group
                  ${active
                    ? 'text-white'
                    : 'text-white/45 hover:text-white/80 hover:bg-white/5'
                  }
                `}
                style={active ? {
                  background: 'linear-gradient(135deg, rgba(254,166,25,0.18) 0%, rgba(254,166,25,0.08) 100%)',
                  boxShadow: 'inset 0 0 0 1px rgba(254,166,25,0.2)',
                } : {}}
              >
                {/* Active indicator bar */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-secondary-container" />
                )}
                <span
                  className={`material-symbols-outlined text-xl shrink-0 transition-colors ${active ? 'text-secondary-container' : ''}`}
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {isSidebarOpen && <span className="truncate">{item.label}</span>}
              </a>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-white/5 space-y-1">
          <a
            className={`flex items-center ${isSidebarOpen ? 'gap-3 px-3' : 'justify-center'} py-2.5 text-white/30 hover:text-white/60 font-display text-sm font-semibold cursor-pointer hover:bg-white/5 rounded-xl transition-all`}
            title={isSidebarOpen ? undefined : "ติดต่อช่วยเหลือ"}
          >
            <span className="material-symbols-outlined text-xl">contact_support</span>
            {isSidebarOpen && "ติดต่อช่วยเหลือ"}
          </a>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Main content ── */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        {/* Top bar */}
        <header
          className="sticky top-0 z-40 flex justify-between items-center px-4 lg:px-6 h-14"
          style={{
            background: 'rgba(248,249,255,0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(197,198,205,0.3)',
            boxShadow: '0 1px 12px rgba(9,20,38,0.06)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 min-w-[40px] min-h-[40px] text-on-surface-variant hover:bg-surface-container transition-colors rounded-xl"
            >
              <span className="material-symbols-outlined text-xl">
                {isSidebarOpen ? 'close' : 'menu'}
              </span>
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-on-surface-variant/40 font-medium hidden sm:block">DocTrack</span>
              <span className="text-on-surface-variant/30 hidden sm:block">/</span>
              <span className="font-semibold text-primary capitalize">
                {navItems.find(n => n.id === currentPage)?.label ?? currentPage}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button className="relative p-2 text-on-surface-variant hover:bg-surface-container transition-colors rounded-xl">
              <span className="material-symbols-outlined text-xl">notifications</span>
              {hasNotifications && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-white" />
              )}
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-container transition-colors rounded-xl">
              <span className="material-symbols-outlined text-xl">help_outline</span>
            </button>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-xl ml-1 flex items-center justify-center text-white text-xs font-black shadow-sm"
              style={{ background: 'linear-gradient(135deg, #091426 0%, #1e293b 100%)' }}>
              A
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 pt-6 pb-10 flex-1 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
