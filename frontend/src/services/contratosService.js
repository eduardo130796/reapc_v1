import { api } from "./api"

export async function buscarContratosAPI(ug) {
  const { data } = await api.get("/contratos/api/", {
    params: { ug }
  })
  return data.data // Extrai o array de dentro do wrapper {success, data}
}

export async function criarContrato(payload) {

  console.log("Enviando contrato:", payload)

  const { data } = await api.post("/contratos/", payload)

  return data

}

export async function excluirContrato(id) {

  const { data } = await api.delete(`/contratos/${id}/`)

  return data

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