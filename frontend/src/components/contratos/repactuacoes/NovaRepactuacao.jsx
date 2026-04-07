import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { simularEstruturaPCFP } from "../../../services/pcfpService";
import { salvarNovaRepactuacao } from "../../../services/repactuacaoService";
import { extrairParametrosAgrupados } from "../../../services/parametrosService";
import { ChevronRightIcon, CheckCircleIcon, CurrencyDollarIcon, PresentationChartLineIcon, CalculatorIcon } from "@heroicons/react/24/outline";

export default function NovaRepactuacao({ cargoId, basePcfp, onSuccess, onCancel }) {
  
  const [passo, setPasso] = useState(1);
  const [tipo, setTipo] = useState(""); // "CCT" ou "IPCA"
  const [metadados, setMetadados] = useState({
    justificativa: "",
    data_referencia: "",
    vigencia_inicio: ""
  });
  
  const [valoresAntigos, setValoresAntigos] = useState({});
  const [valoresNovos, setValoresNovos] = useState({});
  const [resultadoLoading, setResultadoLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [loadingSave, setLoadingSave] = useState(false);

  // EXTRAIR GRUPOS DA ESTRUTURA BASE (para renderizar inputs)
  const gruposAll = useMemo(() => {
    if (!basePcfp?.estrutura) return [];
    return extrairParametrosAgrupados(basePcfp.estrutura);
  }, [basePcfp]);

  // SETAR VALORES INICIAIS BASEADO NA PCFP ATUAL
  useEffect(() => {
    if (basePcfp?.parametros) {
       setValoresAntigos(structuredClone(basePcfp.parametros));
       setValoresNovos(structuredClone(basePcfp.parametros)); // Novo inicia igual ao antigo
    }
  }, [basePcfp]);

  // FILTRAR POR TIPO
  const gruposFiltrados = useMemo(() => {
     if (!tipo) return [];
     
     // Lógica simples: se CCT, mostra Salários, Vales, Benefícios, Descontos, Encargos folha.
     // Se IPCA, mostra Insumos, Uniformes, Equipamentos, Limpeza (itens que costumam ser IPCA).
     // Para ser mais preciso, aqui usamos aproximação por nome de módulo ou variáveis.
     // Como o backend manda os "Módulos", podemos filtrar pelo index ou substring.
     
     return gruposAll.map(g => {
        let exibir = false;
        const nomeUpper = (g.nome || "").toUpperCase();
        
        if (tipo === "CCT") {
           // Módulos que contêm salários, benefícios gerais, remuneração
           if (nomeUpper.includes("SALÁRIO") || nomeUpper.includes("REMUNERAÇÃO") || 
               nomeUpper.includes("BENEFÍCIO") || nomeUpper.includes("VALE") ||
               nomeUpper.includes("CUSTO MENSAL") || nomeUpper.includes("ENCARGOS")) {
               exibir = true;
           }
        } 
        else if (tipo === "IPCA") {
           // Módulos de insumos diversos, depreciação, lucro/despesas indiretas (se precisar)
           if (nomeUpper.includes("INSUMO") || nomeUpper.includes("MATERIAL") ||
               nomeUpper.includes("UNIFORME") || nomeUpper.includes("DESPESAS") ||
               nomeUpper.includes("TRIBUTO")) {
               exibir = true;
           }
        }
        
        // Se a lógica acima for muito restritiva, podemos exibir tudo mas com labels diferenciados 
        // ou liberar sempre todos, mas priorizando a visualização.
        // Pela instrução "ocultar/filtrar as que não sâo da CCT ou IPCA":
        
        // Retorna o grupo original se exibir, ou grupo vazio para não renderizar na UI
        if(exibir) return g;
        
        // Fallback: se nenhum filtro cair perfeitamente, mostra (para evitar que o cara fique travado)
        // Isso é uma salvaguarda.
        return { ...g, oculto: !exibir };
     });
  }, [gruposAll, tipo]);

  // SIMULAÇÃO EM TEMPO REAL
  useEffect(() => {
     if (passo < 3) return; // Só simula na aba final

     const timer = setTimeout(async () => {
        try {
           setResultadoLoading(true);
           const res = await simularEstruturaPCFP({
              estrutura: basePcfp.estrutura,
              parametros: valoresNovos
           });
           setResultado(res);
        } catch (err) {
           console.error("Erro recálculo", err);
        } finally {
           setResultadoLoading(false);
        }
     }, 600);
     
     return () => clearTimeout(timer);
  }, [valoresNovos, passo, basePcfp]);


  const handleChangeNovo = (chave, strVal) => {
     const num = strVal === "" ? "" : Number(strVal);
     setValoresNovos(prev => ({ ...prev, [chave]: num }));
  };

  const handleSalvar = async () => {
     try {
        setLoadingSave(true);
        if (!resultado || !resultado.total_unitario) {
           toast.error("Motor de cálculo da PCFP não processou um total numérico.");
           return;
        }

        const payload = {
           cargo_id: cargoId,
           estrutura: basePcfp.estrutura,
           parametros: valoresNovos,
           resultados: resultado,
           total_unitario: resultado.total_unitario,
           tipo_versao: tipo === "CCT" ? "Repactuação por CCT" : "Repactuação de Insumos (IPCA)",
           tipo_evento: tipo,
           justificativa: metadados.justificativa,
           data_referencia: metadados.data_referencia,
           vigencia_inicio: metadados.vigencia_inicio,
        };

        await salvarNovaRepactuacao(payload);
        toast.success("Nova versão gerada com sucesso!");
        onSuccess?.();

     } catch (err) {
        toast.error("Falha ao salvar a nova versão.");
     } finally {
        setLoadingSave(false);
     }
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm text-slate-800">
       
       <div className="border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Nova Repactuação de Planilha</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">Fechar</button>
       </div>

       <div className="p-6">
          
          {/* PASSO 1 - TIPO E METADADOS */}
          {passo === 1 && (
             <div className="space-y-6">
                <div>
                   <label className="font-bold text-sm text-slate-700">1. Qual o tipo de reajuste a ser aplicado?</label>
                   <div className="grid grid-cols-2 gap-4 mt-3">
                      <div 
                         onClick={() => setTipo("CCT")}
                         className={`border-2 rounded-xl p-5 cursor-pointer flex items-center gap-4 transition-all ${tipo === "CCT" ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:border-indigo-300"}`}
                      >
                         <CurrencyDollarIcon className={`w-8 h-8 ${tipo === "CCT" ? "text-indigo-600" : "text-slate-400"}`} />
                         <div>
                            <span className={`block font-bold ${tipo === "CCT" ? "text-indigo-900" : "text-slate-700"}`}>Convenção Coletiva (CCT)</span>
                            <span className="text-xs text-slate-500">Ajuste de salários, auxílios e verbas trabalhistas de acordo com dissídio.</span>
                         </div>
                      </div>
                      <div 
                         onClick={() => setTipo("IPCA")}
                         className={`border-2 rounded-xl p-5 cursor-pointer flex items-center gap-4 transition-all ${tipo === "IPCA" ? "border-sky-600 bg-sky-50" : "border-slate-200 hover:border-sky-300"}`}
                      >
                         <PresentationChartLineIcon className={`w-8 h-8 ${tipo === "IPCA" ? "text-sky-600" : "text-slate-400"}`} />
                         <div>
                            <span className={`block font-bold ${tipo === "IPCA" ? "text-sky-900" : "text-slate-700"}`}>Insumos Diversos (IPCA)</span>
                            <span className="text-xs text-slate-500">Correção anual focada em materiais, uniformes, lucro e insumos usando inflação.</span>
                         </div>
                      </div>
                   </div>
                </div>

                {tipo && (
                   <div className="grid grid-cols-2 gap-4 mt-4 bg-slate-50 p-5 rounded-lg border border-slate-100">
                      <div className="col-span-2">
                         <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">Justificativa da Ação (Processo)</label>
                         <input 
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                            placeholder="Ex: Dissídio base maio/2026 Processo Administrativo nº..."
                            value={metadados.justificativa}
                            onChange={e => setMetadados(prev => ({...prev, justificativa: e.target.value}))}
                         />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">{tipo === "CCT" ? "Ref. CCT" : "Ref. Mês IPCA"}</label>
                         <input 
                            type="text"
                            placeholder="Ex: CCT 2026/2027"
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            value={metadados.data_referencia}
                            onChange={e => setMetadados(prev => ({...prev, data_referencia: e.target.value}))}
                         />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">Início do Fato Gerador (Vigência)</label>
                         <input 
                            type="date"
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            value={metadados.vigencia_inicio}
                            onChange={e => setMetadados(prev => ({...prev, vigencia_inicio: e.target.value}))}
                         />
                      </div>
                   </div>
                )}

                <div className="flex justify-end pt-4">
                   <button 
                      disabled={!tipo || !metadados.justificativa || !metadados.vigencia_inicio}
                      onClick={() => setPasso(2)}
                      className="px-6 py-2 bg-slate-900 text-white rounded-lg flex items-center gap-2 font-medium disabled:opacity-50 hover:bg-slate-800"
                   >
                      Ir para Alteração de Valores <ChevronRightIcon className="w-4 h-4"/>
                   </button>
                </div>
             </div>
          )}

          {/* PASSO 2 E 3 - FORMULÁRIO DE ENTRADAS + PREVIEW DO RECALCULO */}
          {passo === 2 && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LADO ESUQERDO: PREENCHIMENTO */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
                       Atualize os dados na coluna <strong>Novo Valor</strong>. Os demais campos permanecerão intocados. Você está simulando o reajuste por <strong>{tipo}</strong>.
                    </div>

                    <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                       {gruposFiltrados.map((g, idx) => {
                          if (g.oculto) return null; // Filtrado logicamente e omitido da view

                          return (
                             <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-slate-100 px-4 py-2 font-bold text-sm text-slate-700">
                                   {g.nome}
                                </div>
                                <div className="p-4 space-y-4">
                                   {(g.itens || []).map((item, iDx) => (
                                      <div key={iDx} className="grid grid-cols-12 gap-3 items-center border-b pb-3 last:border-0 last:pb-0">
                                         <div className="col-span-6">
                                            <span className="text-sm font-medium text-slate-800">{item.nome}</span>
                                            <span className="block text-xs text-slate-400 font-mono mt-0.5">{item.chave}</span>
                                         </div>
                                         <div className="col-span-3">
                                            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Atual</label>
                                            <span className="text-sm text-slate-500 bg-slate-50 px-2 py-1.5 rounded border border-slate-100 block opacity-70">
                                               {valoresAntigos[item.chave] ?? "-"}
                                            </span>
                                         </div>
                                         <div className="col-span-3">
                                            <label className="text-[10px] uppercase font-bold text-indigo-500 block mb-1">Novo</label>
                                            <input 
                                               type="number"
                                               className="w-full text-sm font-medium text-indigo-900 border border-indigo-200 bg-indigo-50 px-2 py-1.5 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                               value={valoresNovos[item.chave] ?? ""}
                                               onChange={e => handleChangeNovo(item.chave, e.target.value)}
                                            />
                                         </div>
                                      </div>
                                   ))}
                                </div>
                             </div>
                          );
                       })}
                    </div>
                </div>

                {/* LADO DIREITO: RESULTADO */}
                <div className="lg:col-span-1 border-l pl-6 space-y-6 flex flex-col justify-between">
                   <div>
                      <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><CalculatorIcon className="w-5 h-5"/> Recálculo</h4>
                      {resultadoLoading ? (
                         <div className="text-slate-400 text-sm animate-pulse">Recalculando...</div>
                      ) : (
                         <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                               <span className="text-xs font-bold text-slate-400 uppercase">Total Original (V1)</span>
                               <div className="text-xl font-mono text-slate-600 mt-1">
                                  R$ {Number(basePcfp.total_unitario || 0).toFixed(2)}
                               </div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                               <span className="text-xs font-bold text-green-600 uppercase">Novo Total Projetado</span>
                               <div className="text-2xl font-mono font-bold text-green-700 mt-1">
                                  R$ {resultado ? Number(resultado.total_unitario || 0).toFixed(2) : "-"}
                               </div>
                            </div>

                            {/* Mostrar um pequeno delta */}
                            {resultado && basePcfp.total_unitario > 0 && (
                               <div className={`text-sm font-bold ${resultado.total_unitario >= basePcfp.total_unitario ? 'text-green-600' : 'text-red-500'}`}>
                                  Variação: {(((resultado.total_unitario / basePcfp.total_unitario) - 1) * 100).toFixed(2)}%
                               </div>
                            )}
                         </div>
                      )}
                   </div>

                   <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
                      <button 
                         onClick={() => setPasso(1)}
                         className="w-full px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200"
                      >
                         Voltar Metadados
                      </button>
                      <button 
                         disabled={loadingSave || resultadoLoading || !resultado}
                         onClick={handleSalvar}
                         className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2"
                      >
                         {loadingSave ? "Salvando..." : <><CheckCircleIcon className="w-5 h-5"/> Aprovar e Salvar Versão</>}
                      </button>
                   </div>
                </div>

             </div>
          )}
          
       </div>
    </div>
  );
}
