import { 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  CalendarDaysIcon,
  CalendarIcon,
  CalculatorIcon
} from "@heroicons/react/24/outline";

export default function ContratoResumo({ contrato, cargos = [] }) {
  if (!contrato) return null;

  // Calcula valor anual como soma dos cargos (qty * valor_unitario * 12 meses)
  const valorCalculado = cargos.reduce((acc, c) => {
    return acc + (Number(c.quantidade || 0) * Number(c.valor_unitario || 0));
  }, 0) * 12;

  // Usa o calculado se tiver cargos, senão fallback pro valor_anual do contrato
  const valorAnual = cargos.length > 0 ? valorCalculado : Number(contrato.valor_anual || contrato.valor_global || 0);

  const formatarData = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };

  const fornecedor = contrato.fornecedor_nome ?? contrato.fornecedor ?? "-";
  const dataInicio = contrato.vigencia_inicio ?? contrato.data_inicio;
  const dataFim = contrato.vigencia_fim ?? contrato.data_fim;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <Card
        title="Valor Anual (Cargos)"
        value={`R$ ${valorAnual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
        icon={<CurrencyDollarIcon className="w-6 h-6" />}
        highlight
        subtitle={cargos.length > 0 ? `${cargos.length} cargos × 12 meses` : "Sem cargos vinculados"}
      />
      <Card
        title="Fornecedor"
        value={fornecedor}
        icon={<UserGroupIcon className="w-6 h-6" />}
      />
      <Card
        title="Início Vigência"
        value={formatarData(dataInicio)}
        icon={<CalendarDaysIcon className="w-6 h-6" />}
      />
      <Card
        title="Término Vigência"
        value={formatarData(dataFim)}
        icon={<CalendarIcon className="w-6 h-6" />}
      />
    </div>
  );
}

function Card({ title, value, icon, highlight = false, subtitle }) {
  return (
    <div className={`
      relative overflow-hidden bg-card border-2 border-border rounded-[32px] p-6 shadow-xl transition-all group hover:border-primary/30
      ${highlight ? "ring-2 ring-emerald-500/10" : ""}
    `}>
      <div className="flex items-start justify-between mb-4">
        <div className={`
          p-3 rounded-2xl shadow-lg transition-transform group-hover:scale-110 duration-300
          ${highlight ? "bg-emerald-600 text-white shadow-emerald-500/20" : "bg-slate-900 dark:bg-primary text-white shadow-primary/20"}
        `}>
          {icon}
        </div>
        {highlight && (
          <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full dark:bg-emerald-500/20 dark:text-emerald-400">
            Calculado
          </span>
        )}
      </div>
      
      <div className="space-y-0.5">
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{title}</p>
        <p className={`text-lg font-black tracking-tight truncate ${highlight ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-[10px] text-slate-400 font-bold">{subtitle}</p>
        )}
      </div>

      {/* Subtle background decoration */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 transform rotate-12">
        {icon && <div className="scale-[3]" style={{ pointerEvents: "none" }}>{icon}</div>}
      </div>
    </div>
  );
}