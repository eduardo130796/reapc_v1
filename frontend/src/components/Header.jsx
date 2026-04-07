import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { 
  Bars3Icon, 
  ArrowRightOnRectangleIcon, 
  UserIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

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
      }, 65%, 50%)`
    : "#94a3b8";

  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || (email ? email.slice(0, 2).toUpperCase() : "?");

  return (
    <div
      className="flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm ring-2 ring-background font-bold text-sm transition-transform hover:scale-105"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

export default function Header({ onMenuClick, title }) {
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const email = user?.email || "";
  const userName = user?.nome || (email ? email.split("@")[0] : "Usuário");
  
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  function logout() {
    authLogout();
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
    <header className="relative z-30 flex h-16 shrink-0 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 glass transition-all">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menu"
          className="lg:hidden p-2 -ml-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all active:scale-95"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        
        {/* Título com Breadcrumb 느낌 */}
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <span>PCFP</span>
          <span className="text-border">/</span>
          <h1 className="font-semibold text-foreground truncate">
            {title ?? "Painel"}
          </h1>
        </div>
        <h1 className="sm:hidden font-semibold text-foreground truncate">
          {title ?? "Painel"}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        
        {/* Mock Search (Visual improve) */}
        <div className="hidden md:flex items-center relative group">
           <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
           <input 
            type="text" 
            placeholder="Pesquisar..." 
            className="pl-9 pr-4 py-1.5 bg-muted/50 border-none rounded-full text-sm w-40 lg:w-64 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
           />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all active:scale-95"
          title={theme === "light" ? "Mudar para modo escuro" : "Mudar para modo claro"}
        >
          {theme === "light" ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all relative">
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
        </button>

        {/* User Menu */}
        <div className="relative ml-2" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((m) => !m)}
            className="flex items-center gap-2 rounded-full p-0.5 focus:outline-none hover:ring-4 hover:ring-accent transition-all"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <Avatar email={email} name={userName} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-2xl border border-border bg-popover py-2 shadow-xl ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in zoom-in duration-200">
              <div className="px-4 py-3 border-b border-border mb-1">
                <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{email}</p>
              </div>
              
              <div className="px-2 space-y-1">
                <button
                  onClick={() => { setMenuOpen(false); navigate("/perfil"); }}
                  className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-accent transition-colors"
                >
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  Meu Perfil
                </button>
                
                <div className="h-px bg-border my-1 mx-2" />
                
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  Sair da Conta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
