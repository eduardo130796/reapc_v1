from fastapi import APIRouter, Depends
from app.schemas.pcfp_schema import PCFPInput, SimularEstruturaSchema, SalvarEstruturaSchema
from app.services.pcfp_service import calcular_service
from app.core.dependencies import require_permission
from app.services.pcfp_service import buscar_pcfp_service
from app.services.pcfp_service import simular_estrutura_service
from app.services.pcfp_service import salvar_estrutura_service

router = APIRouter()

@router.post("")
@router.post("/")
def salvar_estrutura(payload: SalvarEstruturaSchema):
    return salvar_estrutura_service(payload.cargo_id, payload.estrutura)

@router.post("/calcular")
def calcular(
    payload: PCFPInput):
    print("🔥 ENTROU NO ENDPOINT")
    return calcular_service(payload,{"id": "0e75fa56-62f7-4f57-ae57-38c8fb29239b"})

@router.get("/{cargo_id}")
def buscar_pcfp(cargo_id: str):
    return buscar_pcfp_service(cargo_id)

@router.post("/simular-estrutura")
def simular_estrutura(data: SimularEstruturaSchema):

    resultado = simular_estrutura_service(
        estrutura=data.estrutura,
        parametros=data.parametros
    )

    return {
        "success": True,
        "message": "Simulação realizada",
        "data": resultado
    }