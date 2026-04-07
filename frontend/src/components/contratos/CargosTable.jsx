import { 
  UserCircleIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

export default function CargosTable({
  cargos,
  onSelectCargo,
  onCriarCargo,
  loading
}) {

  // =========================
  // EMPTY STATE
  // =========================
  if (!loading && (!cargos || cargos.length === 0)) {
    return (
      <div className="bg-card border-2 border-dashed border-border rounded-[40px] p-20 text-center group hover:border-primary/30 transition-all duration-500">
        <div className="relative mb-8 inline-block">
          <UserGroupIcon className="w-24 h-24 text-slate-200 dark:text-slate-800 group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-border">
              <ShoppingBagIcon className="w-10 h-10 text-primary animate-bounce-slow" />
            </div>
          </div>
        </div>
        <h3 className="text-xl font-black text-foreground mb-2">Sem cargos definidos</h3>
        <p className="text-slate-500 font-bold text-sm max-w-sm mx-auto mb-8">
          Este contrato ainda não possui cargos vinculados. Comece adicionando o primeiro cargo para iniciar os cálculos.
        </p>
        <button
          onClick={() => onCriarCargo?.()}
          className="px-8 py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-500/30 border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 transition-all text-sm inline-flex items-center gap-2"
        >
          <UserCircleIcon className="w-5 h-5" />
          Configurar Primeiro Cargo
        </button>
      </div>
    );
  }

  // =========================
  // TABLE / LIST DESIGN
  // =========================
  return (
    <div className="space-y-4">
      {/* Header Labels (Desktop only) */}
      <div className="hidden md:grid grid-cols-12 px-8 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-border text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
        <div className="col-span-5">Cargo / Identificação</div>
        <div className="col-span-2 text-center">Qtde</div>
        <div className="col-span-2 text-center">Vlr. Unitário</div>
        <div className="col-span-2 text-right">Total Mensal</div>
        <div className="col-span-1"></div>
      </div>

      <div className="space-y-3">
        {cargos.map((c) => {
          const total = (c.quantidade || 0) * (c.valor_unitario || 0);

          return (
            <div
              key={c.id}
              onClick={() => onSelectCargo?.(c)}
              className="group relative bg-card border-2 border-border rounded-3xl p-5 hover:border-primary/40 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.99] transform"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                
                {/* Info Principal */}
                <div className="col-span-12 md:col-span-5 flex items-center gap-4">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary rounded-2xl transition-colors shrink-0">
                    <UserCircleIcon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-black text-foreground truncate tracking-tight">{c.nome}</h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">ID: {c.id?.slice(0, 8)}</span>
                  </div>
                </div>

                {/* Quantidade */}
                <div className="col-span-4 md:col-span-2 text-left md:text-center">
                   <div className="md:hidden text-[9px] font-black text-slate-400 uppercase mb-1">Quantidade</div>
                   <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-black text-xs border border-border">
                     {c.quantidade} postos
                   </span>
                </div>

                {/* Valor Unitário */}
                <div className="col-span-4 md:col-span-2 text-left md:text-center">
                   <div className="md:hidden text-[9px] font-black text-slate-400 uppercase mb-1">Unitário</div>
                   <span className="text-sm font-bold text-foreground">
                    R$ {Number(c.valor_unitario || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                   </span>
                </div>

                {/* Total */}
                <div className="col-span-4 md:col-span-2 text-right">
                   <div className="md:hidden text-[9px] font-black text-slate-400 uppercase mb-1">Total</div>
                   <span className="text-base font-black text-primary tracking-tight">
                    R$ {Number(total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                   </span>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex col-span-1 justify-end">
                   <ChevronRightIcon className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}