export default function ContratoResumo({ contrato }) {

  if (!contrato) {
    return null; // ou skeleton se quiser
  }

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">

      <Card
        title="Valor Anual"
        value={`R$ ${Number(contrato.valor_anual || 0).toLocaleString("pt-BR")}`}
      />

      <Card
        title="Fornecedor"
        value={contrato.fornecedor || "-"}
      />

      <Card
        title="Início"
        value={contrato.data_inicio || "-"}
      />

      <Card
        title="Fim"
        value={contrato.data_fim || "-"}
      />

    </div>
  );
}
// 👇 ADICIONA ISSO
function Card({ title, value }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}