import { api } from "./api";

export async function listarPermissions() {
  const res = await api.get("/permissions");
  return res;
}

export async function salvarPermissoes(roleId, permissoes) {
  const res = await api.post(`/permissions/role/${roleId}`, {
    permissoes
  });

  return res.data;
}