from fastapi import HTTPException
from app.database.client import supabase
from app.core.response import success
from app.core.cache import get_cache, set_cache

from app.repositories.usuarios_repository import get_usuario_by_auth_id, criar_usuario
from app.repositories.roles_repository import get_role_by_id
from app.repositories.permissions_repository import get_permissions_by_role


# =========================
# LOGIN (AUTH ONLY)
# =========================

def login_service(email: str, password: str):

    try:
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
    except Exception:
        raise HTTPException(401, "Erro na autenticação")

    if not response.user or not response.session:
        raise HTTPException(401, "Credenciais inválidas")

    auth_user = response.user

    # =========================
    # 🔥 SINCRONIZAÇÃO
    # =========================

    usuario = get_usuario_by_auth_id(auth_user.id)

    if not usuario:
        # 🔥 cria automaticamente
        usuario = criar_usuario({
            "auth_user_id": auth_user.id,
            "nome": auth_user.email,  # ou outro campo
            "role": "e5395575-38d2-4d76-8d64-6b03f9e928f7",  # padrão
            "ativo": True
        })

    # =========================
    # RESPONSE
    # =========================

    return {
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token,
        "user": {
            "id": auth_user.id,
            "email": auth_user.email
        }
    }


def refresh_token_service(refresh_token: str):
    try:
        response = supabase.auth.refresh_session(refresh_token)
    except Exception:
        raise HTTPException(401, "Erro ao atualizar token")

    if not response.session:
        raise HTTPException(401, "Sessão inválida")

    return {
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token
    }


# =========================
# NORMALIZA PERMISSÕES
# =========================

def _normalize_permissions(permissions):

    result = []

    for p in permissions:

        if not p:
            continue

        resource = p.get("resource")
        action = p.get("action")

        if resource and action:
            result.append(f"{resource}.{action}")

    return result


# =========================
# ME (AUTHZ + CACHE)
# =========================

def me_service(auth_user_id: str):

    cache_key = f"user_permissions:{auth_user_id}"

    # =========================
    # 🔥 CACHE (Desativado temporariamente para aplicar novas roles)
    # =========================
    # cached = get_cache(cache_key)
    # if cached:
    #    return success(cached, "Usuário carregado (cache)")

    # =========================
    # USER
    # =========================

    usuario = get_usuario_by_auth_id(auth_user_id)

    if not usuario:
        raise HTTPException(404, "Usuário não encontrado")

    # =========================
    # ROLE
    # =========================

    role = get_role_by_id(usuario.get("role_id"))

    if not role:
        raise HTTPException(404, "Role não encontrada")

    # =========================
    # PERMISSIONS
    # =========================

    permissions = get_permissions_by_role(role["id"])

    permissions_list = _normalize_permissions(permissions)

    # 🔥 wildcard simples (opcional)
    if role["name"] == "admin":
        permissions_list.append("*")

    # =========================
    # RESULT
    # =========================

    result = {
        "id": usuario["id"],
        "nome": usuario.get("nome"),
        "email": usuario.get("nome"), # Fallback
        "role": role["name"],
        "permissions": permissions_list
    }

    # 🔥 CACHE (5 min)
    set_cache(cache_key, result, ttl=300)

    return success(result, "Usuário carregado")