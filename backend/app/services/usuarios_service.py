from fastapi import HTTPException
from app.core.response import success
from app.repositories import usuarios_repository as repo
from app.services.audit_service import registrar_log
from app.database.client import supabase_admin
from supabase_auth.errors import AuthApiError
from datetime import datetime


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

        result.append({
            "id": u.get("id"),
            "email": u.get("email"),  # ✅ CORRETO
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

    try:
        auth_user = supabase_admin.auth.admin.create_user({
            "email": payload.email,
            "password": payload.password,
            "email_confirm": True
        })

        # 🔥 AQUI ESTÁ O PONTO CRÍTICO
        auth_user_id = auth_user.user.id

    except AuthApiError as e:

        # 🔥 TRATAMENTO INTELIGENTE
        if "already been registered" in str(e):
            raise HTTPException(
                status_code=400,
                detail="Já existe um usuário com este email"
            )

        # fallback
        raise HTTPException(
            status_code=400,
            detail="Erro ao criar usuário no auth"
        )

        if not auth_user or not auth_user.user:
            raise HTTPException(400, "Erro ao criar usuário no Auth")

    user_id = auth_user.user.id

    # 📄 CRIA NA TABELA
    data = repo.inserir({
        "nome": payload.nome,
        "email": payload.email,
        "role_id": payload.role_id,
        "auth_user_id": auth_user_id,  # 🔥 OBRIGATÓRIO
        "ativo": True
    })

    registrar_log(
        user["id"],
        "create",
        ENTITY,
        data["id"],
        data
    )

    return success(data, "Usuário criado com sucesso")


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


# =========================
# ATUALIZAR USUÁRIO (ADMIN)
# =========================
def atualizar_usuario_service(user_id: str, payload, user):

    usuario = repo.buscar_por_id(user_id)

    if not usuario:
        raise HTTPException(404, "Usuário não encontrado")

    data_to_update = {}

    if payload.nome:
        data_to_update["nome"] = payload.nome

    if payload.role_id:
        data_to_update["role_id"] = payload.role_id

    if data_to_update:
        repo.atualizar(user_id, data_to_update)

    if payload.password:
        supabase_admin.auth.admin.update_user_by_id(
            user_id,
            {"password": payload.password}
        )

    registrar_log(
        user["id"],
        "update",
        ENTITY,
        user_id,
        data_to_update
    )

    return success({
        "id": user_id,
        "nome": data_to_update.get("nome", usuario.get("nome")),
        "role_id": data_to_update.get("role_id", usuario.get("role_id")),
    }, "Usuário atualizado com sucesso")


# =========================
# DELETAR USUÁRIO (ADMIN)
# =========================
def excluir_usuario_service(user_id: str, user):

    usuario = repo.buscar_por_id(user_id)

    if not usuario:
        raise HTTPException(404, "Usuário não encontrado")

    auth_user_id = usuario.get("auth_user_id")

    # =========================
    # 1. DELETAR DA TABELA (PRIMEIRO)
    # =========================
    repo.deletar(user_id)

    # =========================
    # 2. DELETAR DO AUTH
    # =========================
    try:
        if auth_user_id:
            supabase_admin.auth.admin.delete_user(auth_user_id)
    except Exception as e:
        print("Erro ao deletar no auth:", e)

    # =========================
    # 3. LOG
    # =========================
    registrar_log(
        user["id"],
        "delete",
        ENTITY,
        user_id,
        {"auth_user_id": auth_user_id}
    )

    return success(None, "Usuário excluído com sucesso")
