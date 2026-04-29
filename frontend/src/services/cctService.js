import { api } from "./api";

export const listarCCTs = async () => {
    return await api.get("/ccts/");
};

export const buscarCCT = async (id) => {
    return await api.get(`/ccts/${id}`);
};

export const criarCCT = async (payload) => {
    return await api.post("/ccts/", payload);
};

export const listarItens = async (cctId) => {
    return await api.get(`/ccts/${cctId}/itens`);
};

export const adicionarItem = async (cctId, payload) => {
    return await api.post(`/ccts/${cctId}/itens`, payload);
};

export const listarValores = async (cctId) => {
    return await api.get(`/ccts/${cctId}/valores`);
};

export const adicionarValor = async (cctId, payload) => {
    return await api.post(`/ccts/${cctId}/valores`, payload);
};

export const listarCCTsPorSindicato = async (sindicatoId) => {
    return await api.get(`/ccts/por-sindicato/${sindicatoId}`);
};

export const listarValoresPorCargo = async (cctId, cargoBaseId) => {
    return await api.get(`/ccts/${cctId}/valores/${cargoBaseId}`);
};
