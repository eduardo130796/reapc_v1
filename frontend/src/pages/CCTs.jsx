import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { listarCCTs, criarCCT } from "../services/cctService";
import CCTForm from "../components/cct/CCTForm";
import {
  PlusIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  MapPinIcon,
  IdentificationIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function CCTs() {
  const navigate = useNavigate();
  const [ccts, setCcts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const carregarCCTs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarCCTs();
      setCcts(data?.data || []);
    } catch (err) {
      toast.error("Erro ao carregar CCTs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarCCTs();
  }, [carregarCCTs]);

  const handleCriar = async (payload) => {
    setSubmitting(true);
    try {
      const nova = await criarCCT(payload);
      toast.success("CCT criada!");
      setModalOpen(false);
      navigate(`/ccts/${nova.id}`);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : "Erro ao criar CCT");
    } finally {
      setSubmitting(false);
    }
  };

  const cctsFiltradas = ccts.filter(c =>
    (c.sindicato?.nome || "").toLowerCase().includes(busca.toLowerCase()) ||
    c.sindicato_cnpj.includes(busca) ||
    c.categoria.toLowerCase().includes(busca.toLowerCase()) ||
    (c.numero_registro || "").toLowerCase().includes(busca.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'VIGENTE': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'VENCIDA': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      case 'PENDENTE': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  const formatData = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <MainLayout title="Convenções Coletivas">
      <div className="space-y-8 pb-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Gestão de CCTs</h1>
            <p className="text-slate-500 font-bold text-sm mt-1">Estrutura jurídica real, vigência e seleção automática para repactuação.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={carregarCCTs}
              className="p-3 bg-slate-100 dark:bg-slate-800 border-2 border-border rounded-xl text-slate-500 hover:border-primary transition-all active:rotate-180 duration-500"
            >
              <ArrowPathIcon className={`w-6 h-6 ${loading ? 'animate-spin text-primary' : ''}`} />
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-black rounded-xl hover:brightness-110 shadow-xl shadow-primary/20 border-b-4 border-primary-dark active:translate-y-1 active:border-b-0 transition-all"
            >
              <PlusIcon className="w-5 h-5" />
              Nova Convenção
            </button>
          </div>
        </div>

        {/* BUSCA */}
        <div className="relative group max-w-xl">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por Sindicato, Registro ou Categoria..."
            className="w-full pl-12 pr-4 py-3.5 bg-card border-2 border-border rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm font-bold text-sm"
          />
        </div>

        {/* LISTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center animate-pulse">
              <ArrowPathIcon className="w-12 h-12 mx-auto mb-4 animate-spin text-slate-300" />
              <p className="font-black text-slate-400">Carregando Biblioteca...</p>
            </div>
          ) : cctsFiltradas.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-slate-50/50 dark:bg-slate-900/50 border-4 border-dashed border-border rounded-[40px]">
              <DocumentTextIcon className="w-24 h-24 mx-auto mb-6 opacity-5" />
              <p className="font-black text-xl text-slate-400">Nenhuma CCT encontrada.</p>
            </div>
          ) : (
            cctsFiltradas.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/ccts/${c.id}`)}
                className="group bg-card border-2 border-border rounded-[2.5rem] p-6 hover:border-primary/40 transition-all cursor-pointer shadow-xl hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                  <ChevronRightIcon className="w-6 h-6 text-primary" />
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl group-hover:bg-primary transition-colors">
                      <IdentificationIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest truncate">{c.sindicato?.nome || c.sindicato_cnpj}</span>
                        <div className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase ${getStatusColor(c.status)}`}>
                          {c.status || 'PENDENTE'}
                        </div>
                      </div>
                      <h3 className="text-base font-black text-foreground line-clamp-2 mt-0.5">{c.categoria}</h3>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Nº Registro</span>
                      <span className="text-[10px] font-black text-foreground">{c.numero_registro || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Vigência</span>
                      <div className="flex items-center gap-1 text-[10px] font-black text-foreground">
                        <span>{formatData(c.data_inicio)}</span>
                        <span className="text-slate-300">→</span>
                        <span>{formatData(c.data_fim)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Local/Base</span>
                      <div className="flex items-center gap-1.5">
                        <div className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded border border-border text-[9px] font-black">
                          {c.uf}
                        </div>
                        <div className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded border border-border text-[9px] font-black">
                          BASE: {formatData(c.data_base)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      <CCTForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCriar}
        loading={submitting}
      />
    </MainLayout>
  );
}
