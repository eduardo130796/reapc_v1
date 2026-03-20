import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function MainLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 antialiased">
      {/* Overlay no mobile quando sidebar aberta */}
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={closeSidebar}
        className={`
          fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-200
          lg:hidden
          ${sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"}
        `}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        className="hidden lg:flex"
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        className="flex lg:hidden fixed inset-y-0 left-0 z-50"
        mobile
      />

      <div className="flex flex-1 flex-col min-w-0 min-h-screen">
        <Header
          onMenuClick={toggleSidebar}
          title={title}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 overflow-auto">
          <div className="mx-auto max-w-7xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
