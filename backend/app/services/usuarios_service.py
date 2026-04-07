from fastapi import HTTPException
from app.core.response import success
from app.repositories import usuarios_repository as repo
from app.services.audit_service import registrar_log
from app.database.client import supabase_admin


ENTITY = "usuarios"


# =========================
# LISTAR USUÁRIOS
# =========================
def listar_usuarios_service(user):

    usuarios = repo.listar()

    # 🔥 ROLES
    roles = supabase_admin.table("roles").select("id, name").execute().data
    roles_map = {r["id"]: r["name"] for r in roles}

    # 🔥 AUTH USERS (EMAIL)
    auth_users = supabase_admin.auth.admin.list_users()

    auth_map = {
        u.id: getattr(u, "email", None)
        for u in auth_users
    }

    result = []

    for u in usuarios:

        user_id = u.get("id")

        result.append({
            "id": user_id,
            "email": auth_map.get(user_id),  # 🔥 CORRETO
            "nome": u.get("nome"),
            "role_id": u.get("role_id"),
            "role": roles_map.get(u.get("role_id")),
            "ativo": u.get("ativo", True),
            "created_at": u.get("created_at")
        })

    return success(result)


# =========================
# CRIAR USUÁRIO
# =========================
def criar_usuario_service(payload, user):

    # 🔐 CRIA NO AUTH
    auth_user = supabase_admin.auth.admin.create_user({
        "email": payload.email,
        "password": payload.password,
        "email_confirm": True
    })

    if not auth_user.user:
        raise HTTPException(400, "Erro ao criar usuário no Auth")

    user_id = auth_user.user.id

    # 📄 CRIA NA TABELA
    data = repo.inserir({
        "id": user_id,
        "nome": payload.nome,
        "role_id": payload.role_id,
        "ativo": True
    })

    registrar_log(user["id"], "create", ENTITY, user_id, data)

    return success({
        "id": user_id,
        "email": payload.email,
        "nome": payload.nome,
        "role_id": payload.role_id,
        "ativo": True
    }, "Usuário criado")


# =========================
# ATUALIZAR ROLE
# =========================
def atualizar_role_service(user_id: str, role_id: str, user):

    usuario = repo.buscar_por_id(user_id)

    if not usuario:
        raise HTTPException(404, "Usuário não encontrado")

    data = repo.atualizar_role(user_id, role_id)

    registrar_log(
        user["id"],
        "update_role",
        ENTITY,
        user_id,
        {"role_id": role_id}
    )


# =========================
# ATUALIZAR PERFIL (USER SELF-SERVICE)
# =========================
def atualizar_perfil_service(user_id: str, payload, current_user):
    
    if user_id != current_user["id"]:
        raise HTTPException(403, "Você não tem permissão para alterar este perfil")

    data_to_update = {}
    if payload.nome:
        data_to_update["nome"] = payload.nome

    if data_to_update:
        repo.atualizar(user_id, data_to_update)

    if payload.password:
        supabase_admin.auth.admin.update_user_by_id(
            user_id,
            {"password": payload.password}
        )

    registrar_log(
        user_id,
        "update_profile",
        ENTITY,
        user_id,
        {"updated_fields": list(data_to_update.keys()) + (["password"] if payload.password else [])}
    )

    # Buscar dados atualizados
    usuario_atualizado = repo.buscar_por_id(user_id)
    
    return success({
        "id": user_id,
        "nome": usuario_atualizado.get("nome"),
    }, "Perfil atualizado com sucesso")