import { useEffect, useState, useCallback } from "react";
import MainLayout from "../layouts/MainLayout";
import { listarSindicatos, criarSindicato } from "../services/sindicatosService";
import {
  BuildingOfficeIcon,
  PlusIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  IdentificationIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import Modal from "../components/ui/Modal";

export default function Sindicatos() {
  const [sindicatos, setSindicatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ cnpj: "", nome: "", uf: "" });

  const carregarSindicatos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listarSindicatos();
      setSindicatos(res?.data || []);
    } catch (err) {
      toast.error("Erro ao carregar sindicatos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarSindicatos();
  }, [carregarSindicatos]);

  const handleCriar = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await criarSindicato(formData);
      toast.success("Sindicato cadastrado!");
      setModalOpen(false);
      setFormData({ cnpj: "", nome: "", uf: "" });
      carregarSindicatos();
    } catch (err) {
      toast.error("Erro ao cadastrar sindicato");
    } finally {
      setSubmitting(false);
    }
  };

  const filtrados = sindicatos.filter(s =>
    s.nome.toLowerCase().includes(busca.toLowerCase()) ||
    s.cnpj.includes(busca)
  );

  return (
    <MainLayout title="Gestão de Sindicatos">
      <div className="space-y-8 pb-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Sindicatos Jurídicos</h1>
            <p className="text-slate-500 font-bold text-sm mt-1">Entidades vinculadas às Convenções Coletivas.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={carregarSindicatos}
              className="p-3 bg-slate-100 dark:bg-slate-800 border-2 border-border rounded-xl text-slate-500 hover:border-primary transition-all duration-500"
            >
              <ArrowPathIcon className={`w-6 h-6 ${loading ? 'animate-spin text-primary' : ''}`} />
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-black rounded-xl hover:brightness-110 shadow-xl shadow-primary/20 border-b-4 border-primary-dark active:translate-y-1 active:border-b-0 transition-all"
            >
              <PlusIcon className="w-5 h-5" />
              Novo Sindicato
            </button>
          </div>
        </div>

        {/* BUSCA */}
        <div className="relative group max-w-xl">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por Nome ou CNPJ..."
            className="w-full pl-12 pr-4 py-3.5 bg-card border-2 border-border rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm font-bold text-sm"
          />
        </div>

        {/* LISTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center animate-pulse">
              <ArrowPathIcon className="w-12 h-12 mx-auto mb-4 animate-spin text-slate-300" />
              <p className="font-black text-slate-400">Carregando Entidades...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-slate-50/50 dark:bg-slate-900/50 border-4 border-dashed border-border rounded-[40px]">
              <BuildingOfficeIcon className="w-24 h-24 mx-auto mb-6 opacity-5" />
              <p className="font-black text-xl text-slate-400">Nenhum sindicato cadastrado.</p>
            </div>
          ) : (
            filtrados.map((s) => (
              <div
                key={s.id}
                className="group bg-card border-2 border-border rounded-[2.5rem] p-6 hover:border-primary/40 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="flex items-start gap-5">
                  <div className="p-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl group-hover:bg-primary transition-colors">
                    <BuildingOfficeIcon className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{s.cnpj}</span>
                    <h3 className="text-lg font-black text-foreground truncate mt-0.5">{s.nome}</h3>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg border border-border text-[9px] font-black uppercase">
                        <MapPinIcon className="w-3 h-3" />
                        {s.uf}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Cadastrar Sindicato"
        footer={(
          <button
            type="submit"
            form="sindicato-form"
            disabled={submitting}
            className="px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-500/30 border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {submitting ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PlusIcon className="w-5 h-5" />}
            Salvar Sindicato
          </button>
        )}
      >
        <form id="sindicato-form" onSubmit={handleCriar} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">CNPJ</label>
            <div className="relative">
              <IdentificationIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                value={formData.cnpj}
                onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Nome / Sigla</label>
            <div className="relative">
              <BuildingOfficeIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                value={formData.nome}
                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: SINDIVIG-SP"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">UF (Estado)</label>
            <div className="relative">
              <MapPinIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                maxLength={2}
                value={formData.uf}
                onChange={e => setFormData({ ...formData, uf: e.target.value.toUpperCase() })}
                placeholder="Ex: SP"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm uppercase"
              />
            </div>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}
