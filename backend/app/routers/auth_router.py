from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.services.auth_service import me_service
from app.schemas.usuarios_schema import UsuarioUpdate
from app.services.usuarios_service import atualizar_perfil_service

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get("/me")
def me(user=Depends(get_current_user)):
    return me_service(user["id"])


@router.put("/me")
def update_me(payload: UsuarioUpdate, user=Depends(get_current_user)):
    return atualizar_perfil_service(user["id"], payload, user)