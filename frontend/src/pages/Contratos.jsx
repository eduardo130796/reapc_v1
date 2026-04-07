import { useEffect, useState, useCallback, useMemo } from "react";
import MainLayout from "../layouts/MainLayout";
import BuscarContratoAPI from "../components/contratos/BuscarContratoAPI";
import EditarContratoModal from "../components/contratos/EditarContratoModal";
import { useNavigate } from "react-router-dom";
import {
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline";
import {
  listarContratos,
  excluirContrato
} from "../services/contratosService";
import { useAuth } from "../contexts/AuthContext";

export default function Contratos() {

  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBuscar, setShowBuscar] = useState(false);
  const [contratoEditar, setContratoEditar] = useState(null);
  const [busca, setBusca] = useState("");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.permissions?.includes("*");

  const navigate = useNavigate();

  // =========================
  // LOAD
  // =========================

  const carregarContratos = useCallback(async () => {
    setLoading(true);

    try {
      const data = await listarContratos();
      setContratos(data || []);
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
      alert("Erro ao excluir contrato");
    }
  }

  // =========================
  // FILTRO
  // =========================

  const contratosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase();

    return (contratos || []).filter(c => {
      return (
        (c.numero || "").toLowerCase().includes(termo) ||
        (c.fornecedor_nome || "").toLowerCase().includes(termo)
      );
    });
  }, [contratos, busca]);

  // =========================
  // UI
  // =========================

  return (

    <MainLayout title="Contratos">

      {/* HEADER */}
      <section className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Contratos
          </h1>

          <p className="text-slate-500">
            Clique em um contrato para visualizar detalhes e repactuação
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={handleRefresh}
            className="h-10 w-10 flex items-center justify-center border rounded-lg"
            disabled={refreshing || loading}
          >
            <ArrowPathIcon className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowBuscar(true)}
              className="flex items-center gap-2 px-4 h-10 bg-blue-600 text-white rounded-lg"
            >
              <PlusIcon className="w-5 h-5" />
              Importar contratos
            </button>
          )}

        </div>

      </section>

      {/* BUSCA */}
      <div className="mb-6 relative max-w-md">

        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />

        <input
          placeholder="Buscar por número ou fornecedor..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border overflow-hidden">

        {loading ? (
          
          <div className="p-10 text-center text-slate-400 animate-pulse">
            Buscando contratos...
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-slate-800">

              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left">Número</th>
                  <th className="px-4 py-3 text-left">Fornecedor</th>
                  <th className="px-4 py-3 text-left">Vigência</th>
                  <th className="px-4 py-3 text-left">Valor Global</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>

              <tbody>

                {contratosFiltrados.map((c, idx) => (

                  <tr
                    key={c.id}
                    onClick={() => navigate(`/contratos/${c.id}`)}
                    className={`
                      group
                      ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                      hover:bg-blue-50
                      transition
                      cursor-pointer
                    `}
                  >

                    <td className="px-6 py-4 font-medium">
                      {c.numero || "-"}
                    </td>

                    <td className="px-4 py-4">
                      {c.fornecedor_nome || "-"}
                    </td>

                    <td className="px-4 py-4">
                      {(c.vigencia_inicio || "-")} → {(c.vigencia_fim || "-")}
                    </td>

                    <td className="px-4 py-4">
                      R$ {Number(c.valor_global || 0).toLocaleString("pt-BR")}
                    </td>

                    <td className="px-4 py-4 text-right">

                      <div className="flex items-center justify-end gap-2">

                        <span className="text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition">
                          Ver detalhes →
                        </span>

                        {isAdmin && (
                          <>
                            {/* EDITAR */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setContratoEditar(c);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>

                            {/* EXCLUIR */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExcluir(c.id);
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                              title="Excluir"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* MODAL */}
      {showBuscar && (
        <BuscarContratoAPI
          onClose={() => setShowBuscar(false)}
          onImport={carregarContratos}
        />
      )}
      {contratoEditar && (
        <EditarContratoModal
          contrato={contratoEditar}
          onClose={() => setContratoEditar(null)}
          onSuccess={carregarContratos}
        />
      )}
    </MainLayout>
  );
}