import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import {
  buscarPCFP,
  aplicarModeloPCFP,
  calcularPCFP,
  salvarVersaoPCFP,
  salvarEstruturaPCFP
} from "../../services/pcfpService";
import {
  listarCCTsPorSindicato,
  listarValoresPorCargo
} from "../../services/cctService";
import EstruturaPCFP from "../contratos/EstruturaPCFP";
import SelecionarModeloModal from "../contratos/SelecionarModeloModal";
import RepactuacaoLista from "../contratos/repactuacoes/RepactuacaoLista";
import {
  CalculatorIcon,
  DocumentArrowUpIcon,
  TableCellsIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
  BanknotesIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function PCFPModal({ cargo, onClose, onSuccess }) {
  const [aba, setAba] = useState("estrutura");
  const [pcfp, setPcfp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculando, setCalculando] = useState(false);
  const [resultadoCalculo, setResultadoCalculo] = useState(null);
  const [showModelos, setShowModelos] = useState(false);
  const [salvandoVersao, setSalvandoVersao] = useState(false);

  // CCT
  const [ccts, setCcts] = useState([]);
  const [selectedCctId, setSelectedCctId] = useState("");
  const [cctValores, setCctValores] = useState([]);
  const [loadingCct, setLoadingCct] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [cargo.id]);

  async function carregarDados() {
    setLoading(true);
    try {
      const resPcfp = await buscarPCFP(cargo.id);
      setPcfp(resPcfp?.data || { estrutura: { modulos: [] } });

      if (cargo.sindicato_id) {
        const cctRes = await listarCCTsPorSindicato(cargo.sindicato_id);
        const lista = cctRes?.data?.data || [];
        setCcts(lista);

        if (lista.length > 0) {
          setSelectedCctId(lista[0].id);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar PCFP");
    } finally {
      setLoading(false);
    }
  }

  // Monitorar mudança de CCT para carregar valores informativos
  useEffect(() => {
    if (selectedCctId && cargo.cargo_base_id) {
      async function loadCctValues() {
        setLoadingCct(true);
        try {
          const res = await listarValoresPorCargo(selectedCctId, cargo.cargo_base_id);
          setCctValores(res?.data || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingCct(false);
        }
      }
      loadCctValues();
    }
  }, [selectedCctId, cargo.cargo_id]);

  const temEstrutura = !!(pcfp?.estrutura?.modulos?.length);

  async function handleAplicarModelo(modelo) {
    setLoading(true);
    try {
      await aplicarModeloPCFP(cargo.id, modelo.id);
      toast.success("Modelo aplicado!");
      setShowModelos(false);
      carregarDados();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Erro ao aplicar modelo");
    } finally {
      setLoading(false);
    }
  }

  async function handleCalcular() {
    if (!temEstrutura) return;
    if (!selectedCctId) return toast.error("Selecione uma CCT para base de cálculo");

    setCalculando(true);
    setResultadoCalculo(null);
    try {
      const resp = await calcularPCFP(cargo.id, pcfp.estrutura, {
        cct_id: selectedCctId
      });
      const data = resp?.data || resp;
      setResultadoCalculo(data);
      toast.success("Cálculo realizado!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Erro no cálculo");
    } finally {
      setCalculando(false);
    }
  }

  async function handleSalvarVersao() {
    if (!resultadoCalculo) return;
    setSalvandoVersao(true);
    try {
      const resultados = resultadoCalculo.resultados || {};
      const total = Object.values(resultados).at(-1) || 0;

      await salvarVersaoPCFP({
        cargo_id: cargo.id,
        estrutura: pcfp.estrutura,
        parametros: resultadoCalculo.parametros_utilizados || {},
        resultados: resultados,
        total_unitario: total,
        tipo_versao: "Base",
        tipo_evento: "CCT",
        justificativa: "Versão gerada via PCFPModal",
        vigencia_inicio: new Date().toISOString().split('T')[0]
      });

      toast.success("Versão base salva e valor do cargo atualizado!");
      onSuccess?.();
      setResultadoCalculo(null);
      setAba("repactuacoes");
    } catch (err) {
      toast.error("Erro ao salvar versão");
    } finally {
      setSalvandoVersao(false);
    }
  }

  // UI Components
  const Footer = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        {temEstrutura && (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-border">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CCT Ref:</span>
            <select
              value={selectedCctId}
              onChange={(e) => setSelectedCctId(e.target.value)}
              className="bg-transparent text-xs font-bold outline-none border-none text-foreground cursor-pointer"
            >
              {ccts.map(c => (
                <option key={c.id} value={c.id}>{c.categoria} {c.data_base ? new Date(c.data_base).getFullYear() : 'S/A'}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {temEstrutura && (
          <>
            <button
              onClick={handleCalcular}
              disabled={calculando}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:translate-y-1 transition-all disabled:opacity-50"
            >
              {calculando ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <CalculatorIcon className="w-5 h-5" />}
              Calcular com CCT
            </button>
            {resultadoCalculo && (
              <button
                onClick={handleSalvarVersao}
                disabled={salvandoVersao}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 active:translate-y-1 transition-all"
              >
                {salvandoVersao ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <CheckCircleIcon className="w-5 h-5" />}
                Efetivar Calculo
              </button>
            )}
          </>
        )}
        <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-foreground">Fechar</button>
      </div>
    </div>
  );

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={`Gestão PCFP: ${cargo.cargos_base?.nome || cargo.nome}`}
      maxWidth="max-w-[90vw]"
      footer={Footer}
    >
      <div className="flex flex-col h-full min-h-[60vh]">
        {!temEstrutura && !loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-[40px] border-4 border-dashed border-border group">
            <div className="p-8 bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl border-2 border-border mb-8 group-hover:scale-110 transition-transform">
              <TableCellsIcon className="w-20 h-20 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-2">Planilha não configurada</h3>
            <p className="text-slate-500 font-bold mb-8 max-w-sm text-center">Para este cargo, ainda não existe uma estrutura de PCFP ativa. Selecione um modelo para começar.</p>
            <button
              onClick={() => setShowModelos(true)}
              className="px-8 py-4 bg-primary text-white font-black rounded-3xl hover:brightness-110 shadow-2xl shadow-primary/30 flex items-center gap-3 transition-all active:scale-95"
            >
              <DocumentArrowUpIcon className="w-6 h-6" />
              Aplicar Modelo de Planilha
            </button>
          </div>
        ) : (
          <div className="flex gap-8 h-full">
            {/* LADO ESQUERDO: ESTRUTURA E TABS */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-6 border-b border-border mb-6 overflow-x-auto shrink-0">
                <TabButton active={aba === 'estrutura'} onClick={() => setAba('estrutura')} label="Estrutura de Cálculo" icon={<TableCellsIcon className="w-4 h-4" />} />
                <TabButton active={aba === 'repactuacoes'} onClick={() => setAba('repactuacoes')} label="Histórico / Repactuações" icon={<ClockIcon className="w-4 h-4" />} />
              </div>

              <div className="flex-1">
                {loading ? (
                  <div className="py-20 text-center"><ArrowPathIcon className="w-10 h-10 animate-spin mx-auto text-primary" /></div>
                ) : aba === 'estrutura' ? (
                  <div className="space-y-6">
                    {resultadoCalculo && (
                      <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-500/20 rounded-3xl animate-in zoom-in-95">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><CalculatorIcon className="w-8 h-8" /></div>
                          <div>
                            <h4 className="text-lg font-black text-emerald-800 dark:text-emerald-400">Novo Valor Projectado</h4>
                            <p className="text-[10px] uppercase font-bold text-emerald-600">Considerando CCT base {selectedCctId}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(resultadoCalculo.resultados || {}).slice(-4).map(([k, v]) => (
                            <div key={k} className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-emerald-500/20">
                              <span className="text-[10px] font-black text-emerald-700/60 uppercase">{k.replace(/_/g, ' ')}</span>
                              <p className="text-xl font-black font-mono text-emerald-900 dark:text-emerald-100 mt-1">
                                R$ {(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <EstruturaPCFP
                      structure={pcfp?.estrutura}
                      onSave={async (novaEstrutura) => {
                        await salvarEstruturaPCFP({ cargo_id: cargo.id, estrutura: novaEstrutura });
                        carregarDados();
                      }}
                    />
                  </div>
                ) : (
                  <RepactuacaoLista cargoId={cargo.id} basePcfp={pcfp} />
                )}
              </div>
            </div>

            {/* LADO DIREITO: CCT INFORMATIVA (BASE) */}
            <div className="w-80 shrink-0 space-y-6">
              <div className="bg-slate-50 dark:bg-slate-900/50 border-2 border-border rounded-[32px] p-6 sticky top-0">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpenIcon className="w-6 h-6 text-primary" />
                  <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Base CCT (Infoline)</h4>
                </div>

                {!selectedCctId ? (
                  <div className="text-center py-10">
                    <ExclamationTriangleIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Selecione uma CCT</p>
                  </div>
                ) : loadingCct ? (
                  <div className="py-10 text-center"><ArrowPathIcon className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                ) : cctValores.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Nenhum valor cadastrado na CCT para este cargo base.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cctValores.map(v => (
                      <div key={v.id} className="p-4 bg-white dark:bg-slate-800 border border-border rounded-2xl shadow-sm">
                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">{v.cct_itens?.descricao}</span>
                        <div className="flex items-center gap-2">
                          <BanknotesIcon className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-black text-foreground font-mono">
                            R$ {Number(v.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
                  <p className="text-[9px] font-bold text-primary uppercase leading-relaxed">
                    Estes valores são extraídos diretamente da CCT selecionada e servem como entrada informativa para a PCFP. Eles não podem ser editados aqui.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showModelos && (
        <SelecionarModeloModal
          onClose={() => setShowModelos(false)}
          onSelect={handleAplicarModelo}
        />
      )}
    </Modal>
  );
}

function TabButton({ active, onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-4 
        ${active ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-foreground hover:border-border'}`}
    >
      {icon}
      {label}
    </button>
  );
}
