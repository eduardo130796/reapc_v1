import { useEffect, useState, useMemo, useCallback } from "react";
import {
  listarUsuarios,
  atribuirRole,
  criarUsuario
} from "../../services/usuariosService";
import { listarRoles } from "../../services/rolesService";
import { toast } from "react-hot-toast";
import {
  ArrowPathIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import UsuarioModal from "../../components/ui/UsuarioModal";
import { excluirUsuario } from "../../services/usuariosService";

function Card({ title, value, color = "blue" }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className={`text-2xl font-bold text-${color}-600`}>
        {value}
      </p>
    </div>
  );
}

export default function UsuariosTab() {

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [busca, setBusca] = useState("");
  const [filtroRole, setFiltroRole] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  console.log(usuarios)
  console.log(roles)
  // =========================
  // LOAD
  // =========================

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([
        listarUsuarios(),
        listarRoles()
      ]);

      setUsuarios(u?.data || []);
      setRoles(r?.data || []);

    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar usuários");
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
    setUsuarioSelecionado(null);
    setOpenModal(true);
  }

  function abrirEdicao(user) {
    setUsuarioSelecionado(user);
    setOpenModal(true);
  }
  const userId = localStorage.getItem("user_id");

  // =========================
  // SAVE
  // =========================

  async function salvar(form) {
    try {

      if (usuarioSelecionado) {
        await atribuirRole(usuarioSelecionado.id, form.role_id);
        toast.success("Usuário atualizado com sucesso");
      } else {
        await criarUsuario(form);
        toast.success("Usuário criado com sucesso");
      }

      setOpenModal(false);
      carregar();

    } catch (err) {
      toast.error(err || "Erro ao salvar usuário");
    }
  }

  // =========================
  // FILTER
  // =========================

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(u => {

      const matchBusca =
        !busca ||
        u.email?.toLowerCase().includes(busca.toLowerCase()) ||
        u.nome?.toLowerCase().includes(busca.toLowerCase());

      const matchRole =
        !filtroRole || u.role_id === filtroRole;

      return matchBusca && matchRole;

    });
  }, [usuarios, busca, filtroRole]);

  // =========================
  // STATS
  // =========================

  const total = usuarios.length;
  const ativos = usuarios.filter(u => u.ativo).length;
  const inativos = total - ativos;

  return (
    <>

      {/* HEADER */}
      <section className="mb-10 flex items-center justify-between gap-4">

        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Usuários
          </h1>
          <p className="text-slate-500">
            Gerencie acessos, roles e permissões do sistema
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={handleRefresh}
            className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition"
            disabled={refreshing || loading}
          >
            <ArrowPathIcon className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={abrirNovo}
            className="flex items-center gap-2 px-4 h-10 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            Novo usuário
          </button>

        </div>

      </section>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card title="Total" value={total} />
        <Card title="Ativos" value={ativos} color="green" />
        <Card title="Inativos" value={inativos} color="gray" />
      </div>

      {/* FILTROS */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">

        <input
          placeholder="Buscar por nome ou email..."
          className="flex-1 border border-slate-300 rounded-lg px-4 py-2"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <select
          className="border border-slate-300 rounded-lg px-4 py-2"
          value={filtroRole}
          onChange={(e) => setFiltroRole(e.target.value)}
        >
          <option value="">Todas as roles</option>
          {roles.map(r => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

      </div>

      {/* TABELA */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">

        {loading ? (
          <div className="py-20 text-center text-slate-500">
            Carregando usuários...
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            Nenhum usuário encontrado
          </div>
        ) : (

          <table className="w-full">

            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-3 text-left">Usuário</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>

              {usuariosFiltrados.map((u, idx) => (

                <tr key={u.id}
                  className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100 transition`}
                >

                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        {u.nome || "Sem nome"}
                      </span>
                      <span className="text-sm text-slate-500">
                        {u.email}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {
                      roles.find(r => r.id === u.role_id)?.name || "-"
                    }
                  </td>

                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium
                      ${u.ativo
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {u.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right flex justify-end gap-1">

                    <button
                      onClick={() => abrirEdicao(u)}
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>


                  </td>
                  <td>
                    {u.id !== userId && (
                      <button
                        onClick={async () => {
                          if (!confirm("Deseja excluir este usuário?")) return;

                          try {
                            await excluirUsuario(u.id);
                            toast.success("Usuário excluído");
                            carregar();
                          } catch (e) {
                            toast.error(e);
                          }
                        }}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Excluir
                      </button>)}
                  </td>
                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

      {/* MODAL */}
      <UsuarioModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={salvar}
        roles={roles}
        initialData={usuarioSelecionado}
      />

    </>
  );
}