from fastapi import APIRouter, Depends
from app.schemas.repactuacao_schema import RepactuacaoCreateSchema
from app.services.repactuacao_service import criar_versao_repactuacao, listar_versoes_cargo

router = APIRouter()

@router.post("")
@router.post("/")
def criar_repactuacao(payload: RepactuacaoCreateSchema):
    return criar_versao_repactuacao(payload.dict())

@router.get("/cargo/{cargo_id}")
def listar_por_cargo(cargo_id: str):
    return listar_versoes_cargo(cargo_id)
