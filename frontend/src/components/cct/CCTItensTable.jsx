import { PlusIcon } from "@heroicons/react/24/outline";

export default function CCTItensTable({ itens, onAdd }) {
  return (
    <div className="bg-card border-2 border-border rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/5">
      <div className="p-8 border-b border-border flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <h3 className="text-xl font-black text-foreground tracking-tight">Itens de Cálculo</h3>
          <p className="text-slate-500 font-bold text-xs tracking-tight mt-1">Defina as rubricas e regras matemáticas da convenção.</p>
        </div>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-black rounded-xl hover:brightness-110 shadow-lg shadow-primary/20 border-b-4 border-primary-dark active:translate-y-1 active:border-b-0 transition-all text-xs"
        >
          <PlusIcon className="w-4 h-4" />
          Adicionar Item
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              <th className="px-8 py-4 text-[10px] font-black text-primary uppercase tracking-widest border-b border-border">Ordem</th>
              <th className="px-8 py-4 text-[10px] font-black text-primary uppercase tracking-widest border-b border-border">Código / Nome</th>
              <th className="px-8 py-4 text-[10px] font-black text-primary uppercase tracking-widest border-b border-border">Tipo de Cálculo</th>
              <th className="px-8 py-4 text-[10px] font-black text-primary uppercase tracking-widest border-b border-border">Base de Cálculo</th>
              <th className="px-8 py-4 text-[10px] font-black text-primary uppercase tracking-widest border-b border-border text-center">Obrigatório</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {itens.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-12 text-center text-slate-400 font-bold italic">Nenhum item cadastrado.</td>
              </tr>
            ) : (
              itens.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-8 py-4 border-b border-border">
                    <span className="w-7 h-7 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-black text-slate-500 border border-border group-hover:bg-primary group-hover:text-white transition-all">
                      {item.ordem_calculo}
                    </span>
                  </td>
                  <td className="px-8 py-4 border-b border-border">
                    <p className="text-sm font-black text-foreground">{item.codigo_item}</p>
                  </td>
                  <td className="px-8 py-4 border-b border-border">
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 rounded-lg border border-border uppercase">
                      {item.tipo_calculo}
                    </span>
                  </td>
                  <td className="px-8 py-4 border-b border-border">
                    <p className="text-xs font-bold text-slate-500">{item.base_calculo || '-'}</p>
                  </td>
                  <td className="px-8 py-4 border-b border-border text-center">
                    <div className={`mx-auto h-2.5 w-2.5 rounded-full ${item.obrigatorio ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-slate-300 dark:bg-slate-700'}`} />
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
