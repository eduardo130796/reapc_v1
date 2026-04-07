import { api } from "./api";

export async function listarRoles() {
  const res = await api.get("/roles");
  return res;
}

export async function criarRole(payload) {
  const res = await api.post("/roles", payload);
  return res.data;
}