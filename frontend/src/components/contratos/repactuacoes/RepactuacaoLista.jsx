import { useEffect, useState } from "react";
import { listarRepactuacoes } from "../../../services/repactuacaoService";
import NovaRepactuacao from "./NovaRepactuacao";
import { PlusIcon, DocumentTextIcon, CalendarIcon } from "@heroicons/react/24/outline";

export default function RepactuacaoLista({ cargoId, basePcfp }) {
  
  const [versoes, setVersoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [criando, setCriando] = useState(false);

  async function carregarLista() {
    setLoading(true);
    try {
      const data = await listarRepactuacoes(cargoId);
      setVersoes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarLista();
  }, [cargoId]);

  if (criando) {
     return (
        <NovaRepactuacao 
           cargoId={cargoId} 
           basePcfp={basePcfp} 
           onCancel={() => setCriando(false)}
           onSuccess={() => {
              setCriando(false);
              carregarLista();
           }}
        />
     );
  }

  return (
    <div className="space-y-6">
       
       <div className="flex items-center justify-between">
          <p className="text-slate-500 text-sm">
             Aqui você encontra o histórico de repactuações que geraram novas versões de cálculo para este cargo.
          </p>
          <button 
             disabled={!basePcfp}
             onClick={() => setCriando(true)}
             className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
          >
             <PlusIcon className="w-4 h-4"/>
             Nova Repactuação
          </button>
       </div>

       {loading ? (
          <div className="py-12 text-center text-slate-400">Carregando histórico...</div>
       ) : versoes.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-xl py-16 flex flex-col items-center justify-center bg-slate-50">
             <DocumentTextIcon className="w-12 h-12 text-slate-300 mb-3" />
             <h4 className="text-slate-600 font-bold">Nenhuma Repactuação Encontrada</h4>
             <p className="text-slate-400 text-sm mt-1">Este cargo não possui versões de reajustes cadastradas.</p>
          </div>
       ) : (
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 border-b">
                   <tr>
                      <th className="px-6 py-4 font-bold">Versão</th>
                      <th className="px-6 py-4 font-bold">Tipo</th>
                      <th className="px-6 py-4 font-bold">Fato Gerador</th>
                      <th className="px-6 py-4 font-bold">Justificativa</th>
                      <th className="px-6 py-4 font-bold text-right" title="Novo Total Mensal Unitário">Total (R$)</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {versoes.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                         <td className="px-6 py-4">
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 flex items-center justify-center font-mono font-bold rounded-md w-max text-xs">
                               {(v.created_at || "").substring(0, 4)}.{v.id.substring(0,4).toUpperCase()}
                            </span>
                         </td>
                         <td className="px-6 py-4 font-medium text-slate-800">
                            {v.tipo_versao || v.tipo_evento || "Repactuação"}
                         </td>
                         <td className="px-6 py-4">
                            {v.vigencia_inicio ? (
                               <div className="flex items-center gap-1 text-slate-600">
                                  <CalendarIcon className="w-4 h-4 text-slate-400"/>
                                  {new Date(v.vigencia_inicio + "T00:00:00").toLocaleDateString('pt-BR')}
                               </div>
                            ) : "-"}
                         </td>
                         <td className="px-6 py-4 text-slate-500 max-w-sm truncate" title={v.justificativa}>
                            {v.justificativa || "-"}
                         </td>
                         <td className="px-6 py-4 text-right font-mono font-bold text-slate-700">
                             R$ {Number(v.total_unitario || 0).toFixed(2)}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       )}
    </div>
  );
}
