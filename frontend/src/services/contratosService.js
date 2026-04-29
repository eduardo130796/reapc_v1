import { api } from "./api"

export async function buscarContratosAPI(ug) {
  return await api.get("/contratos/api/", {
    params: { ug }
  });
}

export async function criarContrato(payload) {
  return await api.post("/contratos/", payload);
}

export async function excluirContrato(id) {
  return await api.delete(`/contratos/${id}/`);
}

export async function listarContratos() {
  const res = await api.get("/contratos/");
  return res;
}

export async function buscarContrato(id) {
  const res = await api.get(`/contratos/${id}/`);
  return res;
}
export async function atualizarContrato(id, payload) {
  const res = await api.put(`/contratos/${id}/`, payload);
  return res;
}