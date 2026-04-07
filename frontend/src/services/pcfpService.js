import { api } from "./api";

export async function buscarPCFP(cargoId) {
  try {
    const response = await api.get(`/pcfp/${cargoId}`);

    console.log("RESPOSTA API:", response.data);

    // 🔥 AQUI É O PONTO CRÍTICO
    return response || null;

  } catch (err) {
    console.error("Erro ao buscar PCFP:", err);
    return null;
  }
}


export async function calcularPCFP(cargoId, estrutura, parametros) {

  const payload = {
    cargo_id: cargoId,
    estrutura,
    parametros
  };

  const response = await api.post("/pcfp/calcular", payload);

  return response;
}

// =========================
// 🔥 NOVO: SALVAR ESTRUTURA
// =========================
export async function salvarEstruturaPCFP(payload) {

  const response = await api.post("/pcfp", payload);

  return response;
}

export async function simularEstruturaPCFP(payload) {
  const response = await api.post("/pcfp/simular-estrutura", payload);
  return response;
}