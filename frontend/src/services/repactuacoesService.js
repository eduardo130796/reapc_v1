import { api } from "./api";

export async function listarRepactuacoesCargo(cargoId) {
  const res = await api.get(`/repactuacoes/cargo/${cargoId}`);
  return res.data?.data ?? [];
}
