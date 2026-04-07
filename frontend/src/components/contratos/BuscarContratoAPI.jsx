import { useState } from "react"
import { buscarContratosAPI, criarContrato } from "../../services/contratosService"
import { toast } from "react-hot-toast"
import Modal from "../ui/Modal"
import { 
  MagnifyingGlassIcon, 
  ArrowDownTrayIcon,
  BuildingLibraryIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline"

export default function BuscarContratoAPI({ onClose, onImport }) {
  const [ug, setUg] = useState("290002")
  const [contratos, setContratos] = useState([])
  const [busca, setBusca] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleBuscar() {
    setLoading(true)
    try {
      const data = await buscarContratosAPI(ug)
      setContratos(data)
      toast.success(`${data.length} contratos encontrados`)
    } catch (err) {
      console.error(err)
      toast.error("Erro ao buscar contratos")
    }
    setLoading(false)
  }

  async function handleImportar(c) {
    try {
      await criarContrato({ id_api: c.id_api })
      toast.success("Contrato importado com sucesso")
      if (onImport) onImport()
      if (onClose) onClose()
    } catch (err) {
      console.error(err)
      if (err?.response?.data?.erro) {
        toast.error(err.response.data.erro)
      } else {
        toast.error("Erro ao importar contrato")
      }
    }
  }

  const contratosFiltrados = contratos.filter(c =>
    c.numero?.toLowerCase().includes(busca.toLowerCase()) ||
    c.fornecedor_nome?.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <Modal 
      open={true} 
      onClose={onClose} 
      title="Importar da API Governamental"
    >
      <div className="space-y-6">
        {/* BUSCA UG */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] pl-1">Código da UG (Unidade Gestora)</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <BuildingLibraryIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={ug}
                onChange={e => setUg(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-900 border-2 border-border rounded-2xl focus:ring-4 focus:ring-primary/20 outline-none transition-all font-bold text-sm"
                placeholder="Ex: 290002"
              />
            </div>
            <button
              onClick={handleBuscar}
              disabled={loading}
              className="px-6 py-3 bg-slate-900 dark:bg-primary text-white font-black rounded-2xl hover:brightness-110 shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <GlobeAltIcon className="w-5 h-5" />}
              {loading ? "Buscando..." : "Consultar"}
            </button>
          </div>
        </div>

        {/* LISTAGEM RESULTADO */}
        {contratos.length > 0 ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="relative group">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                placeholder="Filtrar nesta lista..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all text-xs font-bold"
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar border-2 border-border rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/80 sticky top-0 z-10">
                  <tr>
                    <th className="p-4 font-black uppercase tracking-widest text-slate-500">Contrato</th>
                    <th className="p-4 font-black uppercase tracking-widest text-slate-500">Fornecedor</th>
                    <th className="p-4 font-black uppercase tracking-widest text-slate-500 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {contratosFiltrados.map(c => (
                    <tr key={c.id_api} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-bold text-foreground">
                        {c.numero}
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">{c.vigencia_inicio} → {c.vigencia_fim}</div>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 font-medium truncate max-w-[200px]">
                        {c.fornecedor_nome}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleImportar(c)}
                          className="p-2.5 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-95 border border-emerald-600/20"
                          title="Importar Contrato"
                        >
                          <ArrowDownTrayIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : !loading && (
          <div className="p-12 text-center border-2 border-dashed border-border rounded-3xl opacity-40">
             <GlobeAltIcon className="w-16 h-16 mx-auto mb-4" />
             <p className="font-bold text-sm">Insira uma UG e clique em consultar para listar os contratos disponíveis no portal da transparência.</p>
          </div>
        )}
      </div>
    </Modal>
  )
}