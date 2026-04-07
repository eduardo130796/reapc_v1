import { 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  CalendarDaysIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";

export default function ContratoResumo({ contrato }) {
  if (!contrato) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <Card
        title="Valor Anual"
        value={`R$ ${Number(contrato.valor_anual || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
        icon={<CurrencyDollarIcon className="w-6 h-6" />}
        highlight
      />
      <Card
        title="Fornecedor"
        value={contrato.fornecedor || "-"}
        icon={<UserGroupIcon className="w-6 h-6" />}
      />
      <Card
        title="Início Vigência"
        value={contrato.data_inicio ? new Date(contrato.data_inicio).toLocaleDateString("pt-BR") : "-"}
        icon={<CalendarDaysIcon className="w-6 h-6" />}
      />
      <Card
        title="Término Vigência"
        value={contrato.data_fim ? new Date(contrato.data_fim).toLocaleDateString("pt-BR") : "-"}
        icon={<CalendarIcon className="w-6 h-6" />}
      />
    </div>
  );
}

function Card({ title, value, icon, highlight = false }) {
  return (
    <div className={`
      relative overflow-hidden bg-card border-2 border-border rounded-[32px] p-6 shadow-xl transition-all group hover:border-primary/30
      ${highlight ? "ring-2 ring-primary/5" : ""}
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
            Global
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest pl-0.5">{title}</p>
        <p className={`text-lg font-black tracking-tight truncate ${highlight ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
          {value}
        </p>
      </div>
      
      {/* Subtle background decoration */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700 transform rotate-12">
        {icon && <div className="scale-[3] shadow-none" style={{ pointerEvents: 'none' }}>{icon}</div>}
      </div>
    </div>
  );
}