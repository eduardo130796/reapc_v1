import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

function Avatar({ email, name }) {
  const color = email
    ? `hsl(${
        (
          (email.charCodeAt(0) +
            email.charCodeAt(email.length - 1) +
            email.length) *
          31
        ) %
          360
      }, 55%, 45%)`
    : "#64748b";

  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || (email ? email.slice(0, 2).toUpperCase() : "?");

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white shadow-inner"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

export default function Header({ onMenuClick, title }) {
  const navigate = useNavigate();
  const email = localStorage.getItem("user_email") ?? "";
  const userName = email ? email.split("@")[0] : "Usuário";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menu"
          className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-slate-800 truncate">
          {title ?? "Painel"}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2" ref={menuRef}>
        <div className="hidden sm:block text-right min-w-0">
          <p className="text-sm font-medium text-slate-700 truncate">
            {userName}
          </p>
          <p className="text-xs text-slate-500 truncate max-w-[180px]">
            {email}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((m) => !m)}
          className="flex items-center gap-2 rounded-full p-1 pr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 hover:bg-slate-100 transition-colors"
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          <Avatar email={email} name={userName} />
          <svg
            className={`h-5 w-5 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {menuOpen && (
          <div
            className="absolute right-4 top-full mt-2 w-64 origin-top-right rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-900/5 focus:outline-none z-50"
            role="menu"
          >
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Avatar email={email} name={userName} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{email}</p>
                </div>
              </div>
            </div>
            <div className="py-1">
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                role="menuitem"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 text-slate-400" />
                Sair
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
