from pydantic import BaseModel, Field
from typing import Optional
import uuid


class CargoBase(BaseModel):
    contrato_id: uuid.UUID
    cargo_id: uuid.UUID
    quantidade: int = Field(default=1, ge=1)
    status: Optional[str] = "ativo"
    sindicato_id: Optional[uuid.UUID] = None


class CargoCreate(CargoBase):
    pass


class CargoUpdate(BaseModel):
    quantidade: Optional[int] = None
    status: Optional[str] = None
    sindicato_id: Optional[uuid.UUID] = None


class CargoResponse(CargoBase):
    id: str
    cargos_base: Optional[dict] = None
    sindicato: Optional[dict] = None

    class Config:
        from_attributes = True