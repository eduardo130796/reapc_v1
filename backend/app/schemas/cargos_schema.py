from pydantic import BaseModel, Field
from typing import Optional


class CargoBase(BaseModel):
    contrato_id: str
    nome: str = Field(..., min_length=2)
    quantidade: int = Field(default=1, ge=1)
    valor_unitario: float = Field(default=0, ge=0)
    status: Optional[str] = "ativo"


class CargoCreate(CargoBase):
    pass


class CargoUpdate(BaseModel):
    nome: Optional[str]
    quantidade: Optional[int]
    valor_unitario: Optional[float]
    status: Optional[str]


class CargoResponse(CargoBase):
    id: str