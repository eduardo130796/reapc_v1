import { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Squares2X2Icon,
  DocumentDuplicateIcon,
  FolderOpenIcon,
  XMarkIcon,
  UsersIcon, 
  CalculatorIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { 
  Squares2X2Icon as Squares2X2IconSolid,
  DocumentDuplicateIcon as DocumentDuplicateIconSolid,
  FolderOpenIcon as FolderOpenIconSolid,
  UsersIcon as UsersIconSolid,
  CalculatorIcon as CalculatorIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid
} from "@heroicons/react/24/solid";

const LOGO = (
  <div className="relative group cursor-pointer transition-transform duration-300 hover:scale-105">
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none" className="shrink-0 drop-shadow-lg" aria-hidden>
      <rect width="48" height="48" rx="14" fill="hsl(var(--primary))" />
      <path d="M14 32l10-16 10 16" stroke="rgba(255,255,255,0.95)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
);

const menuSections = [
  {
    title: "Principal",
    items: [
      { name: "Dashboard", path: "/dashboard", Icon: Squares2X2Icon, IconActive: Squares2X2IconSolid },
    ]
  },
  {
    title: "Gestão",
    items: [
      { name: "Modelos PCFP", path: "/modelos", Icon: DocumentDuplicateIcon, IconActive: DocumentDuplicateIconSolid },
      { name: "Contratos", path: "/contratos",  Icon: FolderOpenIcon, IconActive: FolderOpenIconSolid },
      { name: "Repactuações", path: "/repactuacoes", Icon: CalculatorIcon, IconActive: CalculatorIconSolid },
    ]
  },
  {
    title: "Administração",
    items: [
      { name: "Usuários", path: "/usuarios", Icon: UsersIcon, IconActive: UsersIconSolid },
      { name: "Permissões", path: "/roles", Icon: ShieldCheckIcon, IconActive: ShieldCheckIconSolid },
    ]
  }
];

export default function Sidebar({ isOpen, onClose, className = "", mobile }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || "tecnico";
  const isAdmin = role === "admin";
  const isGestor = role === "gestor";
  const isTecnico = role === "tecnico";

  const filteredSections = useMemo(() => {
    return menuSections.map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (isAdmin) return true;
        if (isGestor) return ["Dashboard", "Modelos PCFP", "Contratos", "Repactuações"].includes(item.name);
        if (isTecnico) return ["Dashboard", "Repactuações"].includes(item.name);
        return false;
      })
    })).filter(section => section.items.length > 0);
  }, [isAdmin, isGestor, isTecnico]);

  const baseClasses = `
    flex flex-col h-full w-72
    bg-[#0f172a] text-slate-300
    border-r border-slate-800/60
    transition-transform duration-400 ease-in-out
    shadow-2xl
  `;
  const mobileTransform = mobile
    ? (isOpen ? "translate-x-0" : "-translate-x-full")
    : "";

  return (
    <aside
      className={`${baseClasses} ${mobileTransform} ${className}`}
      role="navigation"
      aria-label="Menu principal"
    >
      {/* Header: Logo + App Name */}
      <div className="flex h-20 shrink-0 items-center justify-between gap-3 px-6">
        <div className="flex items-center gap-3.5 group cursor-pointer" onClick={() => navigate("/dashboard")}>
          {LOGO}
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
              PCFP
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Gestão Analítica
            </span>
          </div>
        </div>
        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Nav Content */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar space-y-8">
        {filteredSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h3 className="px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500/80">
              {section.title}
            </h3>
            <ul className="space-y-1" role="list">
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={mobile ? onClose : undefined}
                    className={({ isActive }) =>
                      `
                        group flex items-center justify-between gap-3 rounded-xl px-4 py-2.5
                        text-sm font-medium
                        transition-all duration-200
                        ${isActive
                          ? "bg-primary text-white shadow-lg shadow-primary/20"
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                        }
                      `
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <span className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-white" : "text-slate-500 group-hover:text-primary"}`}>
                            {isActive ? (
                              <item.IconActive className="w-5 h-5" />
                            ) : (
                              <item.Icon className="w-5 h-5" />
                            )}
                          </span>
                          <span className="truncate">{item.name}</span>
                        </div>
                        {isActive && <ChevronRightIcon className="w-4 h-4 text-white/50 animate-in slide-in-from-left-1" />}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer: User Profile Card */}
      <div className="shrink-0 p-4 border-t border-slate-800/60 bg-slate-900/30">
        <button 
          onClick={() => navigate("/perfil")}
          className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-800/50 transition-all group"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg group-hover:ring-2 group-hover:ring-primary/50 transition-all">
            <span className="font-bold text-sm">{user?.nome?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}</span>
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">
              {user?.nome || "Completar Perfil"}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {user?.email}
            </p>
          </div>
          <UserCircleIcon className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
        </button>
      </div>
    </aside>
  );
}
