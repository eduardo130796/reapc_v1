import { 
  IdentificationIcon, 
  MapPinIcon, 
  TagIcon, 
  CalendarIcon,
  DocumentTextIcon,
  KeyIcon
} from "@heroicons/react/24/outline";

export default function CCTHeader({ cct }) {
  if (!cct) return null;

  const getStatusColor = (status) => {
    switch(status) {
      case 'VIGENTE': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'VENCIDA': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      case 'PENDENTE': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  const formatData = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-card border-2 border-border rounded-3xl shadow-2xl p-6 ring-1 ring-white/5 relative overflow-hidden shrink-0">
      <div className="flex flex-col lg:flex-row lg:items-center gap-8">
        <div className="p-5 bg-slate-900 dark:bg-primary text-white rounded-2xl shadow-2xl shadow-primary/20 rotate-1 transform transition-all hover:rotate-0">
          <DocumentTextIcon className="w-12 h-12" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Sindicato Jurídico</span>
            <div className="flex items-center gap-2">
              <IdentificationIcon className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-black text-foreground truncate">{cct.sindicato?.nome || cct.sindicato_cnpj}</p>
            </div>
            <p className="text-[10px] text-slate-400 font-bold ml-6">{cct.sindicato_cnpj}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Registro / Categoria</span>
            <div className="flex items-center gap-2">
              <KeyIcon className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-black text-foreground truncate">{cct.numero_registro || 'Não informado'}</p>
            </div>
            <p className="text-[10px] text-slate-400 font-bold ml-6 truncate">{cct.categoria}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Período de Vigência</span>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-black text-foreground">
                {formatData(cct.data_inicio)} <span className="text-slate-300 mx-1">→</span> {formatData(cct.data_fim)}
              </p>
            </div>
            <p className="text-[10px] text-slate-400 font-bold ml-6">DATA BASE: {formatData(cct.data_base)}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Status / Região</span>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border ${getStatusColor(cct.status)}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${cct.status === 'VIGENTE' ? 'bg-emerald-500 animate-pulse' : 'bg-current'}`} />
                <span className="text-[10px] font-black uppercase">{cct.status || 'PENDENTE'}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg border border-border">
                <MapPinIcon className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase text-foreground">{cct.uf}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
