from pydantic import BaseModel, Field
from typing import Any, Optional


class ModeloBase(BaseModel):
    nome: str = Field(..., min_length=2)
    estrutura: Any
    ativo: Optional[bool] = True


class ModeloCreate(ModeloBase):
    pass


class ModeloUpdate(BaseModel):
    nome: Optional[str]
    estrutura: Optional[Any]
    ativo: Optional[bool]


class ModeloResponse(ModeloBase):
    id: str
    versao: int