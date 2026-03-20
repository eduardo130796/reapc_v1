import { api } from "./api"

export async function buscarContratosAPI(ug) {

const { data } = await api.get(`/contratos/api?ug=${ug}`)

return data

}

export async function criarContrato(payload) {

  console.log("Enviando contrato:", payload)

  const { data } = await api.post("/contratos", payload)

  return data

}

export async function excluirContrato(id) {

const { data } = await api.delete(`/contratos/${id}`)

return data

}

export async function listarContratos() {

const { data } = await api.get("/contratos")

return data

}

export async function buscarContrato(id) {

const { data } = await api.get(`/contratos/${id}`)

return data

}
