import { useState } from "react";
import { criarCargo } from "../../services/cargosService";
import Modal from "../ui/Modal";
import { 
  UserPlusIcon, 
  HashtagIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function CriarCargoModal({ contratoId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    nome: "",
    quantidade: "",
    salario: ""
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (!form.nome || !form.quantidade || !form.salario) {
      return toast.error("Preencha todos os campos obrigatórios");
    }

    setLoading(true);
    try {
      const payload = {
        contrato_id: contratoId,
        nome: form.nome.trim(),
        quantidade: Number(form.quantidade),
        salario: Number(form.salario)
      };
      await criarCargo(payload);
      toast.success("Cargo criado com sucesso!");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar cargo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Novo Cargo"
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
            className="px-8 py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircleIcon className="w-5 h-5" />}
            Criar Cargo
          </button>
        </div>
      )}
    >
      <div className="space-y-6">
        <Input 
          label="Nome do Cargo" 
          name="nome" 
          placeholder="Ex: Vigilante 44h"
          value={form.nome} 
          onChange={handleChange}
          icon={<UserPlusIcon className="w-5 h-5" />}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Quantidade" 
            name="quantidade" 
            type="number" 
            placeholder="0"
            value={form.quantidade} 
            onChange={handleChange}
            icon={<HashtagIcon className="w-5 h-5" />}
          />
          <Input 
            label="Salário Base" 
            name="salario" 
            type="number" 
            placeholder="0.00"
            value={form.salario} 
            onChange={handleChange}
            icon={<CurrencyDollarIcon className="w-5 h-5" />}
          />
        </div>

        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-2xl">
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold leading-relaxed">
            Dica: Após criar o cargo, você poderá configurar os percentuais e módulos específicos na tela de detalhes.
          </p>
        </div>
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