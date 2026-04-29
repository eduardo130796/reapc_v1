import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 🔥 NOVO

  useEffect(() => {
    async function syncUser() {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token) {
        try {
          // 🔥 BUSCAR DADOS FRESCOS DO SERVIDOR
          const { api } = await import("../services/api");
          const freshUser = await api.get("/auth/me");

          if (freshUser?.data?.id) {
            const userData = freshUser.data;

            if (userData?.id && userData?.role) {
              setUser(userData);
            }
            localStorage.setItem("user", JSON.stringify(userData));
          }
        } catch (err) {
          console.error("Erro ao sincronizar usuário:", err);
          if (storedUser) {
            const parsed = JSON.parse(storedUser);

            if (parsed?.id && parsed?.role) {
              setUser(parsed);
            } else {
              localStorage.removeItem("user");
            }
          }
        }
      } else if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      setLoading(false);
    }

    syncUser();
  }, []);

  async function login({ user, token, refresh_token }) {
    localStorage.setItem("token", token);
    localStorage.setItem("refresh_token", refresh_token);

    try {
      const { api } = await import("../services/api");
      const freshUser = await api.get("/auth/me");

      const userData = freshUser?.data;

      if (!userData?.id || !userData?.role) {
        throw new Error("Usuário inválido");
      }

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

    } catch (err) {
      console.error("Erro ao buscar usuário após login", err);
      throw err;
    }
  }

  function logout() {
    localStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}