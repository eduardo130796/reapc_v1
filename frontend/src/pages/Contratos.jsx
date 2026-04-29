import { useEffect, useState, useCallback, useMemo } from "react";
import MainLayout from "../layouts/MainLayout";
import BuscarContratoAPI from "../components/contratos/BuscarContratoAPI";
import EditarContratoModal from "../components/contratos/EditarContratoModal";
import CriarContratoManualModal from "../components/contratos/CriarContratoManualModal";
import { useNavigate } from "react-router-dom";
import {
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";
import {
  listarContratos,
  excluirContrato
} from "../services/contratosService";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";

export default function Contratos() {

  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBuscar, setShowBuscar] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [contratoEditar, setContratoEditar] = useState(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.permissions?.includes("*");

  const navigate = useNavigate();

  const formatarData = (d) => {
    if (!d) return "--/--/----";
    return new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };

  // =========================
  // LOAD
  // =========================

  const carregarContratos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listarContratos();
      setContratos(res?.data || []);
    } catch (err) {
      console.error("Erro ao carregar contratos", err);
      toast.error("Erro ao carregar contratos");
      setContratos([]); // 🔥 segurança
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarContratos();
  }, [carregarContratos]);

  function handleRefresh() {
    setRefreshing(true);
    carregarContratos();
  }

  async function handleExcluir(id, e) {
    if (e) e.stopPropagation();
    if (!confirm("Deseja realmente excluir este contrato?")) return;
    try {
      await excluirContrato(id);
      toast.success("Contrato removido");
      carregarContratos();
    } catch (err) {
      console.error("Erro ao excluir contrato", err);
      toast.error("Erro ao excluir contrato");
    }
  }

  // =========================
  // FILTRO & STATS
  // =========================

  const stats = useMemo(() => {
    const lista = Array.isArray(contratos) ? contratos : [];

    return {
      total: lista.length,
      emRepactuacao: lista.filter(c => c.status === "Em Repactuação").length,
      concluidos: lista.filter(c => c.status === "Concluído").length,
      pendentes: lista.filter(c => c.status === "Pendente").length,
    };
  }, [contratos]);

  const contratosFiltrados = useMemo(() => {
    let list = Array.isArray(contratos) ? [...contratos] : [];
    const termo = busca.toLowerCase();

    if (termo) {
      list = list.filter(c =>
        (c.numero || "").toLowerCase().includes(termo) ||
        (c.fornecedor_nome || "").toLowerCase().includes(termo)
      );
    }

    if (filtroStatus !== "Todos") {
      list = list.filter(c => c.status === filtroStatus);
    }

    return list;
  }, [contratos, busca, filtroStatus]);

  // =========================
  // UI
  // =========================

  return (
    <MainLayout title="Gestão de Contratos">

      {/* DASHBOARD SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total contratos" value={stats.total} color="bg-slate-900" />
        <StatCard label="Em Repactuação" value={stats.emRepactuacao} color="bg-amber-500" />
        <StatCard label="Concluídos" value={stats.concluidos} color="bg-emerald-600" />
        <StatCard label="Pendentes" value={stats.pendentes} color="bg-rose-500" />
      </div>

      {/* CONTROLES */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">

        <div className="flex-1 space-y-4">
          {/* BUSCA */}
          <div className="relative group max-w-md">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              placeholder="Buscar contrato ou fornecedor..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-border rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm font-bold text-sm"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {/* FILTROS RAPIDOS */}
          <div className="flex flex-wrap gap-2">
            {["Todos", "Vigente", "Em Repactuação", "Concluído", "Pendente"].map(s => (
              <button
                key={s}
                onClick={() => setFiltroStatus(s)}
                className={`
                  px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                  ${filtroStatus === s
                    ? "bg-primary text-white shadow-lg shadow-primary/20 ring-2 ring-primary/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"}
                `}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className={`p-2.5 bg-slate-100 dark:bg-slate-800 border-2 border-border dark:border-slate-700 rounded-xl text-foreground hover:border-primary transition-all shadow-md ${refreshing ? "animate-spin" : "active:rotate-180 duration-500"}`}
            title="Recarregar"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>

          {isAdmin && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowManual(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 shadow-xl shadow-emerald-500/30 border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 transition-all text-xs"
              >
                <PlusIcon className="w-4 h-4" />
                Novo Contrato
              </button>

              <button
                onClick={() => setShowBuscar(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-primary text-white font-black rounded-xl hover:brightness-110 shadow-xl shadow-primary/20 border-b-4 border-slate-700 dark:border-primary-dark active:translate-y-1 active:border-b-0 transition-all text-xs"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Importar Gov
              </button>
            </div>
          )}
        </div>
      </div>

      {/* LISTAGEM */}
      <div className="space-y-4">
        {loading && !refreshing ? (
          <div className="p-20 text-center text-slate-400 font-black animate-pulse flex flex-col items-center gap-4">
            <ArrowPathIcon className="w-12 h-12 animate-spin text-primary" />
            Aguardando base de dados...
          </div>
        ) : contratosFiltrados.length === 0 ? (
          <div className="p-24 text-center border-4 border-dashed border-border rounded-[48px] opacity-30">
            <DocumentTextIcon className="w-24 h-24 mx-auto mb-6" />
            <p className="font-black text-xl">Nenhum contrato encontrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header Labels */}
            <div className="hidden md:grid grid-cols-12 px-8 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-border text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
              <div className="col-span-5">Identificação / Fornecedor</div>
              <div className="col-span-3 text-center">Vigência</div>
              <div className="col-span-2 text-right">Valor Global</div>
              <div className="col-span-2"></div>
            </div>

            {contratosFiltrados.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/contratos/${c.id}`)}
                className="group relative bg-card border-2 border-border rounded-[32px] p-6 hover:border-primary/40 transition-all duration-300 cursor-pointer shadow-xl shadow-black/5 hover:shadow-primary/5 active:scale-[0.99] transform"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6">

                  {/* INFO PRINCIPAL */}
                  <div className="col-span-12 md:col-span-5 flex items-center gap-5">
                    <div className="p-4 bg-slate-900 dark:bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 transition-transform group-hover:scale-105 duration-300">
                      <BriefcaseIcon className="w-7 h-7" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-base font-black text-foreground truncate tracking-tight uppercase">{c.numero || "S/N"}</h4>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-[11px] text-slate-500 font-bold truncate flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
                        {c.fornecedor_nome || "Fornecedor não informado"}
                      </p>
                    </div>
                  </div>

                  {/* VIGÊNCIA */}
                  <div className="col-span-6 md:col-span-3 text-left md:text-center">
                    <div className="md:hidden text-[9px] font-black text-slate-400 uppercase mb-1">Vigência</div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs border border-border">
                      {formatarData(c.vigencia_inicio)} <span className="opacity-30">→</span> {formatarData(c.vigencia_fim)}
                    </div>
                  </div>

                  {/* VALOR */}
                  <div className="col-span-6 md:col-span-2 text-right">
                    <div className="md:hidden text-[9px] font-black text-slate-400 uppercase mb-1">Valor Global</div>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                      R$ {Number(c.valor_global || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* AÇÕES */}
                  <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2 border-t md:border-0 pt-4 md:pt-0 border-border">
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setContratoEditar(c); }}
                          className="p-2.5 text-slate-400 hover:text-primary rounded-xl hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
                          title="Editar"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => handleExcluir(c.id, e)}
                          className="p-2.5 text-slate-400 hover:text-destructive rounded-xl hover:bg-destructive/10 transition-all border border-transparent hover:border-destructive/20"
                          title="Excluir"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    <ChevronRightIcon className="hidden md:block w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAIS */}
      {showManual && (
        <CriarContratoManualModal
          onClose={() => setShowManual(false)}
          onSuccess={carregarContratos}
        />
      )}
      {showBuscar && (
        <BuscarContratoAPI
          onClose={() => setShowBuscar(false)}
          onImport={carregarContratos}
        />
      )}
      {contratoEditar && (
        <EditarContratoModal
          contrato={contratoEditar}
          onClose={() => setContratoEditar(null)}
          onSuccess={carregarContratos}
        />
      )}
    </MainLayout>
  );
}

// ===============================
// COMPONENTES LOCAIS
// ===============================

function StatCard({ label, value, color }) {
  return (
    <div className="bg-card border-2 border-border rounded-3xl p-5 shadow-xl shadow-black/5">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-8 ${color} rounded-full flex-shrink-0`} />
        <div>
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-black text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const configs = {
    "Vigente": "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    "Em Repactuação": "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
    "Concluído": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
    "Pendente": "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20",
  };
  const style = configs[status] || configs["Vigente"];
  return (
    <span className={`flex-shrink-0 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${style}`}>
      {status || "Vigente"}
    </span>
  );
}
