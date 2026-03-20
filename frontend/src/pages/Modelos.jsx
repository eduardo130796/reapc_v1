import { useEffect, useState, useCallback } from "react";
import {
  listarModelos,
  excluirModelo
} from "../services/modelosService";
import MainLayout from "../layouts/MainLayout";
import ImportarModeloModal from "../components/ImportarModeloModal";
import EditarModeloModal from "../components/EditarModeloModal";
import {
  ArrowPathIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

function StatusPill({ ativo }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold 
      ${ativo ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-400"}`}
    >
      <span
        className={`h-2 w-2 rounded-full mr-2 ${
          ativo ? "bg-green-400" : "bg-slate-300"
        }`}
      />
      {ativo ? "Ativo" : "Inativo"}
    </span>
  );
}

export default function Modelos() {
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showImportar, setShowImportar] = useState(false);
  const [modeloEditar, setModeloEditar] = useState(null);

  const carregarModelos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarModelos();
      setModelos(data);
    } catch (err) {
      // Optionally add toast or snackbar for user feedback
      console.error("Erro ao carregar modelos", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarModelos();
  }, [carregarModelos]);

  async function handleExcluir(id) {
    if (!window.confirm("Deseja realmente excluir este modelo? Essa ação não pode ser desfeita.")) return;
    try {
      await excluirModelo(id);
      carregarModelos();
    } catch (err) {
      // Optionally add toast or snackbar for user feedback
      console.error("Erro ao excluir modelo", err);
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    carregarModelos();
  }

  return (
    <MainLayout title="Modelos PCFP">
      <section className="mb-10 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Modelos PCFP
          </h1>
          <span className="text-base text-slate-500 font-medium">
            Gerencie seus modelos de planilha de maneira simples e eficiente.
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Atualizar lista"
            disabled={refreshing || loading}
          >
            <ArrowPathIcon
              className={`w-5 h-5 transition-transform ${
                refreshing ? "animate-spin" : ""
              }`}
            />
          </button>
          <button
            onClick={() => setShowImportar(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <PlusIcon className="w-5 h-5" />
            Importar
          </button>
        </div>
      </section>

      <div className="mt-0 rounded-2xl shadow border border-slate-100 bg-white overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-blue-700/80 text-lg font-semibold flex flex-col items-center">
            <ArrowPathIcon className="w-7 h-7 animate-spin mb-2 text-blue-400" />
            Carregando modelos...
          </div>
        ) : modelos.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-base">
            Nenhum modelo cadastrado no momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-slate-800">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3 font-semibold text-left">Nome</th>
                  <th className="px-4 py-3 font-semibold text-left">Versão</th>
                  <th className="px-4 py-3 font-semibold text-left">Status</th>
                  <th className="px-4 py-3 font-semibold text-right min-w-[120px]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {modelos.map((m, idx) => (
                  <tr
                    key={m.id}
                    className={
                      idx % 2 === 0
                        ? "bg-white hover:bg-slate-50 transition"
                        : "bg-slate-50 hover:bg-slate-100 transition"
                    }
                  >
                    <td className="px-6 py-4 font-medium">{m.nome}</td>
                    <td className="px-4 py-4">v{m.versao}</td>
                    <td className="px-4 py-4">
                      <StatusPill ativo={m.ativo} />
                    </td>
                    <td className="px-4 py-4 text-right flex justify-end items-center gap-1 min-w-[120px]">
                      <button
                        onClick={() => setModeloEditar(m)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        title="Editar"
                        aria-label="Editar"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleExcluir(m.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                        title="Excluir"
                        aria-label="Excluir"
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

      {/* Importar Modelo Modal */}
      {showImportar && (
        <ImportarModeloModal
          onClose={() => setShowImportar(false)}
          onSuccess={() => {
            setShowImportar(false);
            carregarModelos();
          }}
        />
      )}

      {/* Editar Modelo Modal */}
      {modeloEditar && (
        <EditarModeloModal
          modelo={modeloEditar}
          onClose={() => setModeloEditar(null)}
          onSuccess={() => {
            setModeloEditar(null);
            carregarModelos();
          }}
        />
      )}
    </MainLayout>
  );
}