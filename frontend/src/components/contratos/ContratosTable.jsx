import { useEffect, useState } from "react"
import { listarContratos } from "../../services/contratosService"

export default function ContratosTable() {

  const [contratos, setContratos] = useState([])
  const [loading, setLoading] = useState(true)

  async function carregarContratos() {

    try {

      const data = await listarContratos()

      setContratos(data)

    } catch (err) {

      console.error(err)

    }

    setLoading(false)

  }

  useEffect(() => {

    carregarContratos()

  }, [])

  if (loading) return <p>Carregando...</p>

  return (

    <table className="w-full">

      <thead>
        <tr>
          <th>Número</th>
          <th>Fornecedor</th>
          <th>Vigência</th>
          <th>Valor</th>
        </tr>
      </thead>

      <tbody>

        {contratos.map(c => (

          <tr key={c.id}>

            <td>{c.numero}</td>

            <td>{c.fornecedor_nome}</td>

            <td>
              {c.vigencia_inicio} → {c.vigencia_fim}
            </td>

            <td>
              R$ {Number(c.valor_global).toLocaleString("pt-BR")}
            </td>

          </tr>

        ))}

      </tbody>

    </table>

  )

}