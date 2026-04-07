# app/core/security.py

from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, ExpiredSignatureError, JWTError
from jose.utils import base64url_decode
import requests
import os
from app.database.client import supabase, supabase_admin
from jose.exceptions import JWTError
import json

security = HTTPBearer(auto_error=False)

SUPABASE_URL = "https://meeqcmusmshqcsugnwov.supabase.co"
JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
_jwks_cache = None


def get_jwks():
    global _jwks_cache

    if _jwks_cache:
        return _jwks_cache

    res = requests.get(JWKS_URL, timeout=5)
    res.raise_for_status()

    _jwks_cache = res.json()
    return _jwks_cache

def verify_token(token: str):
    jwks = get_jwks()

    headers = jwt.get_unverified_header(token)
    kid = headers.get("kid")

    key = next((k for k in jwks["keys"] if k["kid"] == kid), None)

    if not key:
        raise HTTPException(401, "Chave JWT não encontrada")

    try:
        payload = jwt.decode(
            token,
            key,
            algorithms=["ES256"],
            options={"verify_aud": False}
        )
        return payload

    except JWTError as e:
        print("ERRO JWT:", str(e))  # 🔥 importante pra debug
        raise HTTPException(401, "Token inválido")

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if not credentials:
        raise HTTPException(401, "Token não enviado")

    token = credentials.credentials
    payload = verify_token(token)

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(401, "Token inválido")

    # 🔥 buscar usuário + role + permissions
    profile = supabase.table("users_profile") \
        .select("id, email, role_id") \
        .eq("id", user_id) \
        .execute()

    if not profile.data:
        raise HTTPException(403, "Usuário não tem profile")

    profile = profile.data[0]

    role = supabase.table("roles") \
        .select("name") \
        .eq("id", profile["role_id"]) \
        .execute()

    if not role.data:
        raise HTTPException(403, "Usuário sem role válida")

    role_name = role.data[0]["name"]

     # 🔍 permissions
    perms_res = supabase.table("role_permissions") \
        .select("permission:permission_id(resource, action)") \
        .eq("role_id", profile["role_id"]) \
        .execute()

    permissions = [
        {
            "resource": p["permission"]["resource"],
            "action": p["permission"]["action"]
        }
        for p in perms_res.data
    ] if perms_res.data else []
    return {
        "id": user_id,
        "email": profile["email"],
        "role": role_name,
        "permissions": permissions
    }