import { api } from "./api"

// LISTAR
export async function listarCargos(contratoId) {
  const { data } = await api.get(`/cargos?contrato_id=${contratoId}`)
  return data
}

// CRIAR
export async function criarCargo(payload) {
  const { data } = await api.post("/cargos", payload)
  return data
}

// EXCLUIR
export async function excluirCargo(id) {
  const { data } = await api.delete(`/cargos/${id}`)
  return data
}

// IMPORTAR AUTOMÁTICO
export async function importarCargos(contratoId) {
  const { data } = await api.post(`/contratos/${contratoId}/importar-cargos`)
  return data
}