import { useState, useEffect, useMemo } from "react";
import { criarRole } from "../../services/rolesService";
import { salvarPermissoes } from "../../services/permissionsService";
import PermissionsMatrix from "./PermissionsMatrix";
import { toast } from "react-hot-toast";

// =========================
// NORMALIZADOR (CORE)
// =========================

function normalizePermission(p) {
  if (!p) return null;

  if (typeof p === "string") return p;

  if (p.name) return p.name;

  if (p.resource && p.action) {
    return `${p.resource}.${p.action}`;
  }

  console.warn("Permissão inválida:", p);
  return null;
}

export default function RoleModal({
  open,
  onClose,
  role,
  permissions = [],
  onSuccess
}) {

  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  // =========================
  // INIT / LOAD
  // =========================

  useEffect(() => {

    if (role) {

      setName(role.name || "");

      setSelected(
        (role.permissions || [])
          .map(normalizePermission)
          .filter(Boolean)
      );

    } else {

      setName("");
      setSelected([]);

    }

  }, [role]);

  // =========================
  // DERIVADOS
  // =========================

  const isEdit = !!role;

  const isValid = useMemo(() => {
    return name.trim().length > 0;
  }, [name]);

  // =========================
  // SAVE
  // =========================

  async function handleSave() {

    if (!isValid) {
      toast.error("Informe o nome da role");
      return;
    }

    setLoading(true);

    try {

      let roleId = role?.id;

      // 🔥 CREATE
      if (!role) {

        const created = await criarRole({
          name: name.trim()
        });

        roleId = created.id;

      }

      // 🔥 SALVAR PERMISSÕES
      await salvarPermissoes(roleId, selected);

      toast.success(
        isEdit
          ? "Role atualizada com sucesso"
          : "Role criada com sucesso"
      );

      onSuccess?.();
      onClose();

    } catch (err) {

      console.error(err);

      toast.error(
        typeof err === "string"
          ? err
          : "Erro ao salvar role"
      );

    } finally {
      setLoading(false);
    }

  }

  // =========================
  // CLOSE HANDLER
  // =========================

  function handleClose() {
    if (loading) return; // evita fechar no meio do save
    onClose();
  }

  if (!open) return null;

  // =========================
  // UI
  // =========================

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl shadow-lg p-6 w-[720px] max-h-[90vh] flex flex-col">

        {/* HEADER */}
        <div className="mb-6">

          <h2 className="text-xl font-semibold text-slate-900">
            {isEdit ? "Editar Role" : "Nova Role"}
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Configure permissões de acesso do sistema
          </p>

        </div>

        {/* FORM */}
        <div className="flex flex-col gap-4">

          {/* NOME */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome da Role
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Administrador"
              disabled={loading}
              className="border border-slate-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>

        {/* MATRIX */}
        <div className="mt-6 flex-1 overflow-hidden">

          <PermissionsMatrix
            permissions={permissions}
            selected={selected}
            onChange={setSelected}
          />

        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t">

          <span className="text-xs text-slate-400">
            {selected.length} permissões selecionadas
          </span>

          <div className="flex gap-2">

            <button
              onClick={handleClose}
              disabled={loading}
              className="border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50"
            >
              Cancelar
            </button>

            <button
              onClick={handleSave}
              disabled={!isValid || loading}
              className={`
                px-4 py-2 rounded-lg text-white font-medium
                ${loading || !isValid
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
                }
              `}
            >
              {loading
                ? "Salvando..."
                : isEdit
                  ? "Salvar alterações"
                  : "Criar role"
              }
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}