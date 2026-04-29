import { api } from "./api";

export async function buscarPCFP(cargoId) {
  try {
    return await api.get(`/pcfp/cargo/${cargoId}`);
  } catch (err) {
    console.error("Erro ao buscar PCFP:", err);
    return null;
  }
}

export async function aplicarModeloPCFP(cargoId, modeloId) {
  return await api.post("/pcfp/aplicar-modelo", {
    cargo_id: cargoId,
    modelo_id: modeloId
  });
}

export async function salvarVersaoPCFP(payload) {
  return await api.post("/pcfp/salvar-versao", payload);
}


export async function calcularPCFP(cargoId, estrutura, parametros, cctId = null) {
  const payload = {
    cargo_id: cargoId,
    estrutura,
    parametros,
    ...(cctId ? { cct_id: cctId } : {})
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
  return await api.post("/pcfp/simular-estrutura", payload);
}
