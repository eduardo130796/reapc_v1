from fastapi import APIRouter, Depends
from app.schemas.cargos_schema import CargoCreate, CargoUpdate
from app.services.cargos_service import *
from app.core.dependencies import require_permission

router = APIRouter()


# ===============================
# LISTAR
# ===============================
@router.get("/")
def listar(
    contrato_id: str,
    user = Depends(require_permission("contratos", "read"))
):
    return listar_cargos_service(contrato_id, user)


# ===============================
# CRIAR
# ===============================
@router.post("/")
def criar(
    payload: CargoCreate,
    user = Depends(require_permission("contratos", "update"))
):
    return criar_cargo_service(payload, user)


# ===============================
# ATUALIZAR
# ===============================
@router.put("/{cargo_id}")
def atualizar(
    cargo_id: str,
    payload: CargoUpdate,
    user = Depends(require_permission("contratos", "update"))
):
    return atualizar_cargo_service(cargo_id, payload, user)


# ===============================
# EXCLUIR
# ===============================
@router.delete("/{cargo_id}")
def excluir(
    cargo_id: str,
    user = Depends(require_permission("contratos", "delete"))
):
    return excluir_cargo_service(cargo_id, user)


# ===============================
# IMPORTAR
# ===============================
@router.post("/importar/{contrato_id}")
def importar(
    contrato_id: str,
    user = Depends(require_permission("contratos", "update"))
):
    return importar_cargos_service(contrato_id, user)

@router.post("/{cargo_id}/aplicar-modelo")
def aplicar_modelo(
    cargo_id: str,
    payload: dict,
    user = Depends(require_permission("contratos", "update"))
):
    return aplicar_modelo_service(cargo_id, payload, user)