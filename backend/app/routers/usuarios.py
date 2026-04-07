from fastapi import APIRouter, Depends
from app.schemas.usuarios_schema import UsuarioCreate
from app.services.usuarios_service import *
from app.core.dependencies import require_role

router = APIRouter()


@router.get("/")
def listar(user = Depends(require_role("admin"))):
    return listar_usuarios_service(user)


@router.post("/")
def criar(payload: UsuarioCreate, user = Depends(require_role("admin"))):
    return criar_usuario_service(payload, user)


@router.put("/{user_id}/role")
def atualizar_role(
    user_id: str,
    role_id: str,
    user = Depends(require_role("admin"))
):
    return atualizar_role_service(user_id, role_id, user)