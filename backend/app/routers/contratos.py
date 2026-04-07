from fastapi import APIRouter, Depends
from app.schemas.contratos_schema import (
    ContratoCreate,
    ContratoUpdate
)
from app.services.contratos_service import *
from app.core.dependencies import require_permission

router = APIRouter()


# ===============================
# LISTAR
# ===============================
@router.get("/")
def listar(user = Depends(require_permission("contratos", "read"))):
    return listar_contratos_service(user)


# ===============================
# BUSCAR NA API EXTERNA
# ===============================
@router.get("/api/")
def buscar_api(
    ug: str,
    user = Depends(require_permission("contratos", "read"))
):
    from app.services.contratos_api_service import buscar_contratos_api_service
    from fastapi import HTTPException
    try:
        return buscar_contratos_api_service(ug)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Erro ao consultar API externa: {str(e)}")


# ===============================
# BUSCAR LOCAL
# ===============================
@router.get("/{contrato_id}/")
def buscar(
    contrato_id: str,
    user = Depends(require_permission("contratos", "read"))
):
    return buscar_contrato_service(contrato_id, user)


# ===============================
# CRIAR
# ===============================
@router.post("/")
def criar(
    payload: ContratoCreate,
    user = Depends(require_permission("contratos", "create"))
):
    return criar_contrato_service(payload, user)


# ===============================
# ATUALIZAR
# ===============================
@router.put("/{contrato_id}")
def atualizar(
    contrato_id: str,
    payload: ContratoUpdate,
    user = Depends(require_permission("contratos", "update"))
):
    return atualizar_contrato_service(contrato_id, payload, user)


# ===============================
# EXCLUIR
# ===============================
@router.delete("/{contrato_id}")
def excluir(
    contrato_id: str,
    user = Depends(require_permission("contratos", "delete"))
):
    return excluir_contrato_service(contrato_id, user)