import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  simularEstruturaPCFP
} from "../../services/pcfpService";
import { 
  ChevronDownIcon, ChevronUpIcon, PlusIcon, TrashIcon, 
  CheckCircleIcon, CalculatorIcon, DocumentCheckIcon, 
  BookOpenIcon, XMarkIcon, BoltIcon, CodeBracketIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

// =========================
// GLOSSÁRIO
// =========================
const GLOSSARY = [
  { term: "Parâmetro", def: "Valor aberto para ser digitado pelo sistema (Moeda ou Porcentagem)." },
  { term: "Soma", def: "Soma os valores de todos os itens informados na Base." },
  { term: "Multiplicação", def: "Multiplica entre si todos os itens informados na Base (ex: Dias x Passagens x Valor)." },
  { term: "Subtração Limitada", def: "Subtrai o segundo item da base pelo primeiro. Nunca retorna valor negativo." },
  { term: "Percentual Parametrizado", def: "Aplica uma porcentagem externa (indicada pelo ID) sobre a Soma das bases." },
  { term: "Percentual Fixo", def: "Aplica uma porcentagem imutável cravada no card sobre a Soma das bases." },
  { term: "Percentual Truncado", def: "Aplica porcentagem e trunca ignorando dizimas (ex: 10.334 vira 10.33). Pode vir de param externo, item ou fixo." },
  { term: "Por Dentro", def: "Cálculo financeiro usado em tributos: Base / (1 - Percentual)." }
];

// =========================
// UTIL
// =========================
function gerarId(descricao) {
  return (descricao || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "");
}

function clone(obj) {
  return structuredClone(obj);
}

// =========================
// COMPONENTES AUXILIARES
// =========================
function BaseSelector({ item, allItens, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedCount = (item.config?.base || []).length;
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 border-2 border-border rounded-xl px-4 py-3 cursor-pointer text-sm hover:border-primary transition-all shadow-sm"
        onClick={() => setOpen(!open)}
      >
        <span className={selectedCount === 0 ? "text-slate-500 font-bold" : "text-slate-900 dark:text-slate-100 font-black"}>
          {selectedCount === 0 ? "Selecionar base..." : `${selectedCount} item(s) selecionados`}
        </span>
        <ChevronDownIcon className="w-5 h-5 text-slate-400" />
      </div>
      {open && (
         <div className="absolute top-full mt-2 left-0 w-72 bg-popover border-2 border-border rounded-2xl shadow-2xl z-20 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
            {allItens.length === 0 ? (
               <div className="p-4 text-sm text-slate-500 text-center font-bold">Nenhum item disponível</div>
            ) : (
               allItens.map(opt => (
                  <label key={opt.id_tecnico} className="flex items-start px-4 py-3 hover:bg-accent border-b border-border last:border-0 cursor-pointer text-sm transition-colors group">
                     <input 
                       type="checkbox" 
                       className="mt-0.5 mr-3 w-5 h-5 text-primary rounded border-border focus:ring-primary bg-background" 
                       checked={(item.config?.base || []).includes(opt.id_tecnico)}
                       onChange={(e) => {
                          let newBase = [...(item.config?.base || [])];
                          if (e.target.checked) newBase.push(opt.id_tecnico);
                          else newBase = newBase.filter(x => x !== opt.id_tecnico);
                          onChange(newBase);
                       }}
                     />
                     <div className="flex flex-col">
                        <span className="font-black text-foreground group-hover:text-primary transition-colors break-words">{opt.descricao || "Item Sem Nome"}</span>
                        <span className="text-[10px] text-muted-foreground font-mono uppercase mt-0.5">{opt.id_tecnico}</span>
                     </div>
                  </label>
              ))
            )}
         </div>
      )}
    </div>
  )
}

// =========================
// COMPONENTE PRINCIPAL
// =========================
export default function EstruturaPCFP({ 
  structure, 
  onSave, 
  onSimulate, 
  readOnly,
  title = "Estrutura de Cálculos (PCFP)",
  description = "Configure o modelo do motor visualmente."
}) {

  const [estrutura, setEstrutura] = useState({ modulos: [] });
  const [valores, setValores] = useState({});
  const [parametros, setParametros] = useState({});
  const [loading, setLoading] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (structure && structure.modulos) {
      setEstrutura(clone(structure));
      setJsonInput(JSON.stringify(structure, null, 2));
    } else {
      const basic = { modulos: [] };
      setEstrutura(basic);
      setJsonInput(JSON.stringify(basic, null, 2));
    }

    const temp = JSON.parse(localStorage.getItem("pcfp_parametros_temp") || "{}");
    setParametros(temp);
  }, [structure]);

  // Actions
  function updateItem(modIndex, subIndex, itemIndex, updater) {
    setEstrutura(prev => {
      const nova = clone(prev);
      let item;
      if (subIndex === null) {
        if (!nova.modulos[modIndex].itens) nova.modulos[modIndex].itens = [];
        item = nova.modulos[modIndex].itens[itemIndex];
      } else {
        if (!nova.modulos[modIndex].submodulos[subIndex].itens) nova.modulos[modIndex].submodulos[subIndex].itens = [];
        item = nova.modulos[modIndex].submodulos[subIndex].itens[itemIndex];
      }
      if (!item.config) item.config = {};
      updater(item);
      return nova;
    });
  }

  function moveItem(modIndex, subIndex, itemIndex, dir) {
    setEstrutura(prev => {
      const nova = clone(prev);
      const list = subIndex === null 
        ? nova.modulos[modIndex].itens 
        : nova.modulos[modIndex].submodulos[subIndex].itens;
        
      if (dir === -1 && itemIndex > 0) {
        [list[itemIndex], list[itemIndex - 1]] = [list[itemIndex - 1], list[itemIndex]];
      } else if (dir === 1 && itemIndex < list.length - 1) {
        [list[itemIndex], list[itemIndex + 1]] = [list[itemIndex + 1], list[itemIndex]];
      }
      return nova;
    });
  }

  function addItem(modIndex, subIndex) {
    setEstrutura(prev => {
      const nova = clone(prev);
      const list = subIndex === null 
        ? (nova.modulos[modIndex].itens = nova.modulos[modIndex].itens || [])
        : (nova.modulos[modIndex].submodulos[subIndex].itens = nova.modulos[modIndex].submodulos[subIndex].itens || []);
        
      list.push({
        id_tecnico: `novo_item_${Date.now()}`,
        descricao: "Novo Item",
        tipo: "parametro",
        config: {}
      });
      return nova;
    });
  }

  function removeItem(modIndex, subIndex, itemIndex) {
    setEstrutura(prev => {
      const nova = clone(prev);
      const list = subIndex === null 
        ? nova.modulos[modIndex].itens 
        : nova.modulos[modIndex].submodulos[subIndex].itens;
      list.splice(itemIndex, 1);
      return nova;
    });
  }

  function autogenerateParam(modIndex, subIndex, itemIndex) {
    updateItem(modIndex, subIndex, itemIndex, (i) => {
       i.parametro = `perc_${i.id_tecnico}`;
    });
  }

  function addNewModule() {
     setEstrutura(prev => {
        const nova = clone(prev);
        nova.modulos.push({
           nome: "Novo Módulo",
           itens: [],
           submodulos: []
        });
        return nova;
     });
     setActiveTab(estrutura?.modulos?.length || 0);
  }

  const itensFlat = useMemo(() => {
    if (!estrutura || !estrutura.modulos) return [];
    return estrutura.modulos.flatMap(m => [
      ...(m.itens || []),
      ...(m.submodulos || []).flatMap(s => s.itens || [])
    ]);
  }, [estrutura]);

  useEffect(() => {
    if (!estrutura || !estrutura.modulos) return;
    const timer = setTimeout(async () => {
      try {
        const res = onSimulate 
          ? await onSimulate({ estrutura, parametros })
          : await simularEstruturaPCFP({ estrutura, parametros });
        setValores(res);
      } catch { /* erro silenciado */ }
    }, 500);
    return () => clearTimeout(timer);
  }, [estrutura, parametros, onSimulate]);

  function renderItem(item, modIndex, subIndex, itemIndex) {
    const valorAtual = valores[item.id_tecnico];
    const temValor = valorAtual !== undefined && valorAtual !== null;
    const uniqueKey = `item-${modIndex}-${subIndex ?? 'root'}-${itemIndex}`;

    return (
      <div key={uniqueKey} className="relative bg-white dark:bg-card rounded-3xl border-2 border-slate-200 dark:border-border shadow-lg overflow-visible mb-6 hover:border-primary/50 hover:shadow-2xl transition-all duration-300 group ring-1 ring-transparent hover:ring-primary/10">
        {!readOnly && (
           <div className="absolute -top-4 right-6 flex gap-1.5 items-center bg-slate-50 dark:bg-slate-800 border-2 border-border rounded-2xl p-2 opacity-0 group-hover:opacity-100 transition-all z-10 shadow-xl translate-y-2 group-hover:translate-y-0">
             <button type="button" onClick={() => moveItem(modIndex, subIndex, itemIndex, -1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-500 hover:text-primary transition-colors"><ChevronUpIcon className="w-5 h-5"/></button>
             <button type="button" onClick={() => moveItem(modIndex, subIndex, itemIndex, 1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-500 hover:text-primary transition-colors"><ChevronDownIcon className="w-5 h-5"/></button>
             <div className="w-px h-5 bg-border mx-1"></div>
             <button type="button" onClick={() => removeItem(modIndex, subIndex, itemIndex)} className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-xl text-slate-500 transition-colors"><TrashIcon className="w-5 h-5"/></button>
           </div>
        )}
        <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-10 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1 md:col-span-2">
              <label className="text-[11px] font-bold text-primary/70 uppercase tracking-widest pl-1">Nome do Item</label>
                <input
                  disabled={readOnly}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border-2 border-border dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-slate-100 font-bold text-base placeholder:opacity-30 disabled:opacity-70 shadow-inner"
                  value={item.descricao || ""}
                  placeholder="Ex: Salário Base..."
                  onChange={(e) => updateItem(modIndex, subIndex, itemIndex, (i) => {
                    i.descricao = e.target.value;
                    i.id_tecnico = gerarId(e.target.value);
                  })}
                />
              <div className="text-[9px] text-muted-foreground font-mono font-black pl-3 opacity-90 uppercase">ID: {item.id_tecnico}</div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] pl-1">Tipo de Operação</label>
              <div className="relative">
                <select
                  className="w-full pl-4 pr-10 py-3 bg-slate-100 dark:bg-slate-900 border-2 border-border dark:border-slate-800 rounded-xl appearance-none focus:ring-2 focus:ring-primary/20 text-sm text-slate-900 dark:text-slate-100 font-black shadow-inner"
                  value={item.tipo || "parametro"}
                  onChange={(e) => updateItem(modIndex, subIndex, itemIndex, (i) => i.tipo = e.target.value)}
                >
                  <option value="parametro">Parâmetro Fixo</option>
                  <option value="soma">Soma de Bases</option>
                  <option value="multiplicacao">Multiplicação</option>
                  <option value="subtracao_limitada">Subtração Limitada</option>
                  <option value="percentual_parametrizado">Percentual Variável</option>
                  <option value="percentual_fixo">Percentual Fixo</option>
                  <option value="percentual_truncado">Percentual Truncado</option>
                  <option value="por_dentro_base">Cálculo por Dentro</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-background border-2 border-border rounded-md pointer-events-none shadow-sm">
                   <ChevronDownIcon className="w-3 h-3 text-slate-900 dark:text-slate-100" />
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              {item.tipo === "parametro" ? (
                <>
                  <label className="text-[10px] font-black text-primary border-b border-primary/20 pb-0.5 uppercase tracking-[0.2em] pl-1 inline-block">Simular (R$)</label>
                    <input
                      type="number"
                      disabled={readOnly}
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border-2 border-primary/40 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 font-mono text-sm font-black disabled:opacity-70 shadow-inner"
                      value={parametros[item.id_tecnico] ?? ""}
                      placeholder="0,00"
                      onChange={(e) => {
                        const v = e.target.value;
                        setParametros(prev => {
                          const n = { ...prev, [item.id_tecnico]: v === "" ? "" : Number(v) };
                          localStorage.setItem("pcfp_parametros_temp", JSON.stringify(n));
                          return n;
                        });
                      }}
                    />
                </>
              ) : item.tipo === "percentual_parametrizado" ? (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] pl-1 truncate block">ID Variável</label>
                    <div className="relative">
                      <input className="w-full pl-5 pr-12 py-4 bg-slate-100 dark:bg-slate-900 border-2 border-border rounded-2xl text-base text-slate-900 dark:text-slate-100 font-black shadow-inner" placeholder="perc_..." value={item.parametro || ""} onChange={(e) => updateItem(modIndex, subIndex, itemIndex, i => i.parametro = e.target.value)} />
                      <button className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:scale-125 transition-all p-1" onClick={() => autogenerateParam(modIndex, subIndex, itemIndex)}><BoltIcon className="w-5 h-5"/></button>
                    </div>
                  </div>
                  {item.parametro && (
                    <div className="w-28">
                      <label className="text-xs font-black text-primary truncate uppercase block pl-1">% Sim.</label>
                      <input type="number" className="w-full px-4 py-4 bg-slate-100 dark:bg-slate-900 border-2 border-primary/40 rounded-2xl text-base font-mono text-center text-slate-900 dark:text-slate-100 font-black shadow-inner" value={parametros[item.parametro] ?? ""} onChange={(e) => {
                        const v = e.target.value;
                        setParametros(prev => {
                          const n = { ...prev, [item.parametro]: v === "" ? "" : Number(v) };
                          localStorage.setItem("pcfp_parametros_temp", JSON.stringify(n));
                          return n;
                        });
                      }} />
                    </div>
                  )}
                </div>
              ) : item.tipo === "percentual_truncado" ? (
                <div className="flex flex-col gap-2">
                   <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Configuração de %</label>
                   <div className="flex gap-3">
                      <select className="w-32 bg-slate-100 dark:bg-slate-900 border-2 border-border rounded-2xl text-[10px] text-slate-900 dark:text-slate-100 font-black p-3 shadow-inner" value={item.parametro !== undefined ? "parametro" : item.config?.percentual_base !== undefined ? "base" : "fixo"} onChange={e => updateItem(modIndex, subIndex, itemIndex, i => {
                        delete i.parametro; delete i.config.percentual_base; delete i.config.percentual;
                        if(e.target.value === "parametro") i.parametro = "";
                        else if(e.target.value === "base") i.config.percentual_base = "";
                        else i.config.percentual = 0;
                      })}>
                        <option value="parametro">ID Externo</option>
                        <option value="base">ID Item</option>
                        <option value="fixo">Valor Fixo</option>
                      </select>
                      <div className="flex-1">
                        {item.parametro !== undefined ? (
                          <input className="w-full px-4 py-4 border-2 border-border bg-slate-100 dark:bg-slate-900 rounded-2xl text-base text-slate-900 dark:text-slate-100 font-black shadow-inner" placeholder="ID..." value={item.parametro || ""} onChange={e => updateItem(modIndex, subIndex, itemIndex, i => i.parametro = e.target.value)} />
                        ) : item.config?.percentual_base !== undefined ? (
                           <input className="w-full px-4 py-4 border-2 border-border bg-slate-100 dark:bg-slate-900 rounded-2xl text-base text-slate-900 dark:text-slate-100 font-black shadow-inner" placeholder="ID Item..." value={item.config?.percentual_base || ""} onChange={e => updateItem(modIndex, subIndex, itemIndex, i => i.config.percentual_base = e.target.value)} />
                        ) : (
                           <input type="number" className="w-full px-4 py-4 border-2 border-border bg-slate-100 dark:bg-slate-900 rounded-2xl text-base text-slate-900 dark:text-slate-100 font-mono font-black shadow-inner" placeholder="0,00" value={item.config?.percentual || ""} onChange={e => updateItem(modIndex, subIndex, itemIndex, i => i.config.percentual = Number(e.target.value))} />
                        )}
                      </div>
                   </div>
                </div>
              ) : (
                <div className="h-full flex items-center pt-8">
                  <span className="text-[11px] text-primary font-black uppercase tracking-[0.2em] bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">Processamento Automático</span>
                </div>
              )}
            </div>
            
            {item.tipo !== "parametro" && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Bases de Cálculo (O que compõe este item?)</label>
                <BaseSelector 
                  item={item} 
                  allItens={itensFlat.filter(i => i.id_tecnico !== item.id_tecnico)}
                  onChange={(newBase) => updateItem(modIndex, subIndex, itemIndex, i => i.config.base = newBase)}
                />
              </div>
            )}
          </div>
          
          <div className="md:col-span-2 h-full min-h-[80px] flex flex-col justify-center items-center bg-primary/5 dark:bg-primary/10 rounded-2xl p-4 border-2 border-primary/20 group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-all duration-300 shadow-inner group-hover:border-primary/40 group-hover:scale-[1.02] transform">
            <span className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" /> Live Result
            </span>
            <div className="text-center">
              <span className={`text-xl font-black font-mono tracking-tighter transition-all duration-500 ${temValor ? 'text-primary' : 'text-slate-400'}`}>
                {temValor ? `R$ ${Number(valorAtual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "0,00"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!estrutura || !estrutura.modulos) return (
     <div className="flex flex-col justify-center items-center h-64 gap-6">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary shadow-lg shadow-primary/20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <CalculatorIcon className="w-6 h-6 text-primary" />
          </div>
        </div>
        <p className="text-foreground text-sm font-black uppercase tracking-[0.4em] animate-pulse">Iniciando Motor de Cálculo...</p>
     </div>
  );

  return (
    <div className="w-full mx-auto space-y-10 pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-[32px] border-2 border-slate-200 dark:border-border shadow-xl ring-1 ring-white/5 bg-gradient-to-br from-card to-secondary/30">
        <div className="flex-1">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-900 dark:bg-primary text-white rounded-2xl shadow-xl shadow-primary/30">
                 <DocumentCheckIcon className="w-8 h-8" />
              </div>
              <div>
                 <h2 className="text-lg font-black text-foreground tracking-tight leading-none mb-1">{title}</h2>
                 <p className="text-[10px] text-foreground font-black opacity-80 tracking-tight">{description}</p>
              </div>
           </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
           <button 
             className="flex items-center gap-2 px-6 py-3 bg-sky-500/10 text-sky-600 font-black rounded-2xl border-2 border-sky-500/30 hover:bg-sky-500/20 transition-all shadow-md active:scale-95" 
             onClick={() => setShowGlossary(!showGlossary)}
           >
             <BookOpenIcon className="w-5 h-5" /> Glossário
           </button>
           <button 
             className={`flex items-center gap-2 px-6 py-3 font-black rounded-2xl transition-all shadow-md active:scale-95 border-2 ${
               isJsonMode ? 'bg-amber-500/10 text-amber-600 border-amber-600/30' : 'bg-secondary border-border text-foreground'
             }`} 
             onClick={() => setIsJsonMode(!isJsonMode)}
           >
             <CodeBracketIcon className="w-5 h-5" /> {isJsonMode ? 'Visual' : 'JSON'}
           </button>
           {!readOnly && (
              <button 
                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/30 border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 disabled:opacity-50" 
                disabled={loading} 
                onClick={async () => {
                  try {
                    setLoading(true);
                    const data = isJsonMode ? JSON.parse(jsonInput) : estrutura;
                    await onSave(data);
                    if(isJsonMode) setEstrutura(data);
                    toast.success("Salvo!");
                  } catch(e) {
                    toast.error(e instanceof SyntaxError ? "JSON Inválido" : "Erro ao Salvar");
                  } finally { setLoading(false); }
                }}
              >
                {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <CheckCircleIcon className="w-5 h-5" />}
                Salvar Tudo
              </button>
           )}
        </div>
      </div>

      {showGlossary && (
         <div className="bg-secondary border-2 border-border rounded-[48px] p-10 relative shadow-2xl animate-in zoom-in-95 duration-300 ring-4 ring-primary/5">
            <button onClick={() => setShowGlossary(false)} className="absolute top-8 right-8 p-3 hover:bg-background rounded-2xl transition-all border-2 border-border shadow-md active:scale-90"><XMarkIcon className="w-7 h-7 text-foreground" /></button>
            <h3 className="font-black mb-10 flex items-center gap-4 text-sky-600 text-2xl underline underline-offset-[12px] decoration-sky-600/20"><BookOpenIcon className="w-8 h-8" /> Glossário de Fórmulas e Regras</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
               {GLOSSARY.map((g, i) => (
                  <div key={i} className="flex gap-5 border-l-4 border-sky-500/40 pl-6 py-2 bg-sky-500/5 rounded-r-3xl transition-all hover:bg-sky-500/10 group">
                     <span className="font-black text-sky-700 text-sm uppercase whitespace-nowrap tracking-widest">{g.term}:</span>
                     <span className="text-base text-foreground font-black leading-relaxed opacity-80 group-hover:opacity-100">{g.def}</span>
                  </div>
               ))}
            </div>
         </div>
      )}

      {isJsonMode ? (
         <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-card border-2 border-border rounded-[48px] p-8 shadow-2xl overflow-hidden ring-1 ring-white/5">
               <textarea 
                 className="w-full h-[700px] bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm p-10 rounded-[32px] border-2 border-border outline-none focus:ring-8 focus:ring-primary/10 shadow-inner font-black custom-scrollbar leading-relaxed" 
                 value={jsonInput} 
                 onChange={e => setJsonInput(e.target.value)} 
                 spellCheck={false} 
               />
            </div>
         </div>
      ) : (
         <div className="space-y-16 animate-in fade-in duration-500">
            {/* TABS */}
            <div className="bg-card p-2 rounded-2xl border border-border flex gap-2 overflow-x-auto custom-scrollbar shadow-lg ring-1 ring-white/5 mb-4">
               {estrutura?.modulos?.map((m, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveTab(i)} 
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-1 text-center border-b-2
                      ${activeTab === i 
                        ? 'bg-slate-900 dark:bg-primary text-white border-primary shadow-xl' 
                        : 'text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground'
                      }`}
                  >
                     {m.nome || `Módulo ${i+1}`}
                  </button>
               ))}
               {!readOnly && (
                 <button 
                   onClick={addNewModule} 
                   className="px-5 py-2.5 rounded-xl text-xs font-bold text-primary border-2 border-dashed border-primary/30 hover:bg-primary hover:text-white transition-all"
                 >
                   + Novo Módulo
                 </button>
               )}
            </div>

            {/* SEÇÕES */}
            {estrutura?.modulos?.map((m, mi) => (
               mi === activeTab && (
                  <div key={mi} className="bg-card rounded-3xl border-2 border-border overflow-hidden shadow-2xl ring-1 ring-white/5 animate-in slide-in-from-bottom-12 duration-700">
                     <div className="bg-secondary/40 px-6 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-border">
                        <div className="flex-1 flex items-center gap-6 min-w-[280px]">
                           <div className="w-2 h-8 bg-primary rounded-full shadow-lg shadow-primary/40" />
                           <input 
                              className="font-black text-lg bg-transparent border-none focus:ring-0 outline-none w-full p-0 text-foreground placeholder:opacity-20 tracking-tight" 
                              value={m.nome || ""} 
                              onChange={e => setEstrutura(prev => {
                                const n = clone(prev); n.modulos[mi].nome = e.target.value; return n;
                              })} 
                              placeholder="Nome do Módulo Principal" 
                           />
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] bg-background border-2 border-border px-6 py-2 rounded-full font-black uppercase tracking-[0.2em] text-foreground shadow-md flex items-center gap-2">
                             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                             {m.itens?.length || 0} Itens
                           </span>
                        </div>
                     </div>
                     <div className="p-4 space-y-4 group/container">
                        {/* ITENS DIRETOS */}
                        <div className="space-y-6">
                           {m.itens?.map((item, ii) => renderItem(item, mi, null, ii))}
                        </div>
                        
                        {!readOnly && (
                           <button onClick={() => addItem(mi, null)} className="flex items-center gap-4 text-primary text-base font-black hover:scale-105 transition-all py-6 group/add pl-4 border-2 border-transparent hover:border-primary/20 rounded-3xl hover:bg-primary/5">
                              <PlusIcon className="w-10 h-10 p-2 bg-slate-900 dark:bg-primary text-white rounded-xl shadow-xl shadow-primary/40 transition-transform group-hover/add:rotate-90 ring-4 ring-primary/10" /> 
                              <span>Adicionar Item ao Módulo</span>
                           </button>
                        )}

                        {/* SUBSEÇÕES */}
                        <div className="space-y-8 mt-8 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border-2 border-dashed border-border/80 shadow-inner">
                           {m.submodulos?.map((sub, si) => (
                              <div key={si} className="pl-8 border-l-4 border-primary/50 relative group/sub">
                                 <div className="flex flex-wrap items-center gap-6 mb-8 -ml-[calc(2rem+4px)]">
                                    <div className="w-12 h-1 bg-primary/40 rounded-full" />
                                    <input 
                                      className="font-black text-lg bg-transparent border-none focus:ring-0 outline-none flex-1 p-0 text-foreground" 
                                      value={sub.nome || ""} 
                                      onChange={e => setEstrutura(prev => {
                                        const n = clone(prev); n.modulos[mi].submodulos[si].nome = e.target.value; return n;
                                      })} 
                                      placeholder="Título do Submódulo..." 
                                    />
                                    <button onClick={() => setEstrutura(prev => {
                                      const n = clone(prev); n.modulos[mi].submodulos.splice(si, 1); return n;
                                    })} className="p-2.5 text-destructive bg-white dark:bg-slate-800 border-2 border-destructive/20 hover:border-destructive rounded-xl transition-all opacity-0 group-hover/sub:opacity-100 shadow-xl active:scale-95"><TrashIcon className="w-6 h-6" /></button>
                                 </div>
                                 <div className="space-y-6">
                                    {sub.itens?.map((item, ii) => renderItem(item, mi, si, ii))}
                                    {!readOnly && (
                                       <button onClick={() => addItem(mi, si)} className="flex items-center gap-2 text-primary font-black text-sm hover:brightness-125 transition-all py-3 pl-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                                          <PlusIcon className="w-5 h-5 p-1 bg-slate-900 dark:bg-primary text-white rounded-lg" /> Item em "{sub.nome}"
                                       </button>
                                    )}
                                 </div>
                              </div>
                           ))}
                           
                           {!readOnly && (
                              <button onClick={() => setEstrutura(prev => {
                                const n = clone(prev); if(!n.modulos[mi].submodulos) n.modulos[mi].submodulos = [];
                                n.modulos[mi].submodulos.push({nome: "Novo Submódulo", itens:[]}); return n;
                              })} className="w-full py-6 border-2 border-dashed border-border rounded-3xl text-foreground/40 font-black hover:bg-white dark:hover:bg-slate-800 hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-5 text-lg group shadow-sm hover:shadow-lg">
                                 <PlusIcon className="w-12 h-12 p-3 bg-slate-50 dark:bg-slate-800 border-2 border-primary/20 text-primary shadow-xl rounded-2xl group-hover:rotate-12 transition-all shadow-primary/5" /> Novo Submódulo
                              </button>
                           )}
                        </div>
                     </div>
                  </div>
               )
            ))}
         </div>
      )}
    </div>
  );
}
