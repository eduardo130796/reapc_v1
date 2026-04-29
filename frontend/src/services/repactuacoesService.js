import { api } from "./api";

export async function listarRepactuacoesCargo(cargoId) {
  return await api.get(`/repactuacoes/cargo/${cargoId}`);
}
