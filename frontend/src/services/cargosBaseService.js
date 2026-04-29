import { api } from "./api"

const cargosBaseService = {
  listar: async () => {
    return await api.get("/cargos-base/");
  },

  criar: async (nome) => {
    return await api.post("/cargos-base/", { nome });
  }
};

export default cargosBaseService;
