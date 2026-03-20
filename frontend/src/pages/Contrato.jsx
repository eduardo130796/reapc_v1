import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import MainLayout from "../layouts/MainLayout"
import ContratoHeader from "../components/contratos/ContratoHeader"
import ContratoTabs from "../components/contratos/ContratoTabs"

import { buscarContrato } from "../services/contratosService"

export default function Contrato() {

  const { id } = useParams()

  const [contrato, setContrato] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aba, setAba] = useState("cargos")

  useEffect(() => {

    const carregar = async () => {

      if (!id) return

      try {

        const data = await buscarContrato(id)

        setContrato(data || null)

      } catch (e) {

        console.error("Erro ao carregar contrato:", e)

      } finally {

        setLoading(false)

      }

    }

    carregar()

  }, [id])

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <MainLayout>
        <div className="p-10 text-slate-500">
          Carregando contrato...
        </div>
      </MainLayout>
    )
  }

  // =========================
  // NÃO ENCONTRADO
  // =========================

  if (!contrato) {
    return (
      <MainLayout>
        <div className="p-10 text-red-500">
          Contrato não encontrado
        </div>
      </MainLayout>
    )
  }

  // =========================
  // TELA PRINCIPAL
  // =========================

  return (

    <MainLayout>

      {/* HEADER DO CONTRATO */}
      <ContratoHeader contrato={contrato} />

      {/* TABS (CARGOS / PCFP) */}
      <ContratoTabs
        aba={aba}
        setAba={setAba}
        contratoId={contrato.id}
      />

    </MainLayout>

  )

}