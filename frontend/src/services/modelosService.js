import { api } from "./api";

export async function listarModelos() {
  const res = await api.get("/modelos/");
  return res;
}
export async function criarModelo(payload) {
  return await api.post("/modelos/", payload);
}

export async function atualizarModelo(id, payload) {
  return await api.put(`/modelos/${id}/`, payload);
}

export async function excluirModelo(id) {
  await api.delete(`/modelos/${id}/`);
}

export async function toggleModelo(id) {
  return await api.patch(`/modelos/${id}/toggle/`);
}

export const importarModelo = async (payload) => {
  const { data } = await api.post("/modelos/", payload)
  return data
}