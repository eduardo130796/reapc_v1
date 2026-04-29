import { api } from "./api";

export const listarSindicatos = async () => {
    return await api.get("/sindicatos/");
};

export const criarSindicato = async (payload) => {
    return await api.post("/sindicatos/", payload);
};
