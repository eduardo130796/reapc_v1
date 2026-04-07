export function mapContratoToAPI(form) {
  return {
    numero: form.numero?.trim(),

    objeto: form.objeto?.trim() || "",

    fornecedor: form.fornecedor_nome?.trim() || null,

    valor_anual: form.valor_global
      ? Number(form.valor_global)
      : null,

    data_inicio: form.vigencia_inicio || null,
    data_fim: form.vigencia_fim || null
  };
}