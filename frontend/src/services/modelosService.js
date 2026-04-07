import { api } from "./api";

export async function listarModelos() {
  const res = await api.get("/modelos");
  return res;
}
export async function criarModelo(payload) {
  const { data } = await api.post("/modelos", payload);
  return data;
}

export async function atualizarModelo(id, payload) {
  const { data } = await api.put(`/modelos/${id}`, payload);
  return data;
}

export async function excluirModelo(id) {
  await api.delete(`/modelos/${id}`);
}

export async function toggleModelo(id) {
  const { data } = await api.patch(`/modelos/${id}/toggle`);
  return data;
}

export const importarModelo = async (payload) => {
  const { data } = await api.post("/modelos", payload)
  return data
}