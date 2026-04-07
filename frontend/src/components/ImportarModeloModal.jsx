import { useState } from "react"
import { importarModelo } from "../services/modelosService"
import { toast } from "react-hot-toast"

const ImportarModeloModal = ({ onClose, onSuccess }) => {
  // Estado para campos do formulário
  const [nome, setNome] = useState("")
  const [json, setJson] = useState("")
  const [loading, setLoading] = useState(false)

  // Manipula upload de arquivo JSON
  const handleCarregarArquivo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => setJson(event.target.result)
    reader.readAsText(file)
  }

  // Manipula importação do modelo
  const handleImportar = async () => {
    setLoading(true)
    try {
      const estrutura = JSON.parse(json)
      await importarModelo({
        nome: nome.trim(),
        estrutura,
      })
      toast.success("Modelo importado com sucesso")
      onSuccess?.()
      onClose?.()
    } catch (err) {
      // Feedback amigável em caso de JSON inválido ou erro de importação
      toast.error(
        err instanceof SyntaxError
          ? "JSON inválido"
          : "Erro ao importar modelo"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    // Overlay do modal
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {/* Container centralizado do modal */}
      <div className="bg-white rounded-xl shadow-lg p-6 w-[600px]">
        <h2 className="text-xl font-semibold mb-6">Importar Modelo</h2>
        {/* Campo: Nome do modelo */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nome do Modelo
          </label>
          <input
            className="border border-slate-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nome do modelo"
            value={nome}
            onChange={e => setNome(e.target.value)}
            disabled={loading}
            maxLength={120}
            autoFocus
          />
        </div>
        {/* Upload de arquivo JSON */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Arquivo JSON
          </label>
          <input
            type="file"
            accept=".json"
            onChange={handleCarregarArquivo}
            disabled={loading}
            className="block w-full text-sm border border-slate-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200"
          />
        </div>
        {/* Campo: JSON */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Estrutura JSON
          </label>
          <textarea
            className="border border-slate-300 rounded-lg px-3 py-2 w-full h-64 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cole o JSON ou carregue o arquivo"
            value={json}
            onChange={e => setJson(e.target.value)}
            disabled={loading}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
        {/* Botões de ação */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleImportar}
            disabled={!nome.trim() || !json || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium"
          >
            {loading ? "Importando..." : "Importar"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImportarModeloModal