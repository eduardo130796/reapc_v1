import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { buscarPCFP, aplicarModeloPCFP, calcularPCFP, salvarVersaoPCFP } from "../../services/pcfpService";
import { listarCCTsPorSindicato } from "../../services/cctService";
import { useAuth } from "../../contexts/AuthContext";

import EstruturaPCFP from "./EstruturaPCFP";
import RepactuacaoLista from "./repactuacoes/RepactuacaoLista";
import SelecionarModeloModal from "./SelecionarModeloModal";
import {
  CalculatorIcon,
  DocumentPlusIcon,
  CheckBadgeIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

export default function CargoDetalhe({ cargo }) {
  const { user } = useAuth();
  const role = user?.role || "tecnico";
  const isAdmin = role === "admin";
  const isGestor = role === "gestor";
  const isTecnico = role === "tecnico";

  const [aba, setAba] = useState(isTecnico ? "repactuacoes" : "estrutura");
  const [pcfp, setPcfp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculando, setCalculando] = useState(false);
  const [resultadoCalculo, setResultadoCalculo] = useState(null);
  const [showModelos, setShowModelos] = useState(false);
  const [salvandoVersao, setSalvandoVersao] = useState(false);

  const [ccts, setCcts] = useState([]);
  const [selectedCctId, setSelectedCctId] = useState("");
  const [loadingCcts, setLoadingCcts] = useState(false);

  async function carregarCcts() {
    if (!cargo.sindicato_id) return;
    setLoadingCcts(true);
    try {
      const res = await listarCCTsPorSindicato(cargo.sindicato_id);
      const lista = res?.data || [];
      setCcts(lista);
      if (lista.length > 0) setSelectedCctId(lista[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCcts(false);
    }
  }

  useEffect(() => {
    carregar();
    carregarCcts();
  }, [cargo.id, cargo.sindicato_id]);

  const temEstrutura = !!(pcfp?.estrutura?.modulos?.length);
  const calculado = !!pcfp?.bloqueado;

  async function handleCalcular() {
    if (!selectedCctId) return toast.error("Selecione uma CCT para calcular");
    setCalculando(true);
    setResultadoCalculo(null);
    try {
      const res = await calcularPCFP(cargo.id, pcfp.estrutura, {}, selectedCctId);
      const data = res?.data || res;
      setResultadoCalculo(data);
      toast.success("Cálculo realizado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Erro ao calcular");
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
        tipo_versao: "Manual",
        tipo_evento: "CCT",
        justificativa: "Versão gerada manualmente pelo sistema",
        vigencia_inicio: new Date().toISOString().split('T')[0]
      });
      toast.success("Versão salva com sucesso!");
      setAba("repactuacoes");
      setResultadoCalculo(null);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar versão");
    } finally {
      setSalvandoVersao(false);
    }
  }

  return (
    <div className="mt-6 bg-white dark:bg-card border rounded-xl p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{cargo.nome}</h3>
          <p className="text-sm text-slate-500">
            {!temEstrutura && "Não configurado"}
            {temEstrutura && !calculado && "Configurado (editável)"}
            {calculado && "Calculado e bloqueado"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {temEstrutura ? (
            <div className="flex items-center gap-3">
              {/* SELETOR DE CCT */}
              <div className="flex flex-col">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CCT para Cálculo</label>
                <select
                  value={selectedCctId}
                  onChange={e => setSelectedCctId(e.target.value)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-border rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">Selecione a CCT...</option>
                  {ccts.map(cct => (
                    <option key={cct.id} value={cct.id}>
                      {cct.categoria} ({cct.data_base ? new Date(cct.data_base).getFullYear() : 'S/A'})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleCalcular}
                disabled={calculando || !selectedCctId}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 h-fit self-end"
              >
                {calculando ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CalculatorIcon className="w-4 h-4" />}
                Calcular
              </button>

              <button
                onClick={() => setShowModelos(true)}
                className="px-4 py-2 border-2 border-border text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all h-fit self-end"
              >
                Trocar Modelo
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowModelos(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-lg shadow-lg shadow-primary/20"
            >
              <DocumentPlusIcon className="w-4 h-4" />
              Configurar Planilha PCFP
            </button>
          )}

          {calculado && (
            <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold">
              Bloqueado
            </span>
          )}
        </div>
      </div>

      {/* RESULTADO DO CÁLCULO */}
      {resultadoCalculo && (
        <div className="mb-6 p-5 bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-500/20 rounded-2xl animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-sm font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <CheckBadgeIcon className="w-5 h-5" />
                Simulação de Custo (CCT + Estrutura)
              </h4>
              <p className="text-[10px] font-bold text-emerald-600/70 mt-1">
                Cálculo gerado com base na CCT vinculada e estrutura atual.
              </p>
            </div>
            <button
              onClick={handleSalvarVersao}
              disabled={salvandoVersao}
              className="px-6 py-2 bg-emerald-600 text-white font-black text-xs rounded-xl shadow-lg border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 transition-all disabled:opacity-50"
            >
              {salvandoVersao ? "Salvando..." : "Salvar Versão"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(resultadoCalculo.resultados || {}).slice(0, 3).map(([key, val]) => (
              <ResultCard key={key} label={key.replace(/_/g, " ")} value={val} />
            ))}
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-6 border-b mb-6">
        {[
          !isTecnico && { key: "estrutura", label: "Estrutura" },
          { key: "repactuacoes", label: "Repactuações", disabled: !temEstrutura }
        ].filter(Boolean).map(tab => (
          <button
            key={tab.key}
            disabled={tab.disabled}
            onClick={() => setAba(tab.key)}
            className={`pb-2 text-sm font-medium transition-colors ${
              aba === tab.key
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            } ${tab.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      {loading && <div className="py-8 text-center text-slate-400 text-sm">Carregando...</div>}

      {!loading && aba === "estrutura" && !isTecnico && (
        <EstruturaPCFP
          structure={pcfp?.estrutura}
          onSave={async (novaEstrutura) => {
            const { salvarEstruturaPCFP } = await import("../../services/pcfpService");
            await salvarEstruturaPCFP({
              cargo_id: cargo?.id,
              estrutura: novaEstrutura
            });
            carregar();
          }}
          readOnly={isGestor && calculado}
        />
      )}

      {aba === "repactuacoes" && (
        <RepactuacaoLista
          cargoId={cargo.id}
          basePcfp={pcfp}
        />
      )}

      {showModelos && (
        <SelecionarModeloModal
          onClose={() => setShowModelos(false)}
          onSelect={async (modelo) => {
            setLoading(true);
            try {
              await aplicarModeloPCFP(cargo.id, modelo.id);
              toast.success("Modelo aplicado!");
              carregar();
            } catch {
              toast.error("Erro ao aplicar modelo");
            } finally {
              setLoading(false);
              setShowModelos(false);
            }
          }}
        />
      )}

    </div>
  );
}

function ResultCard({ label, value }) {
  return (
    <div className="bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-emerald-500/20 shadow-sm">
      <span className="text-[9px] font-black text-emerald-700/60 uppercase tracking-widest">{label}</span>
      <p className="text-base font-black text-emerald-900 dark:text-emerald-100 font-mono mt-1">
        R$ {(Number(value) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}