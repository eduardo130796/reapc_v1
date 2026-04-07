from fastapi import APIRouter, Depends
from app.schemas.modelos_schema import ModeloCreate, ModeloUpdate
from app.services.modelos_service import (
    listar_modelos_service,
    criar_modelo_service,
    atualizar_modelo_service,
    excluir_modelo_service
)
from app.core.dependencies import require_permission

router = APIRouter()

@router.get("/")
def listar(user = Depends(require_permission("modelos", "read"))):
    return listar_modelos_service(user)

@router.post("/")
def criar(
    payload: ModeloCreate,
    user = Depends(require_permission("modelos", "create"))
):
    return criar_modelo_service(payload, user)

@router.put("/{modelo_id}")
def atualizar(
    modelo_id: str,
    payload: ModeloUpdate,
    user = Depends(require_permission("modelos", "update"))
):
    return atualizar_modelo_service(modelo_id, payload, user)

@router.delete("/{modelo_id}")
def excluir(
    modelo_id: str,
    user = Depends(require_permission("modelos", "delete"))
):
    return excluir_modelo_service(modelo_id, user)