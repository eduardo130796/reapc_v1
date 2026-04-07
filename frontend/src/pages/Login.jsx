import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "react-hot-toast"

// Modern SVG logo (you can swap for your own)
const Logo = () => (
  <svg width={48} height={48} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="24" fill="#2563EB" />
    <path d="M14 32l10-16 10 16" stroke="#e7eefc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function validateEmail(email) {
  // Simple modern email validation
  return /\S+@\S+\.\S+/.test(email);
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Digite um email válido.");
      return;
    }

    if (!password) {
      setError("Digite uma senha.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password
      });

      // 🔥 PRIMEIRO salva o token
      localStorage.setItem("token", res.access_token);

      // 🔥 AGORA o interceptor consegue enviar
      const me = await api.get("/auth/me");

      login({
        user: me,
        token: res.access_token,
        refresh_token: res.refresh_token
      });

      toast.success("Login realizado com sucesso");

      navigate("/dashboard");

    } catch (err) {

      console.error("ERRO LOGIN:", err);

      const message =
        typeof err === "string"
          ? err
          : "Falha ao realizar login.";

      toast.error(message);
      setError(message);

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#0b1220] from-60% to-blue-600">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[380px] bg-[rgba(15,27,51,0.95)] shadow-xl shadow-blue-700/20 rounded-2xl p-8 text-[#e7eefc] flex flex-col gap-6 relative border border-white/5"
      >
        <div className="flex flex-col items-center gap-2 mb-2.5">
          <Logo />
          <h1 className="text-[22px] font-bold tracking-tight m-0 text-[#e7eefc]">
            Bem-vindo de volta
          </h1>
          <span className="text-[#8ba5d2] text-[15px] font-normal">
            Acesse sua conta
          </span>
        </div>

        <div className="flex flex-col gap-3.5">
          <div>
            <label
              htmlFor="login-email"
              className="text-[13px] text-[#bcc6e2] font-medium mb-1.5 block"
            >
              E-mail
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              disabled={loading}
              className={`w-full py-3 px-3.5 rounded-lg border transition focus:outline-none text-[15px] bg-[#172341] text-[#e7eefc] border-[#253356] focus:border-blue-600 disabled:opacity-65 ${
                error && !validateEmail(email)
                  ? "border-red-500 ring-2 ring-red-400/60"
                  : "focus:ring-2 focus:ring-blue-400/40"
              }`}
            />
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="text-[13px] text-[#bcc6e2] font-medium mb-1.5 block"
            >
              Senha
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Sua senha"
              minLength={6}
              maxLength={64}
              disabled={loading}
              className="w-full py-3 px-3.5 rounded-lg border text-[15px] bg-[#172341] text-[#e7eefc] transition focus:outline-none border-[#253356] focus:border-blue-600 disabled:opacity-65 focus:ring-2 focus:ring-blue-400/40"
            />
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-0.5 py-2.5 px-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-[14px] font-medium tracking-tight transition"
          >
            <span className="flex items-center gap-1.5">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="10" fill="#ef4444" opacity="0.8" />
                <path d="M10 6v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="10" cy="14" r="1" fill="#fff" />
              </svg>
              {error}
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg border-none text-white font-bold text-[17px] tracking-wide mt-1 transition
            ${loading
              ? "bg-slate-700 cursor-not-allowed opacity-75"
              : "bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg shadow-blue-700/10 hover:from-blue-700 hover:to-blue-900 cursor-pointer"}
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                className="mr-2 animate-spin"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  stroke="#fff"
                  strokeWidth="3"
                  fill="none"
                  opacity=".2"
                />
                <path
                  d="M18 10a8 8 0 1 1-8-8"
                  stroke="#fff"
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
              Entrando...
            </span>
          ) : (
            "Entrar"
          )}
        </button>

        {result?.access_token && (
          <div className="mt-1.5 text-[13px] opacity-95 break-all text-green-200 text-center">
            <div className="mb-1 font-medium">Login realizado!</div>
            <div className="bg-[#172341] rounded-md px-2.5 py-1.5 break-all text-green-400 font-mono text-[13px] mx-auto inline-block shadow-md shadow-green-400/5">
              Token (primeiros 24 chars):<br />
              {String(result.access_token).slice(0, 24)}…
            </div>
          </div>
        )}
      </form>
      {/* Custom spinner animation for extra polish, apply via Tailwind's animate-spin */}
      <style>
        {`
          input:disabled, button:disabled {
            opacity: 0.65;
          }
        `}
      </style>
    </div>
  );
  }
