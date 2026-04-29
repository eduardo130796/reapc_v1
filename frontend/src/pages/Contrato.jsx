import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import CriarCargoModal from "../components/contratos/CriarCargoModal";
import ContratoResumo from "../components/contratos/ContratoResumo";
import CargosTable from "../components/contratos/CargosTable";
import { buscarContrato } from "../services/contratosService"
import { listarCargos } from "../services/cargosService";
import { useAuth } from "../contexts/AuthContext";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  PlusIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function Contrato() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.permissions?.includes("*");

  const [contrato, setContrato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCriarCargo, setShowCriarCargo] = useState(false);
  const [cargos, setCargos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const listaCargos = Array.isArray(cargos) ? cargos : [];

  // =========================
  // CARREGAR DADOS
  // =========================
  const fetchData = async (showRefresh = false) => {
    if (!id) return;
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [contratoRes, cargosRes] = await Promise.all([
        buscarContrato(id),
        listarCargos(id)
      ]);

      setContrato(contratoRes?.data || null);
      setCargos(cargosRes?.data || []);

    } catch (e) {
      console.error("Erro ao carregar dados:", e);
      toast.error("Erro ao carregar dados do contrato");
      setContrato(null);
      setCargos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // =========================
  // UI RENDER
  // =========================
  if (loading) {
    return (
      <MainLayout title="Detalhes do Contrato">
        <div className="p-20 text-center text-slate-400 font-black animate-pulse flex flex-col items-center gap-4">
          <ArrowPathIcon className="w-12 h-12 animate-spin text-primary" />
          Lendo informações do contrato...
        </div>
      </MainLayout>
    );
  }

  if (!contrato) {
    return (
      <MainLayout title="Contrato Não Encontrado">
        <div className="p-24 text-center border-4 border-dashed border-border rounded-[48px] opacity-30">
          <DocumentTextIcon className="w-24 h-24 mx-auto mb-6" />
          <p className="font-black text-xl">Contrato não encontrado na base de dados.</p>
          <button onClick={() => navigate("/contratos")} className="mt-6 text-primary font-bold hover:underline">Voltar para lista</button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Contrato ${contrato.numero}`}>
      <div className="space-y-10 animate-in fade-in duration-700">

        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/50">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/contratos")}
              className="p-3 bg-white dark:bg-slate-900 border-2 border-border rounded-2xl text-slate-400 hover:text-primary hover:border-primary transition-all shadow-md active:scale-90"
              title="Voltar para Contratos"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <StatusBadge status={contrato.status} />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {contrato.id?.slice(0, 8)}</span>
              </div>
              <h1 className="text-3xl font-black text-foreground tracking-tight leading-none uppercase">{contrato.numero}</h1>
              <p className="text-slate-500 font-bold text-xs tracking-tight mt-2 flex items-center gap-2">
                <BuildingOfficeIcon className="w-3.5 h-3.5" />
                {contrato.fornecedor_nome ?? contrato.fornecedor ?? "Fornecedor não identificado"}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => fetchData(true)}
              className={`p-3 bg-slate-100 dark:bg-slate-800 border-2 border-border dark:border-slate-700 rounded-2xl text-foreground hover:border-primary transition-all shadow-md ${refreshing ? "" : "active:rotate-180 duration-500"}`}
              disabled={refreshing}
            >
              <ArrowPathIcon className={`w-5 h-5 ${refreshing ? "animate-spin text-primary" : ""}`} />
            </button>
            {isAdmin && (
              <button
                onClick={() => setShowCriarCargo(true)}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-500/30 border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 transition-all text-sm"
              >
                <PlusIcon className="w-5 h-5" />
                Novo Cargo
              </button>
            )}
          </div>
        </div>

        {/* RESUMO EM CARDS — passa cargos para cálculo */}
        <ContratoResumo contrato={contrato} cargos={cargos} />

        {/* SEÇÃO DE CARGOS */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-slate-900 dark:bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
              <BriefcaseIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">Postos de Trabalho</h2>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-0.5">

                {listaCargos.length > 0 ? `${listaCargos.length} cargo${listaCargos.length > 1 ? "s" : ""} vinculado${listaCargos.length > 1 ? "s" : ""}` : "Nenhum cargo vinculado"}
              </p>
            </div>
          </div>

          <CargosTable
            cargos={cargos}
            onCriarCargo={() => setShowCriarCargo(true)}
            loading={loading}
            isAdmin={isAdmin}
            onRefresh={() => fetchData(true)}
          />
        </div>

        {/* MODAL DE CRIAÇÃO */}
        {showCriarCargo && (
          <CriarCargoModal
            contratoId={contrato.id}
            onClose={() => setShowCriarCargo(false)}
            onSuccess={() => fetchData(true)}
          />
        )}

      </div>
    </MainLayout>
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
    <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${style}`}>
      {status || "Vigente"}
    </span>
  );
}