import { useState } from "react"
import { buscarContratosAPI, criarContrato } from "../../services/contratosService"
import { toast } from "react-hot-toast"

export default function BuscarContratoAPI({ onClose }) {

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

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-[900px] max-h-[85vh] overflow-auto rounded-xl p-6 shadow-xl">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-lg font-semibold">
            Importar contrato da API
          </h2>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-black"
          >
            ✕
          </button>

        </div>

        {/* BUSCA UG */}

        <div className="flex gap-3 mb-6">

          <input
            value={ug}
            onChange={e => setUg(e.target.value)}
            className="border rounded-lg px-3 py-2 w-40"
          />

          <button
            onClick={handleBuscar}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Buscando..." : "Buscar contratos"}
          </button>

        </div>

        {/* CAMPO PESQUISA */}

        {contratos.length > 0 && (

          <input
            placeholder="Buscar contrato ou fornecedor..."
            className="border rounded-lg px-3 py-2 w-full mb-4"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />

        )}

        {/* TABELA */}

        {contratos.length > 0 && (

          <div className="border rounded-lg overflow-hidden">

            <table className="w-full text-sm">

              <thead className="bg-slate-50">

                <tr className="text-left">

                  <th className="p-3">Número</th>
                  <th className="p-3">Fornecedor</th>
                  <th className="p-3">Vigência</th>
                  <th className="p-3">Valor</th>
                  <th className="p-3"></th>

                </tr>

              </thead>

              <tbody>

                {contratosFiltrados.map(c => (

                  <tr key={c.id_api} className="border-t">

                    <td className="p-3 font-medium">
                      {c.numero}
                    </td>

                    <td className="p-3">
                      {c.fornecedor_nome}
                    </td>

                    <td className="p-3">
                      {c.vigencia_inicio} → {c.vigencia_fim}
                    </td>

                    <td className="p-3">
                      R$ {Number(c.valor_global || 0).toLocaleString("pt-BR")}
                    </td>

                    <td className="p-3 text-right">

                      <button
                        onClick={() => handleImportar(c)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Importar
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>

  )

}