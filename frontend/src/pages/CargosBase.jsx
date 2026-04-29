import { useEffect, useState, useCallback } from "react";
import MainLayout from "../layouts/MainLayout";
import cargosBaseService from "../services/cargosBaseService";
import {
  UserGroupIcon,
  PlusIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import Modal from "../components/ui/Modal";

export default function CargosBase() {
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ nome: "" });

  const carregarCargos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cargosBaseService.listar();
      setCargos(res.data || []);
    } catch (err) {
      toast.error("Erro ao carregar catálogo de cargos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarCargos();
  }, [carregarCargos]);

  const handleCriar = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await cargosBaseService.criar(formData.nome);
      toast.success("Cargo adicionado ao catálogo!");
      setModalOpen(false);
      setFormData({ nome: "" });
      carregarCargos();
    } catch (err) {
      toast.error(err || "Erro ao cadastrar cargo");
    } finally {
      setSubmitting(false);
    }
  };

  const filtrados = cargos.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <MainLayout title="Catálogo Global de Cargos">
      <div className="space-y-8 pb-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Cargos & Funções</h1>
            <p className="text-slate-500 font-bold text-sm mt-1">Repositório único de nomenclaturas para CCTs e Contratos.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={carregarCargos}
              className="p-3 bg-slate-100 dark:bg-slate-800 border-2 border-border rounded-xl text-slate-500 hover:border-primary transition-all duration-500"
            >
              <ArrowPathIcon className={`w-6 h-6 ${loading ? 'animate-spin text-primary' : ''}`} />
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-black rounded-xl hover:brightness-110 shadow-xl shadow-primary/20 border-b-4 border-primary-dark active:translate-y-1 active:border-b-0 transition-all"
            >
              <PlusIcon className="w-5 h-5" />
              Novo Cargo
            </button>
          </div>
        </div>

        {/* BUSCA */}
        <div className="relative group max-w-xl">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Pesquisar cargo no catálogo..."
            className="w-full pl-12 pr-4 py-3.5 bg-card border-2 border-border rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm font-bold text-sm uppercase"
          />
        </div>

        {/* LISTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center animate-pulse">
              <ArrowPathIcon className="w-12 h-12 mx-auto mb-4 animate-spin text-slate-300" />
              <p className="font-black text-slate-400">Consultando Catálogo...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-slate-50/50 dark:bg-slate-900/50 border-4 border-dashed border-border rounded-[40px]">
              <UserGroupIcon className="w-24 h-24 mx-auto mb-6 opacity-5" />
              <p className="font-black text-xl text-slate-400">Nenhum cargo encontrado.</p>
            </div>
          ) : (
            filtrados.map((c) => (
              <div
                key={c.id}
                className="group bg-card border-2 border-border rounded-[2.5rem] p-6 hover:border-primary/40 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="flex items-start gap-5">
                  <div className="p-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl group-hover:bg-primary transition-colors">
                    <UserGroupIcon className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                      <CheckBadgeIcon className="w-3 h-3" />
                      Entidade Global
                    </span>
                    <h3 className="text-lg font-black text-foreground mt-0.5 break-words uppercase">{c.nome}</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-2 truncate">ID: {c.id}</p>
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
        title="Novo Cargo no Catálogo"
        footer={(
          <button
            type="submit"
            form="cargo-form"
            disabled={submitting}
            className="px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-500/30 border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {submitting ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PlusIcon className="w-5 h-5" />}
            Salvar no Catálogo
          </button>
        )}
      >
        <form id="cargo-form" onSubmit={handleCriar} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Nome da Função</label>
            <div className="relative">
              <UserGroupIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                autoFocus
                value={formData.nome}
                onChange={e => setFormData({ ...formData, nome: e.target.value.toUpperCase() })}
                placeholder="EX: VIGILANTE 44H"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-black text-sm uppercase"
              />
            </div>
            <p className="text-[10px] text-slate-500 font-bold px-1">
              DICA: Use nomes padronizados para facilitar o relacionamento entre CCTs e Contratos.
            </p>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}
