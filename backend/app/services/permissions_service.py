from app.core.response import success
from app.core.cache import clear_cache

from app.repositories import permissions_repository as repo
from app.services.audit_service import registrar_log


ENTITY = "permissions"


# =========================
# LISTAR
# =========================

def listar_permissions_service(user):
    data = repo.listar()
    return success(data)


# =========================
# CRIAR
# =========================

def criar_permission_service(payload, user):

    data = repo.inserir(payload.model_dump())

    registrar_log(
        user["id"],
        "create",
        ENTITY,
        data["id"],
        data
    )

    return success(data, "Permission criada")


# =========================
# SALVAR PERMISSÕES DA ROLE
# =========================

def salvar_role_permissions_service(role_id: str, permissoes: list, user):

    # 🔥 salva no banco
    repo.salvar_role_permissions(role_id, permissoes)

    # 🔥 log
    registrar_log(
        user["id"],
        "update_permissions",
        "roles",
        role_id,
        permissoes
    )

    # 🔥 invalida cache (simples e suficiente)
    _clear_role_cache(role_id)

    return success(message="Permissões atualizadas")


# =========================
# CACHE INVALIDATION
# =========================

def _clear_role_cache(role_id: str):
    """
    Estratégia simples:
    limpa todos os usuários daquela role
    """

    try:

        usuarios = repo.get_users_by_role(role_id)

        for u in usuarios:
            clear_cache(f"user_permissions:{u['auth_user_id']}")

    except Exception as e:
        print("Erro ao limpar cache:", e)