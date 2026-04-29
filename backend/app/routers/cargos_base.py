from fastapi import APIRouter, Depends
from app.schemas.cargos_base_schema import CargoBaseCreate
from app.services.cargos_base_service import *
from app.core.dependencies import get_current_user

router = APIRouter()

@router.get("/")
def listar(user = Depends(get_current_user)):
    return listar_cargos_base_service()

@router.post("/")
def criar(payload: CargoBaseCreate, user = Depends(get_current_user)):
    return criar_cargo_base_service(payload)
