import { useEffect, useState, useCallback } from "react";
import MainLayout from "../layouts/MainLayout";
import BuscarContratoAPI from "../components/contratos/BuscarContratoAPI";
import { useNavigate } from "react-router-dom";
import {ArrowPathIcon,PlusIcon,PencilSquareIcon,TrashIcon,} from "@heroicons/react/24/outline";
import {
  listarContratos,
  excluirContrato
} from "../services/contratosService";

export default function Contratos() {

  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const [showBuscar, setShowBuscar] = useState(false);

  const carregarContratos = useCallback(async () => {

    setLoading(true);

    try {

      const data = await listarContratos();

      setContratos(data);

    } catch (err) {

      console.error("Erro ao carregar contratos", err);

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  }, []);

  useEffect(() => {
    carregarContratos();
  }, [carregarContratos]);

  function handleRefresh() {
    setRefreshing(true);
    carregarContratos();
  }

  async function handleExcluir(id) {

    if (!confirm("Deseja realmente excluir este contrato?")) return;

    try {

      await excluirContrato(id);

      carregarContratos();

    } catch (err) {

      console.error("Erro ao excluir contrato", err);

    }

  }

  return (

    <MainLayout title="Contratos">

      <section className="mb-10 flex items-center justify-between gap-4">

        <div className="flex flex-col gap-0.5">

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Contratos
          </h1>

          <span className="text-base text-slate-500 font-medium">
            Gerencie contratos cadastrados e suas repactuações
          </span>

        </div>

        <div className="flex gap-2">

          <button
            onClick={handleRefresh}
            className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition"
            disabled={refreshing || loading}
          >
            <ArrowPathIcon
              className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>

          <button
            onClick={() => setShowBuscar(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            Importar da API
          </button>

        </div>

      </section>

      <div className="rounded-2xl shadow border border-slate-100 bg-white overflow-hidden">

        {loading ? (

          <div className="py-20 text-center text-blue-700/80 text-lg font-semibold flex flex-col items-center">

            <ArrowPathIcon className="w-7 h-7 animate-spin mb-2 text-blue-400" />

            Carregando contratos...

          </div>

        ) : contratos.length === 0 ? (

          <div className="py-20 text-center text-slate-500 text-base">
            Nenhum contrato cadastrado.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full whitespace-nowrap text-slate-800">

              <thead>

                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">

                  <th className="px-6 py-3 text-left font-semibold">
                    Número
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Fornecedor
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Vigência
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Valor Global
                  </th>

                  <th className="px-4 py-3 text-right font-semibold">
                    Ações
                  </th>

                </tr>

              </thead>

              <tbody>

                {contratos.map((c, idx) => (

                  <tr
                    key={c.id}
                    onClick={() => navigate(`/contratos/${c.id}`)}
                    className={
                      idx % 2 === 0
                        ? "bg-white hover:bg-slate-50 transition cursor-pointer"
                        : "bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                    }
                  >

                    <td className="px-6 py-4 font-medium">
                      {c.numero}
                    </td>

                    <td className="px-4 py-4">
                      {c.fornecedor_nome}
                    </td>

                    <td className="px-4 py-4">
                      {c.vigencia_inicio} → {c.vigencia_fim}
                    </td>

                    <td className="px-4 py-4">
                      R$ {Number(c.valor_global).toLocaleString("pt-BR")}
                    </td>

                    <td className="px-4 py-4 text-right flex justify-end gap-1">

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/contratos/${c.id}`);
                        }}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                        title="Editar"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>

                      <button
                        onClick={async () => {

                          if (!confirm("Deseja realmente excluir este contrato?")) return

                          try {

                            await excluirContrato(c.id)

                            carregarContratos()

                          } catch (err) {

                            console.error(err)
                            alert("Erro ao excluir contrato")

                          }

                        }}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                        title="Excluir"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {showBuscar && (
        <BuscarContratoAPI
          onClose={() => setShowBuscar(false)}
          onImport={carregarContratos}
        />
      )}

    </MainLayout>

  );
}