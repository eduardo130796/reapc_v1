from fastapi import APIRouter, Depends
from app.schemas.cct_schema import (
    CCTCreate,
    CCTItemCreate,
    CCTValorCreate
)
from app.services.cct_service import *
from app.core.dependencies import require_permission

router = APIRouter()

# --- CCTs ---

@router.get("/")
def listar(user = Depends(require_permission("cct", "read"))):
    return listar_ccts_service(user)

@router.get("/por-sindicato/{sindicato_id}")
def listar_por_sindicato(sindicato_id: str, user = Depends(require_permission("cct", "read"))):
    return listar_ccts_por_sindicato_service(sindicato_id, user)

@router.post("/")
def criar(payload: CCTCreate, user = Depends(require_permission("cct", "create"))):
    return criar_cct_service(payload, user)

@router.get("/{cct_id}")
def buscar(cct_id: str, user = Depends(require_permission("cct", "read"))):
    return buscar_cct_service(cct_id, user)

# --- ITENS ---

@router.get("/{cct_id}/itens")
def listar_itens(cct_id: str, user = Depends(require_permission("cct", "read"))):
    return listar_itens_service(cct_id, user)

@router.post("/{cct_id}/itens")
def adicionar_item(cct_id: str, payload: CCTItemCreate, user = Depends(require_permission("cct", "create"))):
    return adicionar_item_service(cct_id, payload, user)

# --- VALORES ---

@router.get("/{cct_id}/valores")
def listar_valores(cct_id: str, user = Depends(require_permission("cct", "read"))):
    return listar_valores_service(cct_id, user)

@router.post("/{cct_id}/valores")
def adicionar_valor(cct_id: str, payload: CCTValorCreate, user = Depends(require_permission("cct", "create"))):
    return adicionar_valor_service(cct_id, payload, user)
