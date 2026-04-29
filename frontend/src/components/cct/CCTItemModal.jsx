import { useState } from "react";
import Modal from "../ui/Modal";
import { 
  PuzzlePieceIcon, 
  CalculatorIcon, 
  Bars3BottomLeftIcon,
  CheckCircleIcon,
  PlusIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function CCTItemModal({ open, onClose, onSave, loading, itensExistentes }) {
  const [formData, setFormData] = useState({
    codigo_item: "",
    tipo_calculo: "FIXO",
    base_calculo: "",
    obrigatorio: true,
    ordem_calculo: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.base_calculo && formData.base_calculo === formData.codigo_item) {
      toast.error("A base de cálculo não pode ser o próprio item.");
      return;
    }
    onSave(formData);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo Item de CCT"
      footer={(
        <div className="flex items-center gap-4">
          <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-black text-slate-500 transition-all">Cancelar</button>
          <button 
            type="submit" 
            form="item-form" 
            disabled={loading}
            className="px-8 py-3 bg-primary text-white font-black rounded-xl hover:brightness-110 shadow-lg border-b-4 border-primary-dark transition-all flex items-center gap-2"
          >
            {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PlusIcon className="w-5 h-5" />}
            Adicionar Item
          </button>
        </div>
      )}
    >
      <form id="item-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Código do Item</label>
            <div className="relative">
              <PuzzlePieceIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                value={formData.codigo_item}
                onChange={e => setFormData({...formData, codigo_item: e.target.value})}
                placeholder="Ex: SALARIO_BASE"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Tipo de Cálculo</label>
            <div className="relative">
              <CalculatorIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={formData.tipo_calculo}
                onChange={e => setFormData({...formData, tipo_calculo: e.target.value})}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
              >
                <option value="FIXO">Valor Fixo</option>
                <option value="PERCENTUAL">Percentual</option>
                <option value="DIARIO">Diário</option>
                <option value="MULTIPLICADOR">Multiplicador</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Base de Cálculo (Opcional)</label>
            <div className="relative">
              <Bars3BottomLeftIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={formData.base_calculo}
                onChange={e => setFormData({...formData, base_calculo: e.target.value})}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
              >
                <option value="">Nenhuma (Valor Base)</option>
                {itensExistentes.map(it => (
                  <option key={it.id} value={it.codigo_item}>{it.codigo_item}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Ordem de Cálculo</label>
            <input
              type="number"
              required
              min="1"
              value={formData.ordem_calculo}
              onChange={e => setFormData({...formData, ordem_calculo: parseInt(e.target.value)})}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-border rounded-2xl">
          <input
            type="checkbox"
            id="obrigatorio"
            checked={formData.obrigatorio}
            onChange={e => setFormData({...formData, obrigatorio: e.target.checked})}
            className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-primary/20"
          />
          <label htmlFor="obrigatorio" className="text-sm font-black text-foreground cursor-pointer">Este item é de preenchimento obrigatório para todos os cargos</label>
        </div>
      </form>
    </Modal>
  );
}
