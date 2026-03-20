import { NavLink } from "react-router-dom";
import {
  Squares2X2Icon,
  DocumentDuplicateIcon,
  FolderOpenIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Squares2X2Icon as Squares2X2IconSolid,
  DocumentDuplicateIcon as DocumentDuplicateIconSolid,
  FolderOpenIcon as FolderOpenIconSolid,
} from "@heroicons/react/24/solid";

const LOGO = (
  <svg
    width="32"
    height="32"
    viewBox="0 0 48 48"
    fill="none"
    className="shrink-0"
    aria-hidden
  >
    <rect width="48" height="48" rx="12" fill="currentColor" className="text-blue-600" />
    <path
      d="M14 32l10-16 10 16"
      stroke="rgba(255,255,255,0.9)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    Icon: Squares2X2Icon,
    IconActive: Squares2X2IconSolid,
  },
  {
    name: "Modelos PCFP",
    path: "/modelos",
    Icon: DocumentDuplicateIcon,
    IconActive: DocumentDuplicateIconSolid,
  },
  {
    name: "Contratos",
    path: "/contratos",
    Icon: FolderOpenIcon,
    IconActive: FolderOpenIconSolid,
  },
];

export default function Sidebar({ isOpen, onClose, className = "", mobile }) {
  const baseClasses = `
    flex flex-col h-full w-72
    bg-slate-900 text-slate-200
    border-r border-slate-800
    transition-transform duration-300 ease-out
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
      {/* Top: logo + nome + botão fechar (mobile) */}
      <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-800 px-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex items-center justify-center text-blue-500">
            {LOGO}
          </span>
          <span className="text-lg font-semibold tracking-tight text-white truncate">
            PCFP
          </span>
        </div>
        {mobile && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1" role="list">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={mobile ? onClose : undefined}
                className={({ isActive }) =>
                  `
                    flex items-center gap-3 rounded-lg px-3 py-2.5
                    text-sm font-medium
                    transition-colors duration-150
                    outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
                    ${isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800/80">
                      {isActive ? (
                        <item.IconActive className="w-5 h-5 text-white" />
                      ) : (
                        <item.Icon className="w-5 h-5 text-slate-400" />
                      )}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-800 px-4 py-3">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} PCFP
        </p>
      </div>
    </aside>
  );
}
