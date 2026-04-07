from fastapi import APIRouter, Depends
from app.schemas.roles_schema import RoleCreate
from app.services.roles_service import *
from app.core.dependencies import require_role

router = APIRouter()


@router.get("/")
def listar(user = Depends(require_role("admin"))):
    return listar_roles_service(user)


@router.post("/")
def criar(payload: RoleCreate, user = Depends(require_role("admin"))):
    return criar_role_service(payload, user)


@router.delete("/{role_id}")
def deletar(role_id: str, user = Depends(require_role("admin"))):
    return deletar_role_service(role_id, user)