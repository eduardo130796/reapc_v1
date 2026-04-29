import { useState } from "react";
import { PlusIcon, UserGroupIcon, CurrencyDollarIcon, TagIcon } from "@heroicons/react/24/outline";

export default function CCTValoresTable({ valores, itens, onAdd }) {
  const [busca, setBusca] = useState("");

  const valoresFiltrados = valores.filter(v => 
    (v.cargo?.nome || "Cargo Removido").toLowerCase().includes(busca.toLowerCase()) ||
    v.codigo_item.toLowerCase().includes(busca.toLowerCase())
  );

  const valoresAgrupados = valoresFiltrados.reduce((acc, v) => {
    const cargoNome = v.cargo?.nome || "Vínculo Quebrado";
    if (!acc[cargoNome]) acc[cargoNome] = [];
    acc[cargoNome].push(v);
    return acc;
  }, {});

  const formatarValor = (valor, codigo_item) => {
    const item = itens.find(i => i.codigo_item === codigo_item);
    const tipo = item?.tipo_calculo || "FIXO";

    switch (tipo) {
      case "PERCENTUAL": return `${valor}%`;
      case "MULTIPLICADOR": return `${valor}x`;
      case "DIARIO": return `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)}/dia`;
      default: return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    }
  };

  return (
    <div className="bg-card border-2 border-border rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/5">
      <div className="p-8 border-b border-border space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-foreground tracking-tight">Valores por Cargo</h3>
            <p className="text-slate-500 font-bold text-xs tracking-tight mt-1">Atribua valores específicos aos itens para cada função da convenção.</p>
          </div>
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 shadow-xl shadow-emerald-500/30 border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 transition-all text-sm"
          >
            <PlusIcon className="w-5 h-5" />
            Vincular Valor
          </button>
        </div>

        <div className="relative group max-w-md">
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Pesquisar por cargo ou item..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm font-bold text-sm"
          />
          <UserGroupIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              <th className="px-8 py-4 text-[10px] font-black text-primary uppercase tracking-widest border-b border-border">Cargo / Função</th>
              <th className="px-8 py-4 text-[10px] font-black text-primary uppercase tracking-widest border-b border-border">Item de Cálculo</th>
              <th className="px-8 py-4 text-[10px] font-black text-primary uppercase tracking-widest border-b border-border text-right">Valor Vinculado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Object.keys(valoresAgrupados).length === 0 ? (
              <tr>
                <td colSpan="3" className="px-8 py-16 text-center text-slate-400">
                  <CurrencyDollarIcon className="w-16 h-16 mx-auto mb-4 opacity-5" />
                  <p className="font-black text-lg opacity-30">Nenhum valor vinculado ainda.</p>
                </td>
              </tr>
            ) : (
              Object.keys(valoresAgrupados).map(cargo => (
                <tr key={cargo} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-5 border-b border-border align-top">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400">
                        <UserGroupIcon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-black text-foreground">{cargo}</span>
                    </div>
                  </td>
                  <td className="p-0 border-b border-border col-span-2" colSpan="2">
                     <table className="w-full text-left bg-transparent">
                        <tbody className="divide-y divide-border/50">
                           {valoresAgrupados[cargo].map(v => (
                             <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group/row">
                               <td className="px-8 py-3 w-1/2">
                                 <div className="flex items-center gap-3">
                                   <TagIcon className="w-4 h-4 text-slate-300" />
                                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-border">
                                     {v.codigo_item}
                                   </span>
                                 </div>
                               </td>
                               <td className="px-8 py-3 text-right">
                                 <span className="text-base font-black text-primary">
                                   {formatarValor(v.valor, v.codigo_item)}
                                 </span>
                               </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
