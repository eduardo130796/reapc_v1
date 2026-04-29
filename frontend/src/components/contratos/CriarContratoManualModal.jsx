import { useState, useEffect } from "react";
import { criarContrato } from "../../services/contratosService";
import Modal from "../ui/Modal";
import {
  HashtagIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  BookOpenIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";


export default function CriarContratoManualModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    numero: "",
    fornecedor_nome: "",
    objeto: "",
    vigencia_inicio: "",
    vigencia_fim: "",
    valor_global: ""
  });
  const [loading, setLoading] = useState(false);


  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (!form.numero || !form.fornecedor_nome) {
      return toast.error("Número e Fornecedor são obrigatórios");
    }

    setLoading(true);
    try {
      const payload = {
        numero: form.numero,
        fornecedor: form.fornecedor_nome,
        objeto: form.objeto,
        data_inicio: form.vigencia_inicio || null,
        data_fim: form.vigencia_fim || null,
        valor_anual: form.valor_global ? Number(form.valor_global) : 0
      };

      await criarContrato(payload);
      toast.success("Contrato criado com sucesso!");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar contrato manualmente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Novo Contrato Manual"
      footer={(
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-foreground transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-slate-900 dark:bg-primary text-white font-black rounded-2xl hover:brightness-110 shadow-xl shadow-primary/20 border-b-4 border-slate-700 dark:border-primary-dark active:translate-y-1 active:border-b-0 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircleIcon className="w-5 h-5" />}
            Criar Contrato
          </button>
        </div>
      )}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Número do Contrato"
            name="numero"
            placeholder="Ex: 01/2024"
            value={form.numero}
            onChange={handleChange}
            icon={<HashtagIcon className="w-5 h-5" />}
          />
          <Input
            label="Fornecedor"
            name="fornecedor_nome"
            placeholder="Nome da Empresa"
            value={form.fornecedor_nome}
            onChange={handleChange}
            icon={<UserGroupIcon className="w-5 h-5" />}
          />
        </div>

        <Input
          label="Objeto do Contrato"
          name="objeto"
          placeholder="Descrição resumida do serviço"
          value={form.objeto}
          onChange={handleChange}
          icon={<DocumentTextIcon className="w-5 h-5" />}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Início Vigência"
            name="vigencia_inicio"
            type="date"
            value={form.vigencia_inicio}
            onChange={handleChange}
            icon={<CalendarIcon className="w-5 h-5" />}
          />
          <Input
            label="Fim Vigência"
            name="vigencia_fim"
            type="date"
            value={form.vigencia_fim}
            onChange={handleChange}
            icon={<CalendarIcon className="w-5 h-5" />}
          />
        </div>

        <Input
          label="Valor Global / Anual"
          name="valor_global"
          type="number"
          placeholder="0.00"
          value={form.valor_global}
          onChange={handleChange}
          icon={<CurrencyDollarIcon className="w-5 h-5" />}
        />

      </div>
    </Modal>
  );
}

function Input({ label, icon, value, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] pl-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        <input
          {...props}
          value={value ?? ""}
          className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
        />
      </div>
    </div>
  );
}
