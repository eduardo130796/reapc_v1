from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class CargoBaseBase(BaseModel):
    nome: str = Field(..., min_length=2, description="Nome do cargo em caixa alta")

class CargoBaseCreate(CargoBaseBase):
    pass

class CargoBaseResponse(CargoBaseBase):
    id: uuid.UUID
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
