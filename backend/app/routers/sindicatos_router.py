from fastapi import APIRouter, Depends
from app.schemas.sindicatos_schema import SindicatoCreate
from app.services.sindicatos_service import *
from app.core.dependencies import require_permission

router = APIRouter()

@router.get("/")
def listar(user = Depends(require_permission("cct", "read"))):
    return listar_sindicatos_service()

@router.post("/")
def criar(payload: SindicatoCreate, user = Depends(require_permission("cct", "create"))):
    return criar_sindicato_service(payload)
