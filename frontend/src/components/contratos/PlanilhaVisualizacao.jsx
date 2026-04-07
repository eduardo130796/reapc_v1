export default function PlanilhaVisualizacao({ pcfp, resultado }) {

  const estrutura = pcfp?.estrutura;

  if (!estrutura) {
    return <div className="p-6 text-slate-500">Sem estrutura</div>;
  }

  // =========================
  // CORE
  // =========================

  function getValor(item) {
    if (!resultado) return null;

    const chave = item.id_tecnico;
    return resultado?.detalhado?.[chave] ?? null;
  }

  function getPercentual(item) {

    if (!resultado) return null;

    // 🔹 percentual parametrizado
    if (item.parametro) {
      return resultado?.detalhado?.[item.parametro] ?? null;
    }

    // 🔹 percentual fixo
    if (item.config?.percentual !== undefined) {
      return item.config.percentual;
    }

    // 🔹 percentual baseado em outro campo
    if (item.config?.percentual_base) {
      return resultado?.detalhado?.[item.config.percentual_base] ?? null;
    }

    return null;
  }

  // =========================
  // FORMATADORES
  // =========================

  function formatarMoeda(valor) {
    if (valor == null) return "—";

    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function formatarPercentual(valor) {
    if (valor == null) return "—";

    return (valor * 100).toFixed(2) + "%";
  }

  // =========================
  // RENDER
  // =========================

  return (

    <div className="space-y-8">

      {estrutura.modulos?.map((modulo, i) => (

        <div key={i} className="border rounded-xl overflow-hidden">

          {/* HEADER MÓDULO */}
          <div className="bg-slate-200 px-4 py-2 font-semibold text-sm uppercase tracking-wide">
            {modulo.nome}
          </div>

          <Tabela
            itens={modulo.itens}
            submodulos={modulo.submodulos}
            getValor={getValor}
            getPercentual={getPercentual}
            formatarMoeda={formatarMoeda}
            formatarPercentual={formatarPercentual}
          />

        </div>

      ))}

    </div>
  );
}

function Tabela({
  itens = [],
  submodulos = [],
  getValor,
  getPercentual,
  formatarMoeda,
  formatarPercentual
}) {

  return (

    <div className="w-full">

      {/* HEADER */}
      <div className="grid grid-cols-12 bg-slate-100 text-xs font-semibold text-slate-600 px-4 py-2">
        <div className="col-span-7">Descrição</div>
        <div className="col-span-2 text-right">%</div>
        <div className="col-span-3 text-right">Valor</div>
      </div>

      {/* ITENS DIRETOS */}
      {itens?.map((item, i) => (
        <LinhaTabela
          key={i}
          item={item}
          nivel={0}
          getValor={getValor}
          getPercentual={getPercentual}
          formatarMoeda={formatarMoeda}
          formatarPercentual={formatarPercentual}
        />
      ))}

      {/* SUBMÓDULOS */}
      {submodulos?.map((sub, j) => (

        <div key={j}>

          {/* HEADER SUB */}
          <div className="bg-slate-50 px-4 py-2 text-sm font-medium border-t">
            {sub.nome}
          </div>

          {sub.itens?.map((item, k) => (
            <LinhaTabela
              key={k}
              item={item}
              nivel={1}
              getValor={getValor}
              getPercentual={getPercentual}
              formatarMoeda={formatarMoeda}
              formatarPercentual={formatarPercentual}
            />
          ))}

        </div>

      ))}

    </div>
  );
}

function LinhaTabela({
  item,
  nivel,
  getValor,
  getPercentual,
  formatarMoeda,
  formatarPercentual
}) {

  // 🔥 IGNORA ITENS OCULTOS
  if (item.exibir === false) return null;

  const valor = getValor(item);
  const percentual = getPercentual(item);

  const isTotal = item.codigo === "TOTAL";

  return (
    <div
      className={`grid grid-cols-12 px-4 py-1 text-sm border-t 
        ${isTotal ? "bg-slate-50 font-semibold" : ""}
      `}
    >

      {/* DESCRIÇÃO */}
      <div
        className={`col-span-7 ${
          nivel === 1 ? "pl-4 text-slate-700" : "text-slate-800"
        }`}
      >
        {item.descricao || item.nome || "—"}
      </div>

      {/* % */}
      <div className="col-span-2 text-right text-slate-600">
        {percentual != null ? formatarPercentual(percentual) : "—"}
      </div>

      {/* VALOR */}
      <div className="col-span-3 text-right font-medium text-slate-900">
        {formatarMoeda(valor)}
      </div>

    </div>
  );
}