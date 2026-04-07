import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function MainLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased transition-colors duration-300">
      
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

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 overflow-auto bg-muted/30 dark:bg-transparent">
          <div className="mx-auto max-w-[1400px] w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-card text-card-foreground rounded-3xl border border-border shadow-sm p-6 min-h-[80vh]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
