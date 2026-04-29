import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    const res = response.data;

    // 🔥 LOGIN (não segue padrão de { data: ... })
    if (res.access_token) {
      return res;
    }

    // 🔥 PADRÃO NORMAL DO BACKEND
    if (res.success === false) {
      return Promise.reject(res.message || "Erro no servidor");
    }

    if (res.data !== undefined) {
      // Retornar o corpo completo para que o frontend use res.data
      return res;
    }

    return res;
  },
  async (error) => {
    const originalRequest = error.config;

    // 🔥 Se o erro for 401 e não for uma tentativa de refresh anterior
    // Excluimos a rota de login para não entrar em loop se as credenciais forem erradas
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes("/login")) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          // 🔥 Tenta atualizar o token usando uma instância limpa do axios para não entrar no interceptor de novo
          const res = await axios.post(`${import.meta.env.VITE_API_URL}/refresh?refresh_token=${refreshToken}`);
          
          const { access_token, refresh_token: newRefreshToken } = res.data;

          localStorage.setItem("token", access_token);
          localStorage.setItem("refresh_token", newRefreshToken);

          // 🔥 Refaz o request original com o novo token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // 🔥 Se o refresh falhar, limpa tudo e redireciona pro login
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject("Sessão expirada");
        }
      } else {
        // 🔥 Sem refresh token, limpa tudo e redireciona pro login
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject("Sessão expirada");
      }
    }

    return Promise.reject(
      error?.response?.data?.message || error?.message || "Erro inesperado"
    );
  }
);