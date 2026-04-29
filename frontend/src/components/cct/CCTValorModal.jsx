import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import cargosBaseService from "../../services/cargosBaseService";
import { toast } from "react-hot-toast";
import {
  UserGroupIcon,
  TagIcon,
  CurrencyDollarIcon,
  CheckBadgeIcon,
  PlusIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

export default function CCTValorModal({ open, onClose, onSave, loading, itens }) {
  const [formData, setFormData] = useState({
    cargo_base_id: "",
    codigo_item: "",
    valor: ""
  });

  const [cargosBase, setCargosBase] = useState([]);
  const [loadingCargos, setLoadingCargos] = useState(false);
  const [novoCargoMode, setNovoCargoMode] = useState(false);
  const [novoCargoNome, setNovoCargoNome] = useState("");
  const [criandoCargo, setCriandoCargo] = useState(false);

  useEffect(() => {
    if (open) {
      loadCargos();
    }
  }, [open]);

  const loadCargos = async () => {
    setLoadingCargos(true);
    try {
      const resp = await cargosBaseService.listar();
      setCargosBase(resp?.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar cargos base.");
    } finally {
      setLoadingCargos(false);
    }
  };

  const handleCriarCargoRapido = async () => {
    if (!novoCargoNome.trim()) return;
    setCriandoCargo(true);
    try {
      const resp = await cargosBaseService.criar(novoCargoNome);
      const novoCargo = resp.data?.data;

      setCargosBase(prev => [...prev, novoCargo]);

      setFormData(prev => ({
        ...prev,
        cargo_base_id: novoCargo.id
      }));

      setNovoCargoMode(false);
      setNovoCargoNome("");

      toast.success("Catálogo atualizado com novo cargo!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao criar cargo base.");
    } finally {
      setCriandoCargo(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      valor: parseFloat(formData.valor)
    });
  };

  const itemSelecionado = itens.find(it => it.codigo_item === formData.codigo_item);
  const tipoCalculo = itemSelecionado?.tipo_calculo || "FIXO";

  const getLabelInfo = () => {
    switch (tipoCalculo) {
      case "PERCENTUAL": return { prefixo: "", sufixo: "%", label: "Valor (%)", step: "0.01" };
      case "MULTIPLICADOR": return { prefixo: "", sufixo: "x", label: "Fator Multiplicador", step: "0.01" };
      case "DIARIO": return { prefixo: "R$", sufixo: "/dia", label: "Valor por Dia", step: "0.01" };
      default: return { prefixo: "R$", sufixo: "", label: "Valor Fixo", step: "0.01" };
    }
  };

  const { prefixo, sufixo, label, step } = getLabelInfo();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Vincular Valor ao Cargo"
      footer={(
        <div className="flex items-center gap-4">
          <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-black text-slate-500 transition-all">Cancelar</button>
          <button
            type="submit"
            form="valor-form"
            disabled={loading}
            className="px-8 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 shadow-xl border-b-4 border-emerald-800 transition-all flex items-center gap-2"
          >
            {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PlusIcon className="w-5 h-5" />}
            Vincular Valor
          </button>
        </div>
      )}
    >
      <form id="valor-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Catálogo de Cargos / Funções</label>
            <div className="relative">
              {!novoCargoMode ? (
                <>
                  <UserGroupIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    required
                    value={formData.cargo_base_id}
                    onChange={e => {
                      if (e.target.value === "NOVO_CARGO") {
                        setNovoCargoMode(true);
                        setFormData({ ...formData, cargo_base_id: "" });
                      } else {
                        setFormData({ ...formData, cargo_base_id: e.target.value });
                      }
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
                  >
                    <option value="">Selecione o cargo do catálogo...</option>
                    {loadingCargos && <option disabled>Carregando...</option>}
                    {cargosBase.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                    <option value="NOVO_CARGO" className="font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20">
                      + Adicionar Novo ao Catálogo
                    </option>
                  </select>
                </>
              ) : (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={novoCargoNome}
                    onChange={e => setNovoCargoNome(e.target.value)}
                    placeholder="NOME DO NOVO CARGO"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border-2 border-emerald-500 rounded-xl focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all font-black text-sm uppercase"
                  />
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={handleCriarCargoRapido}
                      disabled={criandoCargo}
                      className="px-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {criandoCargo ? "..." : "Salvar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNovoCargoMode(false)}
                      className="px-4 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-700"
                    >
                      X
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Item de Cálculo</label>
            <div className="relative">
              <TagIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                required
                value={formData.codigo_item}
                onChange={e => setFormData({ ...formData, codigo_item: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
              >
                <option value="">Selecione o item...</option>
                {itens.map(it => (
                  <option key={it.id} value={it.codigo_item}>{it.codigo_item}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">{label}</label>
            <div className="relative">
              {prefixo && <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">{prefixo}</span>}
              <input
                required
                type="number"
                step={step}
                value={formData.valor}
                onChange={e => setFormData({ ...formData, valor: e.target.value })}
                placeholder="0.00"
                className={`w-full ${prefixo ? "pl-12" : "pl-4"} ${sufixo ? "pr-12" : "pr-4"} py-3 bg-slate-50 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm`}
              />
              {sufixo && <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">{sufixo}</span>}
            </div>
          </div>
        </div>

        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-3">
          <CheckBadgeIcon className="w-6 h-6 text-primary shrink-0" />
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Este valor será a <strong>fonte única</strong> para todos os cálculos que utilizarem este cargo neste contrato.
            O motor de cálculo identificará automaticamente o tipo (Fixo, Percentual, etc) baseado no cadastro do item.
          </p>
        </div>
      </form>
    </Modal>
  );
}
