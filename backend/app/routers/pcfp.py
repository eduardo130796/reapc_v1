from fastapi import APIRouter, Depends
from app.schemas.pcfp_schema import PCFPInput, SalvarEstruturaSchema
from app.services.pcfp_service import *
from app.core.dependencies import require_permission

router = APIRouter()

# ─── SALVAR ESTRUTURA (EstruturaPCFP.jsx chama POST /pcfp) ───
@router.post("")
@router.post("/")
def salvar_estrutura(payload: SalvarEstruturaSchema):
    return salvar_estrutura_service(payload.cargo_id, payload.estrutura)

# ─── OBTER PCFP POR CARGO ───
@router.get("/cargo/{cargo_id}")
def obter_pcfp(cargo_id: str, user = Depends(require_permission("contratos", "read"))):
    return obter_pcfp_por_cargo_service(cargo_id)

# ─── CALCULAR COM CCT ───
@router.post("/calcular")
def calcular(
    payload: dict,
    user = Depends(require_permission("contratos", "update"))
):
    return calcular_pcfp_service(payload, user)

# ─── APLICAR MODELO ───
@router.post("/aplicar-modelo")
def aplicar_modelo(
    payload: dict,
    user = Depends(require_permission("contratos", "update"))
):
    cargo_id = payload.get("cargo_id")
    modelo_id = payload.get("modelo_id")
    return aplicar_modelo_service(cargo_id, modelo_id, user)

# ─── SALVAR VERSÃO DE REPACTUAÇÃO ───
@router.post("/salvar-versao")
def salvar_versao(
    payload: dict,
    user = Depends(require_permission("contratos", "update"))
):
    return salvar_versao_service(payload, user)

# ─── SIMULAR ESTRUTURA (pré-visualização ao vivo) ───
@router.post("/simular-estrutura")
def simular_estrutura(data: dict, user = Depends(require_permission("contratos", "read"))):
    resultado = simular_estrutura_service(
        estrutura=data.get("estrutura"),
        parametros=data.get("parametros")
    )
    return {
        "success": True,
        "message": "Simulação realizada",
        "data": resultado
    }