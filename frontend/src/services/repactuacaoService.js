import { api } from "./api";

export async function listarRepactuacoes(cargoId) {
  try {
    const response = await api.get(`/repactuacoes/cargo/${cargoId}`);
    return response || [];
  } catch (err) {
    console.error("Erro ao listar repactuacoes:", err);
    return [];
  }
}

export async function salvarNovaRepactuacao(payload) {
  const response = await api.post("/repactuacoes", payload);
  return response;
}
