import { useState, useEffect } from "react";
import { listarModelos } from "../../services/modelosService";
import Modal from "../ui/Modal";
import { 
  DocumentIcon, 
  CheckCircleIcon, 
  CubeIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

export default function SelecionarModeloModal({ onClose, onSelect }) {
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const res = await listarModelos();
        setModelos(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar modelos:", err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const modelosFiltrados = modelos.filter(m => 
    m.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    m.descricao?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Selecionar Modelo de Planilha"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* BUSCA */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar modelo por nome..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-900 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
             <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-xs font-bold text-slate-500 uppercase">Carregando Modelos...</p>
             </div>
          ) : modelosFiltrados.length === 0 ? (
             <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl">
                <CubeIcon className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-500">Nenhum modelo encontrado</p>
             </div>
          ) : (
            modelosFiltrados.map(modelo => (
              <button
                key={modelo.id}
                onClick={() => onSelect(modelo)}
                className="flex items-start gap-4 p-4 bg-white dark:bg-slate-900 border-2 border-border rounded-2xl hover:border-primary hover:shadow-lg transition-all text-left group"
              >
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                  <DocumentIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-black text-slate-900 dark:text-slate-100">{modelo.nome}</h4>
                    {modelo.ativo && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Ativo</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{modelo.descricao || "Sem descrição disponível."}</p>
                </div>
                <div className="self-center">
                   <CheckCircleIcon className="w-6 h-6 text-slate-200 group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}