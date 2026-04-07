# app/core/dependencies.py

from fastapi import Depends, HTTPException
from app.core.security import get_current_user


def require_role(role: str):

    def checker(user = Depends(get_current_user)):
        if user["role"] != role:
            raise HTTPException(403, "Acesso negado")
        return user

    return checker


def require_permission(resource: str, action: str):

    def checker(user = Depends(get_current_user)):

        if any(
            p["resource"] == "*" or p["action"] == "*"
            for p in user["permissions"]
        ):
            return user

        permitido = any(
            p["resource"] == resource and p["action"] == action
            for p in user["permissions"]
        )

        if not permitido:
            raise HTTPException(403, "Permissão negada")

        return user

    return checker