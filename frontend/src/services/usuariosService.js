import { api } from "./api";

export async function listarUsuarios() {
  const res = await api.get("/usuarios");
  return res;
}

export async function atribuirRole(userId, roleId) {
  return await api.put(`/usuarios/${userId}/role`, {
    role_id: roleId
  });
}

export async function criarUsuario(payload) {
  const res = await api.post("/usuarios", payload);
  return res;
}

export async function updateProfile(payload) {
  return await api.put("/auth/me", payload);
}