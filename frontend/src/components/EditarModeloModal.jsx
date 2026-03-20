import { useState } from "react";
import { atualizarModelo } from "../services/modelosService";
import { toast } from "react-hot-toast";

const EditarModeloModal = ({ modelo, onClose, onSuccess }) => {
  const [nome, setNome] = useState(modelo.nome);
  const [ativo, setAtivo] = useState(modelo.ativo);
  const [estrutura, setEstrutura] = useState(
    JSON.stringify(modelo.estrutura, null, 2)
  );
  const [loading, setLoading] = useState(false);

  const handleSalvar = async () => {
    setLoading(true);
    try {
      await atualizarModelo(modelo.id, {
        nome: nome.trim(),
        ativo,
        estrutura: JSON.parse(estrutura)
      });
      toast.success("Modelo atualizado com sucesso");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(
        err instanceof SyntaxError
          ? "Estrutura JSON inválida"
          : "Erro ao atualizar modelo"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[600px]">
        <h2 className="text-xl font-semibold mb-6">Editar Modelo</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nome do Modelo
          </label>
          <input
            className="border border-slate-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={nome}
            onChange={e => setNome(e.target.value)}
            disabled={loading}
            placeholder="Nome do modelo"
            autoFocus
            maxLength={120}
          />
        </div>
        <div className="mb-4 flex items-center">
          <input
            id="editar-modelo-ativo"
            type="checkbox"
            checked={ativo}
            onChange={e => setAtivo(e.target.checked)}
            disabled={loading}
            className="mr-2 accent-blue-600 rounded"
          />
          <label htmlFor="editar-modelo-ativo" className="text-sm text-slate-700 select-none">
            Modelo ativo
          </label>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Estrutura JSON
          </label>
          <textarea
            className="border border-slate-300 rounded-lg px-3 py-2 w-full h-64 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={estrutura}
            onChange={e => setEstrutura(e.target.value)}
            disabled={loading}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors text-slate-700 font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            disabled={loading}
            className={`bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium transition-colors ${
              loading ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarModeloModal;