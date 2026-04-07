from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class ContratoBase(BaseModel):
    numero: str = Field(..., min_length=3)
    objeto: str
    fornecedor: Optional[str] = None
    valor_anual: float = Field(..., gt=0)
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    id_api: Optional[str] = None
    status: Optional[str] = "Vigente"


class ContratoCreate(ContratoBase):
    pass


class ContratoUpdate(BaseModel):
    numero: Optional[str]
    objeto: Optional[str]
    fornecedor: Optional[str]
    valor_anual: Optional[float]
    data_inicio: Optional[date]
    data_fim: Optional[date]
    status: Optional[str]


class ContratoResponse(ContratoBase):
    id: str