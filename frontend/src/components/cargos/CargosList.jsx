import { useEffect, useState, useCallback } from "react"
import {
  listarCargos,
  excluirCargo,
  importarCargos
} from "../../services/cargosService"

import {
  ArrowPathIcon,
  PlusIcon,
  TrashIcon
} from "@heroicons/react/24/outline"

export default function CargosList({ contratoId }) {

  const [cargos, setCargos] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listarCargos(contratoId)
      setCargos(data)
    } catch (err) {
      console.error("Erro ao carregar cargos", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [contratoId])

  useEffect(() => {
    if (contratoId) carregar()
  }, [contratoId, carregar])

  async function handleImportar() {
    try {
      await importarCargos(contratoId)
      carregar()
    } catch (err) {
      console.error(err)
      alert("Erro ao importar cargos")
    }
  }

  async function handleExcluir(id) {
    if (!window.confirm("Excluir cargo?")) return
    await excluirCargo(id)
    carregar()
  }

  function handleRefresh() {
    setRefreshing(true)
    carregar()
  }

  return (
    <div className="mt-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">

        <h2 className="text-xl font-bold">
          Cargos do Contrato
        </h2>

        <div className="flex gap-2">

          <button
            onClick={handleRefresh}
            className="h-10 w-10 flex items-center justify-center rounded-lg border"
          >
            <ArrowPathIcon className={`w-5 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleImportar}
            className="flex items-center gap-2 px-4 h-10 rounded-lg bg-blue-600 text-white"
          >
            <PlusIcon className="w-5" />
            Importar cargos
          </button>

        </div>

      </div>

      {/* TABELA */}
      <div className="rounded-xl border overflow-hidden">

        {loading ? (

          <div className="p-10 text-center">
            Carregando cargos...
          </div>

        ) : cargos.length === 0 ? (

          <div className="p-10 text-center text-slate-500">
            Nenhum cargo cadastrado
          </div>

        ) : (

          <table className="w-full text-sm">

            <thead className="bg-slate-50 text-left">

              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">Qtd</th>
                <th className="p-3">Valor</th>
                <th className="p-3 text-right">Ações</th>
              </tr>

            </thead>

            <tbody>

              {cargos.map((c, idx) => (

                <tr key={c.id} className="border-t">

                  <td className="p-3 font-medium">
                    {c.nome}
                  </td>

                  <td className="p-3">
                    {c.quantidade}
                  </td>

                  <td className="p-3">
                    R$ {Number(c.valor_unitario).toLocaleString("pt-BR")}
                  </td>

                  <td className="p-3 text-right">

                    <button
                      onClick={() => handleExcluir(c.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <TrashIcon className="w-5" />
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>
  )
}