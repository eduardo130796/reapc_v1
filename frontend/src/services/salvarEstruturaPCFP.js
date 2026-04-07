export async function salvarEstruturaPCFP(payload) {
  return await api.post("/pcfp", payload);
}