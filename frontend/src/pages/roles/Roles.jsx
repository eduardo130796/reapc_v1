import { useEffect, useState, useCallback } from "react";
import MainLayout from "../../layouts/MainLayout";
import {
  listarRoles
} from "../../services/rolesService";
import { listarPermissions } from "../../services/permissionsService";

import {
  ArrowPathIcon,
  PlusIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline";

import RoleModal from "../../components/roles/RoleModal";

export default function Roles() {

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [roleSelecionada, setRoleSelecionada] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);

    try {

      const [r, p] = await Promise.all([
        listarRoles(),
        listarPermissions()
      ]);

      setRoles(r || []);
      setPermissions(p || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }

  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function handleRefresh() {
    setRefreshing(true);
    carregar();
  }

  function abrirNovo() {
    setRoleSelecionada(null);
    setOpenModal(true);
  }

  function abrirEdicao(role) {
    setRoleSelecionada(role);
    setOpenModal(true);
  }

  return (
    <MainLayout title="Roles & Permissões">

      {/* HEADER */}
      <section className="mb-10 flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Roles & Permissões
          </h1>
          <p className="text-slate-500">
            Controle de acesso do sistema
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={handleRefresh}
            className="h-10 w-10 flex items-center justify-center border rounded-lg"
          >
            <ArrowPathIcon className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={abrirNovo}
            className="flex items-center gap-2 px-4 h-10 bg-blue-600 text-white rounded-lg"
          >
            <PlusIcon className="w-5 h-5" />
            Nova role
          </button>

        </div>

      </section>

      {/* TABELA */}
      <div className="bg-white rounded-2xl border overflow-hidden">

        {loading ? (
          <div className="p-10 text-center">Carregando...</div>
        ) : (

          <table className="w-full">

            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="p-4 text-left">Nome</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>

              {roles.map((r, idx) => (

                <tr key={r.id}
                  className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100`}
                >

                  <td className="p-4 font-medium">
                    {r.name}
                  </td>

                  <td className="p-4 text-right">

                    <button
                      onClick={() => abrirEdicao(r)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

      <RoleModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        role={roleSelecionada}
        permissions={permissions}
        onSuccess={carregar}
      />

    </MainLayout>
  );
}