import { useEffect, useState, useCallback, useMemo } from "react";
import {
  listarModelos,
  excluirModelo,
  atualizarModelo,
  criarModelo
} from "../services/modelosService";
import MainLayout from "../layouts/MainLayout";
import EstruturaPCFP from "../components/contratos/EstruturaPCFP";
import Modal from "../components/ui/Modal";
import {
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  DocumentDuplicateIcon,
  ChevronRightIcon,
  XMarkIcon,
  PencilIcon,
  ChevronLeftIcon,
  Bars3Icon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

function StatusPill({ ativo }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
      ${ativo ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"}`}>
      <span className={`h-2 w-2 rounded-full mr-2 ${ativo ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
      {ativo ? "Ativo" : "Inativo"}
    </span>
  );
}

export default function Modelos() {
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modeloSelecionado, setModeloSelecionado] = useState(null);
  const [busca, setBusca] = useState("");

  // Layout state
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Modals state
  const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [modalEditarNomeOpen, setModalEditarNomeOpen] = useState(false);
  const [tempNome, setTempNome] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const carregarModelos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarModelos();
      setModelos(data?.data || []);
    } catch (err) {
      console.error("Erro ao carregar modelos", err);
      toast.error("Erro ao carregar modelos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarModelos();
  }, [carregarModelos]);

  const modelosFiltrados = useMemo(() => {
    return modelos.filter(m =>
      (m.nome || "").toLowerCase().includes(busca.toLowerCase())
    );
  }, [modelos, busca]);

  async function handleExcluir(id, e) {
    e.stopPropagation();
    if (!window.confirm("Deseja realmente excluir este modelo?")) return;
    try {
      await excluirModelo(id);
      toast.success("Modelo removido");
      if (modeloSelecionado?.id === id) setModeloSelecionado(null);
      carregarModelos();
    } catch (err) {
      toast.error("Erro ao excluir modelo");
    }
  }

  async function handleConfirmarNovo() {
    if (!tempNome.trim()) return toast.error("Informe um nome para o modelo");
    setModalLoading(true);
    try {
      const novo = await criarModelo({
        nome: tempNome.trim(),
        ativo: true,
        estrutura: { modulos: [] }
      });
      toast.success("Modelo criado!");
      carregarModelos();
      setModeloSelecionado(novo);
      setModalNovoOpen(false);
      setTempNome("");
    } catch (err) {
      toast.error("Erro ao criar modelo");
    } finally {
      setModalLoading(false);
    }
  }

  async function handleSalvarNome() {
    if (!tempNome.trim()) return toast.error("Informe um nome para o modelo");
    setModalLoading(true);
    try {
      await atualizarModelo(modeloSelecionado.id, {
        ...modeloSelecionado,
        nome: tempNome.trim()
      });
      toast.success("Nome atualizado!");
      setModelos(prev => prev.map(m => m.id === modeloSelecionado.id ? { ...m, nome: tempNome.trim() } : m));
      setModeloSelecionado(prev => ({ ...prev, nome: tempNome.trim() }));
      setModalEditarNomeOpen(false);
    } catch (err) {
      toast.error("Erro ao atualizar nome");
    } finally {
      setModalLoading(false);
    }
  }

  async function handleSalvarEstrutura(novaEstrutura) {
    if (!modeloSelecionado) return;
    try {
      await atualizarModelo(modeloSelecionado.id, {
        ...modeloSelecionado,
        estrutura: novaEstrutura
      });
      setModelos(prev => prev.map(m => m.id === modeloSelecionado.id ? { ...m, estrutura: novaEstrutura } : m));
      setModeloSelecionado(prev => ({ ...prev, estrutura: novaEstrutura }));
    } catch (err) {
      throw err;
    }
  }

  return (
    <MainLayout title="Gestão de Modelos PCFP">
      <div className="space-y-8 flex flex-col min-h-screen pb-10">

        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="p-2.5 bg-slate-100 dark:bg-slate-900 border-2 border-border rounded-xl text-foreground hover:border-primary transition-all shadow-md active:scale-90"
              title={isSidebarVisible ? "Recolher Painel" : "Expandir Painel"}
            >
              {isSidebarVisible ? <ChevronLeftIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight leading-none">Biblioteca de Modelos</h1>
              <p className="text-slate-500 font-bold text-xs tracking-tight mt-1">Estruturas base do motor de cálculo.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setRefreshing(true); carregarModelos(); }}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 border-2 border-border dark:border-slate-700 rounded-xl text-foreground hover:border-primary transition-all shadow-md active:rotate-180 duration-500"
            >
              <ArrowPathIcon className={`w-5 h-5 ${refreshing || loading ? "animate-spin text-primary" : ""}`} />
            </button>
            <button
              onClick={() => { setTempNome(""); setModalNovoOpen(true); }}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 shadow-xl shadow-emerald-500/30 border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 transition-all text-sm"
            >
              <PlusIcon className="w-5 h-5" />
              Criar Novo Modelo
            </button>
          </div>
        </div>

        {/* LISTA + DETALHES (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start flex-1">

          {/* COLUNA LISTA (4/12) */}
          {isSidebarVisible && (
            <div className="lg:col-span-4 flex flex-col h-fit space-y-6 animate-in slide-in-from-left duration-300">
              <div className="relative group shrink-0">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Pesquisar..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm text-slate-900 dark:text-slate-100 font-bold text-xs"
                />
              </div>

              <div className="bg-card border-2 border-border rounded-[40px] overflow-hidden shadow-2xl ring-1 ring-white/5 flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {loading && !refreshing ? (
                    <div className="p-20 text-center text-slate-400 font-black animate-pulse flex flex-col items-center gap-4">
                      <ArrowPathIcon className="w-12 h-12 animate-spin" />
                      Lendo Biblioteca...
                    </div>
                  ) : modelosFiltrados.length === 0 ? (
                    <div className="p-24 text-center text-slate-400">
                      <DocumentDuplicateIcon className="w-24 h-24 mx-auto mb-6 opacity-5" />
                      <p className="font-black text-xl opacity-30">Nenhum modelo encontrado.</p>
                    </div>
                  ) : (
                    modelosFiltrados.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setModeloSelecionado(m)}
                        className={`p-4 group/item border-b border-border last:border-0 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 relative
                           ${modeloSelecionado?.id === m.id ? "bg-primary/5 dark:bg-primary/10 !border-primary/40 ring-1 ring-primary/20" : ""}
                         `}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-xl transition-all ${modeloSelecionado?.id === m.id ? "bg-slate-900 dark:bg-primary text-white shadow-lg" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover/item:bg-primary/10 group-hover/item:text-primary"}`}>
                              <DocumentDuplicateIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-sm font-bold truncate leading-tight ${modeloSelecionado?.id === m.id ? "text-primary" : "text-foreground"}`}>
                                {m.nome}
                              </h4>
                              <div className="flex items-center gap-3 mt-1.5">
                                <StatusPill ativo={m.ativo} />
                                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-border shadow-sm">V{m.versao || 1}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={(e) => handleExcluir(m.id, e)}
                              className="p-2 text-slate-400 hover:text-destructive opacity-0 group-hover/item:opacity-100 transition-all rounded-xl hover:bg-destructive/10 border-2 border-transparent hover:border-destructive/20 active:scale-90"
                              title="Excluir Modelo"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                            <ChevronRightIcon className={`w-5 h-5 text-slate-300 transition-transform ${modeloSelecionado?.id === m.id ? "translate-x-1 text-primary opacity-100" : "group-hover/item:translate-x-0.5"}`} />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* COLUNA EDITOR (8/12 ou 12/12) */}
          <div className={`${isSidebarVisible ? 'lg:col-span-8' : 'lg:col-span-12'} h-full flex flex-col transition-all duration-500 overflow-hidden`}>
            {modeloSelecionado ? (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-12 duration-500">
                <div className="bg-card border-2 border-border rounded-3xl shadow-2xl mb-8 p-6 ring-1 ring-white/5 relative overflow-hidden shrink-0">
                  <div className="absolute top-0 right-0 p-6">
                    <button onClick={() => setModeloSelecionado(null)} className="p-3 text-slate-500 hover:text-foreground bg-slate-100 dark:bg-slate-900 rounded-2xl transition-all border-2 border-border hover:border-primary shadow-xl active:scale-90">
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="p-4 bg-slate-900 dark:bg-primary text-white rounded-2xl shadow-2xl shadow-primary/40 rotate-3 transform transition-all">
                      <DocumentDuplicateIcon className="w-12 h-12" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/40" />
                        <span className="text-[11px] text-primary font-bold uppercase tracking-widest">Modelo Estrutural em Edição</span>
                      </div>
                      <div className="flex items-center gap-6 flex-wrap">
                        <h2 className="text-xl font-black text-foreground tracking-tight leading-tight">{modeloSelecionado.nome}</h2>
                        <button
                          onClick={() => { setTempNome(modeloSelecionado.nome); setModalEditarNomeOpen(true); }}
                          className="p-2.5 text-primary bg-primary/5 hover:bg-primary border-2 border-primary/20 hover:text-white rounded-xl transition-all shadow-lg active:scale-90"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                  <EstruturaPCFP
                    structure={modeloSelecionado.structure || modeloSelecionado.estrutura}
                    onSave={handleSalvarEstrutura}
                    title={`Arquiteto Master - ${modeloSelecionado.nome}`}
                    description="Personalize o motor de cálculo para este template. Estas metas serão herdadas por todos os novos cargos."
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-3xl border-4 border-dashed border-border rounded-[64px] text-slate-300 text-center p-24 shadow-inner group">
                <div className="relative mb-12 transition-all group-hover:scale-110 duration-700">
                  <DocumentDuplicateIcon className="w-48 h-48 stroke-[0.3] opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-8 bg-white dark:bg-slate-800 rounded-[40px] shadow-3xl border-2 border-border group-hover:border-primary/40 transition-colors">
                      <PlusIcon className="w-16 h-16 text-primary animate-bounce-slow" />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-foreground opacity-20 tracking-tight mb-3">Pronto para Projetar?</h3>
                <p className="max-w-xl text-lg font-bold opacity-30 leading-relaxed">Selecione um template na biblioteca à esquerda para ver a estrutura interna ou crie um modelo totalmente novo.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAIS (Opaque) */}
      <Modal
        open={modalNovoOpen}
        onClose={() => setModalNovoOpen(false)}
        title="Novo Template de Cálculo"
        footer={(
          <div className="flex items-center gap-4">
            <button
              onClick={() => setModalNovoOpen(false)}
              className="px-8 py-4 text-base font-black text-slate-500 hover:text-foreground transition-all hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl"
            >
              Agora Não
            </button>
            <button
              onClick={handleConfirmarNovo}
              disabled={modalLoading}
              className="px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-500/30 border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {modalLoading ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : <PlusIcon className="w-6 h-6" />}
              Gerar Modelo Base
            </button>
          </div>
        )}
      >
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg">
              <DocumentDuplicateIcon className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-black text-foreground">Como vamos chamar o modelo?</h4>
              <p className="text-slate-500 font-black text-sm">Este nome identifica o template na seleção de novos contratos.</p>
            </div>
          </div>
          <div className="relative group">
            <input
              autoFocus
              value={tempNome}
              onChange={e => setTempNome(e.target.value)}
              className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-900 border-2 border-border rounded-2xl focus:ring-4 focus:ring-primary/20 outline-none transition-all text-slate-900 dark:text-slate-100 font-black text-lg shadow-inner placeholder:opacity-30"
              placeholder="Ex: PCFP Operacional 2024"
              onKeyDown={e => e.key === 'Enter' && handleConfirmarNovo()}
            />
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-border rounded-3xl">
            <p className="text-sm text-slate-500 font-black italic">Dica: O modelo será criado com uma estrutura vazia, pronto para você adicionar os primeiros módulos e itens de cálculo.</p>
          </div>
        </div>
      </Modal>

      <Modal
        open={modalEditarNomeOpen}
        onClose={() => setModalEditarNomeOpen(false)}
        title="Atualizar Nome do Template"
        footer={(
          <div className="flex items-center gap-4">
            <button
              onClick={() => setModalEditarNomeOpen(false)}
              className="px-8 py-4 text-sm font-black text-slate-500 hover:text-foreground transition-all"
            >
              Manter Original
            </button>
            <button
              onClick={handleSalvarNome}
              disabled={modalLoading}
              className="px-10 py-4 bg-primary text-white font-black rounded-2xl hover:brightness-110 shadow-xl shadow-primary/20 border-b-4 border-primary-dark active:translate-y-1 active:border-b-0 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {modalLoading ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : <CheckCircleIcon className="w-6 h-6" />}
              Confirmar Alteração
            </button>
          </div>
        )}
      >
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-primary uppercase tracking-[0.4em] pl-1">Novo Nome do Modelo</label>
            <input
              autoFocus
              value={tempNome}
              onChange={e => setTempNome(e.target.value)}
              className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-900 border-2 border-border rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-slate-100 font-black text-lg shadow-inner"
              placeholder="Nome do modelo"
              onKeyDown={e => e.key === 'Enter' && handleSalvarNome()}
            />
          </div>
          <p className="text-base text-slate-500 font-black leading-relaxed">
            Ao renomear este modelo, o novo nome será refletido imediatamente na biblioteca, mas os contratos que já usam este modelo manterão os dados originais.
          </p>
        </div>
      </Modal>

    </MainLayout>
  );
}