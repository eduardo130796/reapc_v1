import { api } from "./api"

// LISTAR
export async function listarCargos(contratoId) {
  const res = await api.get(`/cargos/?contrato_id=${contratoId}`);
  return res;
}

// CRIAR
export async function criarCargo(payload) {
  const res = await api.post("/cargos/", payload);
  return res;
}

// EXCLUIR
export async function excluirCargo(id) {
  return await api.delete(`/cargos/${id}/`);
}

// IMPORTAR AUTOMÁTICO
export async function importarCargos(contratoId) {
  return await api.post(`/contratos/${contratoId}/importar-cargos/`);
}

export async function aplicarModelo(cargoId, modeloId) {
  return await api.post(`/cargos/${cargoId}/aplicar-modelo/`, {
    modelo_id: modeloId
  });
}

export async function salvarPlanilha(cargoId, payload) {
  return await api.put(`/cargos/${cargoId}/planilha/`, payload);
}