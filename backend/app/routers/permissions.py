from fastapi import APIRouter, Depends
from app.schemas.permissions_schema import PermissionCreate
from app.services.permissions_service import *
from app.core.dependencies import require_role

router = APIRouter()


@router.get("/")
def listar(user = Depends(require_role("admin"))):
    return listar_permissions_service(user)


@router.post("/")
def criar(payload: PermissionCreate, user = Depends(require_role("admin"))):
    return criar_permission_service(payload, user)


@router.post("/role/{role_id}")
def salvar_permissoes(
    role_id: str,
    permissoes: list,
    user = Depends(require_role("admin"))
):
    return salvar_role_permissions_service(role_id, permissoes, user)