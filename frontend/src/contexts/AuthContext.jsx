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
          
          if (freshUser) {
            setUser(freshUser);
            localStorage.setItem("user", JSON.stringify(freshUser));
          }
        } catch (err) {
          console.error("Erro ao sincronizar usuário:", err);
          if (storedUser) setUser(JSON.parse(storedUser));
        }
      } else if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      setLoading(false);
    }
    
    syncUser();
  }, []);

  function login({ user, token, refresh_token }) {
    localStorage.setItem("token", token);
    localStorage.setItem("refresh_token", refresh_token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("user_email", user.email);

    setUser(user);
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