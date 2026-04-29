import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import {
  BuildingOfficeIcon,
  TagIcon,
  HashtagIcon,
  MapPinIcon,
  CalendarIcon,
  PlusIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  IdentificationIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { listarSindicatos, criarSindicato } from "../../services/sindicatosService";

export default function CCTForm({ open, onClose, onSave, loading }) {
  const [sindicatos, setSindicatos] = useState([]);
  const [loadingSindicatos, setLoadingSindicatos] = useState(false);
  const [showNovoSindicato, setShowNovoSindicato] = useState(false);
  const [novoSindicato, setNovoSindicato] = useState({ cnpj: "", nome: "", uf: "" });

  const [formData, setFormData] = useState({
    sindicato_id: "",
    sindicato_cnpj: "",
    categoria: "",
    cnae: "",
    uf: "",
    numero_registro: "",
    descricao: "",
    versao: "1.0",
    data_base: "",
    data_inicio: "",
    data_fim: "",
    ativa: true
  });

  useEffect(() => {
    if (open) {
      carregarSindicatos();
    }
  }, [open]);

  const carregarSindicatos = async () => {
    setLoadingSindicatos(true);
    try {
      const res = await listarSindicatos();
      setSindicatos(res.data || []);
    } catch (error) {
      toast.error("Erro ao carregar sindicatos");
    } finally {
      setLoadingSindicatos(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-preencher UF se selecionar sindicato
    if (name === "sindicato_id") {
      const selected = sindicatos.find(s => s.id === value);
      if (selected) {
        setFormData(prev => ({
          ...prev,
          uf: selected.uf,
          sindicato_cnpj: selected.cnpj
        }));
      }
    }
  };

  const handleNovoSindicatoChange = (e) => {
    const { name, value } = e.target;
    setNovoSindicato(prev => ({ ...prev, [name]: value }));
  };

  const handleCriarSindicato = async () => {
    if (!novoSindicato.cnpj || !novoSindicato.nome || !novoSindicato.uf) {
      return toast.error("Preencha todos os campos do sindicato");
    }
    try {
      const res = await criarSindicato(novoSindicato);
      toast.success("Sindicato criado!");
      await carregarSindicatos();
      setFormData(prev => ({
        ...prev,
        sindicato_id: res.id,
        sindicato_cnpj: res.cnpj,
        uf: res.uf
      }));
      setShowNovoSindicato(false);
      setNovoSindicato({ cnpj: "", nome: "", uf: "" });
    } catch (error) {
      toast.error("Erro ao criar sindicato");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.sindicato_id) return toast.error("Selecione um Sindicato");
    if (!formData.data_inicio || !formData.data_fim) return toast.error("Início e Fim da vigência são obrigatórios");

    onSave(formData);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nova Convenção Coletiva (CCT)"
      maxWidth="max-w-2xl"
      footer={(
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-4 text-sm font-black text-slate-500 hover:text-foreground transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="cct-form"
            disabled={loading}
            className="px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-500/30 border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PlusIcon className="w-5 h-5" />}
            Criar CCT
          </button>
        </div>
      )}
    >
      <form id="cct-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Seção Sindicato */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
              <BuildingOfficeIcon className="w-4 h-4" />
              Sindicato Jurídico
            </h3>
            <button
              type="button"
              onClick={() => setShowNovoSindicato(!showNovoSindicato)}
              className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-tighter"
            >
              {showNovoSindicato ? "- Cancelar" : "+ Novo Sindicato"}
            </button>
          </div>

          {showNovoSindicato ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
              <input
                placeholder="CNPJ"
                name="cnpj"
                value={novoSindicato.cnpj}
                onChange={handleNovoSindicatoChange}
                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border-2 border-border rounded-xl font-bold text-sm"
              />
              <input
                placeholder="Nome/Sigla"
                name="nome"
                value={novoSindicato.nome}
                onChange={handleNovoSindicatoChange}
                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border-2 border-border rounded-xl font-bold text-sm"
              />
              <div className="flex gap-2">
                <input
                  placeholder="UF"
                  name="uf"
                  maxLength={2}
                  value={novoSindicato.uf}
                  onChange={handleNovoSindicatoChange}
                  className="w-20 px-4 py-3 bg-white dark:bg-slate-950 border-2 border-border rounded-xl font-bold text-sm uppercase"
                />
                <button
                  type="button"
                  onClick={handleCriarSindicato}
                  className="flex-1 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase hover:bg-emerald-700"
                >
                  Salvar
                </button>
              </div>
            </div>
          ) : (
            <select
              required
              name="sindicato_id"
              value={formData.sindicato_id}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-slate-950 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
            >
              <option value="">Selecione um sindicato...</option>
              {sindicatos.map(s => (
                <option key={s.id} value={s.id}>{s.nome} ({s.cnpj}) - {s.uf}</option>
              ))}
            </select>
          )}
        </div>

        {/* Seção Dados Jurídicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Nº Registro MTE</label>
            <div className="relative">
              <IdentificationIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                name="numero_registro"
                value={formData.numero_registro}
                onChange={handleChange}
                placeholder="Ex: SP000123/2024"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Categoria</label>
            <div className="relative">
              <TagIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                placeholder="Ex: Vigilância e Segurança"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Data Início Vigência</label>
            <div className="relative">
              <CalendarIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="date"
                name="data_inicio"
                value={formData.data_inicio}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Data Fim Vigência</label>
            <div className="relative">
              <CalendarIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="date"
                name="data_fim"
                value={formData.data_fim}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">CNAE</label>
            <div className="relative">
              <HashtagIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                name="cnae"
                value={formData.cnae}
                onChange={handleChange}
                placeholder="Ex: 80.11-1-01"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Data Base</label>
            <div className="relative">
              <CalendarIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="date"
                name="data_base"
                value={formData.data_base}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Descrição / Notas</label>
          <div className="relative">
            <DocumentTextIcon className="w-5 h-5 absolute left-4 top-4 text-slate-400" />
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Informações adicionais sobre esta CCT..."
              className="w-full pl-12 pr-4 py-3 h-24 bg-slate-50 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm resize-none"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
